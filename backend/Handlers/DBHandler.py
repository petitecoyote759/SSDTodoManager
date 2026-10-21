from uuid import UUID
from typing import Any





def deleteUser(uuid: UUID) -> bool:

    return False




def getUserInfo(uuid: UUID) -> str | None:

    return None




def modifyUser(uuid: UUID, data: str) -> bool:

    return False



def createUser(data: dict[str, Any]) -> dict[str, str]:
    """
    Returns a dictionary with either "Error" if the data was invalid, or "Token" if it was successful
    """

    return {"Error": "Invalid data"}