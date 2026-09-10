import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm import Session, joinedload
from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.activity import Activity
from app.models.activity_type import ActivityType
from app.models.user import User
from app.schemas.activity import ActivityCreate, ActivityResponse


router = APIRouter(
    prefix="/activities",
    tags=["Activities"],
)


@router.post(
    "",
    response_model=ActivityResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_activity(
    activity_data: ActivityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if activity_data.end_at <= activity_data.start_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_at must be after start_at",
        )

    activity_type = (
        db.query(ActivityType)
        .filter(
            ActivityType.id == activity_data.activity_type_id,
            ActivityType.is_active.is_(True),
        )
        .first()
    )

    if activity_type is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid activity type",
        )

    activity = Activity(
        user_id=current_user.id,
        activity_type_id=activity_data.activity_type_id,
        title=activity_data.title,
        start_at=activity_data.start_at,
        end_at=activity_data.end_at,
        notes=activity_data.notes,
    )

    db.add(activity)
    db.commit()
    db.refresh(activity)

    return activity


@router.get(
    "",
    response_model=list[ActivityResponse],
)
def get_activities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(Activity)
        .options(joinedload(Activity.activity_type))
        .filter(
            Activity.user_id == current_user.id,
            Activity.deleted_at.is_(None),
        )
        .order_by(Activity.start_at.desc())
        .all()
    )


@router.get(
    "/{activity_id}",
    response_model=ActivityResponse,
)
def get_activity(
    activity_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    activity = (
        db.query(Activity)
        .options(joinedload(Activity.activity_type))
        .filter(
            Activity.id == activity_id,
            Activity.user_id == current_user.id,
            Activity.deleted_at.is_(None),
        )
        .first()
    )

    if activity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Activity not found",
        )

    db.commit()
    db.refresh(activity)

    return activity