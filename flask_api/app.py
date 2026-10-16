# from flask import Flask
# from flask_cors import CORS
# from dotenv import load_dotenv
# from mqtt_client import start_mqtt_listener
# import os

# # load env variables
# load_dotenv()

# from routes.auth import auth
# from routes.instrument import instrument
# from routes.device import device
# from routes.bin_route import bin_route

# app = Flask(__name__)

# start_mqtt_listener()

# # config (future use)
# app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# # enable CORS
# CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

# # register routes
# app.register_blueprint(auth)
# app.register_blueprint(instrument)
# app.register_blueprint(device)
# app.register_blueprint(bin_route)


# # health check
# @app.route("/")
# def home():
#     return {"status": "API running"}


# # run server
# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)

from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from mqtt_client import start_mqtt_listener, get_all_messages
import os
from datetime import datetime, timezone
from mqtt_client import mqtt_client

load_dotenv()
import json
from routes.auth import auth
from routes.instrument import instrument
from routes.device import device
from routes.bin_route import bin_route

app = Flask(__name__)

# Start MQTT listener
start_mqtt_listener()

app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")

# ✅ FIXED CORS - Allow authorization header
CORS(app)  # ✅ Added Authorization
# CORS(app, 
#      resources={r"/*": {"origins": "*"}},
#      methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
#      allow_headers=["Content-Type", "Authorization", "X-Requested-With"])  # ✅ Added Authorization

# @app.after_request
# def after_request(response):
#     response.headers.add('Access-Control-Allow-Origin', '*')
#     response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
#     response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
#     response.headers.add('Access-Control-Allow-Credentials', 'true')
#     return response

# Register blueprints
app.register_blueprint(auth)
app.register_blueprint(instrument)
app.register_blueprint(device)
app.register_blueprint(bin_route)

# ✅ MQTT ENDPOINT
@app.route("/api/mqtt/data", methods=["GET", "OPTIONS"])
def get_mqtt_data():
    if request.method == "OPTIONS":
        return "", 200
    
    try:
        messages = get_all_messages()
        # Return latest first
        messages.reverse()
        
        return jsonify({
            "success": True,
            "count": len(messages),
            "messages": messages
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route("/api/mqtt/publish", methods=["POST"])
def publish_message():
    try:
        print("==== PUBLISH REQUEST RECEIVED ====")

        data = request.get_json()

        topic = data.get("topic")
        payload = data.get("message")

        # Validation
        if not topic:
            return jsonify({
                "success": False,
                "error": "Topic is required"
            }), 400

        # MQTT Connection Check
        if not mqtt_client.is_connected():
            return jsonify({
                "success": False,
                "error": "MQTT broker not connected"
            }), 500

        print("Topic:", topic)
        print("Payload:", payload)

        result = mqtt_client.publish(
            topic,
            json.dumps(payload)
            if isinstance(payload, dict)
            else str(payload)
        )

        print("MQTT Result:", result.rc)

        return jsonify({
            "success": True,
            "rc": result.rc
        })

    except Exception as e:
        print("PUBLISH ERROR:", str(e))

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Health check
@app.route("/")
def home():
    return {"status": "API running"}

if __name__ == "__main__":
    print("="*50 + "\n")
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)