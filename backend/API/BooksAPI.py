from API.GlobalApp import app
from uuid import UUID
from flask import request
import Handlers.DBHandler as DBHandler






@app.route('/api/users/<uuid:uuid>/books', methods=['POST'])
def createBook(uuid: UUID):

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

    data = request.headers

    recursive = data.get("recursive")
    if recursive != None and recursive.lower() == "true":
        result = DBHandler.getBooksRecursive(uuid)
    else:
        result = DBHandler.getBooks(uuid)

    if "Error" in result:
        return result, 400
    
    return result

