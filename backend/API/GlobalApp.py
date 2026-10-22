from flask import Flask
from flask_cors import CORS
import os, json
from pathlib import Path




def _getPrivateKey():

    sep = os.sep
    with open(Path(__file__).parent.parent / ".env") as file:
        text = file.read()
    data = json.loads(text)
    return data["privateKey"]

private_key = _getPrivateKey()





app = Flask(__name__)
CORS(app)

print(f"Good Key : {Flask.secret_key}")