export default function VideoCard({ video, onClick, onDelete }) {
  const statusColors = {
    ready: 'var(--color-success)',
    transcoding: 'var(--color-muted)',
    error: 'var(--color-error)',
    upload_pending: 'var(--color-muted)',
  }

  return (
    <div className="video-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="video-card__thumb">
        <span className="video-card__format">{video.format}</span>
        {onDelete && (
          <button
            className="btn btn--danger btn--icon video-card__delete"
            onClick={(e) => { e.stopPropagation(); onDelete(video); }}
            title="Delete video"
            aria-label="Delete video"
          >
            ×
          </button>
        )}
      </div>
      <div className="video-card__info">
        <h3 className="video-card__title">{video.title}</h3>
        <span
          className="video-card__status"
          style={{ color: statusColors[video.status] || 'inherit' }}
        >
          {video.status}
        </span>
        {video.status === 'transcoding' && (
          <div className="video-card__progress">
            <div
              className="video-card__progress-bar"
              style={{ width: `${video.transcodingProgress}%` }}
            />
          </div>
        )}
        {video.qualities?.length > 0 && (
          <div className="video-card__qualities">
            {video.qualities.map(q => (
              <span key={q} className="video-card__quality-badge">{q}</span>
            ))}
          </div>
        )}
      </div>
      <style>{`
        .video-card {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: box-shadow var(--transition-fast);
          font-family: var(--font-family-sans);
        }
        .video-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .video-card__thumb {
          background: var(--color-surface);
          aspect-ratio: 16/9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
        }
        .video-card__delete {
          position: absolute;
          top: var(--space-xs);
          right: var(--space-xs);
          width: 28px;
          height: 28px;
          padding: 0;
          border-radius: 50%;
          font-size: var(--font-size-base);
          line-height: 1;
        }
        .video-card__info { padding: var(--space-sm); }
        .video-card__title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-semibold);
          margin: 0 0 var(--space-xs);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .video-card__status {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .video-card__progress {
          height: 4px;
          background: var(--color-surface);
          border-radius: 2px;
          margin-top: var(--space-xs);
          overflow: hidden;
        }
        .video-card__progress-bar {
          height: 100%;
          background: var(--color-text);
          transition: width 0.3s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .video-card { transition: none; }
          .video-card__progress-bar { transition: none; }
        }
        .video-card__qualities {
          display: flex;
          gap: var(--space-xs);
          margin-top: var(--space-xs);
        }
        .video-card__quality-badge {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          padding: 1px 6px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  )
}
