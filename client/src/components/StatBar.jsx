export default function StatBar({ label, value, max = 100, unit = '' }) {
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0

  return (
    <div className="stat-bar">
      <div className="stat-bar__header">
        <span className="stat-bar__label">{label}</span>
        <span className="stat-bar__value">{value}{unit}</span>
      </div>
      <div className="stat-bar__track">
        <div
          className="stat-bar__fill"
          style={{ '--fill-width': `${percent}%` }}
        />
      </div>
      <style>{`
        .stat-bar { margin-bottom: var(--space-xs); }
        .stat-bar__header {
          display: flex;
          justify-content: space-between;
          font-size: var(--font-size-sm);
          margin-bottom: 2px;
        }
        .stat-bar__label { color: var(--color-muted); text-transform: uppercase; letter-spacing: 0.05em; font-size: var(--font-size-xs); }
        .stat-bar__value { font-weight: 600; }
        .stat-bar__track {
          height: 8px;
          background: var(--color-surface);
          border-radius: 4px;
          overflow: hidden;
        }
        .stat-bar__fill {
          height: 100%;
          width: var(--fill-width);
          background: var(--color-primary);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  )
}
