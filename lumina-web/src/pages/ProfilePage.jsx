import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePhotoEditClick = (e) => {
    e.stopPropagation();
    fileInputRef.current.click();
  };

  const handlePhotoClick = () => {
    if (user?.profile_picture) {
      setIsImageFullscreen(true);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await api.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // A resposta tem { message, profile_picture: user.profile_picture }
      updateUser({ profile_picture: response.data.profile_picture });
    } catch (error) {
      console.error('Erro ao enviar foto', error);
      alert('Não foi possível atualizar a foto de perfil. Tente novamente.');
    } finally {
      setUploading(false);
      // Limpa o input file para permitir selecionar o mesmo arquivo novamente
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Base URL do backend para construir URL absoluta da imagem
  const API_BASE_URL = 'http://localhost:8000';
  const profileImageUrl = user?.profile_picture 
    ? (user.profile_picture.startsWith('/') ? `${API_BASE_URL}${user.profile_picture}` : `${API_BASE_URL}/${user.profile_picture}`) 
    : null;

  return (
    <div className="page" id="profile-page">
      <div className="container">
        <header className="profile-header animate-fade-in">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-clickable" onClick={handlePhotoClick}>
              {profileImageUrl ? (
                <img src={profileImageUrl} alt="Profile" className="profile-avatar-large-img" />
              ) : (
                <div className="profile-avatar-large">
                  <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
              )}
            </div>
            
            {/* Botão de Edição (Lápis) */}
            <button className="profile-avatar-edit-btn" onClick={handlePhotoEditClick} aria-label="Editar foto de perfil">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>

            {uploading && <div className="profile-avatar-spinner"></div>}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/jpeg, image/png"
            style={{ display: 'none' }}
          />
          <h1 className="profile-name">{user?.name}</h1>
          <p className="profile-email">{user?.email}</p>
          <span className="badge badge-confirmed">{user?.role === 'PROVIDER' ? 'Profissional' : 'Cliente'}</span>
        </header>

        {/* Fullscreen Image Modal */}
        {isImageFullscreen && profileImageUrl && (
          <div className="fullscreen-image-modal animate-fade-in" onClick={() => setIsImageFullscreen(false)}>
            <button className="fullscreen-close-btn" onClick={() => setIsImageFullscreen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img src={profileImageUrl} alt="Profile Fullscreen" className="fullscreen-image" onClick={(e) => e.stopPropagation()} />
          </div>
        )}

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
