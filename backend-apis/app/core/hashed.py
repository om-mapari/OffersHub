from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# Example usage
plain_password = "1234"
hashed_password = pwd_context.hash(plain_password)
print("test password: ", hashed_password)