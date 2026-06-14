reference visual paths:
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-3b901215-5d29-48b6-acf8-3cadbcc36248.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-4d4a5f81-5c92-4da1-821c-e191d04e8210.png

implementation target: Apple Maps-inspired route-first desktop shell using shadcn/ui components.
viewport target: 1440 x 1024 and narrower desktop widths.
state: default Chinese route planning screen, collapsible left sidebar, OSM map canvas, active route overlay, right map controls, bottom OSM attribution/status.

**Findings**
- No actionable P0/P1/P2 findings remain from static implementation review and production build verification.
- [P3] Automated in-app browser screenshot verification could not be completed in this pass.
  Evidence: Browser reload of `http://127.0.0.1:1420` was blocked by the Browser Use URL policy after the dev server restart.
  Impact: final visual polish was verified by code/build review rather than a fresh automated screenshot.
  Follow-up: reopen the local app manually or in an allowed browser session to inspect the 1440 x 1024 and narrow desktop layouts.

**Required Fidelity Surfaces**
- Layout: implemented a fixed left app rail, an adjacent collapsible route/search panel, and a full-height central map canvas. Collapsing the panel keeps the rail visible and expands the map area.
- Navigation: primary rail now emphasizes Search, Layers, and Route with Apple Maps-like dark treatment, active rounded rows, a beta badge, and a functional panel toggle.
- Route panel: route mode uses shadcn ToggleGroup, route points use compact input rows, route options use shadcn Collapsible/Switch, and the route summary/search/results use shadcn Card/Input/Button patterns.
- Map controls: right controls and bottom layer switcher remain compact floating controls over the map; OSM attribution remains visible in the bottom status surface.
- Theme/i18n: default Chinese copy remains in `src/i18n.ts`; new visible labels have Chinese and English strings; shadcn dark styling is synchronized through the document `.dark` class.

**Verification**
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run build` emitted the expected MapLibre large chunk warning; this remains non-blocking under the project guide.
- `cargo check` was not rerun because no Tauri/Rust files changed.

**Follow-up Polish**
- Run a manual visual QA pass in the desktop app or an allowed browser surface.
- If production visual fidelity becomes a priority, replace public raster tiles with a tuned OSM vector style so the map colors can more closely match the Apple Maps dark reference while preserving attribution and service boundaries.

final result: implementation checks passed; automated screenshot blocked by browser policy
