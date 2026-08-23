from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.auth.schemas import UserRegister, UserLogin, Token, UserOut
from app.auth import service
from app.users.models import User
from app.auth.dependencies import get_current_user
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserOut)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_username = db.query(User).filter(User.username == user_data.username.strip()).first()
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")

    email_clean = user_data.email.strip() if user_data.email and user_data.email.strip() else None
    if email_clean:
        existing_email = db.query(User).filter(User.email == email_clean).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email already registered")

    return service.create_user(db, user_data)


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    login_id = credentials.login or credentials.username
    if not login_id:
        raise HTTPException(status_code=400, detail="Username or login required")
    user = service.authenticate_user(db, login_id, credentials.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    token = create_access_token({"sub": str(user.id)})
    return Token(access_token=token)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user