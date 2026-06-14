reference visual paths:
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-3b901215-5d29-48b6-acf8-3cadbcc36248.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-4d4a5f81-5c92-4da1-821c-e191d04e8210.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-95e8ab91-6be1-4234-82a0-d36bd731e854.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-27468ed5-d25e-41f5-b0e4-047614ad8dbd.png

implementation target: Apple Maps-inspired route-first desktop shell using shadcn/ui components.
viewport target: 1440 x 1024 and narrower desktop widths.
state: default Chinese route planning screen, compact left icon rail, independently open/collapsible route/search panels, OSM map canvas, active route overlay, right map controls, bottom OSM attribution/status.

**Findings**
- No actionable P0/P1/P2 findings remain from static implementation review and production build verification.
- [P3] Full light/dark screenshot capture was not completed in this pass.
  Evidence: Browser could inspect the built app through a temporary in-process static server and confirmed the dark search results card after a real `广州站` query. Browser-side localStorage mutation for forcing a light theme was blocked by the browser runtime, so light mode was verified from CSS coverage and production build output.
  Impact: final light-mode visual polish still benefits from a manual desktop-app pass.
  Follow-up: reopen the local app manually to inspect the search results panel in both `light` and `dark` theme preferences at 1440 x 1024 and a narrower desktop width.

**Required Fidelity Surfaces**
- Layout: implemented a fixed compact left app rail, an adjacent route/search panel, and a full-height central map canvas. The rail collapsed state is separate from panel visibility, so Search, Layers, Route, and Recents can reopen their panels while the rail remains icon-only. The top rail toggle controls rail width only, leaving the active Search/Route panel state unchanged.
- Navigation: primary rail now emphasizes Search, Layers, and Route with Apple Maps-like treatment in both light and dark appearances, active rounded icon buttons, and a functional panel toggle.
- Route panel: route mode uses shadcn ToggleGroup, route points use compact input rows, route options use shadcn Collapsible/Switch, and the route summary/search/results use shadcn Card/Input/Button patterns.
- Search results: search view now uses an Apple Maps-style rounded results card with a featured top result, blue category icon, compact address/distance metadata, clear-query affordance, and `路线` / `详情` actions. The same component has dedicated light and dark surface, text, divider, hover, and action-button styles.
- Map controls: right controls and bottom layer switcher remain compact floating controls over the map; OSM attribution remains visible in the bottom status surface.
- Theme/i18n: default Chinese copy remains in `src/i18n/locales/zh.json`; new visible labels have Chinese and English strings; shadcn dark styling is synchronized through the document `.dark` class. Light mode now uses the pale rail/panel surfaces, white route card, blue active state, and white map controls shown in the latest reference.

**Verification**
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run build` emitted the expected MapLibre large chunk warning; this remains non-blocking under the project guide.
- Browser check: passed for dark search results layout with a real `广州站` query; result card rendered with featured result and `路线` / `详情` actions.
- `cargo check` was not rerun because no Tauri/Rust files changed.

**Follow-up Polish**
- Run a manual visual QA pass in the desktop app or an allowed browser surface.
- If production visual fidelity becomes a priority, replace public raster tiles with a tuned OSM vector style so the map colors can more closely match the Apple Maps dark reference while preserving attribution and service boundaries.

final result: implementation checks passed; automated screenshot blocked by browser policy
