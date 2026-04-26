import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './BookingPage.css';

export default function BookingPage() {
  const { serviceId } = useParams();
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get('provider');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [service, setService] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState(1); // 1 = data/hora, 2 = revisão
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
  ];

  useEffect(() => {
    loadService();
  }, [serviceId, providerId]);

  const loadService = async () => {
    try {
      const res = await api.get(`/providers/${providerId}/services/`);
      const found = res.data.find((s) => s.id === parseInt(serviceId));
      setService(found || null);
    } catch (err) {
      console.error('Erro ao carregar serviço:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');

    try {
      const dateTime = `${selectedDate}T${selectedTime}:00`;

      await api.post(`/appointments/${serviceId}/${providerId}`, {
        client_id: user.id,
        data_hora_inicio: dateTime,
      });

      navigate('/confirmation', {
        state: {
          service: service,
          date: selectedDate,
          time: selectedTime,
        },
      });
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else {
        setError('Erro ao criar agendamento. Tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  if (loading) {
    return (
      <div className="page">
        <LoadingSpinner text="Carregando..." />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="page">
        <div className="container">
          <div className="booking-error">
            <h2>Serviço não encontrado</h2>
            <button className="btn btn-primary" onClick={() => navigate('/services')}>
              Voltar aos serviços
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page" id="booking-page">
      <div className="container">
        {/* Back button */}
        <button className="booking-back" onClick={() => step === 2 ? setStep(1) : navigate(-1)} id="booking-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Voltar
        </button>

        {/* Progress */}
        <div className="booking-progress animate-fade-in">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span className="progress-dot" />
            <span className="progress-label">Data & Hora</span>
          </div>
          <div className="progress-line" />
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span className="progress-dot" />
            <span className="progress-label">Confirmação</span>
          </div>
        </div>

        {step === 1 && (
          <div className="booking-step animate-fade-in" id="booking-step-1">
            <h2>Escolha a data e horário</h2>
            <p className="booking-service-label">
              {service.name} — {service.provider_name}
            </p>

            {/* Date Picker */}
            <div className="input-group">
              <label htmlFor="booking-date">Data</label>
              <input
                id="booking-date"
                type="date"
                className="input-field"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getMinDate()}
              />
            </div>

            {/* Time Slots */}
            {selectedDate && (
              <div className="timeslots-section animate-fade-in">
                <label>Horários disponíveis</label>
                <div className="timeslots-grid" id="timeslots-grid">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      className={`timeslot ${selectedTime === time ? 'active' : ''}`}
                      onClick={() => setSelectedTime(time)}
                      id={`slot-${time.replace(':', '')}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              disabled={!selectedDate || !selectedTime}
              onClick={() => setStep(2)}
              id="go-to-review"
            >
              Revisar agendamento
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="booking-step animate-fade-in" id="booking-step-2">
            <h2>Revisão do agendamento</h2>

            <div className="review-card card">
              <div className="review-item">
                <span className="review-label">Serviço</span>
                <span className="review-value">{service.name}</span>
              </div>
              <div className="review-divider" />
              <div className="review-item">
                <span className="review-label">Profissional</span>
                <span className="review-value">{service.provider_name}</span>
              </div>
              <div className="review-divider" />
              <div className="review-item">
                <span className="review-label">Data</span>
                <span className="review-value">{formatDate(selectedDate)}</span>
              </div>
              <div className="review-divider" />
              <div className="review-item">
                <span className="review-label">Horário</span>
                <span className="review-value">{selectedTime}</span>
              </div>
              <div className="review-divider" />
              <div className="review-item">
                <span className="review-label">Duração</span>
                <span className="review-value">{service.duration_minutes} minutos</span>
              </div>
              <div className="review-divider" />
              <div className="review-item review-item-highlight">
                <span className="review-label">Valor</span>
                <span className="review-value review-price">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)}
                </span>
              </div>
            </div>

            {error && (
              <div className="login-error animate-fade-in" id="booking-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleConfirm}
              disabled={submitting}
              id="confirm-booking"
            >
              {submitting ? <LoadingSpinner size={24} /> : 'Confirmar agendamento'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
