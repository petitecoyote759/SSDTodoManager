from API.GlobalApp import app
from flask import request, abort, jsonify
from uuid import UUID
import Handlers.DBHandler as DBHandler
import Handlers.TokenHandler as TokenHandler
import Settings




@app.route('/api/users/logout', methods=['POST'])
def logoutUser():

    response = jsonify({"message": "logged out"})

    response.set_cookie(
        key="access_token",
        value="",
        max_age=0,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/"
    )

    return response, 200



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

    token = result.get("token")
    if token == None:
        return {"error": "login did not return token"}, 500

    response = jsonify({
        "uuid": result.get("uuid")
    })

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=False,
        samesite="Lax",
        path="/",
        max_age=Settings.tokenDuration * 60 * 60
    )
    
    return response


@app.route("/api/user/auth", methods=['GET'])
def getCurrentUser():
    token = request.cookies.get("access_token")

    if token == None:
        return {"error": "Missing token"}, 400

    result = TokenHandler.getUuidFromJwt(token)

    if isinstance(result, dict):
        return result, 400 # actually error code
    
    uuid: UUID = result

    if TokenHandler.authenticateUser(uuid, token) == False:
        return {"error": "Invalid token"}, 401

    return {"uuid": str(uuid)}, 200










@app.route('/api/users/signup', methods=['POST'])
def createUser():

    data = request.get_json()

    result = DBHandler.createUser(data)

    if "error" in result:
        print(f"E - {result["error"]}")
        return f"error during user creation.", 400

    return {"message": "success"}, 201








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
