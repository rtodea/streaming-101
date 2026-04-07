import { useState, useEffect } from 'react'
import HexViewer from '../components/HexViewer.jsx'

const FILE_OPTIONS = [
  { value: 'original', label: 'Original Upload' },
  { value: 'manifest', label: 'Master Manifest' },
  { value: '1080p/stream.m3u8', label: '1080p Variant Manifest' },
  { value: '720p/stream.m3u8', label: '720p Variant Manifest' },
  { value: '480p/stream.m3u8', label: '480p Variant Manifest' },
  { value: '1080p/segment-000.ts', label: '1080p Segment 0' },
  { value: '720p/segment-000.ts', label: '720p Segment 0' },
  { value: '480p/segment-000.ts', label: '480p Segment 0' },
]

export default function ByteInspector() {
  const [videos, setVideos] = useState([])
  const [selectedVideo, setSelectedVideo] = useState('')
  const [selectedFile, setSelectedFile] = useState('original')
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('/api/videos')
      .then(r => r.json())
      .then(list => {
        setVideos(list)
        if (list.length > 0 && !selectedVideo) setSelectedVideo(list[0].id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedVideo) { setData(null); return }
    setError(null)
    fetch(`/api/videos/${selectedVideo}/bytes?file=${encodeURIComponent(selectedFile)}&offset=${offset}&length=512`)
      .then(r => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then(setData)
      .catch(() => {
        setData(null)
        setError('File not available (video may still be transcoding)')
      })
  }, [selectedVideo, selectedFile, offset])

  const handleVideoChange = (id) => {
    setSelectedVideo(id)
    setOffset(0)
  }

  const handleFileChange = (file) => {
    setSelectedFile(file)
    setOffset(0)
  }

  return (
    <div className="stack" style={{ gap: 'var(--space-sm)' }}>
      <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--space-xs)' }}>
        <select
          value={selectedVideo}
          onChange={(e) => handleVideoChange(e.target.value)}
          style={{ fontSize: 'var(--font-size-sm)', padding: '4px 8px' }}
        >
          <option value="">Select a video...</option>
          {videos.map(v => (
            <option key={v.id} value={v.id}>
              {v.title} ({v.status})
            </option>
          ))}
        </select>

        <select
          value={selectedFile}
          onChange={(e) => handleFileChange(e.target.value)}
          style={{ fontSize: 'var(--font-size-sm)', padding: '4px 8px' }}
        >
          {FILE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <p style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-sm)' }}>{error}</p>
      )}

      <HexViewer data={data} onNavigate={setOffset} />
    </div>
  )
}
