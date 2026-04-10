import { useState } from 'react'
import VideoUploader from '../containers/VideoUploader.jsx'
import LiveCamera from '../containers/LiveCamera.jsx'
import StatsPanel from '../containers/StatsPanel.jsx'
import CatalogList from '../containers/CatalogList.jsx'
import ByteInspector from '../containers/ByteInspector.jsx'
import QRDisplay from '../components/QRDisplay.jsx'

export default function Presenter() {
  const [segmentDuration, setSegmentDuration] = useState(4)
  const catalogUrl = `${window.location.origin}/catalog`

  const updateSegmentDuration = async (value) => {
    setSegmentDuration(value)
    try {
      const res = await fetch('/api/streams')
      const streams = await res.json()
      const active = streams.find(s => s.status === 'live')
      if (active) {
        await fetch(`/api/streams/${active.id}/config`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ segmentDuration: value }),
        })
      }
    } catch { /* no active stream */ }
  }

  return (
    <div className="page container">
      <h1>Presenter Dashboard</h1>
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <div className="stack">
          <section>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
              Upload Video
            </h2>
            <VideoUploader />
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
              Live Camera
            </h2>
            <LiveCamera />
            <div className="row" style={{ marginTop: 'var(--space-sm)' }}>
              <label
                htmlFor="segment-duration"
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'var(--font-weight-medium)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-muted)',
                }}
              >
                Segment Duration: {segmentDuration}s
              </label>
              <input
                id="segment-duration"
                className="form-control"
                type="range"
                min="2"
                max="10"
                value={segmentDuration}
                onChange={(e) => updateSegmentDuration(Number(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
              Audience QR Code
            </h2>
            <QRDisplay url={catalogUrl} size={180} />
          </section>
        </div>

        <div className="stack">
          <section>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
              Videos
            </h2>
            <CatalogList allowDelete />
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
              Byte Inspector
            </h2>
            <ByteInspector />
          </section>

          <section>
            <h2 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)' }}>
              Live Stats
            </h2>
            <StatsPanel />
          </section>
        </div>
      </div>
    </div>
  )
}
