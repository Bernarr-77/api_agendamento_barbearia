from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.schemas import UserInput, UserOutput
from app.core.security import hash_password
from app.db.repositorio import register_user, get_user_by_id
from app.db.session import get_db

router_user = APIRouter(prefix="/users", tags=["Users"])


@router_user.post("/", response_model=UserOutput)
def register_user_route(payload: UserInput, db: Session = Depends(get_db)):
    """Registra um novo usuário."""
    hashed = hash_password(payload.password)
    try:
        new_user = register_user(db, payload.name, payload.email, hashed)
    except HTTPException:
        raise
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Email já existente")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro desconhecido: {str(exc)}")
    return new_user


@router_user.get("/{user_id}", response_model=UserOutput)
def get_user_by_id_route(user_id: int, db: Session = Depends(get_db)):
    """Busca um usuário pelo ID.

    Removido: 'if id is None' — FastAPI já rejeita antes de entrar na função.
    """
    try:
        user = get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro desconhecido: {str(exc)}")
    return user