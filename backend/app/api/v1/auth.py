import hashlib
import secrets
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, create_access_token, decode_access_token, get_password_hash
from app.models.user import User, UserSession
from app.models.telemetry import SecurityAuditLog
from app.schemas.auth import LoginRequest, Token, UserResponse
from app.services.anomaly_detection import AnomalyDetectionService

router = APIRouter(prefix="/auth", tags=["Authentication & Sessions"])
security = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired access token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload.get("sub")
    session_id = payload.get("session_id")
    if session_id:
        sess_stmt = select(UserSession).where(UserSession.id == session_id)
        sess_res = await db.execute(sess_stmt)
        user_sess = sess_res.scalars().first()
        if user_sess and not user_sess.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session has been terminated due to concurrent login on another device or logout.",
                headers={"WWW-Authenticate": "Bearer"},
            )

    stmt = select(User).where(User.id == user_id, User.is_active == True)
    res = await db.execute(stmt)
    user = res.scalars().first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.post("/login", response_model=Token)
async def login(
    req: LoginRequest,
    request: Request,
    user_agent: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(User).where(User.email == req.email)
    res = await db.execute(stmt)
    user = res.scalars().first()

    ip = request.client.host if request.client else "127.0.0.1"

    if not user or not verify_password(req.password, user.hashed_password):
        # Log failed attempt
        db.add(SecurityAuditLog(
            user_id=user.id if user else None,
            event_type="LOGIN_FAILED",
            severity="MEDIUM",
            ip_address=ip,
            details_json=f'{{"email": "{req.email}"}}'
        ))
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    # Classify device (Mobile Phone vs Laptop/Desktop)
    detected_device_type = AnomalyDetectionService.classify_device(
        user_agent or "",
        client_is_mobile=(req.device_type == "MOBILE_APP" or req.device_type == "MOBILE_BROWSER")
    )

    # Create new session record
    session_token_raw = secrets.token_urlsafe(32)
    session_token_hash = hashlib.sha256(session_token_raw.encode("utf-8")).hexdigest()
    
    new_session = UserSession(
        user_id=user.id,
        session_token_hash=session_token_hash,
        device_fingerprint_hash=req.device_fingerprint,
        device_type=detected_device_type,
        ip_address=ip,
        user_agent=user_agent[:490] if user_agent else None,
        is_active=True
    )
    db.add(new_session)
    await db.flush()

    # Enforce Single Active Session per user
    await AnomalyDetectionService.enforce_single_active_session(
        user_id=user.id,
        new_session_id=new_session.id,
        db=db,
        ip_address=ip
    )

    # Issue JWT token
    access_token = create_access_token(
        subject=user.id,
        claims={
            "role": user.role,
            "session_id": new_session.id,
            "device_type": detected_device_type
        }
    )

    # Log successful login
    db.add(SecurityAuditLog(
        user_id=user.id,
        event_type="LOGIN_SUCCESS",
        severity="LOW",
        ip_address=ip,
        details_json=f'{{"device_type": "{detected_device_type}", "session_id": "{new_session.id}"}}'
    ))
    await db.commit()

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        role=user.role,
        full_name=user.full_name,
        employee_code=user.employee_code,
        is_punched_in=user.is_punched_in
    )


@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Terminates the current user session and invalidates access."""
    if credentials:
        payload = decode_access_token(credentials.credentials)
        if payload and payload.get("session_id"):
            session_id = payload.get("session_id")
            sess_stmt = select(UserSession).where(UserSession.id == session_id)
            sess_res = await db.execute(sess_stmt)
            sess = sess_res.scalars().first()
            if sess:
                sess.is_active = False
                sess.punched_out_at = datetime.now(timezone.utc)
                db.add(SecurityAuditLog(
                    user_id=current_user.id,
                    event_type="LOGOUT",
                    severity="LOW",
                    ip_address=request.client.host if request.client else "127.0.0.1",
                    details_json=f'{{"session_id": "{session_id}"}}'
                ))
                await db.commit()
    return {"status": "logged_out", "message": "Session terminated successfully."}
