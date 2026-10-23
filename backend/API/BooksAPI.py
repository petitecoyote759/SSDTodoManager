from API.GlobalApp import app
from uuid import UUID
from flask import request
import Handlers.DBHandler as DBHandler
import API.TokenHandler as TokenHandler






@app.route('/api/users/<uuid:uuid>/books', methods=['POST'])
def createBook(uuid: UUID):

    
    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth



    data = request.get_json()
    name: str | None = data.get("name")
    if name == None:
        return {"Error": "missing name in parameters"}

    result = DBHandler.createBook(uuid, name)

    if "Error" in result:
        return result, 400
    
    return result





@app.route('/api/users/<uuid:uuid>/books', methods=['GET'])
def getBooks(uuid: UUID):

    
    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth
    


    data = request.headers

    recursive = data.get("recursive")
    if recursive != None and recursive.lower() == "true":
        result = DBHandler.getBooksRecursive(uuid)
    else:
        result = DBHandler.getBooks(uuid)

    if "Error" in result:
        return result, 400
    
    return result










@app.route('/api/users/<uuid:uuid>/books/<uuid:buid>', methods=['DELETE'])
def deleteBook(uuid: UUID, buid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth


    result = DBHandler.deleteBook(buid)

    if (result == True):
        return 'Successful', 200
    
    return 'Failed', 400







@app.route('/api/users/<uuid:uuid>/books/<uuid:buid>', methods=['PUT'])
def modifyBook(uuid: UUID, buid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth


    data = request.get_json()
    name: str | None = data.get("name")
    if name == None:
        return {"Error": "missing name in parameters"}

    result = DBHandler.modifyBook(buid, name)

    if (result == True):
        return 'Successful', 200
    
    return 'Failed', 400






@app.route('/api/users/<uuid:uuid>/books', methods=['PUT'])
def modifyBooks(uuid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth


    data = request.get_json()
    print(data)
    if data.get("books") == None:
        return 'Missing parameter books', 400

    result = DBHandler.setBooksRecursive(uuid, data)

    return 'Successful', 200
    
