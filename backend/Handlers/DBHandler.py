from uuid import UUID
from typing import Any
import psycopg2
from psycopg2.extensions import connection, cursor
from psycopg2.extras import register_uuid
from configparser import ConfigParser
from pathlib import Path
import os


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

        sep = os.sep
        with open(Path(__file__).parent.parent / "config" / "databaseSetup.txt") as file:
            text = file.read()

        self.cur.execute(text)

        self.conn.commit()


    def __delete__(self):

        del(self.cur)
        self.conn.close()


database: Database = Database()














def deleteUser(uuid: UUID) -> bool:

    return False




def getUserInfo(uuid: UUID) -> str | None:

    return None




def modifyUser(uuid: UUID, data: str) -> bool:

    return False



def createUser(data: dict[str, Any]) -> dict[str, str]:
    """
    Returns a dictionary with either "Error" if the data was invalid, or "Token" if it was successful
    """

    return {"Error": "Invalid data"}