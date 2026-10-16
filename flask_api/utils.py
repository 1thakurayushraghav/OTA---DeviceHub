from datetime import datetime
from db import instruments_collection


def generate_instrument_code(instrument_code):
    # ✅ normalize
    code = (instrument_code or "").strip().upper()
    if not code:
        raise ValueError("Instrument code required")

    short_code = code[:3]

    # ✅ date part
    now = datetime.utcnow()
    month = now.strftime("%m")
    year = now.strftime("%y")

    prefix = f"{short_code}{month}{year}_".strip()

    # ✅ find LAST sequence based on prefix (case-insensitive)
    last = instruments_collection.find_one(
        {
            "RTUserialNumber": {"$regex": f"^{prefix}", "$options": "i"}
        },
        sort=[("RTUserialNumber", -1)]
    )

    # ✅ safe extraction
    next_seq = 1
    if last and last.get("RTUserialNumber"):
        try:
            last_seq = int(last["RTUserialNumber"].split("_")[-1])
            next_seq = last_seq + 1
        except Exception:
            next_seq = 1

    serial = f"{prefix}{str(next_seq).zfill(2)}"

    return serial