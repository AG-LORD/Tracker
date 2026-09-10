from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.models.activity_type import ActivityType
from app.schemas.activity_type import ActivityTypeResponse


router = APIRouter(
    prefix="/activity-types",
    tags=["Activity Types"],
)


@router.get(
    "",
    response_model=list[ActivityTypeResponse],
)
def get_activity_types(
    db: Session = Depends(get_db),
):
    return (
        db.query(ActivityType)
        .filter(ActivityType.is_active.is_(True))
        .order_by(ActivityType.name)
        .all()
    )