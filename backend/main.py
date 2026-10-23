import API.APIHandler
import API.GlobalApp
import Handlers.DBHandler as DBHandler
import API.TokenHandler as TokenHandler
from uuid import UUID


#DBHandler.deleteUser(UUID("70404fb4-7ca9-480e-9953-557fa7039e68"))
#result = DBHandler.createUser({"username": "name", "password": "test123", "email": "something@gmail.com"})
#result = DBHandler.getUserInfo(UUID("e079ea25-3257-41b5-beb8-c194ac6ef98e"))
result = DBHandler.login("something@gmail.com", "test123")
print(result)
result = TokenHandler.getUuidFromJwt(result["token"])
if type(result) == dict:
    print(result)
    exit()
uuid: UUID = result
print(uuid)

#result = DBHandler.createBook(uuid, "testBook")
#print(result)

result = DBHandler.getBooks(uuid)
print(result)

print("\n\nCLEAR\n\n")



#result = DBHandler.createNote(UUID("44be5192-8464-456c-adde-3ed670248149"), {
#    "name": "other note",
#    "colour": "#12e2f3",
#    "white_text": False,
#    "posx": 73.1,
#    "posy": 11.2,
#})
#print(result)

#result = DBHandler.getBooksRecursive(uuid)
#print(result)

#result = DBHandler.getNotes(UUID("44be5192-8464-456c-adde-3ed670248149"))
#print(result)



#DBHandler.modifyNote(UUID("4f6c9c9e-182b-49e8-959a-258ae70ebf9d"), {"name": "changedName"})




API.GlobalApp.app.run(host='0.0.0.0', port=5000, debug=True)