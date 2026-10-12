# Redesign validation

Reviewed locally on 2026-10-12, on branch `codex/mobile-game-lab`. The app is a **3.4.0-alpha.2** prerelease preview. Main and origin/main remain at `a533fba`.

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
