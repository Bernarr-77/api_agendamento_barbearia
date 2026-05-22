import './ServiceCard.css';

export default function ServiceCard({ service, onBook }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <div className="service-card card card-interactive" id={`service-${service.id}`} onClick={() => onBook?.(service)}>
      <div className="service-card-header">
        <h4 className="service-card-name">{service.name}</h4>
        <span className="service-card-price">{formatPrice(service.price)}</span>
      </div>

      <div className="service-card-details">
        <div className="service-card-meta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>{service.duration_minutes} min</span>
        </div>

        <div className="service-card-meta">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{service.provider_name}</span>
        </div>
      </div>

      <button className="btn btn-primary btn-full service-card-btn" id={`book-service-${service.id}`}>
        Agendar
      </button>
    </div>
  );
}
