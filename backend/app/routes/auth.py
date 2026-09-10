from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.oauth_account import OAuthAccount
from app.models.user import User
from app.schemas.auth import AuthUserResponse, GoogleLoginRequest
from app.services.auth import create_access_token
from app.services.google_auth import verify_google_id_token


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post(
    "/google",
    response_model=AuthUserResponse,
)
def google_login(
    data: GoogleLoginRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    try:
        google_user = verify_google_id_token(data.credential)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google credential",
        ) from exc

    google_user_id = google_user.get("sub")
    email = google_user.get("email")
    name = google_user.get("name") or "User"
    picture = google_user.get("picture")

    if not google_user_id or not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account is missing required information",
        )

    oauth_account = (
        db.query(OAuthAccount)
        .filter(
            OAuthAccount.provider == "google",
            OAuthAccount.provider_user_id == google_user_id,
        )
        .first()
    )

    if oauth_account:
        user = (
            db.query(User)
            .filter(User.id == oauth_account.user_id)
            .first()
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="OAuth account references missing user",
            )

    else:
        user = (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

        if user is None:
            user = User(
                email=email,
                name=name,
                profile_image_url=picture,
                timezone="Asia/Kolkata",
            )
            db.add(user)
            db.flush()

        oauth_account = OAuthAccount(
            user_id=user.id,
            provider="google",
            provider_user_id=google_user_id,
        )

        db.add(oauth_account)

    db.commit()
    db.refresh(user)

    access_token = create_access_token(user.id)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

    return user


@router.get(
    "/me",
    response_model=AuthUserResponse,
)
def get_me(
    current_user: User = Depends(get_current_user),
):
    return current_user


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
    )

    return {"message": "Logged out"}