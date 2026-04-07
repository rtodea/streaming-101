export default function StreamIndicator({ type = 'offline' }) {
  const config = {
    live: { label: 'LIVE', color: 'var(--color-error)', pulse: true },
    vod: { label: 'VOD', color: 'var(--color-success)', pulse: false },
    offline: { label: 'Offline', color: 'var(--color-muted)', pulse: false },
  }

  const { label, color, pulse } = config[type] || config.offline

  return (
    <span className={`stream-indicator ${pulse ? 'stream-indicator--pulse' : ''}`}>
      <span className="stream-indicator__dot" style={{ background: color }} />
      {label}
      <style>{`
        .stream-indicator {
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          font-size: var(--font-size-sm);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stream-indicator__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .stream-indicator--pulse .stream-indicator__dot {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </span>
  )
}
