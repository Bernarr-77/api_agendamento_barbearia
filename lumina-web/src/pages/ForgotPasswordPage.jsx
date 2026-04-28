import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './LoginPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/forgot-password', { email });
      // Mesmo se o e-mail não existir, podemos querer redirecionar para não revelar usuários cadastrados,
      // Mas assumindo que o backend retorna sucesso de qualquer forma ou erro claro.
      // O backend parece retornar sucesso e envia email.
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Usuário não encontrado');
      } else {
        setError('Erro ao solicitar recuperação. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page" id="forgot-password-page">
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
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="url(#logo-gradient)" />
              <path d="M24 16v12M24 32h.01" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="48" y2="48">
                  <stop stopColor="#AAF0D1" />
                  <stop offset="1" stopColor="#487F88" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="login-title">Recuperação de Senha</h1>
          <p className="login-subtitle" style={{ padding: '0 20px', lineHeight: '1.4' }}>
            Digite seu e-mail abaixo e enviaremos um código de 6 dígitos para recuperar sua conta.
          </p>
        </div>

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              className={`input-field ${error ? 'error' : ''}`}
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
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
            disabled={isLoading || !email}
          >
            {isLoading ? <LoadingSpinner size={24} /> : 'Enviar Código'}
          </button>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p>
            Lembrou da senha?{' '}
            <Link to="/login" className="login-link">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
