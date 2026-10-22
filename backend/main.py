import API.APIHandler
import API.GlobalApp
import Handlers.DBHandler as DBHandler
from uuid import UUID


#DBHandler.deleteUser(UUID("70404fb4-7ca9-480e-9953-557fa7039e68"))
result = DBHandler.createUser({"username": "name", "password": "test123", "email": "something@gmail.com"})
#result = DBHandler.getUserInfo(UUID("e079ea25-3257-41b5-beb8-c194ac6ef98e"))
#result = DBHandler.login("something@gmail.com", "test123")

if result != None and "Error" in result:
    print(result["Error"])
else:
    print(result)




API.GlobalApp.app.run(host='0.0.0.0', port=5000, debug=True)