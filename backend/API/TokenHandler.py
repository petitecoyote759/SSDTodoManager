import jwt, datetime
from uuid import UUID
import GlobalApp, Settings


_signingKey: str = GlobalApp.private_key


def getUuidFromJwt(token: str) -> UUID | dict[str, str]:

    try:
        return jwt.decode(token, options={"verify_signature": False}, algorithms="HS256")["uuid"]
    except:
        return {"Error": "JWT failed to decode."}




def generateUserToken(uuid: UUID):
    # get sign key from env
    # TODO: Generate an expiry time in unix format (5-15 mins)

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

    decodedToken: dict
    try:
        decodedToken = jwt.decode(token, _signingKey, algorithms="HS256")
    except jwt.exceptions.InvalidSignatureError:
        print("Invalid signature detected")
        return False # not valid

    return str(uuid) == decodedToken["uuid"]
