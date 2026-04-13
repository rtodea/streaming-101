import QRCode from 'react-qr-code'

export default function QRDisplay({ url, size = 200 }) {
  return (
    <div className="qr-display">
      <div className="qr-display__code">
        <QRCode value={url} size={size} level="M" />
      </div>
      <div className="qr-display__url">{url}</div>
      <style>{`
        .qr-display {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-sm);
          padding: var(--space-md);
          background: white;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border);
        }
        .qr-display__code { padding: var(--space-sm); }
        .qr-display__url {
          font-family: var(--font-family-mono);
          font-size: var(--font-size-sm);
          color: var(--color-muted);
          word-break: break-all;
          text-align: center;
        }
      `}</style>
    </div>
  )
}
