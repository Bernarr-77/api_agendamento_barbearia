from fastapi import FastAPI
from app.api.users import router_user
from app.api.provider import router_provider

app = FastAPI()

app.include_router(router_user)
app.include_router(router_provider)

