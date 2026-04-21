from pydantic import BaseModel, EmailStr, Field, ConfigDict, str_strip,field_validator
from typing import Optional
from datetime import datetime


class UserInput(BaseModel):
    name: str = Field(min_length=3,max_length=30)
    email: EmailStr
    password: str = Field(min_length=6, max_length=72)
    model_config = ConfigDict(str_strip_whitespace=True)
    @field_validator('name', mode='before')
    @classmethod
    def limitar_espacos_excessivos(cls, v: str) -> str:
        if isinstance(v, str):
            return re.sub(r'\s{2,}', ' ', v)
        return v

class UserOutput(BaseModel):
    id: int
    name: str
    email: str
    role: str
    model_config = ConfigDict(from_attributes=True)


class ProviderInput(BaseModel):
    user_id: int = Field(gt=0, le=2147483647)
    bio: str = Field(min_length=1, max_length=500)
    specialty: str = Field(min_length=1, max_length=100)


class ProvidersPatch(BaseModel):
    bio: Optional[str] = Field(None, min_length=1, max_length=500)
    specialty: Optional[str] = Field(None, min_length=1, max_length=100)


class ProviderOutput(BaseModel):
    name: str
    id: int
    bio: str
    specialty: str
    operando: str
    model_config = ConfigDict(from_attributes=True)


class ServiceInput(BaseModel):
    provider_id: int = Field(gt=0, le=2147483647)
    name: str = Field(min_length=1, max_length=100)
    duration_minutes: int = Field(gt=0, le=1440)
    price: float = Field(ge=0, le=1000000)


class ServicePatch(BaseModel):

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    duration_minutes: Optional[int] = Field(None, gt=0, le=1440)
    price: Optional[float] = Field(None, ge=0, le=1000000)


class ServiceOutput(BaseModel):

    id: int
    provider_name: str = Field(alias="nome")
    provider_id: int
    name: str
    duration_minutes: int
    price: float
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class AgendamentoInput(BaseModel):
    client_id: int = Field(gt=0, le=2147483647)
    data_hora_inicio: datetime


class AgendamentosOutput(BaseModel):
    id: int
    name_user: str
    name_provider:str
    name_service: str
    data_hora_inicio: datetime
    data_hora_fim: datetime
    status: str
    model_config = ConfigDict(from_attributes=True)