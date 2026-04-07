export default function HexViewer({ data, onNavigate }) {
  if (!data) return null

  const { file, fileSize, offset, length, rows } = data

  return (
    <div className="hex-viewer">
      <div className="hex-viewer__header">
        <span className="hex-viewer__file">{file}</span>
        <span className="hex-viewer__meta">
          {fileSize.toLocaleString()} bytes total — showing {offset}–{offset + length}
        </span>
      </div>

      <div className="hex-viewer__table-wrap">
        <table className="hex-viewer__table">
          <thead>
            <tr>
              <th>Offset</th>
              <th>Hex</th>
              <th>ASCII</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.offset}>
                <td className="hex-viewer__offset">{row.offset}</td>
                <td className="hex-viewer__hex">{row.hex}</td>
                <td className="hex-viewer__ascii">{row.ascii}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {onNavigate && (
        <div className="hex-viewer__nav">
          <button
            disabled={offset === 0}
            onClick={() => onNavigate(Math.max(0, offset - 512))}
          >
            Prev
          </button>
          <button
            disabled={offset + length >= fileSize}
            onClick={() => onNavigate(offset + 512)}
          >
            Next
          </button>
        </div>
      )}

      <style>{`
        .hex-viewer {
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          overflow: hidden;
          font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
          font-size: 12px;
        }
        .hex-viewer__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-xs) var(--space-sm);
          background: var(--color-surface);
          border-bottom: 1px solid var(--color-border);
          gap: var(--space-sm);
        }
        .hex-viewer__file { font-weight: 600; font-size: var(--font-size-sm); }
        .hex-viewer__meta { color: var(--color-muted); font-size: 11px; }
        .hex-viewer__table-wrap {
          overflow-x: auto;
          max-height: 320px;
          overflow-y: auto;
        }
        .hex-viewer__table {
          width: 100%;
          border-collapse: collapse;
          white-space: pre;
        }
        .hex-viewer__table th {
          position: sticky;
          top: 0;
          background: var(--color-bg, #fff);
          text-align: left;
          padding: 2px var(--space-sm);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--color-muted);
          border-bottom: 1px solid var(--color-border);
        }
        .hex-viewer__table td {
          padding: 1px var(--space-sm);
          vertical-align: top;
        }
        .hex-viewer__table tr:hover td { background: var(--color-surface); }
        .hex-viewer__offset { color: var(--color-muted); user-select: none; }
        .hex-viewer__hex { letter-spacing: 0.5px; }
        .hex-viewer__ascii { color: var(--color-primary); border-left: 1px solid var(--color-border); }
        .hex-viewer__nav {
          display: flex;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          border-top: 1px solid var(--color-border);
          background: var(--color-surface);
        }
        .hex-viewer__nav button {
          font-size: 11px;
          padding: 2px 12px;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          background: var(--color-bg, #fff);
          cursor: pointer;
        }
        .hex-viewer__nav button:disabled { opacity: 0.4; cursor: default; }
        .hex-viewer__nav button:hover:not(:disabled) { background: var(--color-surface); }
      `}</style>
    </div>
  )
}
