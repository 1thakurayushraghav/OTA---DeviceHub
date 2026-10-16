def require_fields(data, fields):

    for field in fields:

        value = data.get(field)

        if value is None:
            return f"{field} is required"

        if isinstance(value, str) and not value.strip():
            return f"{field} cannot be empty"

    return None