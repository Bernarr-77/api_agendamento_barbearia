import { useLocation, useNavigate } from 'react-router-dom';
import './ConfirmationPage.css';

export default function ConfirmationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { service, date, time } = location.state || {};

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  return (
    <div className="page confirmation-page" id="confirmation-page">
      <div className="container">
        <div className="confirmation-content animate-scale-in">
          <div className="confirmation-icon">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="32" fill="url(#conf-grad)" />
              <path d="M20 32L28 40L44 24" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="checkmark-path" />
              <defs>
                <linearGradient id="conf-grad" x1="0" y1="0" x2="64" y2="64">
                  <stop stopColor="#AAF0D1" />
                  <stop offset="1" stopColor="#487F88" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1>Agendamento realizado!</h1>
          <p className="confirmation-subtitle">
            Seu agendamento foi criado com sucesso. Você receberá um email de confirmação.
          </p>

          {service && (
            <div className="confirmation-details card">
              <div className="confirmation-detail-row">
                <span>Serviço</span>
                <strong>{service.name}</strong>
              </div>
              <div className="confirmation-detail-row">
                <span>Data</span>
                <strong>{formatDate(date)}</strong>
              </div>
              <div className="confirmation-detail-row">
                <span>Horário</span>
                <strong>{time}</strong>
              </div>
            </div>
          )}

          <div className="confirmation-actions">
            <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/dashboard')} id="go-home">
              Voltar ao início
            </button>
            <button className="btn btn-text btn-full" onClick={() => navigate('/services')} id="go-services">
              Agendar outro serviço
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
