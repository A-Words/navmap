reference visual paths:
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-3b901215-5d29-48b6-acf8-3cadbcc36248.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-4d4a5f81-5c92-4da1-821c-e191d04e8210.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-95e8ab91-6be1-4234-82a0-d36bd731e854.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-27468ed5-d25e-41f5-b0e4-047614ad8dbd.png
- C:\Users\A_Words\AppData\Local\Temp\codex-clipboard-5b11bc92-6f67-471a-8cb4-088994d75b6b.png

implementation target: Apple Maps-inspired route-first desktop shell using shadcn/ui components.
live reference: Browser visited `https://maps.apple.com.cn/search?query=%E5%B9%BF%E5%B7%9E%E7%AB%99` for the current Apple Maps search UI.
live spacing reference: Browser visited `https://maps.apple.com.cn/search?query=%E5%B9%BF%E5%B7%9E%E5%A1%94%E5%85%A5%E5%8F%A3`; the relevant Apple Maps screenshot represents the input/editing state before pressing Enter, where the instant results panel sits directly under the search field.
search behavior reference: Apple Maps has separate input/editing suggestions and submitted search results states; NavMap intentionally uses the submitted plain results list for both typing and Enter per the latest product direction.
viewport target: 1440 x 1024 and narrower desktop widths.
state: default Chinese route planning screen, compact left icon rail, independently open/collapsible route/search panels, OSM map canvas, active route overlay, top-left map quick controls, bottom-right zoom controls, bottom OSM attribution/status.

**Findings**
- No actionable P0/P1/P2 findings remain from static implementation review and production build verification.
- [P3] Full desktop-app screenshot capture remains manual.
  Evidence: Browser inspected the built web app through a temporary in-process static server and confirmed the revised Apple Maps-style search list after a real `广州站` query. The captured local view used the current light preference; dark mode uses the same structure with dedicated dark CSS and was cross-checked against the live Apple Maps dark reference.
  Impact: final native-window polish still benefits from a manual Tauri desktop pass.
  Follow-up: reopen the local desktop app to inspect the search results panel in both `light` and `dark` theme preferences at 1440 x 1024 and a narrower desktop width.

**Required Fidelity Surfaces**
- Layout: implemented a fixed compact left app rail, an adjacent route/search panel, and a full-height central map canvas. The rail collapsed state is separate from panel visibility, so Search, Layers, Route, and Recents can reopen their panels while the rail remains icon-only. The top rail toggle controls rail width only, leaving the active Search/Route panel state unchanged.
- Navigation: primary rail now emphasizes Search, Layers, and Route with Apple Maps-like treatment in both light and dark appearances, active rounded icon buttons, and a functional panel toggle.
- Route panel: route mode uses shadcn ToggleGroup, route points use compact input rows, the active empty route point shows an Apple Maps-style "我的位置" option directly beneath the input inside the route card, route options use shadcn Collapsible/Switch, and the route summary/search/results use shadcn Card/Input/Button patterns.
- Search results: search view now uses an Apple Maps-style rounded results card with black/white search input treatment, continuous divided rows, left-side circular type icons, compact category/city and distance/address metadata, and small type badges for station, entrance, food, parking, building, and generic place results. The same component has dedicated light and dark surface, text, divider, hover, icon, and badge styles.
- Search states: typing and pressing Enter both render the same submitted-results-style list. Enter still selects the first result when available, while debounced typing keeps the list visually consistent with the submitted search state.
- Search spacing: the result card uses submitted-results spacing under the search field so the panel does not switch between attached suggestion and submitted list layouts.
- Apple Maps live reference: the `广州站` search page presents a dark left search panel with rail navigation, black search input, a continuous rounded results list, row dividers, bold place names, compact category/city/rating metadata, and right-side photo/icon thumbnails on richer places.
- Map controls: layer and current-location buttons now sit as compact floating controls at the visible map's top-left edge, while zoom in/out controls sit at bottom-right; OSM attribution remains visible in the bottom status surface.
- Theme/i18n: default Chinese copy remains in `src/i18n/locales/zh.json`; new visible labels have Chinese and English strings; shadcn dark styling is synchronized through the document `.dark` class. Light mode now uses the pale rail/panel surfaces, white route card, blue active state, and white map controls shown in the latest reference.

**Verification**
- `npm run typecheck`: passed.
- `npm run build`: passed.
- `npm run build` emitted the expected MapLibre large chunk warning; this remains non-blocking under the project guide.
- Browser check: passed for the Apple Maps-style search list with a real `广州站` query before the latest visual alignment. The latest `广州塔` interaction was blocked by Browser's virtual clipboard layer, so the final pass used typecheck/build and static DOM/CSS review.
- Browser reference check: visited Apple Maps China directly and captured the live `广州站` search result layout for comparison.
- Browser reference check: revisited Apple Maps China with `广州塔入口`; after comparing input/editing and submitted states, the local UI was simplified to always use the submitted-results list.
- Browser check: passed at 1440 x 1024 for the route planning reference. Focusing the origin field shows "我的位置" directly below the active input inside the route card, top-left map controls expose two buttons for layer/current location, bottom-right zoom controls expose two buttons, and the old map toolbar/layer switcher selectors are absent.
- `cargo check` was not rerun because no Tauri/Rust files changed.

**Follow-up Polish**
- Run a manual visual QA pass in the desktop app or an allowed browser surface.
- If production visual fidelity becomes a priority, replace public raster tiles with a tuned OSM vector style so the map colors can more closely match the Apple Maps dark reference while preserving attribution and service boundaries.

final result: implementation checks passed; automated screenshot blocked by browser policy
