import { FormEvent, useCallback, useMemo, useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { requestJoinToken, TokenResponse } from './api/livekit';

const defaultRoom = 'talking-skull';

const featureHighlights: Array<{ title: string; description: string }> = [
  {
    title: 'AI-facilitated conversations',
    description:
      'Pair candidates with Talking Skull\'s conversational AI to simulate high-signal, real-world technical interviews.',
  },
  {
    title: 'LiveKit video routing',
    description:
      'Low-latency audio/video powered by LiveKit keeps interviews responsive, even when participants join from different regions.',
  },
  {
    title: 'Insightful analytics',
    description:
      'Capture transcripts and scoring signals from every session, streamed back to the dashboard for hiring teams.',
  },
];

const architectureLayers: Array<{ name: string; summary: string; details: string[] }> = [
  {
    name: 'Experience layer',
    summary: 'React + Vite frontend deployed to Cloud Run.',
    details: [
      'Hero-driven marketing site introduces the platform and captures interview traffic.',
      'LiveKit portal embeds the interview experience without leaving the landing page.',
      'Typed API client keeps LiveKit token exchanges isolated in `src/api` utilities.',
    ],
  },
  {
    name: 'Application layer',
    summary: 'FastAPI backend acting as the orchestrator.',
    details: [
      'Issues signed access tokens for the requested LiveKit room/identity pair.',
      'Provides REST endpoints for scheduling, transcripts, and analytics extensions.',
      'Encapsulates LiveKit SDK usage inside dedicated helper modules for easy testing.',
    ],
  },
  {
    name: 'Infrastructure layer',
    summary: 'Cloud-first delivery pipeline.',
    details: [
      'Google Cloud Build definitions for backend, frontend, and full-stack promotions.',
      'Artifact Registry stores versioned container images for deterministic rollouts.',
      'Cloud Run hosts stateless services with environment-driven configuration.',
    ],
  },
];

const App = () => {
  const [identity, setIdentity] = useState('');
  const [room, setRoom] = useState(defaultRoom);
  const [session, setSession] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canJoin = identity.trim().length > 0 && room.trim().length > 0;

  const handleJoin = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canJoin) {
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const payload = await requestJoinToken({ identity: identity.trim(), room: room.trim() });
        setSession(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected error';
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [canJoin, identity, room]
  );

  const handleLeave = useCallback(() => {
    setSession(null);
  }, []);

  const title = useMemo(
    () => (session ? `Interview room: ${room}` : 'Interview from anywhere with Talking Skull'),
    [room, session]
  );

  return (
    <div className="page">
      <header className="hero">
        <nav className="nav">
          <span className="brand">Talking Skull</span>
          <a className="nav-link" href="#portal">
            Launch interview portal
          </a>
        </nav>

        <div className="hero-content">
          <h1>{title}</h1>
          <p>
            Talking Skull pairs conversational AI with the reliability of LiveKit, giving teams a modern platform for technical
            interviewing, candidate feedback, and hiring analytics.
          </p>
          <div className="hero-actions">
            <a className="cta" href="#portal">
              Start an interview
            </a>
            <a className="secondary-cta" href="#architecture">
              Explore the architecture
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="features" aria-labelledby="features-title">
          <h2 id="features-title">Why teams choose Talking Skull</h2>
          <div className="feature-grid">
            {featureHighlights.map((feature) => (
              <article key={feature.title} className="feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="architecture" className="architecture" aria-labelledby="architecture-title">
          <div className="section-heading">
            <h2 id="architecture-title">Platform architecture</h2>
            <p>
              Each layer is designed to be independently deployable while sharing a common CI/CD foundation. The result is a
              platform that scales with your hiring pipeline.
            </p>
          </div>
          <div className="architecture-grid">
            {architectureLayers.map((layer) => (
              <article key={layer.name} className="architecture-card">
                <h3>{layer.name}</h3>
                <p className="summary">{layer.summary}</p>
                <ul>
                  {layer.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="portal" className="portal" aria-labelledby="portal-title">
          <div className="section-heading">
            <h2 id="portal-title">LiveKit interview portal</h2>
            <p>
              Authenticate with your preferred room name and display identity to jump straight into a LiveKit-powered session. The
              backend mints a scoped token on demand to keep interviews secure.
            </p>
          </div>

          {!session && (
            <form className="join-form" onSubmit={handleJoin}>
              <div className="form-row">
                <label htmlFor="identity">Display name</label>
                <input
                  id="identity"
                  name="identity"
                  value={identity}
                  onChange={(event) => setIdentity(event.target.value)}
                  placeholder="Ada Lovelace"
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="room">Room</label>
                <input
                  id="room"
                  name="room"
                  value={room}
                  onChange={(event) => setRoom(event.target.value)}
                  placeholder="talking-skull"
                  required
                />
              </div>

              {error && <span className="error">{error}</span>}

              <button type="submit" disabled={!canJoin || loading}>
                {loading ? 'Connecting…' : 'Join interview room'}
              </button>
            </form>
          )}

          {session && (
            <div className="livekit-shell">
              <div className="livekit-container">
                <LiveKitRoom
                  serverUrl={session.url}
                  token={session.token}
                  connect
                  onDisconnected={handleLeave}
                  data-lk-theme="default"
                >
                  <VideoConference />
                </LiveKitRoom>
              </div>
              <div className="actions">
                <button type="button" onClick={handleLeave}>
                  Leave room
                </button>
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>Talking Skull</strong>
          <p>Purpose-built for equitable, AI-assisted technical interviews.</p>
        </div>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#architecture">Architecture</a>
          <a href="#portal">Interview portal</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
