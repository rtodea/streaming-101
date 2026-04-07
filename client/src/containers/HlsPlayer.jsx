import { useEffect, useCallback, useRef } from 'react'
import useHls from '../hooks/useHls.js'
import useWebSocket from '../hooks/useWebSocket.js'
import PlayerControls from '../components/PlayerControls.jsx'

export default function HlsPlayer({ src, viewerId, watchingId }) {
  const { attach, stats } = useHls(src)
  const ws = useWebSocket()
  const statsIntervalRef = useRef(null)

  const videoRef = useCallback((el) => {
    if (el) {
      attach(el)
      el.play().catch(() => {})
    }
  }, [attach])

  useEffect(() => {
    ws.connect()

    ws.sendJson({
      type: 'viewer:connect',
      viewerId,
      watchingId,
    })

    statsIntervalRef.current = setInterval(() => {
      ws.sendJson({
        type: 'viewer:stats',
        viewerId,
        currentQuality: stats.quality,
        bandwidth: stats.bandwidth,
        bufferLevel: stats.bufferLevel,
      })
    }, 2000)

    return () => {
      clearInterval(statsIntervalRef.current)
      ws.sendJson({ type: 'viewer:disconnect', viewerId })
      ws.disconnect()
    }
  }, [viewerId, watchingId])

  return (
    <div className="stack">
      <video
        ref={videoRef}
        controls
        style={{ width: '100%', borderRadius: 'var(--radius-md)', background: '#000' }}
      />
      <PlayerControls
        quality={stats.quality}
        bandwidth={stats.bandwidth}
        bufferLevel={stats.bufferLevel}
      />
    </div>
  )
}
