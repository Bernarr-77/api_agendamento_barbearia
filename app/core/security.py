from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

load_dotenv()
secret_key = os.getenv("SECRET_KEY")
expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
algorithm = os.getenv("ALGORITHM")

#===================================================
#       HASHED PASSWORD
#===================================================
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

#===================================================
#       JWT
#===================================================
def create_access_token(data: dict):

    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=expire_minutes)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode,secret_key, algorithm=algorithm)
    return encoded_jwt




