import os
from dotenv import load_dotenv

load_dotenv()

class Config:

    MONGO_URI = os.getenv("MONGO_URI")

    if not MONGO_URI:
        raise Exception("MONGO_URI not found in environment")

    DEBUG = False