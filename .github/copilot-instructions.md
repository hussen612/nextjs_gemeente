# Copilot Instructions for nextjs_gemeente

Concise, project-specific guidance for AI coding agents. Prefer existing patterns over generic advice.

## Big picture

- Product: “Gemeente Meldpunt” – citizens report issues. Stack: Next.js App Router (my-app/) + Convex (convex/) + Clerk auth + Google Maps.
- Flow: Client calls Convex functions via React hooks; Clerk provides identity; alerts stored in Convex (`alerts` table) and shown on a map.
- Routing: pages under `my-app/src/app/**` (e.g., `/`, `/about`, `/dashboard`, `/submit-alert`).

## Key files

- Backend
  - `convex/schema.ts`: `alerts` table with fields: type, description, location, userId, timestamp, status, lat?, lng? (index: by_userId).
  - `convex/alerts.ts`: `createAlert(...)` (insert) and `getAlerts()` (sorted desc list).
  - `convex/auth.config.js`: Convex auth provider (Clerk).
- Frontend
  - `my-app/src/app/providers.tsx`: wraps with `ClerkProvider` and `ConvexProviderWithClerk` using `NEXT_PUBLIC_CONVEX_URL`.
  - `my-app/src/middleware.ts`: `clerkMiddleware` route protection via matcher.
  - `my-app/src/components/MapWithAlerts.jsx`: `useQuery(api.alerts.getAlerts)` and render markers; falls back to parsing `location` as "lat,lng" if no `lat/lng`.
  - `my-app/src/app/(pages)/dashboard|submit-alert/page.tsx`: Google Places Autocomplete + draggable marker; calls `api.alerts.createAlert`.

## Env vars (required)

- `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
- `CLERK_FRONTEND_API_URL`; typical Clerk Next.js: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`.

## Run/build

- From `my-app/`: `npm run dev | build | start`. Frontend expects a reachable Convex URL in env.
- Convex client code is in `convex/_generated/*` (imported as `api`). After schema/function changes, regenerate with Convex tooling so `api` stays in sync.

## Patterns to follow

- Convex hooks: `const list = useQuery(api.alerts.getAlerts) || []`; `const create = useMutation(api.alerts.createAlert)`.
- Auth gating: use `useUser()` to block unauthenticated actions; route-level protection via middleware. For server-side protection, enable identity checks in Convex resolvers (currently commented in `createAlert`).
- Maps: load via `useLoadScript({ googleMapsApiKey, libraries:['places'] })`. Prefer persisting numeric `lat/lng`; string "lat,lng" parsing is only a fallback.
- Client components: mark `'use client'` when using hooks, Clerk, or Maps.

## Safe changes

- Adding fields to `alerts`: update `schema.ts` + `alerts.ts` + affected UI; regenerate Convex client.
- Persist coordinates on submit: pass `lat/lng` into `createAlert` and store them (both submit pages already track marker position).
- Lock down privileged mutations by checking identity in Convex resolvers.

## Pitfalls

- Missing env vars → Maps fail or Convex client cannot connect.
- Forgetting `'use client'` on hook-using pages/components.
- Using stale `convex/_generated` after backend changes.

## Pointers

- Data + server functions: `convex/schema.ts`, `convex/alerts.ts`.
- Providers/auth/integration: `my-app/src/app/providers.tsx`, `my-app/src/middleware.ts`.
- End-to-end alert flow: `my-app/src/app/submit-alert/page.tsx`, `my-app/src/components/MapWithAlerts.jsx`.

Questions or missing details (e.g., Convex dev command, deployment process)? Tell us and we’ll refine this file.
