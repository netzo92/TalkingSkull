# Talking Skull Architecture

Talking Skull pairs an immersive interview experience with cloud-native delivery. The system is organized into three cohesive layers that map to the product journey from marketing touchpoint through live interview execution.

## 1. Experience layer (frontend)

* **Tech stack:** React 18 + TypeScript (Vite) styled with a lightweight design system defined in `src/styles.css`.
* **Landing page:** `src/App.tsx` renders the marketing hero, feature highlights, and embedded LiveKit portal. Navigation links are anchor-based to keep the page static and responsive.
* **Interview portal:** The `LiveKitRoom` component from `@livekit/components-react` connects when a visitor submits the join form. Token retrieval is abstracted through the typed API helper `src/api/livekit.ts`.
* **Build & delivery:** The frontend is containerized (see `frontend/Dockerfile`) and deployed to Cloud Run via `gcp/cloudbuild-frontend.yaml` or the combined pipeline.

## 2. Application layer (backend)

* **Framework:** FastAPI service located in `backend/app`. Entrypoint is `app/main.py`.
* **Responsibilities:**
  * Issue scoped LiveKit access tokens using the credentials supplied through environment variables.
  * Provide REST endpoints for future interview scheduling, transcript retrieval, and analytics enrichment.
  * Encapsulate LiveKit SDK integrations inside helper modules (e.g., `app/livekit.py`) for testability.
* **Configuration:** Environment variables are loaded via `.env`/Secret Manager. CORS rules are configurable to allow the Cloud Run frontend origin.

## 3. Infrastructure layer (delivery pipeline)

* **Container builds:** Dockerfiles for frontend and backend produce minimal images ready for Cloud Run.
* **Pipelines:** Cloud Build manifests (`gcp/cloudbuild*.yaml`) coordinate installing dependencies, running tests, building containers, and deploying to Cloud Run.
* **Artifact storage:** Images are published to Artifact Registry; build substitutions control project, region, and repository naming.
* **Secrets:** LiveKit API keys are stored in Secret Manager and injected at build or runtime.

## Request flow

1. A candidate opens the landing page and is greeted by the hero section describing the platform.
2. When the candidate submits the join form, the frontend calls the backend `/token` endpoint via `requestJoinToken`.
3. FastAPI validates the payload, signs a LiveKit access token, and returns the token plus server URL.
4. The frontend hands the token to `LiveKitRoom`, establishing a WebRTC session between participants.
5. After the session ends, the user can leave the room, and the page resets to the join form state.

## Deployment flow

1. Push to main triggers the combined `gcp/cloudbuild.yaml` pipeline.
2. Pipeline builds and deploys the backend, ensuring LiveKit credentials are available.
3. Once the backend URL is known, the frontend build injects it via `_BACKEND_URL` and deploys the marketing + portal experience.
4. Cloud Run revisions are traffic-managed for zero-downtime rollouts.

## Extensibility roadmap

* **Interview analytics:** Extend the backend with endpoints for transcript ingestion and scoring metrics. Surface the insights in future dashboard routes.
* **Scheduling & invites:** Add calendar integrations and secure magic links that pre-fill room + identity tokens.
* **Role-based access:** Use a lightweight identity provider to differentiate interviewer vs. candidate experiences while reusing the LiveKit portal shell.
