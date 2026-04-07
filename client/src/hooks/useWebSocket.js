import { useState, useEffect, useRef, useCallback } from 'react'

const WS_URL = `ws://${window.location.host}/ws`
const RECONNECT_DELAY = 2000

export default function useWebSocket() {
  const [state, setState] = useState('disconnected')
  const wsRef = useRef(null)
  const handlersRef = useRef(new Map())
  const reconnectTimer = useRef(null)

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(WS_URL)
    wsRef.current = ws

    ws.onopen = () => setState('connected')

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        try {
          const msg = JSON.parse(event.data)
          const handler = handlersRef.current.get(msg.type)
          if (handler) handler(msg)
        } catch { /* ignore non-JSON */ }
      }
    }

    ws.onclose = () => {
      setState('disconnected')
      reconnectTimer.current = setTimeout(connect, RECONNECT_DELAY)
    }

    ws.onerror = () => ws.close()
  }, [])

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimer.current)
    wsRef.current?.close()
    wsRef.current = null
    setState('disconnected')
  }, [])

  const sendJson = useCallback((message) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
    }
  }, [])

  const sendBinary = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(data)
    }
  }, [])

  const on = useCallback((type, handler) => {
    handlersRef.current.set(type, handler)
    return () => handlersRef.current.delete(type)
  }, [])

  useEffect(() => {
    return () => {
      clearTimeout(reconnectTimer.current)
      wsRef.current?.close()
    }
  }, [])

  return { state, connect, disconnect, sendJson, sendBinary, on }
}
