from fastapi import APIRouter, HTTPException, Depends, Path, Query, File, UploadFile
import uuid
import shutil
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from app.api.auth import get_current_user, require_provider
from app.core.schemas import UserInput, UserOutput
from app.core.security import hash_password
from app.db.repositorio import register_user, get_user_by_id,get_user_by_name,get_user_by_email
from app.db.session import get_db
from pydantic import EmailStr

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

@router_user.get("/me", response_model=UserOutput)
def get_me(current_user = Depends(get_current_user)):
    """Retorna os dados do usuário logado no momento."""
    return current_user

@router_user.get("/email", response_model=UserOutput)
def get_user_email(email: str = Query(..., min_length=1, max_length=100), db: Session = Depends(get_db),provedor = Depends(require_provider)):
    """Busca usuários pelo email."""
    try:
        search_by_email = get_user_by_email(db=db,email=email)
        if not search_by_email:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return search_by_email
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro desconhecido: {str(exc)}")
    
@router_user.get("/name", response_model=list[UserOutput])
def get_user_name(name: str = Query(..., min_length=1, max_length=100), db: Session = Depends(get_db),provedor = Depends(require_provider)):
    """Busca usuários pelo nome."""
    try:
        search_by_name = get_user_by_name(db, name)
        if not search_by_name:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
        return search_by_name
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro desconhecido: {str(exc)}")

@router_user.post("/profile-picture")
def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user) 
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="O arquivo deve ser uma imagem válida.")

    # 2. Gera um nome único para o arquivo (ex: 550e8400-e29b.png)
    file_extension = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_extension}"
    file_path = f"uploads/{file_name}"

    # 3. Salva o arquivo fisicamente na pasta uploads/
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 4. Salva o caminho no banco de dados do usuário
    caminho_imagem = f"/uploads/{file_name}"
    current_user.profile_picture = caminho_imagem
    db.commit()
    db.refresh(current_user)

    return {"message": "Foto atualizada com sucesso", "profile_picture": caminho_imagem}

@router_user.get("/{user_id}", response_model=UserOutput)
def get_user_by_id_route(user_id: int = Path(..., gt=0, le=2147483647), db: Session = Depends(get_db), provedor = Depends(require_provider)):
    """Busca um usuário pelo ID."""
    try:
        user = get_user_by_id(db, user_id)
        if user is None:
            raise HTTPException(status_code=404, detail="Usuário não encontrado")
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro desconhecido: {str(exc)}")
    return user
