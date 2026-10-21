from flask import Flask
from flask_cors import CORS
import os, json




def _getPrivateKey():

    sep = os.sep
    with open(f"{__file__}{sep}..{sep}..{sep}.env") as file:
        text = file.read()
    data = json.loads(text)
    return data["privateKey"]

private_key = _getPrivateKey()





app = Flask(__name__)
CORS(app)

print(f"Good Key : {Flask.secret_key}")