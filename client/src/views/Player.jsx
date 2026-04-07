import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router'
import HlsPlayer from '../containers/HlsPlayer.jsx'
import StreamIndicator from '../components/StreamIndicator.jsx'

export default function Player() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isLive = searchParams.get('live') === '1'
  const [title, setTitle] = useState('')
  const [viewerId] = useState(() => crypto.randomUUID())

  useEffect(() => {
    const endpoint = isLive ? `/api/streams` : `/api/videos/${id}`
    fetch(endpoint)
      .then(r => r.json())
      .then(data => {
        if (isLive && Array.isArray(data)) {
          const stream = data.find(s => s.id === id)
          setTitle(stream ? 'Live Stream' : 'Stream')
        } else {
          setTitle(data.title || 'Video')
        }
      })
      .catch(() => {})
  }, [id, isLive])

  const hlsSrc = isLive
    ? `/hls/live/${id}/master.m3u8`
    : `/hls/vod/${id}/master.m3u8`

  return (
    <div className="page container">
      <div className="row" style={{ marginBottom: 'var(--space-md)' }}>
        <h1 style={{ margin: 0 }}>{title}</h1>
        <StreamIndicator type={isLive ? 'live' : 'vod'} />
      </div>
      <HlsPlayer src={hlsSrc} viewerId={viewerId} watchingId={id} />
    </div>
  )
}
