def validate_device_flags(data):

    # ───────── COMMON PARAM VALIDATION ─────────
    def validate_parameters(flag, params, name):
        if flag:
            if not isinstance(params, list) or len(params) == 0:
                return f"{name} parameters required"

            for i, p in enumerate(params):
                if not isinstance(p, dict):
                    return f"{name} parameter #{i+1} must be an object"

                if not p.get("name") or not str(p.get("name")).strip():
                    return f"{name} parameter #{i+1} name required"

                if not p.get("unit") or not str(p.get("unit")).strip():
                    return f"{name} parameter #{i+1} unit required"

        return None

    # ───────── CPCB ─────────
    err = validate_parameters(
        data.get("cpcbFlag"),
        data.get("cpcbParameters", []),
        "CPCB"
    )
    if err:
        return err

    # ───────── M2M ─────────
    err = validate_parameters(
        data.get("m2mFlag"),
        data.get("m2mParameters", []),
        "M2M"
    )
    if err:
        return err

    # Folder validation (user sirf code dale, "/" backend handle karega)
    if data.get("m2mFlag"):
        folder = data.get("m2mFolder", "")
        if not folder or "_" not in folder:
            return "M2M folder must be like xxxx_xx"

    # ───────── SURVEKSHAN ─────────
    err = validate_parameters(
        data.get("survekshanFlag"),
        data.get("survekshanParameters", []),
        "Survekshan"
    )
    if err:
        return err

    # ───────── QES ─────────
    err = validate_parameters(
        data.get("qesFlag"),
        data.get("qesParameters", []),
        "QES"
    )
    if err:
        return err

    # QES extra validation
    if data.get("qesFlag"):
        if not data.get("qesServerId") or not data.get("qesCode"):
            return "QES serverId and code required"

    return None