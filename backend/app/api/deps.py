from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_or_create_demo_user(db: Session) -> User:
    demo_email = "demo@datapilot.ai"
    user = db.query(User).filter(User.email == demo_email).first()
    if not user:
        from app.core.security import get_password_hash
        user = User(
            email=demo_email,
            hashed_password=get_password_hash("datapilot2026"),
            full_name="Alex R. (Demo User)",
            plan_tier="pro",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    if not token:
        # Seamlessly fallback to pre-provisioned demo user so app is instantly usable
        return get_or_create_demo_user(db)
        
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        # If invalid token, fallback to demo user
        return get_or_create_demo_user(db)
        
    try:
        user_id = int(payload["sub"])
    except ValueError:
        return get_or_create_demo_user(db)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return get_or_create_demo_user(db)
    return user
