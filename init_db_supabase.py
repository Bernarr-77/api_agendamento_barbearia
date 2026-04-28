import os
import sys
# Adiciona o diretório atual ao sys.path para reconhecer o pacote 'app'
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from app.db.session import Base
from app.db import models

# URL do Supabase encontrada no seu .env
DATABASE_URL = "postgresql://postgres.mxqrwbsdwcryulwhbjej:9bRqxoqoIr8PHuZp@aws-1-sa-east-1.pooler.supabase.com:6543/postgres"

# Ajuste para garantir compatibilidade do SQLAlchemy com o prefixo postgresql
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"Conectando ao banco de dados...")
try:
    engine = create_engine(DATABASE_URL)
    print("Criando tabelas no Supabase...")
    Base.metadata.create_all(bind=engine)
    print("SUCESSO: Todas as tabelas foram criadas no Supabase.")
except Exception as e:
    print(f"ERRO ao criar tabelas: {e}")
