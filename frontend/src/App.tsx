import { FormEvent, useCallback, useMemo, useState } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { requestJoinToken, TokenResponse } from './api/livekit';

const defaultRoom = 'talking-skull';

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

  const title = useMemo(() => (session ? `Room: ${room}` : 'Join a LiveKit Room'), [room, session]);

  return (
    <main>
      <header>
        <h1>{title}</h1>
        <p>Connect your browser to a LiveKit room using the TalkingSkull backend.</p>
      </header>

      {!session && (
        <form onSubmit={handleJoin}>
          <label htmlFor="identity">
            Display name
            <input
              id="identity"
              name="identity"
              value={identity}
              onChange={(event) => setIdentity(event.target.value)}
              placeholder="Ada Lovelace"
              required
            />
          </label>

          <label htmlFor="room">
            Room
            <input
              id="room"
              name="room"
              value={room}
              onChange={(event) => setRoom(event.target.value)}
              placeholder="talking-skull"
              required
            />
          </label>

          {error && <span className="error">{error}</span>}

          <button type="submit" disabled={!canJoin || loading}>
            {loading ? 'Connecting…' : 'Join room'}
          </button>
        </form>
      )}

      {session && (
        <section>
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
        </section>
      )}
    </main>
  );
};

export default App;
