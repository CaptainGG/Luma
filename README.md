# Luma

Luma is a portfolio-quality smart indoor environment companion designed to feel like a believable product prototype rather than a disconnected UI exercise. It combines simulated room sensors, a calm multi-room dashboard, grounded alerting, derived comfort scoring, and a thin insight system into a polished full-stack demo that shows both product thinking and implementation depth.

## Why I Built This

I built Luma to explore a type of product that sits between consumer wellness software and smart-home infrastructure. The goal was not to recreate an enterprise IoT platform. The goal was to design and implement something focused, coherent, and demoable: a product that feels like it could exist, with enough systems thinking behind it to hold up as a portfolio piece.

That meant making a few deliberate choices early. I wanted the project to show that I can shape scope, design a clean backend boundary, simulate realistic data, and build a UI that feels intentional instead of defaulting to generic dashboard patterns. I also wanted the project to be easy to run locally, which is why the current version uses an in-memory runtime data layer instead of requiring a full database just to evaluate the app.

## What the Product Does

The experience starts on a simple landing page that explains the product and invites the user into the demo. From there, the app supports a small but complete product loop that someone can actually follow.

- The user can enter the demo immediately from the landing page.
- A short onboarding flow lets the user name a space, choose room types, pair mock devices, and land on the dashboard.
- The dashboard gives a live multi-room snapshot of current conditions, device health, active alerts, and recent insights.
- A room detail page drills into one room with a fixed set of four charts, recent alerts, event markers, and presentation-ready room insights.
- The settings screen allows threshold and preference updates without introducing unnecessary account or team complexity.

From a portfolio perspective, this matters because the product is not just "pages." Each screen connects to a real data flow: simulated readings, derived comfort scoring, alert evaluation, and insight generation all feed what the user sees.

## MVP Scope

The MVP is intentionally tight. It includes enough functionality to demonstrate product quality and full-stack thinking without drifting into infrastructure-heavy territory.

Included in this version:

- A polished landing page and demo entry point
- A minimal four-step onboarding flow
- A multi-room dashboard with live-ish refresh behavior
- A room detail page with exactly four charts
- A settings page for summary preferences and threshold tuning
- A seeded seven-day history plus runtime reading generation
- Alerts based on actual thresholds and readings
- Deterministic findings rendered as product-style insight copy

Intentionally excluded from this version:

- Real hardware integration
- Production authentication
- Multi-user collaboration
- Push notifications and messaging systems
- Multi-space management
- WebSocket infrastructure
- Firmware simulation
- Advanced analytics exports

Those exclusions are part of the product strategy, not missing polish. Keeping the MVP narrow made it possible to spend time on clarity, UX, and believable behavior instead of scattering effort across too many half-finished systems.

## Tech Stack

Luma is built with a stack chosen for clarity and speed of iteration rather than novelty.

- `Next.js App Router` powers both the frontend and the route-handler API layer, which keeps the product full-stack without splitting the codebase across multiple services.
- `TypeScript` keeps the data contracts between UI, services, and API routes explicit and safer to evolve.
- `Tailwind CSS` supports the calm editorial UI direction while keeping styling close to component intent.
- `shadcn-style UI primitives` under `src/components/ui` provide a lightweight component foundation without forcing the app into a generic visual identity.
- `Recharts` is used for the room-detail visualizations because it is expressive enough for the MVP while staying lightweight.
- `Zod` validates request payloads and query parameters at the API edge.
- `Prisma` is still present in the repo as part of the longer-term architecture, but the current local runtime uses an in-memory fake store so the project is frictionless to run.
- `date-fns`, `lucide-react`, and small utility libraries support formatting, time handling, and visual polish without pulling in heavy abstractions.

## Architecture Overview

The architecture is intentionally layered so the product remains easy to reason about as it grows.

- `src/app/api` handles HTTP transport, request validation, and response formatting only.
- `src/server/services` contains orchestration and business logic such as simulation refresh, alert reconciliation, settings updates, and insight assembly.
- `src/server/queries` contains reusable read operations over the underlying data source.
- `src/server/store` owns the current in-memory fake runtime state and the mutation helpers that support onboarding, settings, alerts, and simulation.
- `src/lib` contains pure utilities, formatting helpers, shared domain types, constants, scoring helpers, and validation schemas.

This separation matters because it prevents UI code from becoming data-access code. React components never reach into storage directly. Route handlers call services, services call queries and utilities, and the data source stays behind those boundaries.

## Core Product Flows

### Landing and Demo Entry

The landing page is intentionally simple. It frames the product, communicates the mood of the interface, and offers two clear paths: jump into the dashboard or walk through onboarding. The point of this screen is not marketing in the startup sense. It is to make the prototype feel like a coherent product from the first moment.

### Onboarding

The onboarding flow is minimal by design. The user names a space, chooses room types, pairs mock devices, and then lands on the dashboard. That gives enough setup context to make the rest of the app feel personalized, while staying fast enough for a portfolio reviewer to complete in one sitting without friction.

Behind the scenes, onboarding mutates the in-memory store for the current session. Rooms are created or replaced, devices are paired, and the data model is reset into a believable state for the selected room mix.

### Dashboard Refresh Behavior

The dashboard is the operational center of the product. It summarizes room conditions, comfort score, device state, alerts, and recent insights. The page uses lightweight polling rather than WebSockets because the goal is to create believable movement in the interface without adding real-time infrastructure complexity.

Each dashboard refresh can trigger a simulation step, which appends fresh readings, updates battery and sync state, and recalculates downstream alert and insight context.

### Room Detail Charts and Event Markers

The room detail page deliberately avoids endless visualization sprawl. It has exactly four charts:

- Temperature + Humidity
- CO2
- Light + Noise
- Comfort Score Over Time

This fixed scope makes the page easier to understand and keeps the MVP focused. Event markers provide narrative context by surfacing anomalies, alerts, and findings in the same time window rather than forcing the user to interpret raw charts alone.

### Settings Updates

The settings experience supports practical product adjustments: summary preferences and room thresholds. It is not trying to be a full administration surface. The user can meaningfully change the behavior of the demo without needing account systems, team permissions, or notification setup.

## Data Model

The data model is small, but each entity exists for a product reason.

- `User` represents the owner of the demo environment and provides a foundation for preferences.
- `Space` is the top-level container for a single indoor environment such as a home or studio.
- `Room` stores room identity, room type, and threshold preferences that shape scoring and alerts.
- `Device` represents the paired monitor for a room and carries status signals such as battery, sync freshness, and connection state.
- `SensorReading` is the time-series backbone of the app. Everything from charts to alerts to insights is grounded in these readings.
- `Alert` represents a threshold breach or issue that should be visible to the user.
- `Insight` stores a product-facing interpretation of a meaningful pattern found in the readings.
- `UserPreference` contains summary cadence and dashboard-related preferences so the app can feel personalized without adding heavy settings complexity.

## Simulation Strategy

The simulation strategy was chosen to make the app believable without introducing background workers, live devices, or scheduling infrastructure.

The system works in two stages:

1. Seed historical data

Each room starts with a realistic seven-day history of readings. This gives the dashboard, charts, alerts, and insights enough material to feel alive immediately instead of starting from an empty product shell.

2. Generate runtime updates on demand

When the dashboard or room detail page polls for fresh data, the app generates a new reading if enough simulated time has passed. That reading applies gradual drift, room-type-specific behavior, and occasional anomalies. The same pass also updates battery level and last-sync timestamps.

This approach keeps the demo simple to run, fast to review, and realistic enough to tell a convincing product story.

## Alerts and Comfort Scoring

Alerts are generated by evaluating the latest readings against room thresholds for metrics such as CO2, humidity, and noise. Rather than inventing arbitrary badges, the app ties those alerts to real metric values so the user can understand why a room is in warning state.

Comfort scoring is derived rather than stored as a raw field on each reading. That was a deliberate design choice. The score is a product-level interpretation of the sensor data, not a primary measurement. By deriving it from readings and thresholds, the score stays explainable, consistent, and easy to recalculate if the underlying model changes.

## Insight System

The insight system is intentionally split into two layers so the product can feel smart without becoming opaque.

The first layer is the finding layer. This is deterministic analysis over stored readings. It looks for patterns that matter from a product perspective, such as recurring CO2 spikes, abnormal humidity behavior, comfort score degradation, or unusual noise conditions.

The second layer is the presentation layer. It takes those findings and turns them into concise, user-facing product copy. Right now, the phrasing is deterministic so the app stays reliable and easy to run. The architecture leaves room for an optional LLM adapter later, but that future layer is additive rather than foundational.

Example:

- finding: `co2_high_recurring_afternoon`
- evidence: `5 of recent afternoon samples exceeded the CO2 threshold between 14:00-16:00`
- display text: `Air quality tends to drop in the afternoon.`

That separation matters because it keeps the insight engine grounded. The product can evolve toward richer phrasing later without losing trust in the evidence behind each insight.

## Running the Project Locally

The current local workflow is intentionally simple and does not require PostgreSQL.

1. Install dependencies

```bash
npm install
```

2. Start the development server

```bash
npm run dev
```

3. Open the app in the browser

```text
http://localhost:3000
```

4. Explore the main flows

- Start on the landing page
- Enter the demo or run onboarding
- Open the dashboard and room detail pages
- Change preferences in settings

Important behavior to know:

- The fake in-memory store is seeded automatically when the server starts.
- Onboarding and settings mutate that in-memory state during the current session.
- Restarting the server resets the app back to the seeded demo baseline.
- `.env`, Prisma migrations, and `db:seed` are not required for the current fake-data workflow.

If you want a more stable local runtime after building the app, you can also run:

```bash
npm run build
npm run start
```

## Scripts

- `npm run dev`
  Starts the Next.js development server for everyday local iteration.
- `npm run build`
  Builds the production bundle and is the quickest way to confirm the app is deployment-ready.
- `npm run start`
  Runs the built production app locally, which is useful when you want to verify stable runtime behavior outside the dev server.
- `npm run lint`
  Runs ESLint across the project and helps catch regressions before publishing.
- `npm run db:generate`
  Generates the Prisma client for future database-backed work.
- `npm run db:migrate`
  Remains available for a future PostgreSQL-backed version of Luma.
- `npm run db:seed`
  Remains available for future Prisma/PostgreSQL reactivation.

## Design and UX Decisions

Visually, Luma is meant to feel calm, premium, and a little more editorial than operational. I wanted the interface to suggest a thoughtful consumer-facing product, not an internal admin dashboard full of dense chrome and generic widgets.

That led to a few specific decisions:

- A restrained color system with soft surfaces and warmer neutrals
- Rounded, spacious layouts instead of compact enterprise density
- Fixed chart scope so the room page stays focused
- Clear empty, loading, and error states so the prototype feels complete
- Mobile-aware layouts so the app still reads clearly on narrower screens

The overall goal was to make the UI feel intentional and readable while still supporting real application behavior.

## Tradeoffs and Simplifications

This project is full of deliberate tradeoffs.

- The app uses a fake in-memory runtime store today because portfolio reviewers should be able to run it immediately.
- The product uses polling instead of WebSockets because the interaction needs believable updates, not infrastructure theater.
- The MVP supports one primary space and one device per room because that is enough to validate the concept.
- The current insight layer is deterministic because grounded product behavior matters more than flashy AI copy.
- Production auth, collaboration, notifications, and exports were excluded so the product could stay polished where it matters most.

These simplifications are part of the architecture strategy, not shortcuts hidden behind the UI.

## What I Would Build Next

If I continued this project, the next steps would be practical extensions of the current architecture rather than a full rewrite.

- Reactivate PostgreSQL with Prisma as the live runtime store
- Add a thin optional LLM phrasing adapter on top of the deterministic insight system
- Introduce richer visual assets such as polished screenshots or demo GIFs
- Add historical summaries and richer comfort trend comparisons
- Expand device realism without drifting into unnecessary firmware simulation
- Add a lightweight authentication path once the single-user demo story is no longer the main priority

## Visual Walkthrough

This README is intentionally text-first for now. I wanted the portfolio story, product decisions, and architecture to stand on their own before relying on screenshots.

The next documentation pass can add screenshots or short GIFs for:

- the landing page
- the dashboard
- the onboarding flow
- the room detail page
- the settings experience
