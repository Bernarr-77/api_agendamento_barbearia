from fastapi import FastAPI
from app.api.users import router_user
from app.api.provider import router_provider
from app.api.services import router_service
from app.api.agendamentos import router_agendamentos
from app.api.auth import router_auth
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Agendamento API", version="1.0.0")
origins = [
    "http://localhost",
    "http://localhost:3000",   
    "http://localhost:5173",   
    "http://localhost:8080",
]

# 2. Configurando o Porteiro Global
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # Usa a lista VIP acima
    allow_credentials=True,    # Permite que o Front-end envie cookies/tokens
    allow_methods=["*"],       # Permite todos os métodos (GET, POST, DELETE, etc.)
    allow_headers=["*"],       # Permite todos os cabeçalhos (essencial para o nosso Authorization: Bearer token)
)
app.include_router(router_user)
app.include_router(router_provider)
app.include_router(router_service)
app.include_router(router_agendamentos)
app.include_router(router_auth)
