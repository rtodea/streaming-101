import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import VideoCard from '../components/VideoCard.jsx'
import StreamIndicator from '../components/StreamIndicator.jsx'
import useWebSocket from '../hooks/useWebSocket.js'

export default function CatalogList({ allowDelete = false }) {
  const [videos, setVideos] = useState([])
  const [streams, setStreams] = useState([])
  const navigate = useNavigate()
  const ws = useWebSocket()

  const fetchData = async () => {
    const [vRes, sRes] = await Promise.all([
      fetch('/api/videos'),
      fetch('/api/streams'),
    ])
    setVideos(await vRes.json())
    setStreams(await sRes.json())
  }

  useEffect(() => {
    fetchData()
    ws.connect()

    const unsub1 = ws.on('transcode:complete', () => fetchData())
    const unsub2 = ws.on('stream:started', () => fetchData())
    const unsub3 = ws.on('stream:ended', () => fetchData())
    const unsub4 = ws.on('video:deleted', (msg) => {
      setVideos(prev => prev.filter(v => v.id !== msg.videoId))
    })

    return () => {
      unsub1()
      unsub2()
      unsub3()
      unsub4()
      ws.disconnect()
    }
  }, [])

  const handleDelete = async (video) => {
    if (!window.confirm(`Are you sure you want to delete "${video.title}"?`)) return
    try {
      await fetch(`/api/videos/${video.id}`, { method: 'DELETE' })
    } catch { /* WS event will handle UI update */ }
  }

  const liveStream = streams.find(s => s.status === 'live')

  return (
    <div className="stack">
      {liveStream && (
        <div
          className="row"
          style={{ cursor: 'pointer', padding: 'var(--space-md)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}
          onClick={() => navigate(`/player/${liveStream.id}?live=1`)}
        >
          <StreamIndicator type="live" />
          <span>Live stream in progress — click to watch</span>
        </div>
      )}
      <div className="grid grid-3">
        {videos.map(video => (
          <VideoCard
            key={video.id}
            video={video}
            onClick={video.status === 'ready' ? () => navigate(`/player/${video.id}`) : undefined}
            onDelete={allowDelete ? handleDelete : undefined}
          />
        ))}
      </div>
      {videos.length === 0 && !liveStream && (
        <p style={{ color: 'var(--color-muted)', textAlign: 'center' }}>
          No videos yet. Upload one from the Presenter view.
        </p>
      )}
    </div>
  )
}
