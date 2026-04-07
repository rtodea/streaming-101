export default function StatGauge({ label, value, unit = '' }) {
  return (
    <div className="stat-gauge">
      <div className="stat-gauge__value">
        {typeof value === 'number' ? value.toLocaleString() : value}
        {unit && <span className="stat-gauge__unit">{unit}</span>}
      </div>
      <div className="stat-gauge__label">{label}</div>
      <style>{`
        .stat-gauge {
          text-align: center;
          padding: var(--space-md);
          background: var(--color-surface);
          border-radius: var(--radius-md);
          min-width: 120px;
        }
        .stat-gauge__value {
          font-size: var(--font-size-2xl);
          font-weight: 700;
          line-height: 1;
        }
        .stat-gauge__unit {
          font-size: var(--font-size-md);
          font-weight: 400;
          color: var(--color-muted);
          margin-left: 2px;
        }
        .stat-gauge__label {
          font-size: var(--font-size-sm);
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-top: var(--space-xs);
        }
      `}</style>
    </div>
  )
}
