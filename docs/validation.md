# Redesign validation

Reviewed locally on 2026-10-12, on branch `codex/mobile-game-lab`. The app is a **3.4.0-alpha.3** prerelease preview. Main and origin/main remain at `a533fba`.

## Functional checks

- **78 existing tests passed** for Bank and Random Event Dice seeded configurations and gameplay. A temporary configuration selected installed Google Chrome because the pinned Playwright Chromium binary is absent. Repository test configuration was not changed.
- **2048:** 20 legacy logic assertions passed. The standalone test page still emits its inherited absent-UI initialization warning; the production game page is clean. Arrow and tap movement, merge scoring, hints, autoplay, new game, settings, Escape, and focus restoration were checked. Hints use an inline live status.
- **Sliding Puzzle:** three pure logic checks passed, including 22,680 duplicate-tile permutations, along with nine integration checks. Four consecutive Enter/Space moves in each mode retained focus and incremented the move count. The target description exposes all nine cells.
- **Dashboard:** board switching, mean/median selection, URL parameters, tab deep links, keyboard tabs, search, strategy filtering, pagination, empty/reset states, and CSV export were checked.
- **Data reconciliation:** the 68-row 5×5 CSV export sums exactly to the corresponding source records. Displayed group statistics reconcile to all 148 workbook rows.

## Responsive and source checks

Ten views were checked at **1440, 390, and 320 pixels** wide: hub, results, run log, research, definitions, and five game routes. No document overflow, unnamed visible empty buttons, or production page JavaScript errors were found. Screenshots were inspected at desktop and emulated phone widths. Physical-phone and Safari testing were not performed.

All local stylesheet, script, and navigation paths in the redesigned pages resolve. Self-hosted font licenses are included. Source scores and the workbook remain unchanged. PDF fingerprints and page mappings were checked. Offline extraction reproduced the same coverage: **20 pages, 17 embedded images, and six page previews**. Full sources and extracts are ignored under `research/local/`.

## Review disposition: ship

| Review | Finding                                          | Final status |
| ------ | ------------------------------------------------ | ------------ |
| Code   | Skip link changed the active dashboard tab       | Resolved     |
| Code   | Sliding target arrangement was inaccessible      | Resolved     |
| Code   | Moving a Sliding tile lost keyboard focus        | Resolved     |
| Design | Signature tile needed an accessible play link    | Resolved     |
| Design | Navigation arrows needed one authored SVG system | Resolved     |

The independent code reviewer rechecked all three fixes. The design reviewer inspected targeted desktop and phone recaptures and returned **ship**, with both material findings resolved.

The harness does not expose Impeccable's named reviewer or documenter types. Fresh independent agents used the skill's degraded contracts. The user delegated aesthetics, so design approval boards were omitted. The single mechanical detector run reported Space Grotesk overuse warnings and a decorative-grid advisory; those deliberate geometric exhibit choices were retained and disclosed to the reviewer.

Local screenshots and browser check records are in ignored `output/playwright/`. The original redesign review left deployment untouched. On 2026-10-12 the user separately authorized publishing this worktree branch directly to GitHub Pages after adding Light, Dark, and System modes. Main, origin/main, and release tags remain unchanged.

## Appearance validation

The nine public application pages passed all 54 Light/Dark combinations at 320, 390, and 1440 pixels, with no document overflow and 44-pixel appearance controls. The four diagnostic HTML routes also expose both modes. All 15 appearance behavior assertions passed. Browser checks cover live System updates, explicit overrides, route persistence, cross-tab storage synchronization, invalid preferences, and blocked storage. Game palettes remain independent of page appearance. Screenshots were inspected in both appearances. An independent review checked the theme behavior and colors and returned **ship**, with no remaining actionable findings.

Production is published from the pushed `codex/mobile-game-lab` branch using GitHub’s existing Pages workflow. The existing environment branch policies are preserved, with this branch added explicitly. Local ignored PDF extracts and review artifacts are excluded from the pushed branch.


## HTML reading pages and QR validation

Seven reading pages passed all 42 Light/Dark combinations at 320, 390, and 1440 pixels with no horizontal document overflow or JavaScript errors. All seven retain article text and working links with JavaScript disabled. The independent review confirmed source-content preservation, one primary heading per page, unique section IDs, resolving local document links/fragments, image alternatives, shared appearance/version assets, and no raw Markdown destinations in site HTML or JavaScript.

The QR code was generated using the qr-code-generator skill as an SVG with H error correction and a four-module quiet zone. The actual 128-pixel-wide SVG rendered on the 320-pixel Changelog layout decoded via local macOS Vision in both themes to exactly `https://joeywilkes12.github.io/Games-01-public/changelog.html`. No physical-phone scan was performed. An ordinary Changelog link is provided alongside it.

Hub-to-Changelog, About, README, contents anchors, dynamic research links, and keyboard focus of the table region were checked in the local browser. `scripts/build-docs.py --check` confirms generated HTML matches its Markdown sources. The independent review returned **ship** with no actionable findings.


## 3D Random Event Dice preview — 2026-10-15

Worktree branch `codex/dice-3d-roll` starts from the published `codex/mobile-game-lab` commit `1f9415d`. Default 3D tumbling and a saved 2D fast option were added only to the original Random Event Dice route. The six-sided renderer uses correct opposing faces and pip counts; custom-sided dice use numbered blocks. Rendering does not draw random samples.

The focused browser verifier passed **21 checks**, including landing before event/analytics commits, one-second and 100ms cadence, all six front-face orientations, equal seeded results in both modes, pause/resume before landing and during reset holds, stop cancellation, mode switching, persistence, reduced motion, skip-to-end, expiration/extension, and active countdown accuracy during repeated event holds. Real-time transforms changed during a roll and settled correctly. Light/dark layouts at 320, 390, and 1440 pixels had no document overflow; mode controls meet 44px targets. Keyboard selection, visible focus, and 200% text zoom passed. Ten numbered blocks with values up to 100 fit the 320px layout. No browser errors were found.

The existing Random Event Dice seeded browser suite passed **35 tests**, and its Node logic suite passed **46 assertions**. The web-game skill client ran against the local app using installed Chrome and DOM screenshots (the existing analytics canvas is hidden until opened); captured JSON state agreed with the display. Screenshot and timing records remain ignored under `output/playwright/dice-3d/`.

Localhost port 4175 and its private Tailscale HTTP endpoint were checked from this Mac: the page, renderer, styles, and game script returned 200 and matched this worktree byte-for-byte. Other Serve mappings were preserved. No physical-phone or Safari test was performed. The app is a local preview; GitHub Pages publication was not changed.

The single design detector pass reported four advisories: two local 7px radii, a 13px helper-text size, and the dark cast-shadow color. These are scoped to the inset display switch, physical cube faces, compact die captions, and object shadow; they follow the incumbent compact-control and tangible-die treatment rather than changing the shared visual system.


## Approved PR preparation — 2026-10-16

The user approved the 3D preview and supplied an approval screenshot for the PR. A fresh focused independent code reviewer returned **ship**, with no material renderer, scheduler, pause/reset, cancellation, or test-reproducibility findings. After a clean `npm ci --ignore-scripts`, the checked-in `scripts/verify-dice-display.mjs` passed all 21 checks using the locked Playwright dependency and installed Chrome. The application prerelease is now `3.4.0-alpha.5`; generated HTML and fallback labels are synchronized. Baseline tags identify existing commits rather than rewriting main or the published mobile branch. The PR to main includes the four mobile-base commits because those have not yet landed on main.
