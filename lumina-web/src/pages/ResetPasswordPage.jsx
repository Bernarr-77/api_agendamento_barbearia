import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState(location.state?.email || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/reset-password', {
        email,
        code,
        new_password: newPassword,
      });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        setError(err.response.data.detail || 'Código inválido ou e-mail incorreto.');
      } else {
        setError('Erro ao redefinir a senha. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" id="reset-password-page">
      {/* Background decoration */}
      <div className="login-bg-decoration">
        <div className="login-bg-circle login-bg-circle-1" />
        <div className="login-bg-circle login-bg-circle-2" />
        <div className="login-bg-circle login-bg-circle-3" />
      </div>

      <div className="login-container animate-fade-in">
        {/* Logo / Brand */}
        <div className="login-brand">
          <div className="login-logo">
            {success ? (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="url(#logo-gradient-success)" />
                <polyline points="15 25 21 31 33 17" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="logo-gradient-success" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#4ADE80" />
                    <stop offset="1" stopColor="#22C55E" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="url(#logo-gradient)" />
                <rect x="16" y="22" width="16" height="12" rx="2" stroke="white" strokeWidth="2.5" />
                <path d="M19 22v-4a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48">
                    <stop stopColor="#AAF0D1" />
                    <stop offset="1" stopColor="#487F88" />
                  </linearGradient>
                </defs>
              </svg>
            )}
          </div>
          <h1 className="login-title">{success ? 'Senha Redefinida!' : 'Nova Senha'}</h1>
          <p className="login-subtitle" style={{ padding: '0 20px', lineHeight: '1.4' }}>
            {success
              ? 'Sua senha foi redefinida com sucesso. Redirecionando para o login...'
              : 'Insira o código de 6 dígitos que enviamos para o seu e-mail e crie uma nova senha.'}
          </p>
        </div>

        {/* Form */}
        {!success && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="reset-email">Email</label>
              <input
                id="reset-email"
                type="email"
                className="input-field"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={!!location.state?.email}
              />
            </div>

            <div className="input-group">
              <label htmlFor="reset-code">Código de Verificação (6 dígitos)</label>
              <input
                id="reset-code"
                type="text"
                className={`input-field ${error ? 'error' : ''}`}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="new-password">Nova Senha</label>
              <div className="input-password-wrapper">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field ${error ? 'error' : ''}`}
                  placeholder="Min. 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error animate-fade-in">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading || !email || code.length < 6 || newPassword.length < 6}
            >
              {isLoading ? <LoadingSpinner size={24} /> : 'Redefinir Senha'}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="login-footer">
          <p>
            <Link to="/login" className="login-link">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
