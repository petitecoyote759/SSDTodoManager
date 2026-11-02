from API.GlobalApp import app
from uuid import UUID
import Handlers.TokenHandler as TokenHandler
import Handlers.DBHandler as DBHandler
from flask import request
from typing import Any





@app.route('/api/users/<uuid:uuid>/tags', methods=['GET'])
def getTags(uuid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth




    result = DBHandler.getTags(uuid)

    if "Error" in result:
        return result, 400
    
    return result



@app.route('/api/users/<uuid:uuid>/tags', methods=['PUT'])
def updateTags(uuid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth

    
    tags: dict[str, Any] | None = request.get_json()
    if tags == None:
        return {"Error": "missing tags in parameters"}, 400
    if 'tags' not in tags:
        return {"Error": "incorrect format for tags"}, 400


    DBHandler.updateTags(uuid, tags)
    
    return {}, 200
