from uuid import UUID
from typing import Any
import psycopg2
from psycopg2.errors import UniqueViolation
from psycopg2.extensions import connection, cursor
from psycopg2.extras import register_uuid
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
    print(result)

    outputDict: dict[str, str] = {}
    for book in result:
        outputDict[book[0]] = book[1] # uuid as key, name as value

    return outputDict



def getBooksRecursive(uuid: UUID) -> dict[str, Any]:

    database.cur.execute("""
    SELECT json_build_object(
        'book_id', b.book_id
        'user_id', b.user_id,
        'name', b.name,
        'notes', COALESCE (
            SELECT json_agg(
                json_build_object(
                    'note_id', n.note_id,
                    'book_id', n.book_id,
                    'name', n.name,
                    'colour', n.colour,
                    'white_text', n.white_text,
                    'posx', n.posx,
                    'posy', n.posy,
                    'entries', COALESCE(
                        SELECT json_agg(
                            json_build_object(
                                'entry_id', e.entry_id,
                                'note_id', e.note_id,
                                'text', e.text,
                                'completion', e.completion,
                                'due_date', e.due_date,
                                'description', e.description
                            )
                        )
                        FROM public.entries e
                        WHERE e.note_id = n.note_id
                    )
                )
            )
            FROM public.notes n
            WHERE n.book_id = b.book_id
        )                 
    )
    FROM public.books b
    WHERE b.book_id = %s; 
    """)

    result = database.cur.fetchall()
    print(result)

    return {}