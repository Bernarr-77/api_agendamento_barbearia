from fastapi import APIRouter, HTTPException, Depends
from app.core.schemas import ProviderInput, ProviderOutput
from app.db.repositorio import register_provider
from app.db.session import get_db

router_provider = APIRouter()

@router_provider.post("/register_provider/",  response_model=ProviderOutput)
def cadastrar_provider(dados: ProviderInput, db = Depends(get_db)):
    try:
        provider = register_provider(db,dados.user_id,dados.bio,dados.specialty)
        if provider is None:
            raise HTTPException(status_code=404, detail="Não existe usuario cadastrado")
    except Exception as error_500:
        raise HTTPException(status_code=500, detail= f"Erro desconhecido: {str(error_500)}")
    return provider