import { useState, useEffect } from 'react'
import useWebSocket from '../hooks/useWebSocket.js'
import StatGauge from '../components/StatGauge.jsx'
import StatBar from '../components/StatBar.jsx'

export default function StatsPanel() {
  const [stats, setStats] = useState({
    viewerCount: 0,
    viewers: [],
    avgBandwidth: 0,
    qualityDistribution: {},
  })
  const ws = useWebSocket()

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})

    ws.connect()
    ws.sendJson({ type: 'presenter:connect' })
    ws.on('stats:update', (msg) => {
      setStats({
        viewerCount: msg.viewerCount,
        viewers: msg.viewers,
        avgBandwidth: msg.avgBandwidth,
        qualityDistribution: msg.qualityDistribution,
      })
    })

    return () => ws.disconnect()
  }, [])

  const maxViewers = Math.max(50, stats.viewerCount)
  const qualities = Object.entries(stats.qualityDistribution)

  return (
    <div className="stack">
      <div className="row" style={{ gap: 'var(--space-lg)' }}>
        <StatGauge label="Viewers" value={stats.viewerCount} />
        <StatGauge label="Avg Bandwidth" value={stats.avgBandwidth} unit=" kbps" />
      </div>

      {qualities.length > 0 && (
        <div>
          <h3
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 'var(--font-weight-medium)',
              color: 'var(--color-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-xs)',
            }}
          >
            Quality Distribution
          </h3>
          {qualities.map(([quality, count]) => (
            <StatBar
              key={quality}
              label={quality}
              value={count}
              max={stats.viewerCount}
              unit={` viewer${count === 1 ? '' : 's'}`}
            />
          ))}
        </div>
      )}

      {stats.viewers.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table className="stats-table">
            <thead>
              <tr>
                <th>Viewer</th>
                <th>Quality</th>
                <th>Bandwidth</th>
                <th>Buffer</th>
              </tr>
            </thead>
            <tbody>
              {stats.viewers.map(v => (
                <tr key={v.id}>
                  <td>{v.id.slice(0, 8)}</td>
                  <td>{v.currentQuality || '—'}</td>
                  <td>{v.bandwidth ? `${v.bandwidth} kbps` : '—'}</td>
                  <td>{v.bufferLevel != null ? `${v.bufferLevel.toFixed(1)}s` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .stats-table {
          width: 100%;
          border-collapse: collapse;
          font-family: var(--font-family-sans);
          font-size: var(--font-size-sm);
        }
        .stats-table th, .stats-table td {
          padding: var(--space-xs) var(--space-sm);
          text-align: left;
          border-bottom: 1px solid var(--color-border);
        }
        .stats-table th {
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
        }
        .stats-table td {
          font-variant-numeric: tabular-nums;
        }
      `}</style>
    </div>
  )
}
