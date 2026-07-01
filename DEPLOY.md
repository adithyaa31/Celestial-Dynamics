# Deploy PROJECT HELIOS

This project is ready for:
- Frontend: Vercel
- API: Render
- Database: Render Postgres (or Neon/Supabase)

## 1) Deploy API on Render

1. Push this repository to GitHub.
2. In Render, click **New +** -> **Blueprint**.
3. Select your repository (Render will read `render.yaml`).
4. Set `DATABASE_URL` in Render env vars.
5. Update `CORS_ORIGIN` to your frontend URL after Vercel deploy (example: `https://your-app.vercel.app`).
6. Deploy and copy your API URL (example: `https://helios-api.onrender.com`).

## 2) Deploy Frontend on Vercel

1. In Vercel, click **Add New...** -> **Project**.
2. Import the same GitHub repo.
3. Keep root as repository root.
4. Vercel will use `vercel.json`.
5. Add environment variable:
   - `VITE_API_BASE_URL=https://your-render-api-domain.onrender.com`
6. Deploy.

## 3) Final CORS update

After Vercel gives you your final domain:
- Update Render env var:
  - `CORS_ORIGIN=https://your-vercel-domain.vercel.app`
- Redeploy API service.

## 4) Health checks

- API health: `https://your-render-api-domain.onrender.com/api/healthz`
- Frontend: `https://your-vercel-domain.vercel.app`

