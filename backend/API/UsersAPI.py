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
        return {"Error": "missing email or password in parameters"}

    result = DBHandler.login(email, password)

    if "Error" in result:
        return result, 400
    
    return result










@app.route('/api/users', methods=['POST'])
def createUser():

    data = request.get_json()

    result = DBHandler.createUser(data)

    if "Error" in result:
        return f"Error during user creation. Message : \"{result["Error"]}\"", 400

    return result["Token"], 201








@app.route('/api/users/<uuid:uuid>', methods=['DELETE'])
def deleteUser(uuid: UUID):

    token: str | None = request.args["token"]
    if token == None:
        return 'Invalid token', 400

    if TokenHandler.authenticateUser(uuid, token) == False: # not authorised
        return 'User does not exist or you are not authorised', 401

    result: bool = DBHandler.deleteUser(uuid)

    if result == False: # user not found
        return 'User does not exist or you are not authorised', 401

    return 'Completed', 200;






@app.route('/api/users/<uuid:uuid>', methods=['GET'])
def getUserInfo(uuid: UUID):

    token: str | None = request.args["token"]
    if token == None:
        return 'Invalid token', 400

    if TokenHandler.authenticateUser(uuid, token) == False: # not authorised
        return 'User does not exist or you are not authorised', 401

    result = DBHandler.getUserInfo(uuid)

    if result == None: # user not found
        return 'User does not exist or you are not authorised', 401

    return result, 200







@app.route('/api/users/<uuid:uuid>', methods=['PUT'])
def modifyUser(uuid: UUID):

    token: str | None = request.args["token"]
    if token == None:
        return 'Invalid token', 400

    data = request.get_json()

    if TokenHandler.authenticateUser(uuid, token) == False: # not authorised
        return 'User does not exist or you are not authorised', 401

    result = DBHandler.modifyUser(uuid, data)


    if result == True:
        return 'User modified', 200
    else:
        return 'Data had incorrect syntax', 400
