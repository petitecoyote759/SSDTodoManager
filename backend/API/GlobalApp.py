from flask import Flask, request, session
from flask_cors import CORS
import os, json
from typing import Any
from pathlib import Path
from flask_wtf.csrf import CSRFProtect




def _getPrivateKeys():

    with open(Path(__file__).parent.parent / ".env") as file:
        text = file.read()
    data = json.loads(text)
    return data["signingKey"], data["privateKey"]

signingKey, privateKey = _getPrivateKeys()





def getRequestJson(required: dict[str, type], soft: bool = False) -> dict[str, Any]:
    """
    Gets the json from the request, and ensures that all data is the required type
    """

    data = request.get_json()
    values: dict[str, Any] = {}

    for key in required:
        value: Any | None = data.get(key)
        if value == None:
            if soft:
                continue
            else:
                return {"error": f"missing {key} in parameters"}
        if not isinstance(value, required[key]): # is not correct type
            if soft:
                continue
            else:
                return {"error": f"parameter {key} was incorrect type, should be {required[key]}"}
        values[key] = value

    return values








app = Flask(__name__)
CORS(app,
     resources={
         r"/api/*": {
            "origins": ["http://localhost:5173"],     
         }
     },
     supports_credentials=True)


app.secret_key = privateKey
csrf = CSRFProtect(app)


def run():
    app.run(host='0.0.0.0', port=5000, debug=True)