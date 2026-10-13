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


## Theme icon validation — separate design-system branch

On `codex/library-design-system`, all 20 HTML routes passed 80 theme/layout combinations: Light and Dark at 320 and 1440 pixels. Every route has exactly one accessible “Color theme” dropdown, the matching selected-mode SVG, a minimum 44-pixel select hit area, and no horizontal document overflow. Ten behavior assertions passed, covering live System changes, explicit override, navigation persistence, cross-tab synchronization, focus indication, forced-colors fallback, and Bank keyboard handling. Bank now ignores shortcuts originating from form fields and editable content, so Space opens the native selector without rolling; the gameplay shortcut still rolls normally.

Representative hub, lab, Bank, and Changelog screenshots were inspected in both themes at 390 pixels, plus the desktop hub. The known 2048 standalone diagnostic startup warning remains; it is unrelated to the theme control and was also recorded in the original functional checks above. No physical-phone test was performed. An independent code review returned ship after the keyboard fix. Generated documents and Git whitespace checks pass. Screenshots and detailed results are ignored under `output/playwright/theme-icon/`.

No installed skill matches the requested “Library design system” name. The broader replacement system is awaiting its exact name, path, or link. This branch retains the existing design tokens until the intended system is identified. The current Pages source remains `codex/mobile-game-lab`; main and origin/main are unchanged.


## Library design system — 3.4.0-alpha.4 preview

The requested global `library-design-system/SKILL.md` does not exist. With the user's temporary authorization, the source thread “Share design system across projects” was inspected; it proposed the wrapper and recorded no file changes. The first-party Library `DESIGN.md` v0.3 and implemented stylesheet at source commit `3eaa5ae64e405fd0d8ecb5be3cce279b813fc645` supplied the design reference. No global skill or source-repository files were changed.

All **20 HTML routes passed 120 layout/theme combinations**: Light and Dark at 320, 390, and 1440 pixels. No horizontal document overflow was found. Screenshots cover the hub, lab, research, definitions, reading pages, and all five games; affected views were recaptured after color transitions settled. Each route uses the Library serif hierarchy, semantic page colors, and an accessible native icon dropdown with System, Light, and Dark choices.

All **41 browser behavior assertions passed**, including live OS preference changes, explicit overrides, route persistence, cross-tab synchronization, focus indication, forced-colors fallback, board and metric controls, lab tabs, all five game settings dialogs at 320 pixels in both modes, Escape dismissal, Bank's selector/gameplay keyboard behavior, and the 2048 hint. Eight of those assertions cover all four 2048 tile palettes in both page modes, checking large-text contrast across the eleven numbered tiles. The dice timer icon and research return action also passed targeted contrast/layout checks.

The inherited missing-UI startup error remains limited to the standalone 2048 diagnostic page; no production page errors were found. No physical-phone or Safari test was performed. Game logic, recorded research data, and exports were unchanged in this styling pass; prior functional/data checks remain documented above.

Static verification checked **431 local links and assets** across all 20 pages, including three dashboard tab routes handled by its hash router. No duplicate IDs, missing primary headings, broken local destinations, or raw Markdown link destinations were found. Generated-document parity, JavaScript syntax, and Git whitespace checks pass. QR artwork and its black-on-white quiet zone are preserved; the previously recorded decoding checks remain applicable.

Independent code review returned **ship** after confirming the dice timer selector and Bank feedback contrast fixes. The independent design reviewer inspected the targeted desktop/phone recaptures and updated design records; all three material findings are resolved and the final disposition is **ship**. Fresh generic agents used Impeccable's degraded finish-reviewer and documenter contracts because the named agent types are unavailable. The single mechanical detector run found two side-rule advisories that were corrected, plus three rounded-accent advisories on explicitly square surfaces; the latter are false positives and were disclosed to review.

Detailed results and screenshots remain ignored under `output/playwright/library-system/`. This is an unreleased worktree preview on `codex/library-design-system`; GitHub Pages continues to use `codex/mobile-game-lab`. Main and origin/main remain at `a533fba`.
