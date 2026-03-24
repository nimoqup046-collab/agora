# AGORA Deployment Guide (Render)

This guide deploys AGORA to public internet using:
- Render (API + Web)
- Neon (PostgreSQL)
- Upstash (Redis)

## 1) Provision cloud dependencies

1. Create a Neon PostgreSQL database and copy its `DATABASE_URL`.
2. Create an Upstash Redis instance and copy its `REDIS_URL`.
3. Prepare at least one model provider key:
- `OPENROUTER_API_KEY` (recommended)
- or `DEEPSEEK_API_KEY`
- or `ANTHROPIC_API_KEY` + `OPENAI_API_KEY`

## 2) Deploy with Render Blueprint

1. Open Render and create a new **Blueprint** from this repository.
2. Render will detect [`render.yaml`](./render.yaml) and create:
- `agora-api`
- `agora-web`

## 3) Configure `agora-api` environment variables

Set these in Render for the API service:

- `DATABASE_URL` (required)
- `REDIS_URL` (required)
- `OPENROUTER_API_KEY` or `DEEPSEEK_API_KEY` or `ANTHROPIC_API_KEY` + `OPENAI_API_KEY`
- `API_CORS_ORIGINS` (required for browser access)
- `DEFAULT_MODEL_CLAUDE` (optional, default `deepseek-chat`)
- `DEFAULT_MODEL_CODEX` (optional, default `deepseek-chat`)
- `DEFAULT_MODEL_META` (optional, default `deepseek-chat`)

After first deploy, copy your web URL and set:

```bash
API_CORS_ORIGINS=https://<your-web-service>.onrender.com
```

## 4) Configure `agora-web` environment variables

Set this in Render for the web service:

```bash
NEXT_PUBLIC_API_URL=https://<your-api-service>.onrender.com
```

Important: this must point to the public API URL.

## 5) Validate public deployment

1. Open `https://<your-api-service>.onrender.com/health` and confirm `status: ok`.
2. Open `https://<your-web-service>.onrender.com`.
3. Create a session in the GUI.
4. Send a message in Council mode and confirm responses stream in.

## 6) Common issues

- CORS blocked in browser:
  - Ensure `API_CORS_ORIGINS` is set to your exact web origin.
- Web cannot reach API:
  - Ensure `NEXT_PUBLIC_API_URL` points to the API public URL.
- First request is slow:
  - Render free tier can cold start after inactivity.
