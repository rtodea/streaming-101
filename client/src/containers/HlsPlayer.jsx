import { useEffect, useCallback, useRef } from 'react'
import useHls from '../hooks/useHls.js'
import useWebSocket from '../hooks/useWebSocket.js'
import PlayerControls from '../components/PlayerControls.jsx'

const AT_LIVE_THRESHOLD = 3

const formatBehind = (seconds) => {
  const s = Math.round(seconds)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const r = s % 60
  return r ? `${m}m ${r}s` : `${m}m`
}

export default function HlsPlayer({ src, viewerId, watchingId }) {
  const { attach, stats, liveState, setLevel, jumpToLive } = useHls(src)
  const ws = useWebSocket()
  const statsIntervalRef = useRef(null)
  const statsRef = useRef(stats)
  statsRef.current = stats
  const atLiveEdge = liveState.isLive && liveState.behindLive < AT_LIVE_THRESHOLD

  const videoRef = useCallback((el) => {
    if (el) {
      attach(el)
      el.play().catch(() => {})
    }
  }, [attach])

  useEffect(() => {
    ws.connect()

    statsIntervalRef.current = setInterval(() => {
      const s = statsRef.current
      ws.sendJson({
        type: 'viewer:stats',
        viewerId,
        currentQuality: s.quality,
        bandwidth: s.bandwidth,
        bufferLevel: s.bufferLevel,
      })
    }, 2000)

    return () => {
      clearInterval(statsIntervalRef.current)
      ws.sendJson({ type: 'viewer:disconnect', viewerId })
      ws.disconnect()
    }
  }, [viewerId, watchingId])

  useEffect(() => {
    if (ws.state === 'connected') {
      ws.sendJson({ type: 'viewer:connect', viewerId, watchingId })
    }
  }, [ws.state, viewerId, watchingId])

  return (
    <div className="stack">
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          controls
          style={{ width: '100%', borderRadius: 'var(--radius-md)', background: '#000', display: 'block' }}
        />
        {liveState.isLive && (
          <button
            type="button"
            onClick={atLiveEdge ? undefined : jumpToLive}
            disabled={atLiveEdge}
            className={`live-badge ${atLiveEdge ? 'live-badge--at-edge' : 'live-badge--behind'}`}
            aria-label={atLiveEdge ? 'At live edge' : 'Jump to live'}
            title={atLiveEdge ? 'You are at the live edge' : 'Click to jump to live'}
          >
            <span className="live-badge__dot" />
            <span>LIVE</span>
            {!atLiveEdge && (
              <span className="live-badge__behind">−{formatBehind(liveState.behindLive)}</span>
            )}
          </button>
        )}
      </div>
      <PlayerControls
        quality={stats.quality}
        bandwidth={stats.bandwidth}
        bufferLevel={stats.bufferLevel}
        levels={stats.levels}
        selectedLevel={stats.selectedLevel}
        onLevelChange={setLevel}
      />
      <style>{`
        .live-badge {
          position: absolute;
          top: var(--space-sm);
          right: var(--space-sm);
          display: inline-flex;
          align-items: center;
          gap: var(--space-xs);
          padding: var(--space-xs) var(--space-sm);
          border-radius: var(--radius-sm);
          border: none;
          font-family: var(--font-family-sans);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          letter-spacing: 0.08em;
          color: #fff;
          cursor: pointer;
          backdrop-filter: blur(4px);
        }
        .live-badge:disabled {
          cursor: default;
        }
        .live-badge--at-edge {
          background: rgba(220, 38, 38, 0.85);
        }
        .live-badge--behind {
          background: rgba(55, 65, 81, 0.75);
        }
        .live-badge--behind:hover {
          background: rgba(75, 85, 99, 0.9);
        }
        .live-badge__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #fff;
        }
        .live-badge--at-edge .live-badge__dot {
          animation: live-pulse 1.4s infinite ease-in-out;
        }
        .live-badge__behind {
          font-variant-numeric: tabular-nums;
          opacity: 0.9;
        }
        @keyframes live-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .live-badge--at-edge .live-badge__dot { animation: none; }
        }
      `}</style>
    </div>
  )
}
