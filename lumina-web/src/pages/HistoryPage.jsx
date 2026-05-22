import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './HistoryPage.css';

export default function HistoryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [apptToCancel, setApptToCancel] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await api.get('/appointments/me');
      let data = response.data || [];
      // Sort appointments: nearest dates first (ascending order)
      data.sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Determina o status visual com regra de negócio
  const getEffectiveStatus = (appt) => {
    const now = new Date();
    const dateObj = new Date(appt.data_hora_inicio);
    const status = appt.status?.toUpperCase();

    // Se já passou da data e ainda está PENDENTE => cancelado por expiração
    if (status === 'PENDENTE' && dateObj < now) {
      return 'EXPIRADO';
    }
    return status || 'PENDENTE';
  };

  const getStatusBadge = (effectiveStatus) => {
    switch(effectiveStatus) {
      case 'CONFIRMADO': return <span className="badge badge-confirmed">CONFIRMADO</span>;
      case 'CANCELADO': return <span className="badge badge-cancelled">CANCELADO</span>;
      case 'EXPIRADO': return <span className="badge badge-cancelled">CANCELADO</span>;
      default: return <span className="badge badge-pending">{effectiveStatus}</span>;
    }
  };

  const handleConfirm = async (appt) => {
    setActionLoading(true);
    try {
      await api.get(`/appointments/confirmar/${appt.id}/${user.id}`);
      await fetchAppointments();
      setSelectedAppt(null);
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao confirmar agendamento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = (appt) => {
    setApptToCancel(appt);
  };

  const confirmCancel = async () => {
    if (!apptToCancel) return;
    setActionLoading(true);
    try {
      await api.delete(`/appointments/${apptToCancel.id}/${user.id}`);
      await fetchAppointments();
      setSelectedAppt(null);
      setApptToCancel(null);
    } catch (error) {
      alert(error.response?.data?.detail || 'Erro ao cancelar agendamento');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page" id="history-page">
      <div className="container">
        {/* Header */}
        <header className="history-header animate-fade-in">
          <button className="history-back-btn" onClick={() => navigate(-1)} aria-label="Voltar">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="history-title">Meus Agendamentos</h1>
          <div style={{ width: '40px' }}></div>
        </header>

        {/* Lista */}
        <section className="history-list">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              <div className="skeleton" style={{ height: '90px', width: '100%' }}></div>
              <div className="skeleton" style={{ height: '90px', width: '100%' }}></div>
              <div className="skeleton" style={{ height: '90px', width: '100%' }}></div>
            </div>
          ) : appointments.length === 0 ? (
            <div className="history-empty animate-fade-in">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-300)" strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <h3>Nenhum agendamento</h3>
              <p>Você ainda não possui agendamentos registrados.</p>
              <button className="btn btn-primary" onClick={() => navigate('/services')} style={{ marginTop: 'var(--space-md)' }}>
                Agendar agora
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {appointments.map((appt, index) => {
                const dateObj = new Date(appt.data_hora_inicio);
                const effectiveStatus = getEffectiveStatus(appt);
                const isPast = effectiveStatus === 'EXPIRADO' || effectiveStatus === 'CANCELADO';
                
                return (
                  <div 
                    key={appt.id} 
                    className={`card card-interactive history-card animate-fade-in-up delay-${Math.min(index + 1, 5)}`}
                    style={{ opacity: isPast ? 0.65 : 1 }}
                    onClick={() => setSelectedAppt(appt)}
                  >
                    <div className="history-card-top">
                      <h4 className="history-card-service">{appt.name_service || "Serviço"}</h4>
                      {getStatusBadge(effectiveStatus)}
                    </div>
                    <div className="history-card-detail">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>{dateObj.toLocaleDateString('pt-BR')} às {dateObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="history-card-detail">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      <span>Profissional: {appt.name_provider || "Clínica"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <Navbar />

      {/* Modal de Detalhes */}
      {selectedAppt && (
        <AppointmentDetailModal 
          appt={selectedAppt}
          effectiveStatus={getEffectiveStatus(selectedAppt)}
          onClose={() => setSelectedAppt(null)}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          actionLoading={actionLoading}
        />
      )}

      {/* Modal de Cancelamento */}
      {apptToCancel && (
        <div className="appt-modal-overlay animate-fade-in" style={{ zIndex: 10000 }}>
          <div className="appt-modal animate-slide-up" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto' }}>
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h3 style={{ marginBottom: 'var(--space-sm)' }}>Cancelar Agendamento?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
              Tem certeza que deseja cancelar este agendamento? Esta ação não poderá ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setApptToCancel(null)}
                disabled={actionLoading}
              >
                Voltar
              </button>
              <button 
                className="btn" 
                style={{ flex: 1, backgroundColor: '#ef4444', color: 'white', borderColor: '#ef4444' }}
                onClick={confirmCancel}
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelando...' : 'Sim, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AppointmentDetailModal({ appt, effectiveStatus, onClose, onConfirm, onCancel, actionLoading }) {
  const dateInicio = new Date(appt.data_hora_inicio);
  const dateFim = new Date(appt.data_hora_fim);
  const now = new Date();
  const isPast = dateInicio < now;

  const canConfirm = effectiveStatus === 'PENDENTE' && !isPast;
  const canCancel = effectiveStatus === 'PENDENTE' && !isPast;

  return (
    <div className="appt-modal-overlay" onClick={onClose}>
      <div className="appt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="appt-modal-handle"></div>
        
        <div className="appt-modal-header">
          <h3>{appt.name_service || "Serviço"}</h3>
          <button className="appt-modal-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div style={{ marginBottom: 'var(--space-md)' }}>
          {getStatusBadgeModal(effectiveStatus)}
        </div>

        {/* Detalhes */}
        <div className="appt-detail-row">
          <div className="appt-detail-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className="appt-detail-text">
            <label>Data</label>
            <span>{dateInicio.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="appt-detail-row">
          <div className="appt-detail-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div className="appt-detail-text">
            <label>Horário</label>
            <span>{dateInicio.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} — {dateFim.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>

        <div className="appt-detail-row">
          <div className="appt-detail-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="appt-detail-text">
            <label>Profissional</label>
            <span>{appt.name_provider || "Clínica"}</span>
          </div>
        </div>

        <div className="appt-detail-row">
          <div className="appt-detail-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div className="appt-detail-text">
            <label>Cliente</label>
            <span>{appt.name_user || "—"}</span>
          </div>
        </div>

        {/* Avisos */}
        {effectiveStatus === 'EXPIRADO' && (
          <div className="appt-cancelled-notice">
            <p>
              <strong>⚠️ Agendamento cancelado</strong>
              Este agendamento foi cancelado automaticamente pois não foi confirmado a tempo. 
              Caso deseje reagendar, tente marcar um novo horário se houver disponibilidade.
            </p>
          </div>
        )}

        {effectiveStatus === 'CANCELADO' && (
          <div className="appt-cancelled-notice">
            <p>
              <strong>⚠️ Agendamento cancelado</strong>
              Este agendamento foi cancelado. Caso deseje, você pode tentar agendar um novo horário.
            </p>
          </div>
        )}

        {/* Ações */}
        {(canConfirm || canCancel) && (
          <div className="appt-modal-actions">
            {canCancel && (
              <button 
                className="btn btn-secondary" 
                onClick={() => onCancel(appt)} 
                disabled={actionLoading}
              >
                {actionLoading ? 'Cancelando...' : 'Cancelar'}
              </button>
            )}
            {canConfirm && (
              <button 
                className="btn btn-primary" 
                onClick={() => onConfirm(appt)} 
                disabled={actionLoading}
              >
                {actionLoading ? 'Confirmando...' : 'Confirmar'}
              </button>
            )}
          </div>
        )}

        {effectiveStatus === 'CONFIRMADO' && !isPast && (
          <div className="appt-success-notice">
            <p>✅ Agendamento confirmado! Nos vemos em breve.</p>
          </div>
        )}

        {effectiveStatus === 'CONFIRMADO' && isPast && (
          <div className="appt-past-notice">
            <p>Este agendamento já foi realizado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function getStatusBadgeModal(effectiveStatus) {
  switch(effectiveStatus) {
    case 'CONFIRMADO': return <span className="badge badge-confirmed">CONFIRMADO</span>;
    case 'CANCELADO': return <span className="badge badge-cancelled">CANCELADO</span>;
    case 'EXPIRADO': return <span className="badge badge-cancelled">CANCELADO POR EXPIRAÇÃO</span>;
    default: return <span className="badge badge-pending">{effectiveStatus}</span>;
  }
}
