import argon2

ph = argon2.PasswordHasher()

def generateHash(password: str) -> str:
    """
    Creates a hash from the given password using argon2
    """
    
    hash: str = ph.hash(password)

    return hash


def verifyHash(password: str, hash: str) -> bool:
    """
    Returns true if it is the correct password
    """
    return ph.verify(hash, password)