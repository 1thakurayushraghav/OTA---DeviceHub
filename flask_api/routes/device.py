# from flask import Blueprint, request, jsonify
# from datetime import datetime

# from db import devices_collection, instruments_collection
# from validators.validators import require_fields

# device = Blueprint("device", __name__, url_prefix="/api")


# @device.route("/register", methods=["POST"])
# def register_device():

#     data = request.json

#     fields = [
#         "RTUserialNumber",
#         "companyName",
#         "industryId",
#         "deviceId",
#         "stationId",
#         "tokenId",
#         "publicKey",
#         "latitude",
#         "longitude"
#     ]

#     error = require_fields(data, fields)
#     if error:
#         return jsonify({"error": error}), 400

#     serial = data["RTUserialNumber"].strip()

#     # ✅ Check if RTU exists in instruments
#     instrument = instruments_collection.find_one({
#         "RTUserialNumber": serial
#     })

#     if not instrument:
#         return jsonify({"error": "Invalid RTU Serial Number"}), 404

#     # ✅ Prevent duplicate device registration
#     duplicate = devices_collection.find_one({
#         "RTUserialNumber": serial,
#         "deviceId": data["deviceId"]
#     })

#     if duplicate:
#         return jsonify({"error": "Device already registered"}), 409

#     # ✅ FLAGS (default False if not sent)
#     record = {
#         **data,

#         "cpcbFlag": data.get("cpcbFlag", False),
#         "m2mFlag": data.get("m2mFlag", False),
#         "survekshanFlag": data.get("survekshanFlag", False),
#         "qesFlag": data.get("qesFlag", False),
#         "Configured": data.get("Configured", False),

#         "createdAt": datetime.utcnow()
#     }

#     devices_collection.insert_one(record)

#     return jsonify({
#         "success": True,
#         "message": "Device registered successfully",
#         "flags": {
#             "cpcbFlag": record["cpcbFlag"],
#             "m2mFlag": record["m2mFlag"],
#             "survekshanFlag": record["survekshanFlag"],
#             "qesFlag": record["qesFlag"],
#             "Configured": record["Configured"]
#         }
#     }), 201



# @device.route("/device", methods=["GET"])
# def get_device():

#     # ✅ accept multiple params
#     serial = (
#         request.args.get("serialId") or
#         request.args.get("RTUserialNumber") or
#         request.args.get("rtuSerialno")
#     )

#     print("RTU Serial received:", serial)

#     if not serial:
#         return jsonify({"error": "RTU Serial Number is required"}), 400

#     result = devices_collection.find_one(
#         {"RTUserialNumber": serial},
#         {"_id": 0}
#     )

#     if not result:
#         return jsonify({"error": "Device not found"}), 404

#     # ✅ rename key properly (FIXED INDENT)
#     result["RTUSerialno"] = result.pop("RTUserialNumber")

#     return jsonify(result)

# @device.route("/device/check/<path:RTUserialNumber>", methods=["GET"])
# def check_device(RTUserialNumber):

#     serial = RTUserialNumber.strip()

#     instrument = instruments_collection.find_one({
#         "RTUserialNumber": serial
#     })

#     if not instrument:
#         return jsonify({"exists": False}), 200

#     return jsonify({"exists": True}), 200

# from flask import Blueprint, request, jsonify
# from db import devices_collection, instruments_collection
# from validators.validators import require_fields
# from validators.device_validator import validate_device_flags
# from models.device_model import DeviceModel

# device = Blueprint("device", __name__, url_prefix="/api")

# @device.route("/register", methods=["POST"])
# def register_device():

#     data = request.json

#     fields = [
#         "RTUserialNumber", "companyName", "industryId",
#         "deviceId", "stationId", "tokenId",
#         "publicKey", "latitude", "longitude"
#     ]

#     # ✅ REQUIRED FIELD CHECK
#     error = require_fields(data, fields)
#     if error:
#         return jsonify({"error": error}), 400

#     # ✅ FLAG VALIDATION
#     flag_error = validate_device_flags(data)
#     if flag_error:
#         return jsonify({"error": flag_error}), 400

#     serial = data["RTUserialNumber"].strip()

#     # ✅ 1. DUPLICATE DEVICE CHECK (PEHLE KARO)
#     duplicate = devices_collection.find_one({
#         "RTUserialNumber": serial,
#         "deviceId": data["deviceId"]
#     })

#     if duplicate:
#         return jsonify({"error": "Device already registered"}), 409

#     # ✅ 2.  ATOMIC LOCK (AB KARO)
#     instrument = instruments_collection.find_one_and_update(
#         {
#             "RTUserialNumber": serial,
#             "locked": False
#         },
#         {
#             "$set": {"locked": True}
#         }
#     )

#     if not instrument:
#         return jsonify({
#             "error": "Invalid or already used RTU Serial Number"
#         }), 400

#     #  3. CREATE DEVICE RECORD
#     record = DeviceModel.generate(data)

#     devices_collection.insert_one(record)

#     return jsonify({
#         "success": True,
#         "message": "Device registered successfully",
#         "flags": record["flags"]
#     }), 201

# #  GET DEVICE + CONFIGURED TRUE
# @device.route("/device", methods=["GET"])
# def get_device():

#     serial = (
#         request.args.get("serialId") or
#         request.args.get("RTUserialNumber") or
#         request.args.get("rtuSerialno")
#     )

#     if not serial:
#         return jsonify({"error": "RTU Serial Number is required"}), 400

#     result = devices_collection.find_one(
#         {"RTUserialNumber": serial},
#         {"_id": 0}
#     )

#     if not result:
#         return jsonify({"error": "Device not found"}), 404

#     # CONFIGURED TRUE AFTER FETCH
#     devices_collection.update_one(
#         {"RTUserialNumber": serial},
#         {"$set": {"flags.configured": True}}
#     )

#     result["flags"]["configured"] = True

#     result["RTUSerialno"] = result.pop("RTUserialNumber")

#     return jsonify(result)


# @device.route("/device/check/<path:RTUserialNumber>", methods=["GET"])
# def check_device(RTUserialNumber):

#     serial = RTUserialNumber.strip()

#     instrument = instruments_collection.find_one({
#         "RTUserialNumber": serial
#     })

#     return jsonify({"exists": bool(instrument)}), 200

# @device.route("/device/<serial>", methods=["PUT", "PATCH"])
# def update_device(serial):

#     data = request.json

#     existing = devices_collection.find_one({"RTUserialNumber": serial})

#     if not existing:
#         return jsonify({"error": "Device not found"}), 404

#     # optional: validation
#     flag_error = validate_device_flags(data)
#     if flag_error:
#         return jsonify({"error": flag_error}), 400

#     updated_data = DeviceModel.generate({
#         **existing,
#         **data,
#         "RTUserialNumber": serial  # ensure same serial
#     })

#     devices_collection.update_one(
#         {"RTUserialNumber": serial},
#         {"$set": updated_data}
#     )

#     return jsonify({"success": True, "message": "Device updated"})    

# #  GET ALL DEVICES
# @device.route("/devices", methods=["GET"])
# def get_all_devices():

#     devices = list(devices_collection.find({}, {"_id": 0}))

#     # optional formatting
#     for d in devices:
#         d["RTUSerialno"] = d.pop("RTUserialNumber")

#     return jsonify(devices), 200    


from flask import Blueprint, request, jsonify
import time
from datetime import datetime  
from db import devices_collection, instruments_collection
from validators.validators import require_fields
from validators.device_validator import validate_device_flags
from models.device_model import DeviceModel
import os
from mqtt_client import start_mqtt_listener, get_all_messages

def extract_seq_from_serial(serial):
    """Extract sequence number from serial like PIO0426_01"""
    try:
        if "_" in serial:
            return int(serial.split("_")[-1])
        return 0
    except:
        return 0

device = Blueprint("device", __name__, url_prefix="/api")


# ─────────────────────────────────────────────
# ✅ REGISTER DEVICE
# ─────────────────────────────────────────────
@device.route("/register", methods=["POST"])
def register_device():

    data = request.json or {}

    fields = [
        "RTUserialNumber", "companyName", "industryId",
        "deviceId", "stationId", "tokenId",
        "publicKey", "latitude", "longitude"
    ]

    # ✅ REQUIRED FIELD CHECK
    error = require_fields(data, fields)
    if error:
        return jsonify({"error": error}), 400

    # ✅ INSTRUMENT NAME VALIDATION - Check if exists in instruments collection
    serial = data["RTUserialNumber"].strip()
    
    # Fetch instrument details to get instrumentName
    instrument = instruments_collection.find_one({"RTUserialNumber": serial})
    
    if not instrument:
        return jsonify({"error": "Instrument not found with this RTU Serial Number"}), 404
    
    # ✅ Auto-populate instrumentName from instrument collection
    data["instrumentName"] = instrument.get("instrumentName")
    
    # ✅ Allow manual override if provided in request
    if "instrumentName" in data and data["instrumentName"]:
        data["instrumentName"] = data["instrumentName"]
    
    # ✅ FLAG VALIDATION
    flag_error = validate_device_flags(data)
    if flag_error:
        return jsonify({"error": flag_error}), 400

    # ✅ SANITIZE SERIAL
    data["RTUserialNumber"] = serial

    # ✅ FIX: Don't convert "null" to None, keep as "null" string
    if "qes_Sno" in data:
        qes_val = data["qes_Sno"]
        # Only convert real None or empty string to "null"
        if qes_val is None or qes_val == "":
            data["qes_Sno"] = "null"
        else:
            data["qes_Sno"] = str(qes_val).strip()
    else:
        data["qes_Sno"] = "null"

    # ✅ DUPLICATE CHECK
    duplicate = devices_collection.find_one({
        "RTUserialNumber": serial,
        "deviceId": data["deviceId"]
    })

    if duplicate:
        return jsonify({"error": "Device already registered"}), 409

    # ✅ ATOMIC LOCK
    instrument = instruments_collection.find_one_and_update(
        {
            "RTUserialNumber": serial,
            "locked": False
        },
        {
            "$set": {"locked": True}
        }
    )

    if not instrument:
        return jsonify({
            "error": "Invalid or already used RTU Serial Number"
        }), 400

    # ───────── ✅ MODBUS NORMALIZATION ─────────
    if "modbus" not in data:
        data["modbus"] = {
            "slaveId": data.get("slaveId"),
            "baudrate": data.get("baudrate"),
            "startAddress": data.get("startAddress"),
            "addressLength": data.get("addressLength")
        }

    # ✅ CREATE DEVICE
    record = DeviceModel.generate(data)

    devices_collection.insert_one(record)

    return jsonify({
        "success": True,
        "message": "Device registered successfully",
        "instrumentName": record.get("instrumentName"),
        "qes_Sno": record.get("qes_Sno"),
        "flags": record.get("flags", {}),
        "modbus": record.get("modbus", {})
    }), 201

# ─────────────────────────────────────────────
# ✅ BATCH REGISTER DEVICES (USING AVAILABLE LOGIC)
# ─────────────────────────────────────────────

@device.route("/register/batch", methods=["POST"])
def register_batch_devices():
    """Register multiple devices - original + new duplicates"""
    
    data = request.json or {}
    
    # Required fields for base device
    base_fields = [
        "RTUserialNumber", "companyName", "industryId",
        "deviceId", "stationId", "tokenId",
        "publicKey", "latitude", "longitude"
    ]
    
    error = require_fields(data, base_fields)
    if error:
        return jsonify({"error": error}), 400
    
    # Get how many devices to register total (including original)
    total_count = data.get("duplicateCount", 1)
    
    if total_count < 1 or total_count > 5:
        return jsonify({"error": "duplicateCount must be between 1 and 5"}), 400
    
    # Get base serial number (original instrument)
    base_serial = data["RTUserialNumber"].strip()
    
    # Get the original instrument
    original_instrument = instruments_collection.find_one({"RTUserialNumber": base_serial})
    
    if not original_instrument:
        return jsonify({"error": f"Instrument with serial {base_serial} not found"}), 404
    
    original_name = original_instrument.get("instrumentName")
    original_code = original_instrument.get("instrumentCode")
    
    registered_devices = []
    errors = []
    all_serials = []
    
    # Get current date for serial generation
    now = datetime.utcnow()
    month = now.strftime('%m')
    year = now.strftime('%y')
    short_code = original_code[:3] if len(original_code) >= 3 else original_code
    prefix = f"{short_code}{month}{year}_"
    
    # ✅ Get all existing instruments
    all_instruments = list(instruments_collection.find(
        {
            "instrumentCode": original_code,
            "RTUserialNumber": {"$regex": f"^{prefix}"}
        },
        {"RTUserialNumber": 1, "instrumentName": 1}  # ✅ Include instrumentName
    ))
    
    instrument_seq_nums = []
    for r in all_instruments:
        serial = r["RTUserialNumber"]
        if "_" in serial:
            try:
                seq = int(serial.split("_")[-1])
                instrument_seq_nums.append(seq)
            except:
                pass
    
    # ✅ Get all existing DEVICES (already registered)
    all_devices = list(devices_collection.find(
        {"RTUserialNumber": {"$regex": f"^{prefix}"}},
        {"RTUserialNumber": 1}
    ))
    
    device_seq_nums = []
    for d in all_devices:
        serial = d["RTUserialNumber"]
        if "_" in serial:
            try:
                seq = int(serial.split("_")[-1])
                device_seq_nums.append(seq)
            except:
                pass
    
    print(f"Instrument sequences: {instrument_seq_nums}")
    print(f"Device sequences (already registered): {device_seq_nums}")
    
    # ✅ Determine which serials need device registration
    serials_to_register = []
    
    # First, check original serial
    original_seq = extract_seq_from_serial(base_serial)
    
    # Include original if device not registered
    if original_seq not in device_seq_nums:
        serials_to_register.append(original_seq)
        print(f"Original {original_seq} needs device registration")
    
    # Then find next available sequences for remaining slots
    remaining_slots = total_count - len(serials_to_register)
    candidate = 1
    while len(serials_to_register) < total_count:
        # Check if this sequence has an instrument but no device
        if candidate in instrument_seq_nums and candidate not in device_seq_nums:
            if candidate not in serials_to_register:
                serials_to_register.append(candidate)
                print(f"Existing instrument {candidate} needs device registration")
        # Or if it's a new sequence (no instrument yet)
        elif candidate not in instrument_seq_nums:
            if candidate not in serials_to_register:
                serials_to_register.append(candidate)
                print(f"New instrument {candidate} needs creation + registration")
        candidate += 1
    
    serials_to_register.sort()
    print(f"Final serials to register: {serials_to_register}")
    
    # Register each device
    for seq_num in serials_to_register:
        serial = f"{prefix}{str(seq_num).zfill(2)}"
        all_serials.append(serial)
        
        # Check if instrument exists, if not create it
        existing_instrument = instruments_collection.find_one({"RTUserialNumber": serial})
        
        if not existing_instrument:
            # Create new instrument
            instruments_collection.insert_one({
                "instrumentName": original_name,
                "instrumentCode": original_code,
                "RTUserialNumber": serial,
                "locked": False,
                "createdAt": datetime.utcnow()
            })
            print(f"Created new instrument: {serial}")
            instrument_name_to_use = original_name
        else:
            instrument_name_to_use = existing_instrument.get("instrumentName")
        
        # Register device
        device_data = {
            "RTUserialNumber": serial,
            "instrumentName": instrument_name_to_use,  # ✅ Add instrumentName
            "companyName": data["companyName"],
            "industryId": data["industryId"],
            "deviceId": data["deviceId"],
            "stationId": data["stationId"],
            "tokenId": data["tokenId"],
            "publicKey": data["publicKey"],
            "latitude": data["latitude"],
            "longitude": data["longitude"],
            "qes_Sno": data.get("qes_Sno", "null"),
            "createdAt": datetime.utcnow()
        }
        
        if data.get("deviceName"):
            device_data["deviceName"] = data["deviceName"]
        if data.get("stationName"):
            device_data["stationName"] = data["stationName"]
        
        device_data["flags"] = data.get("flags", {})
        device_data["modbus"] = data.get("modbus", {})
        
        try:
            record = DeviceModel.generate(device_data)
            devices_collection.insert_one(record)
            registered_devices.append({
                "RTUserialNumber": serial,
                "instrumentName": instrument_name_to_use,  # ✅ Include in response
                "deviceId": device_data["deviceId"],
                "stationId": device_data["stationId"]
            })
            
            # ✅ Lock the instrument after successful device registration
            instruments_collection.update_one(
                {"RTUserialNumber": serial},
                {"$set": {"locked": True}}
            )
            print(f"✅ Registered and locked: {serial}")
            
        except Exception as e:
            errors.append({"serial": serial, "error": str(e)})
        
        time.sleep(0.05)
    
    response_data = {
        "success": len(registered_devices) > 0,
        "registered_count": len(registered_devices),
        "total_requested": total_count,
        "registered_devices": registered_devices,
        "errors": errors,
        "serials": all_serials
    }
    
    status_code = 201 if registered_devices else 400
    
    return jsonify(response_data), status_code
    
# ─────────────────────────────────────────────
# ✅ GET DEVICE 
# ─────────────────────────────────────────────

@device.route("/device", methods=["GET"])
def get_device():
    search = request.args.get("search")
    serial = (
        request.args.get("serialId") or
        request.args.get("RTUserialNumber") or
        request.args.get("rtuSerialno")
    )
    company = request.args.get("companyName")
    industry = request.args.get("industryId")
    device_id = request.args.get("deviceId")
    station = request.args.get("stationId")
    qes_sno = request.args.get("qes_Sno")
    instrument_name = request.args.get("instrumentName")
    
    # NEW search parameters
    m2m_folder = request.args.get("m2mFolder")
    survekshan_id = request.args.get("survekshanId")
    qes_server_id = request.args.get("qesServerId")
    
    query = {}
    
    # Check if ANY search parameter is provided
    has_search_params = any([
        search, serial, company, industry, device_id, 
        station, qes_sno, instrument_name, m2m_folder, 
        survekshan_id, qes_server_id
    ])
    
    if not has_search_params:
        return jsonify({"error": "Search field required"}), 400
    
    # Build query based on provided parameters
    if search:
        search = search.strip()
        query = {
            "$or": [
                {"RTUserialNumber": {"$regex": search, "$options": "i"}},
                {"instrumentName": {"$regex": search, "$options": "i"}},
                {"companyName": {"$regex": search, "$options": "i"}},
                {"industryId": {"$regex": search, "$options": "i"}},
                {"deviceId": {"$regex": search, "$options": "i"}},
                {"stationId": {"$regex": search, "$options": "i"}},
                {"qes_Sno": {"$regex": search, "$options": "i"}},
                {"deviceName": {"$regex": search, "$options": "i"}},
                {"flags.m2m.extra.folder": {"$regex": search, "$options": "i"}},
                {"flags.survekshan.extra.uniqueId": {"$regex": search, "$options": "i"}},
                {"flags.qes.extra.serverId": {"$regex": search, "$options": "i"}}
            ]
        }
    else:
        # Individual filters
        if serial:
            query["RTUserialNumber"] = serial.strip()
        if company:
            query["companyName"] = company.strip()
        if industry:
            query["industryId"] = industry.strip()
        if device_id:
            query["deviceId"] = device_id.strip()
        if station:
            query["stationId"] = station.strip()
        if qes_sno:
            query["qes_Sno"] = qes_sno.strip()
        if instrument_name:
            query["instrumentName"] = {"$regex": instrument_name.strip(), "$options": "i"}
        if m2m_folder:
            query["flags.m2m.extra.folder"] = m2m_folder.strip()
        if survekshan_id:
            query["flags.survekshan.extra.uniqueId"] = survekshan_id.strip()
        if qes_server_id:
            query["flags.qes.extra.serverId"] = qes_server_id.strip()
    
    # Check if we want list mode
    list_mode = request.args.get("list", "false").lower() == "true"
    
    # Always return list for searches or when multiple results possible
    if list_mode or search or m2m_folder or survekshan_id or qes_server_id:
        cursor = devices_collection.find(query, {"_id": 0}).limit(100)
        results = list(cursor)
        
        if not results:
            return jsonify({"error": "No devices found", "devices": []}), 404
        
        # Format each device
        for result in results:
            if "RTUserialNumber" in result:
                result["RTUSerialno"] = result.pop("RTUserialNumber")
            if "instrumentName" not in result:
                result["instrumentName"] = ""
        
        # If not list_mode and only 1 result, return as single object
        if not list_mode and len(results) == 1:
            return jsonify(results[0]), 200
        
        return jsonify({
            "count": len(results),
            "devices": results
        }), 200
    else:
        # Single device exact match
        result = devices_collection.find_one(query, {"_id": 0})
        
        if not result:
            return jsonify({"error": "Device not found"}), 404
        
        if "RTUserialNumber" in result:
            result["RTUSerialno"] = result.pop("RTUserialNumber")
        
        if "instrumentName" not in result:
            result["instrumentName"] = ""
        
        return jsonify(result), 200

# ─────────────────────────────────────────────
# ✅ CONFIGURE DEVICE (DO NOT TOUCH LOGIC)
# ─────────────────────────────────────────────
@device.route("/device/configure", methods=["POST"])
def configure_device():

    data = request.json or {}

    serial = data.get("RTUserialNumber")
    url = str(data.get("url", "")).lower()

    if not serial:
        return jsonify({"error": "RTUserialNumber required"}), 400

    device_doc = devices_collection.find_one({"RTUserialNumber": serial})

    if not device_doc:
        return jsonify({"error": "Device not found"}), 404

    keywords = os.getenv("CONFIG_KEYWORDS", "sewer_tp").lower().split(",")

    keyword_match = any(k.strip() in url for k in keywords)

    already_configured = device_doc.get("flags", {}).get("configured", False)

    configured = already_configured or keyword_match

    devices_collection.update_one(
        {"RTUserialNumber": serial},
        {"$set": {"flags.configured": configured}}
    )

    return jsonify({
        "success": True,
        "configured": configured
    }), 200


# ─────────────────────────────────────────────
# ✅ CHECK DEVICE EXISTENCE
# ─────────────────────────────────────────────
@device.route("/device/check/<path:RTUserialNumber>", methods=["GET"])
def check_device(RTUserialNumber):

    serial = RTUserialNumber.strip()

    instrument = instruments_collection.find_one({
        "RTUserialNumber": serial
    })

    return jsonify({"exists": bool(instrument)}), 200


# ─────────────────────────────────────────────
# ✅ UPDATE DEVICE (FINAL SAFE VERSION)
# ─────────────────────────────────────────────
@device.route("/device/<serial>", methods=["PUT", "PATCH"])
def update_device(serial):

    data = request.json or {}

    existing = devices_collection.find_one({
        "RTUserialNumber": serial
    })

    if not existing:
        return jsonify({"error": "Device not found"}), 404

    # ✅ FIX: Handle qes_Sno - keep "null" string
    if "qes_Sno" in data:
        qes_value = data["qes_Sno"]
        # Only convert real None or empty string to "null"
        if qes_value is None or qes_value == "":
            data["qes_Sno"] = "null"
        elif isinstance(qes_value, str):
            stripped = qes_value.strip()
            if stripped == "":
                data["qes_Sno"] = "null"
            else:
                data["qes_Sno"] = stripped
        else:
            data["qes_Sno"] = str(qes_value)

    # ✅ FLAGS SAFE COPY
    new_flags = dict(data.get("flags", {}))
    existing_flags = existing.get("flags", {})

    # ───────── HANDLE CUSTOM SERVER ─────────
    if "customServerFlag" in data:
        new_flags.setdefault("customServer", {})
        new_flags["customServer"]["enabled"] = data["customServerFlag"]

    if "customServerUrl" in data:
        new_flags.setdefault("customServer", {}).setdefault("extra", {})
        new_flags["customServer"]["extra"]["url"] = data["customServerUrl"]

    if "customServerAuth" in data and isinstance(data["customServerAuth"], dict):
        new_flags.setdefault("customServer", {}).setdefault("extra", {})
        new_flags["customServer"]["extra"]["auth"] = data["customServerAuth"]

    if "customServerHeaders" in data and isinstance(data["customServerHeaders"], dict):
        new_flags.setdefault("customServer", {}).setdefault("extra", {})
        new_flags["customServer"]["extra"]["headers"] = data["customServerHeaders"]

    # ───────── DEEP MERGE FLAGS ─────────
    def deep_merge(old, new):
        merged = old.copy()
        for k, v in new.items():
            if isinstance(v, dict) and isinstance(old.get(k), dict):
                merged[k] = deep_merge(old[k], v)
            else:
                merged[k] = v
        return merged

    merged_flags = deep_merge(existing_flags, new_flags)

    # ───────── ✅ MODBUS MERGE ─────────
    existing_modbus = existing.get("modbus", {})
    new_modbus = data.get("modbus", {})

    # flat support
    flat_modbus = {
        "slaveId": data.get("slaveId"),
        "baudrate": data.get("baudrate"),
        "startAddress": data.get("startAddress"),
        "addressLength": data.get("addressLength")
    }

    for k, v in flat_modbus.items():
        if v is not None:
            new_modbus[k] = v

    def merge_modbus(old, new):
        merged = old.copy()
        for k, v in new.items():
            if v is not None:
                merged[k] = v
        return merged

    merged_modbus = merge_modbus(existing_modbus, new_modbus)

    # ───────── CLEAN FLAT FIELDS ─────────
    flat_flags = [
        "cpcbFlag", "m2mFlag", "qesFlag",
        "qesInterval", "survekshanFlag",
        "customServerFlag", "customServerUrl", "customServerAuth",
        "configured",

        # modbus cleanup
        "slaveId", "baudrate", "startAddress", "addressLength"
    ]

    clean_data = {
        k: v for k, v in data.items()
        if k not in flat_flags and k not in ["flags", "modbus", "qes_Sno"]
    }

    # ✅ Prepare update data
    update_data = {
        **clean_data,
        "flags": merged_flags,
        "modbus": merged_modbus
    }
    
    # ✅ Only add qes_Sno if it exists in data
    if "qes_Sno" in data:
        update_data["qes_Sno"] = data["qes_Sno"]
    
    # ✅ Handle instrumentName update if provided
    if "instrumentName" in data:
        update_data["instrumentName"] = data["instrumentName"]

    devices_collection.update_one(
        {"RTUserialNumber": serial},
        {
            "$set": update_data,
            "$unset": {key: "" for key in flat_flags}
        }
    )

    return jsonify({
        "success": True,
        "message": "Device updated clean",
        "instrumentName": update_data.get("instrumentName"),
        "qes_Sno": data.get("qes_Sno"),
        "modbus": merged_modbus
    }), 200


# ─────────────────────────────────────────────
# ✅ GET ALL DEVICES
# ─────────────────────────────────────────────
@device.route("/devices", methods=["GET"])
def get_all_devices():

    devices = list(devices_collection.find({}, {"_id": 0}))

    for d in devices:
        d["RTUSerialno"] = d.pop("RTUserialNumber")

    return jsonify(devices), 200


# ─────────────────────────────────────────────
# ✅ DEVICE STATUS
# ─────────────────────────────────────────────
@device.route("/device-status/<serial>", methods=["GET"])
def get_device_status(serial):

    serial = serial.strip()

    device = devices_collection.find_one(
        {"RTUserialNumber": serial},
        {"_id": 0}
    )

    if not device:
        return jsonify({"error": "Device not found"}), 404

    return jsonify({
        "device-status": device.get("device-status", ""),
        "server-status": device.get("server-status", ""),
        "server-code": device.get("server-code", ""),
        "lastsendingtime": device.get("lastsendingtime", "")
    }), 200


