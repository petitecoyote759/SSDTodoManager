import jwt, datetime
from uuid import UUID
import API.GlobalApp as GlobalApp, Settings as Settings
from typing import Any
from flask import request


_signingKey: str = GlobalApp.private_key




def checkAuthorisation(uuid: UUID) -> tuple[str, int]:
    """Returns ['Success', 200] if authorized, or ['error message', code]"""
    print("Incoming:", list(request.cookies.keys()))
    token = request.cookies.get("access_token")
    
    if token == None:
        return 'Missing token', 400

    if authenticateUser(uuid, token) == False: # not authorised
        return 'User does not exist or you are not authorised', 401

    return 'Success', 200







def getUuidFromJwt(token: str) -> UUID | dict[str, str]:

    try:
        return jwt.decode(token, options={"verify_signature": False}, algorithms="HS256")["uuid"]
    except:
        return {"Error": "JWT failed to decode."}




def generateUserToken(uuid: UUID):
    # get sign key from env

    now = datetime.datetime.now()

    claims = {
        "uuid": uuid, 
        "createdAt": str(now.astimezone()),
        "expiryDate": str((now + datetime.timedelta(hours=Settings.tokenDuration)).astimezone())
        }

    token = jwt.encode(
        headers={"typ": "JWT"},
        key=_signingKey,
        payload=claims,
        algorithm="HS256"
        )

    return token


def authenticateUser(uuid: UUID, token: str) -> bool:
    """
    True if that user is who they claim to be
    """

    decodedToken: dict[str, Any]

    try:
        decodedToken = jwt.decode(token, _signingKey, algorithms="HS256")
    except jwt.exceptions.InvalidSignatureError:
        print("Invalid signature detected")
        return False # not valid
    
    expiryDate: datetime.datetime = datetime.datetime.fromisoformat(decodedToken["expiryDate"])
    if expiryDate < datetime.datetime.now().astimezone():
        return False

    return str(uuid) == decodedToken["uuid"]
