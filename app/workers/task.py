import os
import smtplib
from email.message import EmailMessage
from app.workers.celery_app import celery_app as app
from dotenv import load_dotenv
from app.db.session import SessionLocal
from app.db.repositorio import cancel_appointment, get_user_by_id, get_appointment_by_id, get_appointment_status, NoAppointmentNeeded
from app.db.models import Status
load_dotenv()

@app.task(name="enviar_email_pos_agendamento",
        autoretry_for=(Exception,),
        max_retries=5,
        default_retry_delay=300)
def confirmacao_email(email_destino: str, inicio_formatado: str, fim_formatado: str):
    # 1. Pegamos as credenciais do cofre (.env)
    remetente = os.getenv("EMAIL_SENDER")
    senha = os.getenv("EMAIL_PASSWORD")
    servidor_smtp = os.getenv("SMTP_SERVER")
    porta_smtp = int(os.getenv("SMTP_PORT"))

    # 2. Criamos o envelope
    msg = EmailMessage()
    msg['Subject'] = "✨ Seu horário está confirmado!"
    msg['From'] = remetente
    msg['To'] = email_destino

    # 3. Camada de Segurança (Texto simples com f-string)
    msg.set_content(f"Olá! Seu agendamento para o dia {inicio_formatado} foi confirmado com sucesso.")

    # 4. Camada Visual (O e-mail em HTML injetando as variáveis com f-string)
    html_template = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #0f0f0f; padding: 20px; margin: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: #111111; padding: 30px; border-radius: 8px; border-top: 5px solid #AAF0D1; border: 1px solid #2e2e2e; box-shadow: 0 4px 8px rgba(0,0,0,0.5);">
            <h2 style="color: #AAF0D1; text-align: center; margin-bottom: 20px;">Agendamento Confirmado</h2>
            <p style="color: #cccccc; font-size: 16px; line-height: 1.5;">Olá!</p>
            <p style="color: #999999; font-size: 16px; line-height: 1.5;">Passando para avisar que seu horário na <strong>Lumina</strong> está garantido.</p>
            
            <div style="background-color: #1a1a1a; border-left: 4px solid #487F88; padding: 15px; margin: 25px 0;">
                <p style="margin: 0 0 10px 0; color: #AAF0D1; font-size: 16px;"><strong>Detalhes do Agendamento:</strong></p>
                <p style="margin: 0; color: #eeeeee; font-size: 15px;">📅 Início: <strong>{inicio_formatado}</strong></p>
                <p style="margin: 5px 0 0 0; color: #eeeeee; font-size: 15px;">⏰ Fim: <strong>{fim_formatado}</strong></p>
            </div>
            
            <p style="color: #444444; font-size: 12px; text-align: center; margin-top: 30px;">
                Este é um e-mail automático, por favor não responda.
            </p>
        </div>
    </body>
    </html>
    """
    
    msg.add_alternative(html_template, subtype='html')

    # 5. Entregamos a carta
    with smtplib.SMTP(servidor_smtp, porta_smtp) as server:
        server.starttls()
        server.login(remetente, senha)
        server.send_message(msg)


@app.task(name="enviar_email_confirmacao",
        bind=True,
        max_retries=5,
        default_retry_delay=300)
def enviar_email_lembrete(self, email_destino: str, inicio_formatado: str, fim_formatado: str, agendamento_id: int, client_id: int):
    # 1. Credenciais do .env
    remetente = os.getenv("EMAIL_SENDER")
    senha = os.getenv("EMAIL_PASSWORD")
    servidor_smtp = os.getenv("SMTP_SERVER")
    porta_smtp = int(os.getenv("SMTP_PORT"))
    base_url = os.getenv("BASE_URL")

    # 2. Link de confirmação → GET /appointments/confirmar/{appointment_id}/{client_id}
    link_confirmacao = f"{base_url}/appointments/confirmar/{agendamento_id}/{client_id}"

    # 3. Envelope do e-mail
    msg = EmailMessage()
    msg['Subject'] = "✨ Confirme seu horário na Lumina!"
    msg['From'] = remetente
    msg['To'] = email_destino

    # 4. Fallback em texto simples
    msg.set_content(
        f"Olá! Confirme seu agendamento para {inicio_formatado} clicando no link: {link_confirmacao}"
    )

    # 5. Corpo HTML — tema escuro premium Lumina
    html_template = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0; background-color:#0f0f0f; font-family:'Inter', Arial, sans-serif;">

        <!-- Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="
                        max-width: 600px;
                        width: 100%;
                        background: linear-gradient(145deg, #111111, #1a1a1a);
                        border-radius: 16px;
                        overflow: hidden;
                        border: 1px solid #2e2e2e;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                    ">

                        <!-- Header com gradiente Lumina -->
                        <tr>
                            <td style="
                                background: linear-gradient(135deg, #487F88 0%, #AAF0D1 50%, #487F88 100%);
                                padding: 36px 40px;
                                text-align: center;
                            ">
                                <p style="margin:0; font-size:36px; letter-spacing:4px;">✨</p>
                                <h1 style="
                                    margin: 12px 0 0 0;
                                    color: #0f0f0f;
                                    font-size: 22px;
                                    font-weight: 700;
                                    letter-spacing: 2px;
                                    text-transform: uppercase;
                                ">Solicitação Recebida</h1>
                                <p style="margin: 6px 0 0 0; color: #1a1a0a; font-size: 13px; opacity: 0.8;">
                                    Seu horário foi reservado com sucesso!
                                </p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 40px 32px 40px;">

                                <p style="margin: 0 0 8px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">
                                    Olá! 👋
                                </p>
                                <p style="margin: 0 0 28px 0; color: #999999; font-size: 15px; line-height: 1.7;">
                                    Recebemos a sua solicitação de agendamento. Seu horário já está reservado e no momento encontra-se com o status <strong style="color: #AAF0D1;">Pendente</strong>. Entraremos em contato ou você poderá acompanhar pelo painel.
                                </p>

                                <!-- Card de detalhes -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="
                                    background: #1a1a1a;
                                    border: 1px solid #2e2e2e;
                                    border-left: 4px solid #AAF0D1;
                                    border-radius: 10px;
                                    margin-bottom: 36px;
                                ">
                                    <tr>
                                        <td style="padding: 20px 24px;">
                                            <p style="margin: 0 0 14px 0; color: #AAF0D1; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                                                📋 Detalhes do Agendamento
                                            </p>
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px; width:40%;">
                                                        📅 Início:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#eeeeee; font-size:14px; font-weight:600;">
                                                        {inicio_formatado}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px;">
                                                        ⏰ Término:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#eeeeee; font-size:14px; font-weight:600;">
                                                        {fim_formatado}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px;">
                                                        🔖 Protocolo:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#AAF0D1; font-size:14px; font-weight:600;">
                                                        #{agendamento_id:06d}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                </table>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                border-top: 1px solid #2e2e2e;
                                padding: 24px 40px;
                                text-align: center;
                            ">
                                <p style="margin: 0 0 4px 0; color:#444444; font-size:12px;">
                                    Este é um e-mail automático, por favor não responda.
                                </p>
                                <p style="margin:0; color:#333333; font-size:11px;">
                                    © 2026 Lumina · Todos os direitos reservados
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    """

    msg.add_alternative(html_template, subtype='html')

    # 6. Envia via SMTP
    try:
        with smtplib.SMTP(servidor_smtp, porta_smtp) as server:
            server.starttls()
            server.login(remetente, senha)
            server.send_message(msg)
    except Exception as exc:
        raise self.retry(exc=exc)

@app.task(name="enviar_email_lembrete_2h",
        bind=True,
        max_retries=5,
        default_retry_delay=300)
def enviar_email_lembrete_2h(self, email_destino: str, inicio_formatado: str, fim_formatado: str, agendamento_id: int):

    db = SessionLocal()
    try:
        agendamento = get_appointment_status(db, agendamento_id)
        if agendamento is None or agendamento.status != Status.CONFIRMADO:
            return "Agendamento não está confirmado, lembrete não enviado"
    finally:
        db.close()
    remetente = os.getenv("EMAIL_SENDER")
    senha = os.getenv("EMAIL_PASSWORD")
    servidor_smtp = os.getenv("SMTP_SERVER")
    porta_smtp = int(os.getenv("SMTP_PORT"))

    msg = EmailMessage()
    msg['Subject'] = "⏰ Faltam 2 horas para o seu horário!"
    msg['From'] = remetente
    msg['To'] = email_destino

    msg.set_content(
        f"Olá! Lembrete: seu agendamento #{agendamento_id:06d} começa em 2 horas, "
        f"às {inicio_formatado}. Nos vemos em breve!"
    )

    html_template = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0; background-color:#0f0f0f; font-family:'Inter', Arial, sans-serif;">

        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="
                        max-width: 600px;
                        width: 100%;
                        background: linear-gradient(145deg, #1a1a1a, #222222);
                        border-radius: 16px;
                        overflow: hidden;
                        border: 1px solid #2e2e2e;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                    ">

                        <!-- Header Lumina -->
                        <tr>
                            <td style="
                                background: linear-gradient(135deg, #1e3a3a 0%, #487F88 50%, #1e3a3a 100%);
                                padding: 36px 40px;
                                text-align: center;
                            ">
                                <p style="margin:0; font-size:36px; letter-spacing:4px;">⏰</p>
                                <h1 style="
                                    margin: 12px 0 0 0;
                                    color: #ffffff;
                                    font-size: 22px;
                                    font-weight: 700;
                                    letter-spacing: 2px;
                                    text-transform: uppercase;
                                ">Lembrete de Horário</h1>
                                <p style="margin: 6px 0 0 0; color: #AAF0D1; font-size: 13px; opacity: 0.8;">
                                    Faltam 2 horas para o seu atendimento na Lumina
                                </p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 40px 32px 40px;">

                                <p style="margin: 0 0 8px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">
                                    Olá! 👋
                                </p>
                                <p style="margin: 0 0 28px 0; color: #999999; font-size: 15px; line-height: 1.7;">
                                    Passando para lembrar que seu horário na clínica está
                                    <strong style="color: #AAF0D1;">chegando!</strong> Prepare-se e nos vemos em breve.
                                </p>

                                <!-- Card de detalhes -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="
                                    background: #111111;
                                    border: 1px solid #2e2e2e;
                                    border-left: 4px solid #487F88;
                                    border-radius: 10px;
                                    margin-bottom: 36px;
                                ">
                                    <tr>
                                        <td style="padding: 20px 24px;">
                                            <p style="margin: 0 0 14px 0; color: #487F88; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                                                📋 Detalhes do Agendamento
                                            </p>
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px; width:40%;">
                                                        📅 Início:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#eeeeee; font-size:14px; font-weight:600;">
                                                        {inicio_formatado}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px;">
                                                        ⏰ Término:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#eeeeee; font-size:14px; font-weight:600;">
                                                        {fim_formatado}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px;">
                                                        🔖 Protocolo:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#487F88; font-size:14px; font-weight:600;">
                                                        #{agendamento_id:06d}
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Dica -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="
                                    background: #0d1a1a;
                                    border: 1px solid #1a3a3a;
                                    border-radius: 8px;
                                ">
                                    <tr>
                                        <td style="padding: 14px 18px;">
                                            <p style="margin:0; color:#487F88; font-size:13px; line-height:1.5;">
                                                ✨ <strong>Dica:</strong> Chegue com alguns minutos de antecedência
                                                para garantir um atendimento tranquilo.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                border-top: 1px solid #2e2e2e;
                                padding: 24px 40px;
                                text-align: center;
                            ">
                                <p style="margin: 0 0 4px 0; color:#444444; font-size:12px;">
                                    Este é um e-mail automático, por favor não responda.
                                </p>
                                <p style="margin:0; color:#333333; font-size:11px;">
                                    © 2026 Lumina · Todos os direitos reservados
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    """

    msg.add_alternative(html_template, subtype='html')

    try:
        with smtplib.SMTP(servidor_smtp, porta_smtp) as server:
            server.starttls()
            server.login(remetente, senha)
            server.send_message(msg)
    except Exception as exc:
        raise self.retry(exc=exc)

@app.task(name="enviar_email_cancelamento",
        bind=True,
        max_retries=4,
        default_retry_delay=300)
def enviar_email_de_cancelamento(self, agendamento_id: int, client_id: int):

    db = SessionLocal()
    try:
        agendamento = get_appointment_status(db, agendamento_id)
        if agendamento is None:
            return "Agendamento não encontrado"

        if agendamento.status == Status.CONFIRMADO:
            return "Agendamento já foi confirmado"

        if agendamento.status == Status.CANCELADO:
            return "Agendamento já foi cancelado"

        usuario = get_user_by_id(db, client_id)
        if usuario is None:
            return "Usuário não encontrado"
        email_destino = usuario.email

        inicio_formatado = agendamento.data_hora_inicio.strftime("%d/%m/%Y às %H:%M")
        fim_formatado = agendamento.data_hora_fim.strftime("%d/%m/%Y às %H:%M")

        agendamento.status = Status.CANCELADO
        db.commit()

    finally:
        db.close()

    remetente = os.getenv("EMAIL_SENDER")
    senha = os.getenv("EMAIL_PASSWORD")
    servidor_smtp = os.getenv("SMTP_SERVER")
    porta_smtp = int(os.getenv("SMTP_PORT"))

    # 6. Envelope do e-mail
    msg = EmailMessage()
    msg['Subject'] = "❌ Seu agendamento foi cancelado"
    msg['From'] = remetente
    msg['To'] = email_destino

    # 7. Fallback em texto simples
    msg.set_content(
        f"Olá! Seu agendamento #{agendamento_id:06d} para {inicio_formatado} foi cancelado "
        f"pois não recebemos a confirmação dentro do prazo."
    )

    # 8. Corpo HTML — tema escuro premium Lumina (mesmo padrão do lembrete)
    html_template = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0; background-color:#0f0f0f; font-family:'Inter', Arial, sans-serif;">

        <!-- Wrapper -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="
                        max-width: 600px;
                        width: 100%;
                        background: linear-gradient(145deg, #111111, #1a1a1a);
                        border-radius: 16px;
                        overflow: hidden;
                        border: 1px solid #2e2e2e;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
                    ">

                        <!-- Header com gradiente profissional -->
                        <tr>
                            <td style="
                                background: linear-gradient(135deg, #4c1111 0%, #8b0000 50%, #4c1111 100%);
                                padding: 36px 40px;
                                text-align: center;
                            ">
                                <p style="margin:0; font-size:36px; letter-spacing:4px;">❌</p>
                                <h1 style="
                                    margin: 12px 0 0 0;
                                    color: #ffffff;
                                    font-size: 22px;
                                    font-weight: 700;
                                    letter-spacing: 2px;
                                    text-transform: uppercase;
                                ">Agendamento Cancelado</h1>
                                <p style="margin: 6px 0 0 0; color: #ffcccc; font-size: 13px; opacity: 0.8;">
                                    Confirmação não recebida no prazo na Lumina
                                </p>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding: 40px 40px 32px 40px;">

                                <p style="margin: 0 0 8px 0; color: #cccccc; font-size: 16px; line-height: 1.6;">
                                    Olá! 👋
                                </p>
                                <p style="margin: 0 0 28px 0; color: #999999; font-size: 15px; line-height: 1.7;">
                                    Infelizmente, seu agendamento foi <strong style="color: #e74c3c;">cancelado automaticamente</strong>
                                    porque não recebemos a confirmação dentro do prazo de <strong style="color: #e74c3c;">8 horas</strong>.
                                </p>

                                <!-- Card de detalhes -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="
                                    background: #111111;
                                    border: 1px solid #2e2e2e;
                                    border-left: 4px solid #e74c3c;
                                    border-radius: 10px;
                                    margin-bottom: 36px;
                                ">
                                    <tr>
                                        <td style="padding: 20px 24px;">
                                            <p style="margin: 0 0 14px 0; color: #e74c3c; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.5px;">
                                                📋 Detalhes do Agendamento Cancelado
                                            </p>
                                            <table width="100%" cellpadding="0" cellspacing="0">
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px; width:40%;">
                                                        📅 Início:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#eeeeee; font-size:14px; font-weight:600;">
                                                        {inicio_formatado}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px;">
                                                        ⏰ Término:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#eeeeee; font-size:14px; font-weight:600;">
                                                        {fim_formatado}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px;">
                                                        🔖 Protocolo:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#e74c3c; font-size:14px; font-weight:600;">
                                                        #{agendamento_id:06d}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td style="padding: 6px 0; color:#888888; font-size:13px;">
                                                        📌 Status:
                                                    </td>
                                                    <td style="padding: 6px 0; color:#e74c3c; font-size:14px; font-weight:600;">
                                                        CANCELADO
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>

                                <!-- Aviso para reagendar -->
                                <table width="100%" cellpadding="0" cellspacing="0" style="
                                    background: #0d1a1a;
                                    border: 1px solid #1a3a3a;
                                    border-radius: 8px;
                                ">
                                    <tr>
                                        <td style="padding: 14px 18px;">
                                            <p style="margin:0; color:#AAF0D1; font-size:13px; line-height:1.5;">
                                                💡 <strong>Deseja reagendar?</strong> Entre em contato conosco ou
                                                acesse nosso sistema para escolher um novo horário disponível.
                                            </p>
                                        </td>
                                    </tr>
                                </table>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="
                                border-top: 1px solid #2e2e2e;
                                padding: 24px 40px;
                                text-align: center;
                            ">
                                <p style="margin: 0 0 4px 0; color:#444444; font-size:12px;">
                                    Este é um e-mail automático, por favor não responda.
                                </p>
                                <p style="margin:0; color:#333333; font-size:11px;">
                                    © 2026 Lumina · Todos os direitos reservados
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>

    </body>
    </html>
    """

    msg.add_alternative(html_template, subtype='html')

    # 9. Envia via SMTP
    try:
        with smtplib.SMTP(servidor_smtp, porta_smtp) as server:
            server.starttls()
            server.login(remetente, senha)
            server.send_message(msg)
    except Exception as exc:
        raise self.retry(exc=exc)


@app.task(name="enviar_email_recuperacao",
        bind=True,
        max_retries=5,
        default_retry_delay=300)
def enviar_email_recuperacao(self, email_destino: str, codigo: str):
    remetente = os.getenv("EMAIL_SENDER")
    senha = os.getenv("EMAIL_PASSWORD")
    servidor_smtp = os.getenv("SMTP_SERVER")
    porta_smtp = int(os.getenv("SMTP_PORT"))

    msg = EmailMessage()
    msg['Subject'] = "🔐 Seu código de recuperação de senha"
    msg['From'] = remetente
    msg['To'] = email_destino

    msg.set_content(f"Seu código de recuperação é: {codigo}. Ele expira em 10 minutos.")

    html_template = f"""
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#0f0f0f; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="600" style="background:#111111; border-radius:16px; padding:40px; border:1px solid #2e2e2e;">
                        <tr>
                            <td align="center">
                                <h1 style="color:#AAF0D1; margin-bottom:20px;">Recuperação de Senha</h1>
                                <p style="color:#cccccc; font-size:16px;">Você solicitou a alteração da sua senha na Lumina. Utilize o código abaixo para prosseguir:</p>
                                <div style="background:#0a0a0a; border:1px dashed #AAF0D1; padding:20px; margin:30px 0; border-radius:8px;">
                                    <span style="color:#AAF0D1; font-size:32px; font-weight:bold; letter-spacing:8px;">{codigo}</span>
                                </div>
                                <p style="color:#888; font-size:14px;">Este código expira em 10 minutos. Se você não solicitou esta alteração, ignore este e-mail.</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    msg.add_alternative(html_template, subtype='html')

    try:
        with smtplib.SMTP(servidor_smtp, porta_smtp) as server:
            server.starttls()
            server.login(remetente, senha)
            server.send_message(msg)
    except Exception as exc:
        raise self.retry(exc=exc)

