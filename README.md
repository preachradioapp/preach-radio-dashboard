# Preach Radio — Admin Dashboard

React 18 + Vite admin console for Preach Radio: users and creators, podcasts, reels, albums, categories, banners, the station profile, live broadcasting, and CMS pages (terms, privacy, about, FAQ, support contact).

## Getting started

```bash
npm ci
cp .env.example .env.local   # optional — defaults point at production
npm run dev                  # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (must pass with 0 problems) |
| `npm test` | Vitest unit + component + API-layer tests |

### Environment

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `https://api.preachradio.com` | Backend base URL |
| `VITE_GOOGLE_MAPS_API_KEY` | — | Places autocomplete for location fields (manual entry without it) |

## Architecture

```
src/
  api/          RTK Query slices, one per domain (auth, people, catalog, media, admin)
  store/        Redux store (only `auth` is persisted) + auth slice
  routes/       Router (all pages lazy-loaded), auth guards, legacy URL redirects
  layout/       App shell: sidebar, topbar, navigation config (single source of truth)
  components/
    ui/         Design-system primitives: PageHeader, Surface, DataTable, FormModal,
                ImageUpload, IconAction, StatusBadge, UserCell, StatCard, States
  hooks/        useListParams (paging/search/filters), useAction (mutation + toast),
                useS3Upload (presigned upload with progress), useCategoryOptions, …
  lib/          Pure helpers: formatting, FormData/query builders, errors, validation
  pages/        Feature pages grouped by area (auth, dashboard, people, catalog, media, system, public)
  theme/        antd theme tokens (mirrored in tailwind.config.cjs)
```

### Conventions

- **Data fetching** goes through RTK Query. Every list endpoint `providesTags` per item + `LIST`; mutations invalidate exactly what they change. Never call `refetch()` after a mutation.
- **Mutations** are run through `useAction()`, which unwraps the result, shows the server message as a toast and returns `null` on failure.
- **Lists** use `useListParams()` — debounced search, filters and pagination that reset to page 1 — and `<DataTable>`, which renders loading, error (with retry) and empty states.
- **Forms** in modals use `<FormModal>`; it creates a fresh form per open, so create/edit never leak values.
- **Uploads**: multipart endpoints take a `data` JSON field plus file fields — build them with `buildFormData(data, files)`. Only new `File`s are sent; existing image URLs are left alone. Podcast media goes directly to S3 via `useS3Upload()`.
- **Auth**: the token is sent as `Authorization: Bearer …`. A `401` ends the session; a `403` does not.

### Notes on backend data

- Podcast `duration` is stored in the legacy *minutes.seconds* format (4m 07s → `4.07`). Use `toStoredDuration()` / `storedDurationLabel()`; don't write raw seconds.
- Creator-owned podcasts can only be edited by their creator; the dashboard manages station podcasts.
- Rejecting a creator application permanently deletes that account (backend behaviour).

## Deployment

Pushing to `main` builds and deploys `dist/` to EC2 via `.github/workflows/deploy.yml`.
