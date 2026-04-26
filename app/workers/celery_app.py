from celery import Celery
from dotenv import load_dotenv
import os
load_dotenv()
celery_app = Celery('tasks_barbearia',    
            broker=os.getenv('BROKER_URL'),
            backend=os.getenv('BACKEND_URL'),
            include=['app.workers.task'])

celery_app.conf.update(
    result_expires=3600,
)
celery_app.conf.timezone = 'America/Sao_Paulo'
celery_app.conf.enable_utc = False


# celery -A app.workers.celery_app worker --loglevel=info --pool=solo
