# NavMap Agent Guide

This guide is for coding agents working in this repository. Keep changes small, verified, and aligned with the existing route-first desktop map product.

## Product Intent

NavMap is a professional, clean Tauri desktop navigation app built with Vite, React, TypeScript, MapLibre GL, and OpenStreetMap ecosystem services.

The v1 product shape is:

- Left app rail.
- Route-first planning panel.
- Large central map canvas.
- Top search command.
- Right-side map controls.
- Bottom status, scale, coordinates, and OSM attribution.

Do not turn this into a landing page, marketing site, generic dashboard, or GIS admin console unless explicitly requested.

## Commands

Use these checks before committing meaningful changes:

```powershell
npm run typecheck
npm run build
cd src-tauri
cargo check
```

Use these for local development:

```powershell
npm run dev
npm run tauri dev
```

Notes:

- `npm run build` may warn about large chunks because MapLibre is heavy. Treat that as non-blocking unless the task is bundle optimization.
- `cargo check` may warn on Windows about finalizing incremental compilation directories. Treat that as non-blocking when the command still finishes successfully.

## Commit Policy

Use Conventional Commits and keep commits small:

- `chore: ...` for scaffolding, config, dependency, icon, and verification work.
- `feat: ...` for user-visible map, search, route, and desktop capabilities.
- `fix: ...` for bugs and behavior corrections.
- `docs: ...` for documentation-only changes.
- `test: ...` for test or verification additions.

Avoid large mixed commits. Prefer one behavior or subsystem per commit.

## Documentation Updates

When a change affects setup, commands, architecture, OSM service behavior, verification workflow, or agent operating rules, update the relevant documentation in the same small commit or a nearby `docs:` commit.

Keep `README.md` user-facing and `AGENTS.md` agent-facing. Update `design-qa.md` when visual implementation changes materially.

## Architecture Notes

Frontend ownership:

- `src/App.tsx`: top-level state composition and feature orchestration.
- `src/components/AppRail.tsx`: primary navigation rail.
- `src/components/RoutePanel.tsx`: route planning, search list, place details, route state UI.
- `src/components/MapCanvas.tsx`: MapLibre map lifecycle, markers, route layers, projected route overlay, map controls.
- `src/services/geocoding.ts`: Nominatim search and cache.
- `src/services/routing.ts`: OSRM route requests and step mapping.
- `src/services/location.ts`: browser/system geolocation wrapper.
- `src/services/settings.ts`: Tauri settings commands with browser fallback.
- `src/config/mapServices.ts`: OSM service endpoints and map style.

Tauri ownership:

- `src-tauri/src/lib.rs`: Tauri commands and app builder.
- `src-tauri/capabilities/default.json`: permissions.
- `src-tauri/tauri.conf.json`: window and build configuration.
- `src-tauri/icons/`: generated app icon assets.

## OSM And Service Rules

Respect the current OSM usage boundaries:

- Nominatim requests must be user-triggered. Do not add automatic request-on-every-keystroke autocomplete.
- Keep search caching in place or replace it with an equally conservative strategy.
- Do not add batch geocoding, bulk reverse geocoding, tile scraping, tile prefetching, or offline tile downloads without a new service design.
- Keep OSM attribution visible.
- Keep Nominatim, OSRM, and tile URLs centralized in `src/config/mapServices.ts`.
- Treat public OSRM as a demo/light-use endpoint. For production plans, add a configurable backend or self-hosted route service.

## UI And Design Rules

Preserve the selected route-first concept:

- Keep the map as the primary canvas, not inside a card.
- Keep route planning prominent in the left panel.
- Keep controls compact, readable, and suitable for repeated desktop use.
- Avoid nested cards and decorative visual filler.
- Do not remove the projected route overlay unless the MapLibre layer ordering is proven reliable across raster/vector styles.
- If changing layout, verify at least 1440 x 1024 and a narrower desktop width.

## Verification Expectations

For UI or behavior changes:

- Run `npm run typecheck`.
- Run `npm run build`.
- If Tauri or Rust files changed, run `cargo check` in `src-tauri`.
- For visual changes, capture or inspect the app at 1440 x 1024 and update `design-qa.md` when the implementation materially changes.
- If browser automation cannot access Nominatim/OSRM due to local network policy, verify the UI error state and state the limitation.

## Generated And Ignored Files

- `dist/`, `node_modules/`, and `src-tauri/target/` are ignored.
- `navmap-desktop.png` is an ignored local QA screenshot.
- Do not commit temporary screenshots unless the task explicitly asks for persistent visual evidence.
- Keep `Cargo.lock` and `package-lock.json` committed for reproducible app builds.

## Safety

- Do not rewrite git history.
- Do not run destructive git commands.
- Do not remove user changes you did not make.
- Do not run dependency upgrades or `npm audit fix --force` unless explicitly requested.
