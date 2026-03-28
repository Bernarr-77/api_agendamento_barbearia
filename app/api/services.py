from fastapi import APIRouter, HTTPException, Depends
from app.core.schemas import  ServiceInput, ServiceOutput,servicePatch
from app.db.repositorio import criar_services, buscar_servicos as get_services_by_provider, get_provider_by_id,atualizar_servico
from app.db.session import get_db
from typing import List
router_service = APIRouter()

@router_service.post("/criar_service/", response_model=ServiceOutput)
def criar_servico(service: ServiceInput, db = Depends(get_db)):
    try:
        servico = criar_services(db, service.provider_id, service.name, service.duration_minutes, service.price )
        if servico is None:
            raise HTTPException(status_code=404, detail="Não existe provider com esse id")
    except Exception as error_500:
        raise HTTPException(status_code=500, detail= f"Erro desconhecido: {str(error_500)}")
    return servico

@router_service.get("/buscar_todos/", response_model=List[ServiceOutput])
def buscar_servicos(id_provedor: int, db = Depends(get_db)):
    provedor = get_provider_by_id(db, id_provedor)
    if provedor is None:
        raise HTTPException(status_code= 404, detail= "Não existe provedor com esse id")
    try:
        servicos = get_services_by_provider(db, id_provedor)
        if servicos is None:
            raise HTTPException(status_code= 404, detail= "Não existe servicos associados a esse provedor")
    except Exception as error_500:
        raise HTTPException(status_code=500, detail= f"Erro desconhecido: {str(error_500)}")
    return servicos

@router_service.patch("/atualizar_servico/{id_provider}/{id_service}", response_model=ServiceOutput)
def atualizar_service(id_provider: int, id_service: int, dados: servicePatch, db = Depends(get_db)):
    try:
        atualizacao = atualizar_servico(db, id_provider, id_service, dados.name,dados.duration_minutes, dados.price)
        if atualizacao is None:
            raise HTTPException(status_code= 404, detail= "Não existe service com esse id ou o provedor esta inativo ou nao existe")
    except Exception as error_500:
        raise HTTPException(status_code=500, detail= f"Erro desconhecido: {str(error_500)}")
    return atualizacao