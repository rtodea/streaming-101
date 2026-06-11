import { useNavigate } from 'react-router'

export default function QRLanding() {
  const navigate = useNavigate()

  return (
    <div
      className="page container center"
      style={{ minHeight: '80vh', flexDirection: 'column', gap: 'var(--space-lg)' }}
    >
      <h1
        style={{
          fontSize: 'var(--font-size-hero-fluid)',
          fontWeight: 'var(--font-weight-bold)',
          lineHeight: 'var(--line-height-tight)',
          textAlign: 'center',
        }}
      >
        Streaming 101
      </h1>
      <p
        style={{
          fontSize: 'var(--font-size-lg)',
          color: 'var(--color-muted)',
          textAlign: 'center',
        }}
      >
        Welcome to the timjs streaming demo
      </p>
      <button
        className="btn btn--primary"
        onClick={() => navigate('/catalog')}
        style={{ fontSize: 'var(--font-size-lg)', padding: 'var(--space-sm) var(--space-xl)' }}
      >
        View Videos
      </button>
      <div
        style={{
          marginTop: 'var(--space-xl)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-sm)',
        }}
      >
        <p
          style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-muted)',
            textAlign: 'center',
          }}
        >
          Presented at the TimJS meetup — the Timișoara JavaScript community
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-sm)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a
            className="btn btn--ghost"
            href="https://timjs.ro/meetups/past/345966f9-4e41-4977-a109-32f5c25a12e0/"
            target="_blank"
            rel="noreferrer"
          >
            Meetup page ↗
          </a>
          {/* Plain anchor on purpose: /slides/ is served by the backend, not a SPA route */}
          <a className="btn btn--ghost" href="/slides/">
            Slides
          </a>
        </div>
      </div>
    </div>
  )
}
