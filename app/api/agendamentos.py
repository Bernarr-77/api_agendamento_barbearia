from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.schemas import AgendamentoInput, AgendamentosOutput
from app.db.repositorio import (
    create_appointment,
    AppointmentClosedError,
    AppointmentConflictError,
)
from app.db.session import get_db

router_agendamentos = APIRouter(prefix="/appointments", tags=["Appointments"])


@router_agendamentos.post("/{service_id}/{provider_id}", response_model=AgendamentosOutput)
def create_appointment_route(
    service_id: int,
    provider_id: int,
    payload: AgendamentoInput,
    db: Session = Depends(get_db),
):
    """Cria um novo agendamento verificando horário e conflitos.
    """
    try:
        appointment = create_appointment(
            db, service_id, provider_id, payload.data_hora_inicio, payload.client_id
        )
        if appointment is None:
            raise HTTPException(status_code=404, detail="Serviço não encontrado")
    except HTTPException:
        raise
    except AppointmentClosedError:
        raise HTTPException(status_code=400, detail="Estabelecimento fechado neste horário")
    except AppointmentConflictError:
        raise HTTPException(status_code=409, detail="Horário já possui agendamento marcado")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Erro desconhecido: {str(exc)}")
    return appointment

