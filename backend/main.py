import API.APIHandler
import Handlers.DBHandler as DBHandler
from uuid import UUID


#DBHandler.deleteUser(UUID("70404fb4-7ca9-480e-9953-557fa7039e68"))
result = DBHandler.createUser({"username": "otherName", "email": "something@gmail.com"})

if "Error" in result:
    print(result["Error"])
else:
    print(result)