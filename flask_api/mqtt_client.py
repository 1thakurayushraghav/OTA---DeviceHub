import paho.mqtt.client as mqtt
import threading
import json
from datetime import datetime, timezone
import os
import time

# Simple list to store all messages
mqtt_messages = []
messages_lock = threading.Lock()

# MQTT Configuration
MQTT_BROKER = os.getenv("MQTT_BROKER", "cryonexis.online")
MQTT_PORT = int(os.getenv("MQTT_PORT", 1883))
MQTT_USERNAME = os.getenv("MQTT_USERNAME", "root")
MQTT_PASSWORD = os.getenv("MQTT_PASSWORD", "config@qespl")

# =========================
# MQTT CONNECT CALLBACK
# =========================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print(f"✅ MQTT Connected to {MQTT_BROKER}:{MQTT_PORT}")
        client.subscribe("#")
        print("📡 Subscribed to all topics (#)")
    else:
        print(f"❌ MQTT Connection failed with code {rc}")

# =========================
# MQTT MESSAGE CALLBACK - NO SERIAL LOGIC
# =========================
def on_message(client, userdata, msg):
    try:
        topic = msg.topic
        parts = topic.split("/")

        device_id = ""
        message_type = ""

        if len(parts) >= 4:
            device_id = parts[2]
            message_type = "/".join(parts[3:])
        raw_payload = msg.payload.decode()
        
        print("\n📩 RAW MQTT MESSAGE")
        print("📌 Topic:", topic)
        print("📦 Raw Payload:", raw_payload)
        
        # Try to parse JSON
        try:
            payload = json.loads(raw_payload)
        except:
            payload = {"raw": raw_payload}
        
        # ✅ SIMPLY STORE - NO SERIAL CHECK
        current_time = datetime.now(timezone.utc).isoformat()
        
        with messages_lock:
            mqtt_messages.append({
                "deviceId": device_id,
                "messageType": message_type,
                "topic": topic,
                "data": payload,
                "timestamp": current_time
            })
            
            # Keep last 100 messages only
            if len(mqtt_messages) > 100:
                mqtt_messages.pop(0)
        
        print(f"✅ Message stored! Total messages: {len(mqtt_messages)}")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")

# =========================
# GLOBAL MQTT CLIENT
# =========================
mqtt_client = mqtt.Client()

if MQTT_USERNAME and MQTT_PASSWORD:
    mqtt_client.username_pw_set(MQTT_USERNAME, MQTT_PASSWORD)

mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# =========================
# START MQTT LISTENER
# =========================
def start_mqtt_listener():
    try:
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        mqtt_client.loop_start()
        print("🚀 MQTT Listener started successfully")
    except Exception as e:
        print(f"❌ Failed to start MQTT listener: {str(e)}")

# =========================
# GET ALL MESSAGES
# =========================
def get_all_messages():
    with messages_lock:
        return mqtt_messages.copy()