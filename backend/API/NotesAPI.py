from API.GlobalApp import app, getRequestJson
from uuid import UUID
from flask import request
import Handlers.DBHandler as DBHandler
import API.TokenHandler as TokenHandler
from typing import Any






@app.route('/api/users/<uuid:uuid>/books/<uuid:buid>/notes', methods=['POST'])
def createNote(uuid: UUID, buid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth



    required: dict[str, type] = {"name": str, "colour": str, "white_text": bool, "posx": float, "posy": float}
    values: dict[str, Any] = getRequestJson(required)
    if "error" in values:
        return values, 400

    

    result = DBHandler.createNote(buid, values)

    if result == None:
        return 'Create Note Failed', 400
    
    return str(result), 200








@app.route('/api/users/<uuid:uuid>/books/<uuid:buid>/notes', methods=['GET'])
def getNotes(uuid: UUID, buid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth
    

    result = DBHandler.getNotes(buid)

    if result == None:
        return 'Get Notes Failed', 400
    
    return str(result), 200






@app.route('/api/users/<uuid:uuid>/books/<uuid:buid>/notes/<uuid:nuid>', methods=['POST'])
def deleteNote(uuid: UUID, buid: UUID, nuid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth



    result = DBHandler.deleteNote(nuid)

    if result == None:
        return 'Delete Note Failed', 400
    
    return str(result), 200








@app.route('/api/users/<uuid:uuid>/books/<uuid:buid>/notes/<uuid:nuid>', methods=['POST'])
def modifyNote(uuid: UUID, buid: UUID, nuid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth



    required: dict[str, type] = {"name": str, "colour": str, "white_text": bool, "posx": float, "posy": float}
    values: dict[str, Any] = getRequestJson(required, True)
    if "error" in values:
        return values, 400

    

    result = DBHandler.modifyNote(nuid, values)

    if result == None:
        return 'Create Note Failed', 400
    
    return str(result), 200
