import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="page" id="profile-page">
      <div className="container">
        <header className="profile-header animate-fade-in">
          <div className="profile-avatar-large">
            <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
          </div>
          <h1 className="profile-name">{user?.name}</h1>
          <p className="profile-email">{user?.email}</p>
          <span className="badge badge-confirmed">{user?.role === 'PROVIDER' ? 'Profissional' : 'Cliente'}</span>
        </header>

        <section className="profile-section animate-fade-in delay-1">
          <h3 className="profile-section-title">Conta</h3>

          <div className="profile-menu">
            <button className="profile-menu-item" id="menu-appointments" onClick={() => navigate('/history')}>
              <div className="profile-menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <span>Meus agendamentos</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>

            <button className="profile-menu-item" id="menu-services" onClick={() => navigate('/services')}>
              <div className="profile-menu-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <span>Explorar serviços</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          </div>
        </section>

        <section className="profile-section animate-fade-in delay-2">
          <button className="btn btn-secondary btn-full profile-logout" onClick={handleLogout} id="logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair da conta
          </button>
        </section>
      </div>

      <Navbar />
    </div>
  );
}
