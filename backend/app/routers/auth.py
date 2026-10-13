from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    TokenResponse
)
from backend.app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account"
)
def register(
    req: UserRegisterRequest,
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Registers a new student account with validated details and a hashed password.
    Normalizes email and enforces unique account constraints.
    """
    normalized_email = req.email.strip().lower()

    # Uniqueness check
    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists. Please sign in instead."
        )

    # Hash password securely
    hashed_pw = hash_password(req.password)

    new_user = User(
        email=normalized_email,
        full_name=req.full_name.strip(),
        hashed_password=hashed_pw,
        is_active=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse.model_validate(new_user)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate student and return secure session token"
)
def login(
    req: UserLoginRequest,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Authenticates registered users against the database.
    Returns generic error messages on invalid email or password to prevent account enumeration.
    """
    normalized_email = req.email.strip().lower()
    user = db.query(User).filter(User.email == normalized_email, User.is_active == True).first()

    # Verify password against hash
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Issue secure signed JWT session token
    token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "name": user.full_name
        }
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve authenticated student profile"
)
def get_me(current_user: User = Depends(get_current_user)) -> UserResponse:
    """
    Returns the profile of the currently authenticated learner.
    Enforces server-side authentication.
    """
    return UserResponse.model_validate(current_user)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Invalidate client session"
)
def logout(current_user: User = Depends(get_current_user)):
    """
    Terminates client session. Token should be discarded by the client.
    """
    return {
        "message": "Logged out successfully",
        "user_id": current_user.id
    }
