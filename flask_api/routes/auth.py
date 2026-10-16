from flask import Blueprint, request, jsonify
import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

from db import users_collection
from validators.validators import require_fields

# load env
load_dotenv()

SECRET = os.getenv("SECRET_KEY")

auth = Blueprint("auth", __name__, url_prefix="/api/auth")


# REGISTER
@auth.route("/register", methods=["POST"])
def register():

    data = request.json

    error = require_fields(data, ["email", "password"])
    if error:
        return jsonify({"error": error}), 400

    email = data["email"].lower().strip()
    password = data["password"]

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User already exists"}), 409

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    users_collection.insert_one({
        "email": email,
        "password": hashed
    })

    return jsonify({"success": True}), 201


#  LOGIN
@auth.route("/login", methods=["POST"])
def login():

    data = request.json

    error = require_fields(data, ["email", "password"])
    if error:
        return jsonify({"error": error}), 400

    email = data["email"].lower().strip()
    password = data["password"]

    user = users_collection.find_one({"email": email})

    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    if not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"error": "Invalid email or password"}), 401

    #  TOKEN GENERATE
    token = jwt.encode(
        {
            "email": email,
            "exp": datetime.utcnow() + timedelta(days=7)
        },
        SECRET,
        algorithm="HS256"
    )

    return jsonify({
        "success": True,
        "token": token
    }), 200


# ✅ OPTIONAL: VERIFY TOKEN ROUTE
# ==============================
# VERIFY JWT TOKEN
# ==============================
@auth.route("/verify", methods=["GET"])
def verify_token():

    auth_header = request.headers.get("Authorization")

    # No Authorization header
    if not auth_header:
        return jsonify({
            "success": False,
            "error": "Authorization header missing"
        }), 401

    # Invalid Authorization format
    if not auth_header.startswith("Bearer "):
        return jsonify({
            "success": False,
            "error": "Invalid authorization format"
        }), 401

    try:
        token = auth_header.split(" ")[1]

        decoded = jwt.decode(
            token,
            SECRET,
            algorithms=["HS256"]
        )

        return jsonify({
            "success": True,
            "user": decoded
        }), 200

    except jwt.ExpiredSignatureError:
        return jsonify({
            "success": False,
            "error": "Token expired"
        }), 401

    except jwt.InvalidTokenError:
        return jsonify({
            "success": False,
            "error": "Invalid token"
        }), 401

    except Exception as e:
        print("VERIFY ERROR:", e)

        return jsonify({
            "success": False,
            "error": "Authentication failed"
        }), 401