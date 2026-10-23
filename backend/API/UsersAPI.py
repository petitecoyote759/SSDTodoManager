from API.GlobalApp import app
from flask import request, abort
from uuid import UUID
import Handlers.DBHandler as DBHandler
import API.TokenHandler as TokenHandler








@app.route('/api/users/login', methods=['POST'])
def loginUser():

    data = request.get_json()
    email = data["email"]
    password = data["password"]
    if email == None or password == None:
        return {"error": "missing email or password in parameters"}

    result = DBHandler.login(email, password)

    if "error" in result:
        return result, 400
    
    return result










@app.route('/api/users/signup', methods=['POST'])
def createUser():

    data = request.get_json()

    result = DBHandler.createUser(data)

    if "error" in result:
        return f"error during user creation. Message : \"{result["error"]}\"", 400

    return result["Token"], 201








@app.route('/api/users/<uuid:uuid>', methods=['DELETE'])
def deleteUser(uuid: UUID):

    
    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth

    result: bool = DBHandler.deleteUser(uuid)

    if result == False: # user not found
        return 'User does not exist or you are not authorised', 401

    return 'Completed', 200;






@app.route('/api/users/<uuid:uuid>', methods=['GET'])
def getUserInfo(uuid: UUID):

    
    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth

    result = DBHandler.getUserInfo(uuid)

    if result == None: # user not found
        return 'User does not exist or you are not authorised', 401

    return result, 200







@app.route('/api/users/<uuid:uuid>', methods=['PUT'])
def modifyUser(uuid: UUID):

    
    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth

    data = request.get_json()

    result = DBHandler.modifyUser(uuid, data)


    if result == True:
        return 'User modified', 200
    else:
        return 'Data had incorrect syntax', 400
