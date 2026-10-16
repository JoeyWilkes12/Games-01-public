# Game frontend redesign

The five playable routes share the Games Lab palette, self-hosted type, SVG navigation, touch-sized controls, keyboard focus, reduced motion, and dialog focus handling.

- **2048:** board-first layout fits narrow phones, scores use readable data type, tap directions supplement swipe and arrow keys, research opens the dashboard, and all four theme options remain. Board state is exposed through `render_game_to_text()`. Arrow keys no longer scroll the page or play through settings.
- **Color Match:** compact target sits above a fluid square board; colored tiles are now native keyboard-operable buttons with color/position labels. Number mode, hints, solver, themes, and stats remain. State is exposed through `render_game_to_text()`.
- **Bank:** play stays first on phones; scoreboard and dice probabilities follow in document flow. Configuration, BYOD, undo, imported seeds, and replay paths are preserved.
- **Random Event Dice and 2.0:** live dice lead; controls scroll naturally, session analytics become an inline mobile section, and advanced conditions wrap instead of clipping. Existing import/export and event behavior remain.

Implementation is limited to frontend presentation and small accessibility changes. Core game rules, RNG algorithms, and configuration formats were not changed.

## Verification

- All 75 existing Bank and Random Event Dice seeded, configuration, and gameplay tests passed (16.2 seconds) using installed Google Chrome via a temporary `/tmp` configuration. The repository's pinned Playwright Chromium binary is absent; the repository test configuration was not changed.
- JavaScript syntax checks passed for all five game scripts and the shared dialog helper. Asset paths and HTML IDs were checked: no missing stylesheet/script assets, no duplicate IDs, and all required game IDs preserved.
- The develop-web-game skill client ran keyboard moves on 2048 and number mode on Color Match at 320 × 800. Both screenshots were inspected, both exposed state matched their UI, and neither produced a console error artifact.
- Final small fixes give 2048 hints an inline live status and replace a malformed inherited Dice 2.0 SVG path.

- Legacy 2048 logic page: **20 passed, 0 failed**. It also emits the inherited `Cannot set properties of null (setting 'textContent')` because the script unconditionally initializes playable UI while this page provides only the logic-test container. The logic assertions still run; the production game page has no such error.
- Legacy Color Match pure logic: **3 passed**, including exhaustive traversal of all 22,680 permutations for duplicate tiles. Its UI integration page reports **9 passed**.
- Final control verification: inline 2048 hint produces no native dialog; settings suspend arrow-key play and restore focus when Escape closes them; tap-left merges two 2s into 4 with score 4; a Sliding tile moves with Enter; both Dice developer-tool sections begin collapsed and produce no browser console/page errors. The final 320px 2048 hint screenshot was visually inspected.

- Reviewer accessibility fixes: the target image now describes all nine tile colors (and numbers in number mode), including row/column and the empty space. Successful moves preserve keyboard focus on the moved tile at its destination. Verified four consecutive Enter/Space activations in both color and number modes: all eight moves incremented the count and retained button focus without another Tab. JavaScript syntax and diff whitespace checks passed.
