from flask import Blueprint, request, jsonify
from datetime import datetime

from db import instruments_collection
from utils import generate_instrument_code
from validators.validators import require_fields

instrument = Blueprint("instrument", __name__, url_prefix="/api/instrument")


# ===============================
# 🔹 HELPER: EXTRACT SEQUENCE
# ===============================
def extract_seq(serial):
    try:
        return int(serial.split("_")[-1])
    except:
        return 0


def get_next_sequence(code, prefix):
    records = list(instruments_collection.find(
        {
            "instrumentCode": code,
            "RTUserialNumber": {"$regex": f"^{prefix}"}
        },
        {"RTUserialNumber": 1}
    ))

    if records:
        max_seq = max([extract_seq(r["RTUserialNumber"]) for r in records])
        return max_seq + 1

    return 1


# ===============================
# ✅ CREATE
# ===============================
@instrument.route("/create", methods=["POST"])
def create_instrument():
    data = request.json

    error = require_fields(data, ["instrumentName", "instrumentCode"])
    if error:
        return jsonify({"error": error}), 400

    name = data["instrumentName"].strip()
    code = data["instrumentCode"].strip().upper()

    if not code.isalpha():
        return jsonify({"error": "Instrument code must contain only letters"}), 400

    if len(code) < 3:
        return jsonify({"error": "Instrument code must be at least 3 characters"}), 400

    rtu_serial = generate_instrument_code(code)

    instruments_collection.insert_one({
        "instrumentName": name,
        "instrumentCode": code,
        "RTUserialNumber": rtu_serial,
        "locked": False,
        "createdAt": datetime.utcnow()
    })

    return jsonify({
        "success": True,
        "RTUserialNumber": rtu_serial
    }), 201


# ===============================
# ✅ AVAILABLE
# ===============================
@instrument.route("/available", methods=["GET"])
def available_instruments():
    code = request.args.get("code")
    now = datetime.utcnow()

    # ===============================
    # ✅ CASE 1: NO CODE
    # ===============================
    if not code:
        result = []

        # 🔹 show unlocked (top priority)
        unlocked_list = list(instruments_collection.find(
            {"locked": {"$ne": True}},
            {
                "_id": 0,
                "instrumentName": 1,
                "instrumentCode": 1,
                "RTUserialNumber": 1
            }
        ).sort("createdAt", 1).limit(10))

        result.extend(unlocked_list)

        # 🔹 only add NEXT if no unlocked exists for that code
        codes = instruments_collection.distinct("instrumentCode")

        for code_val in codes:
            exists_unlocked = instruments_collection.find_one({
                "instrumentCode": code_val,
                "locked": {"$ne": True}
            })

            # 👉 skip if unlocked exists
            if exists_unlocked:
                continue

            short_code = code_val[:3]
            prefix = f"{short_code}{now.strftime('%m')}{now.strftime('%y')}_"

            next_seq = get_next_sequence(code_val, prefix)
            next_serial = f"{prefix}{str(next_seq).zfill(2)}"
            
            # ✅ Get actual instrument name from existing instrument
            existing_instrument = instruments_collection.find_one({"instrumentCode": code_val})
            instrument_name = existing_instrument.get("instrumentName", code_val) if existing_instrument else code_val

            result.append({
                "instrumentName": instrument_name,
                "instrumentCode": code_val,
                "RTUserialNumber": next_serial,
                "isNextAvailable": True
            })

        return jsonify(result)

    # ===============================
    # ✅ CASE 2: WITH CODE
    # ===============================
    code = code.strip().upper()

    # 🔹 STEP 1: get unlocked
    unlocked_list = list(instruments_collection.find(
        {
            "instrumentCode": code,
            "locked": {"$ne": True}
        },
        {
            "_id": 0,
            "instrumentName": 1,
            "instrumentCode": 1,
            "RTUserialNumber": 1
        }
    ).sort("createdAt", 1))

    if unlocked_list:
        return jsonify(unlocked_list)

    short_code = code[:3]
    prefix = f"{short_code}{now.strftime('%m')}{now.strftime('%y')}_"

    next_seq = get_next_sequence(code, prefix)
    next_serial = f"{prefix}{str(next_seq).zfill(2)}"
    
    # ✅ Get actual instrument name
    existing_instrument = instruments_collection.find_one({"instrumentCode": code})
    instrument_name = existing_instrument.get("instrumentName", code) if existing_instrument else code

    return jsonify([{
        "instrumentName": instrument_name,
        "instrumentCode": code,
        "RTUserialNumber": next_serial,
        "isNextAvailable": True
    }])


# ===============================
# ✅ LATEST
# ===============================
@instrument.route("/latest", methods=["GET"])
def latest_serial():
    latest = instruments_collection.find_one(
        {},
        {"_id": 0},
        sort=[("createdAt", -1)]
    )

    if not latest:
        return jsonify({"RTUserialNumber": None})

    return jsonify({"RTUserialNumber": latest.get("RTUserialNumber")})


# ===============================
# ✅ CONNECT (AUTO CREATE) - FIXED
# ===============================
@instrument.route("/connect", methods=["POST"])
def connect_instrument():
    data = request.json
    serial = data.get("RTUserialNumber")
    code = data.get("instrumentCode")

    if not serial:
        return jsonify({"error": "Serial required"}), 400

    existing = instruments_collection.find_one({"RTUserialNumber": serial})

    if existing:
        return jsonify({"success": True})

    # Get correct name from existing instrument with same code
    template = instruments_collection.find_one({"instrumentCode": code})
    instrument_name = template.get("instrumentName") if template else code

    instruments_collection.insert_one({
        "instrumentName": instrument_name,
        "instrumentCode": code,
        "RTUserialNumber": serial,
        "locked": False,  # Don't lock here, register will lock
        "createdAt": datetime.utcnow()
    })

    return jsonify({"success": True})

    
# ===============================
# ✅ GET NEXT SERIALS (BATCH REGISTRATION)
# ===============================
@instrument.route("/next-serials", methods=["POST"])
def get_next_serials():
    """Generate multiple next serial numbers for batch registration"""
    data = request.json
    code = data.get("instrumentCode")
    count = data.get("count", 1)
    
    if not code:
        return jsonify({"error": "instrumentCode required"}), 400
    
    code = code.strip().upper()
    now = datetime.utcnow()
    
    short_code = code[:3] if len(code) >= 3 else code
    prefix = f"{short_code}{now.strftime('%m')}{now.strftime('%y')}_"
    
    # Get all existing sequences (locked + unlocked)
    all_records = list(instruments_collection.find(
        {
            "instrumentCode": code,
            "RTUserialNumber": {"$regex": f"^{prefix}"}
        },
        {"RTUserialNumber": 1}
    ))
    
    existing_seqs = []
    for r in all_records:
        seq = extract_seq(r["RTUserialNumber"])
        if seq > 0:
            existing_seqs.append(seq)
    
    if existing_seqs:
        start_seq = max(existing_seqs) + 1
    else:
        start_seq = 1
    
    serials = []
    for i in range(count):
        next_serial = f"{prefix}{str(start_seq + i).zfill(2)}"
        serials.append(next_serial)
    
    return jsonify({
        "serials": serials,
        "count": len(serials)
    }), 200


# ===============================
# ✅ DEBUG: CHECK STATUS
# ===============================
@instrument.route("/debug/status", methods=["GET"])
def debug_instrument_status():
    """Debug endpoint to check instrument locks"""
    locked = list(instruments_collection.find(
        {"locked": True},
        {"_id": 0, "RTUserialNumber": 1, "locked": 1, "instrumentCode": 1, "instrumentName": 1}
    ))
    
    unlocked = list(instruments_collection.find(
        {"locked": False},
        {"_id": 0, "RTUserialNumber": 1, "locked": 1, "instrumentCode": 1, "instrumentName": 1}
    ))
    
    return jsonify({
        "locked_count": len(locked),
        "locked_instruments": locked,
        "unlocked_count": len(unlocked),
        "unlocked_instruments": unlocked
    }), 200


# ===============================
# ✅ UNLOCK ALL (FOR TESTING)
# ===============================
@instrument.route("/unlock-all", methods=["POST"])
def unlock_all():
    """Unlock all instruments for testing"""
    result = instruments_collection.update_many(
        {},
        {"$set": {"locked": False}}
    )
    return jsonify({
        "success": True,
        "unlocked_count": result.modified_count
    }), 200