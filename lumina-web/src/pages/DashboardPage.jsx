import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './DashboardPage.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [nextAppointment, setNextAppointment] = useState(null);
  const [loadingAppts, setLoadingAppts] = useState(true);
  
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments/me');
        const all = response.data || [];
        const now = new Date();
        // Busca o próximo agendamento futuro (PENDENTE ou CONFIRMADO)
        const upcoming = all
          .filter(a => {
            const d = new Date(a.data_hora_inicio);
            const status = a.status?.toUpperCase();
            return d > now && (status === 'PENDENTE' || status === 'CONFIRMADO');
          })
          .sort((a, b) => new Date(a.data_hora_inicio) - new Date(b.data_hora_inicio));
        
        setNextAppointment(upcoming.length > 0 ? upcoming[0] : null);
      } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
      } finally {
        setLoadingAppts(false);
      }
    };
    fetchAppointments();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'Olá';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const categories = [
    {
      id: 'estetica',
      title: 'Estética',
      description: 'Tratamentos faciais, corporais e bem-estar',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" strokeLinecap="round" />
          <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #AAF0D1 0%, #7EDDB5 100%)',
    },
    {
      id: 'odonto',
      title: 'Odontologia',
      description: 'Limpeza, clareamento e cuidados dentários',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 5.5C12 5.5 8.5 2 5.5 4C2.5 6 4 10 5 12C6 14 7 18 8 20C9 22 11 22 12 19" />
          <path d="M12 5.5C12 5.5 15.5 2 18.5 4C21.5 6 20 10 19 12C18 14 17 18 16 20C15 22 13 22 12 19" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #487F88 0%, #6BA3AC 100%)',
    },
  ];

  return (
    <div className="page" id="dashboard-page">
      <div className="container">
        {/* Header */}
        <header className="dashboard-header animate-fade-in">
          <div className="dashboard-greeting">
            <p className="dashboard-greeting-label">{getGreeting()},</p>
            <h1 className="dashboard-greeting-name">{firstName}</h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button 
              className="theme-toggle-btn"
              onClick={() => setIsDark(!isDark)}
              aria-label="Alternar tema"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--neutral-200)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 250ms ease'
              }}
            >
              {isDark ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              className="dashboard-avatar"
              onClick={() => navigate('/profile')}
              id="go-to-profile"
              aria-label="Ir para perfil"
            >
              <span>{firstName.charAt(0).toUpperCase()}</span>
            </button>
          </div>
        </header>

        {/* Quick Action */}
        <section className="dashboard-quick-action animate-fade-in delay-1" id="quick-action-section">
          <div className="quick-action-card" onClick={() => navigate('/services')}>
            <div className="quick-action-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="12" y1="14" x2="12" y2="18" />
                <line x1="10" y1="16" x2="14" y2="16" />
              </svg>
            </div>
            <div className="quick-action-text">
              <h3>Novo Agendamento</h3>
              <p>Escolha um serviço e agende seu horário</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </section>

        {/* Próximo Agendamento */}
        <section className="dashboard-next-appt animate-fade-in delay-2" id="next-appt-section">
          <h2 className="section-title">Próximo Agendamento</h2>
          
          {loadingAppts ? (
            <div className="skeleton" style={{ height: '80px', width: '100%' }}></div>
          ) : nextAppointment ? (
            <div className="card next-appt-card" onClick={() => navigate('/history')}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-sm)' }}>
                <h4 style={{ color: 'var(--text-accent)' }}>{nextAppointment.name_service || "Serviço"}</h4>
                <span className={`badge ${nextAppointment.status?.toUpperCase() === 'CONFIRMADO' ? 'badge-confirmed' : 'badge-pending'}`}>
                  {nextAppointment.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', marginBottom: '4px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>
                  {new Date(nextAppointment.data_hora_inicio).toLocaleDateString('pt-BR')} às{' '}
                  {new Date(nextAppointment.data_hora_inicio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Profissional: {nextAppointment.name_provider || "Clínica"}</span>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--neutral-300)" strokeWidth="1.5" style={{ margin: '0 auto var(--space-md)' }}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              <p style={{ marginBottom: 'var(--space-sm)' }}>Nenhum agendamento futuro</p>
              <button className="btn btn-text" onClick={() => navigate('/services')}>Agendar agora</button>
            </div>
          )}
        </section>

        {/* Botão Ver Histórico */}
        <section className="animate-fade-in delay-3">
          <div className="quick-action-card" onClick={() => navigate('/history')} style={{ marginTop: 'var(--space-lg)' }}>
            <div className="quick-action-icon" style={{ background: 'linear-gradient(135deg, var(--tertiary) 0%, var(--tertiary-light) 100%)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="quick-action-text">
              <h3>Histórico de Agendamentos</h3>
              <p>Veja todos os seus agendamentos</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </section>

        {/* Categories */}
        <section className="dashboard-categories" id="categories-section">
          <h2 className="section-title animate-fade-in delay-3">Categorias</h2>
          <div className="categories-grid">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className={`category-card card card-interactive animate-fade-in-up delay-${index + 4}`}
                onClick={() => navigate(`/services?category=${cat.id}`)}
                id={`category-${cat.id}`}
              >
                <div className="category-icon" style={{ background: cat.gradient }}>
                  {cat.icon}
                </div>
                <h3 className="category-title">{cat.title}</h3>
                <p className="category-description">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="dashboard-info animate-fade-in delay-5" id="info-section">
          <div className="info-card">
            <div className="info-card-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div>
              <h4>Horário de funcionamento</h4>
              <p>Segunda a Sábado, 09h às 18h</p>
            </div>
          </div>
        </section>
      </div>

      <Navbar />
    </div>
  );
}
