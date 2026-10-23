from uuid import UUID
from typing import Any
import psycopg2
from psycopg2.errors import UniqueViolation
from psycopg2.extensions import connection, cursor
from psycopg2.extras import register_uuid, Json
from configparser import ConfigParser
from pathlib import Path
import os
import API.TokenHandler as TokenHandler
import Handlers.HashHandler as HashHandler


DB_PATH = os.path.join(os.path.dirname(__file__), "instance", "app.db")


















def loadConfig(filename: str | None = None, section: str = "postgresql"):
    sep = os.sep
    if filename == None:
        filename = f"config{sep}database.ini"
    
    parser = ConfigParser()
    fullPath = Path(__file__).parent.parent / filename
    if Path(fullPath).exists() == False:
        raise Exception(f"Config file does not exist at path {fullPath}")

    parser.read(fullPath)

    config = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            config[param[0]] = param[1]
    else:
        raise Exception(f"Section {section} not found in the {fullPath} file")

    return config






class Database:

    def __init__(self):

        try:
            config = loadConfig()
            self.conn: connection = psycopg2.connect(**config)
            self.cur: cursor = self.conn.cursor()
            self.conn.rollback()
        except Exception as e:
            print(f"something went really wrong, error : {e}")
            exit()


        self.cur.execute("""
        SELECT EXISTS (
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
            AND table_name = 'users'
        );
        """)

        tableExists = self.cur.fetchone()
        if tableExists == None:
            print(f"Something has gone really wrong, quitting. fetch : {tableExists}")
            exit()

        if tableExists[0] == False:
            print("Tables dont exist, setting up")
            self.createDB()

        else:
            print("Tables already exist, skipping setup")
            print(f"{tableExists}")



    def createDB(self):

        with open(Path(__file__).parent.parent / "config" / "databaseSetup.txt") as file:
            text = file.read()

        self.cur.execute(text)

        self.conn.commit()


    def __delete__(self):

        del(self.cur)
        self.conn.close()


database: Database = Database()





















def login(email: str, password: str) -> dict[str, str]:

    database.cur.execute("""
    SELECT password_hash, user_id FROM public.users
    WHERE email = %s
    """, (email,))

    result = database.cur.fetchone()
    
    if result == None:
        return {"error": "Password was incorrect or user does not exist"}

    if HashHandler.verifyHash(password, result[0]) == True:
        token = TokenHandler.generateUserToken(result[1])
        return {"token": token, "uuid": result[1]}
    
    return {"error": "Password was incorrect or user does not exist"}












def deleteUser(uuid: UUID) -> bool:

    database.cur.execute("""
    DELETE FROM public.users
    WHERE user_id = %s
    """, (str(uuid),))

    database.conn.commit()

    if database.cur.rowcount == 0:
        return False # didnt affect anything

    return True




def getUserInfo(uuid: UUID) -> dict[str, str] | None:

    database.cur.execute("""
    SELECT username, email, profile_picture, created_at FROM public.users
    WHERE user_id = %s
    """, (str(uuid),))

    result = database.cur.fetchone()
    if result == None:
        return None

    return {
        "username": result[0],
        "email": result[1],
        "profile_picture": result[2],
        "created_at": result[3]
        }
    




def modifyUser(uuid: UUID, data: dict[str, str]) -> dict[str, str]:

    allowedFields = ["username", "email", "profile_picture"]

    for allowedField in allowedFields:
        if allowedField in data:

            try:
                # need to use f string as you cant parametarise the field
                database.cur.execute(f"""
                UPDATE public.users
                SET {allowedField} = %s
                WHERE user_id = %s
                """, (data[allowedField], str(uuid)))
            except UniqueViolation:
                return {"error": f"email '{data['email']}' has already been registered"}
            except Exception as e:
                print(f"error in account creation, error: {e}")
                return {"error": f"unknown error in insert, message = '{type(e)}'"}

    return {}
            








def createUser(data: dict[str, Any]) -> dict[str, str]:
    """
    Returns a dictionary with either "error" if the data was invalid, or "Token" if it was successful
    """

    if 'username' not in data:
        return {"error": "key \'username\' not found in data"}
    username = data['username']

    if 'email' not in data:
        return {"error": "key \'email\' not found in data"}
    email = data['email']

    if 'password' not in data:
        return {"error": "key \'password\' not found in data"}
    password = data['password']
    
    profilePicture =  data['profile_picture'] if 'profile_picture' in data else ''

    try:
        database.cur.execute("""
        INSERT INTO public.users (username, email, password_hash, profile_picture)
        VALUES (%s, %s, %s, %s)
        RETURNING user_id
        """, (username, email, HashHandler.generateHash(password), profilePicture))
    except UniqueViolation:
        database.conn.rollback()
        return {"error": f"email '{email}' has already been registered"} # should be replaced by confirm via email to prevent fuzzing
    except Exception as e:
        database.conn.rollback()
        print(f"error in account creation, error: {e}")
        return {"error": f"unknown error in insert, type = '{type(e)}'"}

    database.conn.commit()


    # Create JWT
    value = database.cur.fetchone()
    if value == None:
        print(f"Something went wrong with creation, data was \'{data}\'")
        return {"error": "Unkown issue"}

    token = TokenHandler.generateUserToken(value[0])

    return {"token": token}















# << Books >> #

def createBook(uuid: UUID, name: str) -> dict[str, Any]:
    
    database.cur.execute("""
    INSERT INTO public.books (name, user_id)
    VALUES (%s, %s)
    RETURNING book_id
    """, (name, str(uuid)))
    database.conn.commit()
    result = database.cur.fetchone()

    if result == None:
        return {"error": "Unknown error"}

    return {"book_id": result[0]}




def getBooks(uuid: UUID) -> dict[str, str]:

    database.cur.execute("""
    SELECT book_id, name FROM public.books
    WHERE user_id = %s
    """, (str(uuid),))

    result: list[tuple[str, str]] = database.cur.fetchall()

    outputDict: dict[str, str] = {}
    for book in result:
        outputDict[book[0]] = book[1] # uuid as key, name as value

    return outputDict



def getBooksRecursive(uuid: UUID) -> dict[str, Any]:

    database.cur.execute("""
    SELECT json_build_object(
        'books', COALESCE(( 
            SELECT json_agg(json_build_object(
            'book_id', b.book_id,
            'user_id', b.user_id,
            'name', b.name,
            'notes', COALESCE ((
                SELECT json_agg(
                    json_build_object(
                        'note_id', n.note_id,
                        'book_id', n.book_id,
                        'name', n.name,
                        'colour', n.colour,
                        'white_text', n.white_text,
                        'posx', n.posx,
                        'posy', n.posy,
                        'entries', COALESCE((
                            SELECT json_agg(
                                json_build_object(
                                    'entry_id', e.entry_id,
                                    'note_id', e.note_id,
                                    'text', e.text,
                                    'priority', e.priority,
                                    'completion', e.completion,
                                    'due_date', e.due_date,
                                    'description', e.description
                                )
                            )
                            FROM public.entries e
                            WHERE e.note_id = n.note_id
                        ), '[]'::json)
                    )
                )
                FROM public.notes n
                WHERE n.book_id = b.book_id
            ), '[]'::json)                 
        )
    ))))
    FROM public.books b
    WHERE b.user_id = %s; 
    """, (str(uuid),))

    result = database.cur.fetchall()

    return result[0][0]




def setBooksRecursive(uuid: UUID, data: dict[str, Any]):

    # Books Updating
    database.cur.execute("""
    INSERT INTO public.books (book_id, user_id, name)
    SELECT
        -- Put data into books table
        (b->>'book_id')::uuid,
        (b->>'user_id')::uuid,
        (b->>'name')
    -- From json["books"]
    FROM jsonb_array_elements(
        %s::jsonb->'books'
    ) as b
    -- Ensure this is actually a file the user should access
    WHERE (b->>'user_id')::uuid = %s
    -- If already exists
    ON CONFLICT (book_id) DO UPDATE SET
        name=EXCLUDED.name
    """, (Json(data), str(uuid)))

    database.conn.commit()


    # Notes Updating
    database.cur.execute("""
    INSERT INTO public.notes (note_id, book_id, name, colour, white_text, posx, posy)
    SELECT
        -- Put data into notes table
        (n->>'note_id')::uuid,
        (b->>'book_id')::uuid,
        (n->>'name'),
        (n->>'colour'),
        (n->>'white_text')::boolean,
        (n->>'posx')::double precision,
        (n->>'posy')::double precision
    -- Get books from json["books"]
    FROM jsonb_array_elements(
        %s::jsonb->'books'    
    ) as b
    -- Get notes from book["notes"]
    CROSS JOIN LATERAL
        jsonb_array_elements(
            COALESCE(b->'notes', '[]'::jsonb)
        ) AS n
    -- Ensure this is actually a file the user should access
    WHERE (b->>'user_id')::uuid = %s
    -- If already exists
    ON CONFLICT (note_id) DO UPDATE SET
        book_id = EXCLUDED.book_id,
        name = EXCLUDED.name,
        colour = EXCLUDED.colour,
        white_text = EXCLUDED.white_text,
        posx = EXCLUDED.posx,
        posy = EXCLUDED.posy
    """, (Json(data), str(uuid)))

    database.conn.commit()


    # Entries Updating
    database.cur.execute("""
    INSERT INTO public.entries (entry_id, note_id, text, priority, completion, due_date, description)
    SELECT 
        -- Put data into table
        (e->>'entry_id')::uuid,
        (n->>'note_id')::uuid, -- frontend entry doesnt have note_id
        (e->>'text'),
        (e->>'priority')::smallint,
        (e->>'completion'),
        (e->>'due_date')::date,
        (e->>'description')
    -- Get books from json["books"]
    FROM jsonb_array_elements(
        %s::jsonb->'books'
    ) as b
    -- Get notes from book["notes"]
    CROSS JOIN LATERAL
        jsonb_array_elements(
            COALESCE(b->'notes', '[]'::jsonb)
        ) as n
    -- Get entries from note["entries"]
    CROSS JOIN LATERAL
        jsonb_array_elements(
            COALESCE(n->'entries', '[]'::jsonb)
        ) as e
    -- Ensure this is actually a file the user should access
    WHERE (b->>'user_id')::uuid = %s
    -- If already exists
    ON CONFLICT (entry_id) DO UPDATE SET
        note_id = EXCLUDED.note_id,
        text = EXCLUDED.text,
        priority = EXCLUDED.priority,
        completion = EXCLUDED.completion,
        due_date = EXCLUDED.due_date,
        description = EXCLUDED.description
    """, (Json(data), str(uuid)))

    database.conn.commit()












def deleteBook(buid: UUID):
    """
    Returns true if successful
    """

    database.cur.execute("""
    DELETE FROM public.books
    WHERE book_id = %s
    """,(buid,))

    database.conn.commit()

    return database.cur.rowcount == 1


def modifyBook(buid: UUID, name: str):

    database.cur.execute("""
    UPDATE public.books
    SET name = %s
    WHERE book_id = %s
    """, (name, buid))

    database.conn.commit()

    return database.cur.rowcount == 1






# << Notes >> #



def createNote(buid: UUID, variables: dict[str, Any]) -> None | UUID:
    # {"name": str, "colour": str, "white_text": bool, "posx": float, "posy": float}

    database.cur.execute("""
    INSERT INTO public.notes (book_id, name, colour, white_text, posx, posy)
    VALUES (%s, %s, %s, %s, %s, %s)
    RETURNING note_id
    """, (str(buid), variables["name"], variables["colour"], variables["white_text"], variables["posx"], variables["posy"]))

    database.conn.commit()

    result = database.cur.fetchone()
    if result == None:
        return None

    return UUID(result[0])



def getNotes(buid: UUID) -> dict[str, tuple[str, str, bool, float, float]]:
    """
    Returns a dictionary, with the uuid of the note as the key, and the value is a tuple of
    [name, colour, white_text, posx,  posy] with the types
    [str,  str,    bool,       float, float]
    """

    database.cur.execute("""
    SELECT note_id, name, colour, white_text, posx, posy FROM public.notes
    WHERE book_id = %s
    """, (str(buid),))

    result: list[tuple[str, str, str, bool, float, float]] = database.cur.fetchall()

    outputDict: dict[str, tuple[str, str, bool, float, float]] = {}
    for note in result:
        outputDict[note[0]] = (note[1], note[2], note[3], note[4], note[5])

    return outputDict




def deleteNote(nuid: UUID):

    database.cur.execute("""
    DELETE FROM public.notes 
    WHERE note_id = %s
    """, (str(nuid),))

    database.conn.commit()

    return database.cur.rowcount == 1



def modifyNote(nuid: UUID, values: dict[str, Any]):

    allowedValues: dict[str, type] = {"name": str, "colour": str, "white_text": bool, "posx": float, "posy": float}

    for allowedValue in allowedValues:
        if allowedValue not in values:
            continue

        database.cur.execute(f"""
        UPDATE public.notes
        SET {allowedValue} = %s
        WHERE note_id = %s
        """, (values[allowedValue], str(nuid)))

        database.conn.commit()

