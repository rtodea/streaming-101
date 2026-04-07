import { useState, useRef, useCallback, useEffect } from 'react'
import useWebSocket from '../hooks/useWebSocket.js'
import StreamIndicator from '../components/StreamIndicator.jsx'

export default function LiveCamera() {
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const recorderRef = useRef(null)
  const streamRef = useRef(null)
  const ws = useWebSocket()

  const startStream = useCallback(async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      ws.connect()

      await new Promise(resolve => {
        const check = () => {
          if (ws.state === 'connected') resolve()
          else setTimeout(check, 100)
        }
        check()
      })

      ws.sendJson({ type: 'camera:start' })

      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 2_500_000,
      })

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          ws.sendBinary(e.data)
        }
      }

      recorder.start(1000)
      recorderRef.current = recorder
      setStreaming(true)
    } catch (err) {
      setError(err.message || 'Camera access denied')
    }
  }, [ws])

  const stopStream = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    ws.sendJson({ type: 'camera:stop' })
    ws.disconnect()

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setStreaming(false)
  }, [ws])

  useEffect(() => {
    return () => {
      recorderRef.current?.stop()
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  return (
    <div className="stack">
      <div className="row">
        <StreamIndicator type={streaming ? 'live' : 'offline'} />
        {!streaming ? (
          <button onClick={startStream}>Start Live Stream</button>
        ) : (
          <button onClick={stopStream} style={{ color: 'var(--color-error)' }}>
            Stop Stream
          </button>
        )}
      </div>

      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: '100%',
          maxHeight: 400,
          borderRadius: 'var(--radius-md)',
          background: '#000',
          display: streaming ? 'block' : 'none',
        }}
      />

      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>
      )}
    </div>
  )
}
