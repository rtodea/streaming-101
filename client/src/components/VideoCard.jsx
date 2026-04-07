export default function VideoCard({ video, onClick, onDelete }) {
  const statusColors = {
    ready: 'var(--color-success)',
    transcoding: 'var(--color-warning)',
    error: 'var(--color-error)',
    upload_pending: 'var(--color-muted)',
  }

  return (
    <div className="video-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="video-card__thumb">
        <span className="video-card__format">{video.format}</span>
        {onDelete && (
          <button
            className="video-card__delete"
            onClick={(e) => { e.stopPropagation(); onDelete(video); }}
            title="Delete video"
          >
            x
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
          transition: var(--transition-fast);
        }
        .video-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .video-card__thumb {
          background: var(--color-surface);
          aspect-ratio: 16/9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: var(--font-size-sm);
          color: var(--color-muted);
          text-transform: uppercase;
        }
        .video-card__thumb { position: relative; }
        .video-card__delete {
          position: absolute;
          top: var(--space-xs);
          right: var(--space-xs);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: none;
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: var(--font-size-sm);
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          transition: background 0.15s;
        }
        .video-card__delete:hover { background: var(--color-error); }
        .video-card__info { padding: var(--space-sm); }
        .video-card__title {
          font-size: var(--font-size-md);
          margin: 0 0 var(--space-xs);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .video-card__status { font-size: var(--font-size-sm); font-weight: 600; }
        .video-card__progress {
          height: 4px;
          background: var(--color-surface);
          border-radius: 2px;
          margin-top: var(--space-xs);
          overflow: hidden;
        }
        .video-card__progress-bar {
          height: 100%;
          background: var(--color-warning);
          transition: width 0.3s ease;
        }
        .video-card__qualities {
          display: flex;
          gap: var(--space-xs);
          margin-top: var(--space-xs);
        }
        .video-card__quality-badge {
          font-size: var(--font-size-xs);
          padding: 1px 6px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  )
}
