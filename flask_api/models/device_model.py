# from datetime import datetime
# import random

# class DeviceModel:

#     @staticmethod
#     def generate_survekshan_id():
#         return f"M9{random.randint(100,999)}"

#     @staticmethod
#     def format_folder(folder):
#         """
#         Ensure folder always starts with '/'
#         user input: plant_01  → stored: /plant_01
#         """
#         if not folder:
#             return None
#         return f"/{folder.lstrip('/')}"

#     @staticmethod
#     def generate(data):

#         return {
#             "RTUserialNumber": data["RTUserialNumber"],
#             "companyName": data["companyName"],
#             "industryId": data["industryId"],
#             "deviceId": data["deviceId"],
#             "deviceName": data.get("deviceName"),
#             "stationId": data["stationId"],
#             "stationName": data.get("stationName"),
#             "tokenId": data["tokenId"],
#             "publicKey": data["publicKey"],
#             "latitude": data["latitude"],
#             "longitude": data["longitude"],

#             #FLAGS STRUCTURE
#             "flags": {

#                 # ───────── CPCB ─────────
#                 "cpcb": {
#                     "enabled": data.get("cpcbFlag", False),
#                     "parameters": data.get("cpcbParameters", []),
#                     "interval": None,
#                     "extra": {}
#                 },

#                 # ───────── M2M ─────────
#                 "m2m": {
#                     "enabled": data.get("m2mFlag", False),
#                     "parameters": data.get("m2mParameters", []),  
#                     "interval": data.get("m2mInterval"),
#                     "extra": {
#                         "folder": DeviceModel.format_folder(
#                             data.get("m2mFolder")
#                         )
#                     }
#                 },

#                 # ───────── SURVEKSHAN ─────────
#                 "survekshan": {
#                     "enabled": data.get("survekshanFlag", False),
#                     "parameters": data.get("survekshanParameters", []),  
#                     "interval": data.get("survekshanInterval"),
#                     "extra": {
#                         "uniqueId": data.get("survekshanId") 
#                                      or DeviceModel.generate_survekshan_id()
#                     }
#                 },

#                 # ───────── QES ─────────
#                 "qes": {
#                     "enabled": data.get("qesFlag", False),
#                     "parameters": data.get("qesParameters", []), 
#                     "interval": data.get("qesInterval"),
#                     "extra": {
#                         "serverId": data.get("qesServerId"),
#                         "uniqueCode": data.get("qesCode")
#                     }
#                 },

#                 "configured": False
#             },

#             "createdAt": datetime.utcnow()
#         }


from datetime import datetime
import random


class DeviceModel:

    @staticmethod
    def generate_survekshan_id():
        return f"M9{random.randint(100, 999)}"

    @staticmethod
    def format_folder(folder):
        if not folder:
            return None
        return f"/{folder.lstrip('/')}"

    # ✅ Normalize custom server (REUSABLE)
    @staticmethod
    def normalize_custom_server(cs):
        if not isinstance(cs, dict):
            cs = {}

        extra = cs.get("extra", {})

        return {
            "enabled": cs.get("enabled", False),
            "parameters": cs.get("parameters", []),
            "interval": cs.get("interval"),
            "extra": {
                "url": cs.get("url") or extra.get("url"),
                "auth": cs.get("auth") if isinstance(cs.get("auth"), dict)
                        else extra.get("auth", {}),
                "headers": cs.get("headers") if isinstance(cs.get("headers"), dict)
                        else extra.get("headers", {})
            }
        }

    # ✅ NEW: Normalize Modbus Config
    @staticmethod
    def normalize_modbus(modbus):
        if not isinstance(modbus, dict):
            modbus = {}

        return {
            "slaveId": modbus.get("slaveId"),
            "baudrate": modbus.get("baudrate"),
            "startAddress": modbus.get("startAddress"),
            "addressLength": modbus.get("addressLength")
        }

    # ✅ Helper to normalize qes_Sno value
    @staticmethod
    def normalize_qes_sno(value):
        """Convert empty string or 'null' string to None"""
        if value is None:
            return "null"
        if value == "":
            return "null"
        return value

    @staticmethod
    def generate(data):

        # ─────────────────────────────────────────────
        # ✅ CASE 1: New structured payload
        # ─────────────────────────────────────────────
        if isinstance(data.get("flags"), dict):

            flags = data["flags"]

            # ✅ Normalize custom server FIRST
            flags["customServer"] = DeviceModel.normalize_custom_server(
                flags.get("customServer", {})
            )

            # ✅ DEFAULT STRUCTURE ENSURE
            flags.setdefault("cpcb", {
                "enabled": False,
                "parameters": [],
                "interval": None,
                "extra": {}
            })

            flags.setdefault("m2m", {
                "enabled": False,
                "parameters": [],
                "interval": None,
                "extra": {}
            })

            flags.setdefault("survekshan", {
                "enabled": False,
                "qty": None,
                "interval": None,
                "extra": {}
            })

            flags.setdefault("qes", {
                "enabled": False,
                "parameters": [],
                "interval": None,
                "extra": {}
            })

            flags.setdefault("configured", False)

            # ✅ NEW: structured modbus
            modbus = DeviceModel.normalize_modbus(data.get("modbus", {}))

        # ─────────────────────────────────────────────
        # ✅ CASE 2: Old payload (flat fields)
        # ─────────────────────────────────────────────
        else:

            flags = {

                "cpcb": {
                    "enabled": data.get("cpcbFlag", False),
                    "parameters": data.get("cpcbParameters", []),
                    "interval": None,
                    "extra": {}
                },

                "m2m": {
                    "enabled": data.get("m2mFlag", False),
                    "parameters": data.get("m2mParameters", []),
                    "interval": data.get("m2mInterval"),
                    "extra": {
                        "folder": DeviceModel.format_folder(
                            data.get("m2mFolder")
                        )
                    }
                },

                "survekshan": {
                    "enabled": data.get("survekshanFlag", False),
                    "qty": data.get("survekshanQty"),
                    "interval": data.get("survekshanInterval"),
                    "extra": {
                        "uniqueId": data.get("survekshanId")
                    }
                },

                "qes": {
                    "enabled": data.get("qesFlag", False),
                    "parameters": data.get("qesParameters", []),
                    "interval": data.get("qesInterval"),
                    "extra": {
                        "serverId": data.get("qesServerId"),
                        "uniqueCode": data.get("qesCode")
                    }
                },

                # ✅ Custom Server handled cleanly
                "customServer": DeviceModel.normalize_custom_server({
                    "enabled": data.get("customServerFlag", False),
                    "url": data.get("customServerUrl"),
                    "auth": data.get("customServerAuth"),
                    "headers": data.get("customServerHeaders")
                }),

                "configured": False
            }

            # ✅ NEW: flat → modbus mapping
            modbus = DeviceModel.normalize_modbus({
                "slaveId": data.get("slaveId"),
                "baudrate": data.get("baudrate"),
                "startAddress": data.get("startAddress"),
                "addressLength": data.get("addressLength")
            })

        # ─────────────────────────────────────────────
        # ✅ Normalize qes_Sno value
        # ─────────────────────────────────────────────
        qes_sno_value = DeviceModel.normalize_qes_sno(data.get("qes_Sno"))

        # ─────────────────────────────────────────────
        # ✅ FINAL RECORD
        # ─────────────────────────────────────────────
        return {
            "RTUserialNumber": data["RTUserialNumber"],
            "instrumentName": data.get("instrumentName"),
            "companyName": data["companyName"],
            "industryId": data["industryId"],
            "qes_Sno": qes_sno_value,  
            "deviceId": data["deviceId"],
            "deviceName": data.get("deviceName"),
            "stationId": data["stationId"],
            "stationName": data.get("stationName"),
            "code_version": data.get("code_version"),
            "tokenId": data["tokenId"],
            "publicKey": data["publicKey"],
            "latitude": data["latitude"],
            "longitude": data["longitude"],

            # ✅ NEW FIELD
            "modbus": modbus,

            "flags": flags,
            "createdAt": datetime.utcnow()
        }