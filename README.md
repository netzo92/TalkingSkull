# TalkingSkull Platform

Talking Skull combines a polished marketing presence with a LiveKit-powered interview portal. The stack ships as a pair of containerized services ready for Google Cloud Run.

## Project structure

- `frontend/` – Vite-powered React client that renders the landing page, feature highlights, and embedded LiveKit portal.
- `backend/` – FastAPI service that issues LiveKit access tokens and orchestrates future interview workflows.
- `gcp/` – Cloud Build configurations for automated container builds and deployments.
- `docs/` – Architecture reference material.
- `AGENTS.md` – Coding guidelines.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Environment variables are managed through Vite. Copy `.env.example` to `.env` and update the `VITE_API_BASE` to point at the backend service.

To build the production bundle locally:

```bash
npm run build
```

### Landing page overview

* `src/App.tsx` structures the hero, feature grid, architecture summary, and interview portal.
* Global styles live in `src/styles.css` and follow a gradient-rich aesthetic tuned for marketing + app-shell hybrids.
* The join form calls `src/api/livekit.ts`, which encapsulates the backend request to mint a LiveKit access token.

## Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Copy `.env.example` to `.env` (or export variables) and provide your LiveKit credentials:

- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`
- `LIVEKIT_HOST`
- `LIVEKIT_TOKEN_TTL` *(optional, defaults to 3600)*
- `CORS_ALLOWED_ORIGINS` *(comma separated list of allowed origins)*

## GCP deployment pipeline

Three Cloud Build definitions are provided:

- `gcp/cloudbuild.yaml` orchestrates a full deployment. It builds and deploys the backend first (including LiveKit configuration), then compiles the frontend bundle, builds the container image, and deploys it with the backend URL injected via `_BACKEND_URL`.
- `gcp/cloudbuild-backend.yaml` builds the backend container, pushes it to Artifact Registry, and deploys to Cloud Run. It expects substitutions for LiveKit credentials and Secret Manager references.
- `gcp/cloudbuild-frontend.yaml` installs dependencies, builds the React bundle, pushes the container, and deploys it to Cloud Run with the backend URL injected via `_BACKEND_URL`.

### Prerequisites

1. Enable the Cloud Build, Artifact Registry, Cloud Run, and Secret Manager APIs.
2. Create an Artifact Registry repository referenced by `$REPO_NAME` in the build configuration.
3. Store `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET` in Secret Manager and update the substitution placeholders.
4. Grant Cloud Build service accounts permissions to access the secrets and deploy to Cloud Run.

### Trigger examples

Create a trigger for the combined pipeline (or one for each service-specific `cloudbuild-*.yaml` file) and set the corresponding substitutions:

- `_BACKEND_URL` – Cloud Run URL for the backend service.
- `_LIVEKIT_HOST` – Public URL of your LiveKit server.
- `_LIVEKIT_TOKEN_TTL` – Optional TTL in seconds.
- `_LIVEKIT_API_KEY` / `_LIVEKIT_API_SECRET` – Secret resource names.

## Architecture reference

A deeper dive into the layering, request flow, and deployment steps is available in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Development tips

- Use `npm run lint` in the frontend to keep TypeScript code tidy.
- When extending the backend, prefer dependency injection patterns via FastAPI and keep LiveKit helpers isolated in `app/livekit.py`.
- Update the AGENTS.md files if you introduce additional conventions.
