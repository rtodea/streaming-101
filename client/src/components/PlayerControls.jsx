export default function PlayerControls({ quality, bandwidth, bufferLevel }) {
  const bufferPercent = Math.min(100, (bufferLevel || 0) * 10)

  return (
    <div className="player-controls">
      <div className="player-controls__stat">
        <span className="player-controls__label">Quality</span>
        <span className="player-controls__value">{quality || '—'}</span>
      </div>
      <div className="player-controls__stat">
        <span className="player-controls__label">Bandwidth</span>
        <span className="player-controls__value">
          {bandwidth ? `${Math.round(bandwidth)} kbps` : '—'}
        </span>
      </div>
      <div className="player-controls__stat">
        <span className="player-controls__label">Buffer</span>
        <div className="player-controls__buffer">
          <div
            className="player-controls__buffer-fill"
            style={{ width: `${bufferPercent}%` }}
          />
        </div>
        <span className="player-controls__value">
          {bufferLevel != null ? `${bufferLevel.toFixed(1)}s` : '—'}
        </span>
      </div>
      <style>{`
        .player-controls {
          display: flex;
          gap: var(--space-lg);
          padding: var(--space-sm) var(--space-md);
          background: var(--color-surface);
          border-radius: var(--radius-md);
          font-size: var(--font-size-sm);
        }
        .player-controls__stat {
          display: flex;
          align-items: center;
          gap: var(--space-xs);
        }
        .player-controls__label {
          color: var(--color-muted);
          text-transform: uppercase;
          font-size: var(--font-size-xs);
          letter-spacing: 0.05em;
        }
        .player-controls__value { font-weight: 600; }
        .player-controls__buffer {
          width: 60px;
          height: 6px;
          background: var(--color-border);
          border-radius: 3px;
          overflow: hidden;
        }
        .player-controls__buffer-fill {
          height: 100%;
          background: var(--color-success);
          transition: width 0.5s ease;
        }
      `}</style>
    </div>
  )
}
