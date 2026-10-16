import os
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename

bin_route = Blueprint("bin_route", __name__, url_prefix="/api")

UPLOAD_FOLDER = os.path.abspath("files")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Partial search fix
@bin_route.route("/search-bin/<filename>", methods=["GET"])
def search_bin(filename):
    query = filename.lower()
    matched = [
        f for f in os.listdir(UPLOAD_FOLDER)
        if query in f.lower() and os.path.isfile(os.path.join(UPLOAD_FOLDER, f))
    ]
    if matched:
        return jsonify({"exists": True, "filename": matched[0], "matches": matched})
    return jsonify({"exists": False}), 404

# New — list all files
@bin_route.route("/list-bin", methods=["GET"])
def list_bin():
    try:
        files = []
        for f in os.listdir(UPLOAD_FOLDER):
            filepath = os.path.join(UPLOAD_FOLDER, f)
            if os.path.isfile(filepath):
                files.append({
                    "filename": f,
                    "size": os.path.getsize(filepath),
                    "modified": os.path.getmtime(filepath)
                })
        files.sort(key=lambda x: x["modified"], reverse=True)
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ UPLOAD
@bin_route.route("/upload-bin", methods=["POST"])
def upload_bin():
    if "file" not in request.files:
        return jsonify({"error": "No file"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)

    file.save(filepath)

    return jsonify({
        "message": "File uploaded",
        "filename": filename
    })


# ✅ DOWNLOAD (FIXED)
@bin_route.route("/getbin/<filename>", methods=["GET"])
def get_bin(filename):
    try:
        filename = secure_filename(filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404

        return send_file(filepath, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ✅ DELETE BIN FILE
@bin_route.route("/delete-bin/<filename>", methods=["DELETE"])
def delete_bin(filename):
    try:
        filename = secure_filename(filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404

        os.remove(filepath)

        return jsonify({
            "message": "File deleted",
            "filename": filename
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500        

# ✅ REPLACE BIN FILE
@bin_route.route("/replace-bin", methods=["PUT"])
def replace_bin():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files["file"]
        filename = request.form.get("filename")

        # 👇 ADD THIS — check terminal output after clicking Replace
        print(">>> REPLACE CALLED")
        print(">>> filename from form:", filename)
        print(">>> uploaded file name:", file.filename)
        print(">>> uploaded file size:", request.content_length)

        if not filename:
            return jsonify({"error": "Filename required"}), 400

        filename = secure_filename(filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)

        if not os.path.exists(filepath):
            return jsonify({"error": "File not found"}), 404

        os.remove(filepath)
        file.save(filepath)

        return jsonify({
            "message": "File replaced successfully",
            "filename": filename
        })

    except Exception as e:
        print(">>> ERROR:", str(e))
        return jsonify({"error": str(e)}), 500