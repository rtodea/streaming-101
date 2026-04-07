import { useNavigate } from 'react-router'

export default function QRLanding() {
  const navigate = useNavigate()

  return (
    <div className="page container center" style={{ minHeight: '80vh', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <h1 style={{ fontSize: 'var(--font-size-2xl)', textAlign: 'center' }}>
        Streaming 101
      </h1>
      <p style={{ fontSize: 'var(--font-size-lg)', color: 'var(--color-muted)', textAlign: 'center' }}>
        Welcome to the timjs streaming demo
      </p>
      <button
        onClick={() => navigate('/catalog')}
        style={{
          fontSize: 'var(--font-size-lg)',
          padding: 'var(--space-sm) var(--space-xl)',
          background: 'var(--color-primary)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          cursor: 'pointer',
        }}
      >
        Watch Now
      </button>
    </div>
  )
}
