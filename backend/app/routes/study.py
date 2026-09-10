from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.dependencies import get_db
from app.models.activity import Activity
from app.models.activity_type import ActivityType
from app.models.study_session import StudySession
from app.models.study_subject import StudySubject
from app.models.user import User
from app.schemas.study import (
    StudySessionCreate,
    StudySessionResponse,
    StudySubjectCreate,
    StudySubjectResponse,
)


router = APIRouter(
    prefix="/study",
    tags=["Study"],
)


@router.get(
    "/subjects",
    response_model=list[StudySubjectResponse],
)
def get_subjects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(StudySubject)
        .filter(
            StudySubject.user_id == current_user.id,
            StudySubject.is_active.is_(True),
        )
        .order_by(StudySubject.name)
        .all()
    )


@router.post(
    "/subjects",
    response_model=StudySubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subject(
    data: StudySubjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    name = data.name.strip()

    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Subject name cannot be empty",
        )

    existing_subject = (
        db.query(StudySubject)
        .filter(
            StudySubject.user_id == current_user.id,
            StudySubject.name == name,
        )
        .first()
    )

    if existing_subject is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Study subject already exists",
        )

    subject = StudySubject(
        user_id=current_user.id,
        name=name,
    )

    db.add(subject)

    try:
        db.commit()
        db.refresh(subject)
    except Exception:
        db.rollback()
        raise

    return subject


@router.post(
    "/sessions",
    response_model=StudySessionResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_study_session(
    data: StudySessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.end_at <= data.start_at:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="end_at must be after start_at",
        )

    subject = (
        db.query(StudySubject)
        .filter(
            StudySubject.id == data.subject_id,
            StudySubject.user_id == current_user.id,
            StudySubject.is_active.is_(True),
        )
        .first()
    )

    if subject is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Study subject not found",
        )

    study_type = (
        db.query(ActivityType)
        .filter(
            ActivityType.code == "study",
            ActivityType.is_active.is_(True),
        )
        .first()
    )

    if study_type is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Study activity type is not configured",
        )

    try:
        activity = Activity(
            user_id=current_user.id,
            activity_type_id=study_type.id,
            title=data.title,
            start_at=data.start_at,
            end_at=data.end_at,
        )

        db.add(activity)
        db.flush()

        session = StudySession(
            activity_id=activity.id,
            subject_id=data.subject_id,
            topic=data.topic,
            problems_solved=data.problems_solved,
            confidence=data.confidence,
            what_studied=data.what_studied,
            what_struggled=data.what_struggled,
            what_learned=data.what_learned,
        )

        db.add(session)
        db.commit()
        db.refresh(activity)

        return StudySessionResponse(
            activity_id=activity.id,
            subject_id=subject.id,
            title=activity.title,
            start_at=activity.start_at,
            end_at=activity.end_at,
            topic=session.topic,
            problems_solved=session.problems_solved,
            confidence=session.confidence,
            what_studied=session.what_studied,
            what_struggled=session.what_struggled,
            what_learned=session.what_learned,
        )

    except Exception:
        db.rollback()
        raise