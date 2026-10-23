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
        return {"Error": "Password was incorrect or user does not exist"}

    if HashHandler.verifyHash(password, result[0]) == True:
        token = TokenHandler.generateUserToken(result[1])
        return {"Token": token, "uuid": result[1]}
    
    return {"Error": "Password was incorrect or user does not exist"}












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
                return {"Error": f"email '{data['email']}' has already been registered"}
            except Exception as e:
                print(f"Error in account creation, error: {e}")
                return {"Error": f"unknown error in insert, message = '{type(e)}'"}

    return {}
            








def createUser(data: dict[str, Any]) -> dict[str, str]:
    """
    Returns a dictionary with either "Error" if the data was invalid, or "Token" if it was successful
    """

    if 'username' not in data:
        return {"Error": "key \'username\' not found in data"}
    username = data['username']

    if 'email' not in data:
        return {"Error": "key \'email\' not found in data"}
    email = data['email']

    if 'password' not in data:
        return {"Error": "key \'password\' not found in data"}
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
        return {"Error": f"email '{email}' has already been registered"} # should be replaced by confirm via email to prevent fuzzing
    except Exception as e:
        database.conn.rollback()
        print(f"Error in account creation, error: {e}")
        return {"Error": f"unknown error in insert, type = '{type(e)}'"}

    database.conn.commit()


    # Create JWT
    value = database.cur.fetchone()
    if value == None:
        print(f"Something went wrong with creation, data was \'{data}\'")
        return {"Error": "Unkown issue"}

    token = TokenHandler.generateUserToken(value[0])

    return {"Token": token}