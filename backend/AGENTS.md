# Backend Guidelines

- Structure FastAPI applications under `app/` with an `__init__.py` file.
- Use Pydantic models for request and response validation.
- Encapsulate third-party integrations (e.g., LiveKit) in helper modules to keep endpoints clean.
- Prefer environment variable configuration via `pydantic-settings` or utility helpers when complexity grows.
