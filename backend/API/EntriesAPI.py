from API.GlobalApp import app
from uuid import UUID
import API.TokenHandler as TokenHandler
import Handlers.DBHandler as DBHandler






@app.route('/api/users/<uuid:uuid>/tags', methods=['GET'])
def getTags(uuid: UUID):

    auth: tuple[str, int] = TokenHandler.checkAuthorisation(uuid)
    if auth[1] != 200:
        return auth




    result = DBHandler.getTags(uuid)

    if "Error" in result:
        return result, 400
    
    return result
