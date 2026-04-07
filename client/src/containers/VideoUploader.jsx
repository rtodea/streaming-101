import { useState, useRef, useEffect } from 'react'
import useWebSocket from '../hooks/useWebSocket.js'

const ACCEPT = '.mp4,.webm,.mov'

export default function VideoUploader({ onUploadComplete }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [transcodeProgress, setTranscodeProgress] = useState(null)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const ws = useWebSocket()

  useEffect(() => {
    ws.connect()
    ws.on('transcode:progress', (msg) => {
      setTranscodeProgress(msg.progress)
    })
    ws.on('transcode:complete', () => {
      setTranscodeProgress(null)
      setUploading(false)
      onUploadComplete?.()
    })
    ws.on('transcode:error', (msg) => {
      setError(msg.error)
      setTranscodeProgress(null)
      setUploading(false)
    })

    ws.sendJson({ type: 'presenter:connect' })

    return () => ws.disconnect()
  }, [])

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setUploadProgress(0)

    const formData = new FormData()
    formData.append('file', file)

    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setUploadProgress(Math.round((e.loaded / e.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status === 201) {
        setUploadProgress(100)
      } else {
        try {
          const body = JSON.parse(xhr.responseText)
          setError(body.error || 'Upload failed')
        } catch {
          setError('Upload failed')
        }
        setUploading(false)
      }
    }
    xhr.onerror = () => {
      setError('Network error')
      setUploading(false)
    }
    xhr.open('POST', '/api/videos/upload')
    xhr.send(formData)
  }

  return (
    <div className="stack" style={{ gap: 'var(--space-sm)' }}>
      <div className="row">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          disabled={uploading}
        />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>

      {uploading && transcodeProgress == null && (
        <div className="uploader-progress">
          <div className="uploader-progress__bar" style={{ width: `${uploadProgress}%` }} />
          <span>{uploadProgress}% uploaded</span>
        </div>
      )}

      {transcodeProgress != null && (
        <div className="uploader-progress">
          <div
            className="uploader-progress__bar uploader-progress__bar--transcode"
            style={{ width: `${transcodeProgress}%` }}
          />
          <span>Transcoding: {transcodeProgress}%</span>
        </div>
      )}

      {error && (
        <p style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-sm)' }}>{error}</p>
      )}

      <style>{`
        .uploader-progress {
          position: relative;
          height: 24px;
          background: var(--color-surface);
          border-radius: var(--radius-sm);
          overflow: hidden;
          font-size: var(--font-size-sm);
        }
        .uploader-progress span {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1;
        }
        .uploader-progress__bar {
          height: 100%;
          background: var(--color-primary);
          opacity: 0.2;
          transition: width 0.3s ease;
        }
        .uploader-progress__bar--transcode {
          background: var(--color-warning);
        }
      `}</style>
    </div>
  )
}
