import { useEffect, useRef, useState, useCallback } from 'react'
import Hls from 'hls.js'

export default function useHls(src) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [stats, setStats] = useState({
    quality: null,
    bandwidth: 0,
    bufferLevel: 0,
    levels: [],
    selectedLevel: -1,
  })
  const [liveState, setLiveState] = useState({ isLive: false, behindLive: 0 })

  const attach = useCallback((videoEl) => {
    videoRef.current = videoEl
    if (!videoEl || !src) return

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      })

      hls.loadSource(src)
      hls.attachMedia(videoEl)

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setStats(prev => ({
          ...prev,
          levels: data.levels.map((l, i) => ({ height: l.height, index: i })),
        }))
      })

      hls.on(Hls.Events.LEVEL_UPDATED, () => {
        const currentLevels = hls.levels
        if (currentLevels) {
          setStats(prev => ({
            ...prev,
            levels: currentLevels.map((l, i) => ({ height: l.height, index: i })),
          }))
        }
      })

      hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
        const level = hls.levels[data.level]
        setStats(prev => ({
          ...prev,
          quality: level ? `${level.height}p` : null,
        }))
      })

      hls.on(Hls.Events.FRAG_LOADED, (_event, data) => {
        const { total, loading } = data.frag.stats
        const duration = (loading.end - loading.start) / 1000
        const bw = duration > 0 && total > 0
          ? Math.round((total * 8) / duration / 1000)
          : 0
        setStats(prev => ({ ...prev, bandwidth: bw }))
      })

      hlsRef.current = hls
    } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
      videoEl.src = src
    }
  }, [src])

  useEffect(() => {
    const interval = setInterval(() => {
      const video = videoRef.current
      if (!video) return
      const buffered = video.buffered
      if (buffered.length > 0) {
        const bufferEnd = buffered.end(buffered.length - 1)
        setStats(prev => ({
          ...prev,
          bufferLevel: Math.max(0, bufferEnd - video.currentTime),
        }))
      }

      const hls = hlsRef.current
      const details = hls?.latestLevelDetails
      const isLive = !!details?.live
      if (!isLive) {
        setLiveState(prev => (prev.isLive ? { isLive: false, behindLive: 0 } : prev))
        return
      }
      const syncPos = hls.liveSyncPosition
      const behind = Number.isFinite(syncPos)
        ? Math.max(0, syncPos - video.currentTime)
        : 0
      setLiveState({ isLive: true, behindLive: behind })
    }, 1000)

    return () => {
      clearInterval(interval)
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [src])

  const setLevel = useCallback((index) => {
    const hls = hlsRef.current
    if (!hls) return
    hls.currentLevel = index
    setStats(prev => ({ ...prev, selectedLevel: index }))
  }, [])

  const jumpToLive = useCallback(() => {
    const hls = hlsRef.current
    const video = videoRef.current
    if (!hls || !video) return
    const target = hls.liveSyncPosition
    if (Number.isFinite(target)) {
      video.currentTime = target
      video.play().catch(() => {})
    }
  }, [])

  return { attach, stats, liveState, setLevel, jumpToLive }
}
