import './StatusBadge.css';

const STATUS_MAP = {
  PENDENTE: { label: 'Pendente', className: 'badge-pending' },
  CONFIRMADO: { label: 'Confirmado', className: 'badge-confirmed' },
  CANCELADO: { label: 'Cancelado', className: 'badge-cancelled' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status] || STATUS_MAP.PENDENTE;

  return (
    <span className={`badge ${config.className}`} id={`badge-${status?.toLowerCase()}`}>
      <span className="badge-dot" />
      {config.label}
    </span>
  );
}
