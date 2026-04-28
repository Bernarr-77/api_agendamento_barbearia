# Lumina Agendamento API 📖

![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Celery](https://img.shields.io/badge/Celery-37814A?style=for-the-badge&logo=celery&logoColor=white)

O **Lumina** é uma solução profissional de agendamentos automatizados, projetada para alta performance e escalabilidade. O sistema integra uma API robusta em **FastAPI**, um gerenciador de tarefas assíncronas com **Celery/Redis** e um frontend moderno em **React**.

---

## 🛠️ Arquitetura e Tecnologias

- **Core API:** FastAPI com Python 3.11+.
- **Banco de Dados:** PostgreSQL Gerenciado via SQLAlchemy 2.0 e Migrações Alembic.
- **Background Tasks:** Celery para processamento de filas (Envio de e-mails, lembretes).
- **Cache & Broker:** Redis como intermediário de mensagens e cache de alta velocidade.
- **Segurança:** Autenticação JWT (Access/Refresh Tokens) e Criptografia Bcrypt.
- **Interface:** React + Vite, consumindo a API de forma totalmente assíncrona.

## 📂 Organização do Repositório

- `/app`: Lógica central do Backend (Models, Schemas, Rotas, Workers).
- `/lumina-web`: Aplicação Frontend (Interface do Usuário).
- `/alembic`: Controle de versão e evolução do banco de dados.
- `docker-compose.yml`: Infraestrutura local pronta para uso.

---

## 📖 Documentação Detalhada (Notion)

Para uma explicação exaustiva de cada fase do projeto, lógica de código, diagramas e guias de deploy, consulte nosso manual oficial:

👉 **[Documentação Lumina no Notion](https://www.notion.so/Manual-do-Sistema-Agendamento-Lumina-350294f635568122aaa6e5c981545b22)**

Obs: **Backend inteiramente feito a mão**, Frontend feito pelo Claude
