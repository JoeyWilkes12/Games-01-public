# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/). New application
versions follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

Historical entries below were reconstructed from the available Git history on
2026-10-12. Dates identify recorded commits or merges into `main`; they are **not
verified deployment or published-release dates**. Original UI labels are retained,
including the nonstandard `v3.03.00`. The repository had no Git tags at the time of
reconstruction. Links use verified commit boundaries rather than invented tags.
See [versioning policy and evidence](docs/versioning.md).

## Unreleased

Changes not yet published will be listed here.

## [3.4.0-alpha.2] - 2026-10-12

Public preview published directly from `codex/mobile-game-lab` to GitHub Pages;
`main` remains unchanged. This prerelease includes the initial redesign work.

### Added

- A shared Light, Dark, and System appearance selector on every HTML page, with saved preference and live system updates.
- A mobile-first 2048 lab with board-specific score comparisons, mean/median controls, individual run distributions, searchable run logs and filtered CSV export.
- An annotated research library with six page-linked findings from three direct 2048 studies, plus reproducible local PDF text/image extraction.
- Shared self-hosted typography, accessible navigation and touch controls across the hub and playable games.
- A curated changelog reconstructed from the available history, with commit comparisons and an explicit account of missing release evidence.
- A shared application version manifest and documented semantic versioning policy, independent of saved-game configuration schemas.

### Changed

- Rebuilt the hub, 2048, Sliding Puzzle, Bank and Random Event Dice layouts for phone-first play.
- Reorganized analysis into results, run log and research, with URL-addressable filters and source limitations beside findings.
- Replaced the dashboard’s remote chart dependency with accessible local score visuals and exact-value tables.

### Fixed

- Removed unsupported move-count, maximum-tile and timeline views from the dataset.
- Corrected the observed 4×4 leader to Monte Carlo and the Expectimax course paper attribution to Ahmad Zaky.
- Kept unrelated research separate from direct 2048 evidence and documented score/metadata anomalies.

## [v3.03.00] - 2026-01-10

Historical UI label. The corresponding merged pull request, [#4](https://github.com/JoeyWilkes12/Games-01-public/pull/4), calls this milestone **v3.3.0**.

### Added

- Bank's Bring Your Own Dice mode, including manual entry for sums and doubles.
- Confirmation before returning to the hub during active games in Bank, 2048, Random Event Dice, and Sliding Puzzle.
- Undo access from Bank's game-over dialog.

### Changed

- Bank's full scoreboard includes score, gap, and rank columns alongside its compact view.
- Expanded Bank coverage for physical-dice controls and undo behavior.

### Fixed

- Kept Bank's undo control visible in physical-dice mode and cleared stale roll output after undo.

## [v3.1.2] - 2026-01-10

Reconstructed from the footer label and merged [pull request #3](https://github.com/JoeyWilkes12/Games-01-public/pull/3).

### Added

- Bank JSON configuration import/export and reusable sample configurations.

### Changed

- Reorganized Bank's controls, player banking panel, and collapsible probability information.
- Added a compact scoreboard with current-player rank and score gaps, plus an expandable full scoreboard.
- Moved survival probability into the dice cheatsheet.
- Improved the game-over dialog with a scrollable scoreboard and persistent replay control.
- Updated Bank documentation and gameplay screenshots.

## [v3.1.1] - 2026-01-09

Reconstructed from the footer label and the consolidation merged in [pull request #2](https://github.com/JoeyWilkes12/Games-01-public/pull/2).

### Added

- Bank dice game, player configuration, round progression, and multiplayer banking.
- Bank action history and undo, with options to preserve or resample random rolls.
- Bank multi-select banking, keyboard shortcuts, and dice probability cheatsheet.
- Bank deterministic test scenarios and inclusion in the shared test infrastructure.

### Changed

- Consolidated Bank and Random Event Dice development into the game hub.
- Expanded Bank's scoreboard, gap calculations, visual feedback, and game documentation.
- Improved browser test setup, isolation, and demo recordings.

## [v2.0.1] - 2026-01-08

Reconstructed from the footer change at `02c5c1d`; this intermediate development label has no associated release tag or distinct merge into `main`.

### Changed

- Adjusted the Random Event Dice configuration import icon and updated game-page test expectations.

### Removed

- Repeated version footers on individual game pages; the hub retains the application version.

## [v2.0.0] - 2026-01-08

Reconstructed from the first recorded version footer at `17798e4`, including earlier Random Event Dice work merged in [pull request #1](https://github.com/JoeyWilkes12/Games-01-public/pull/1).

### Added

- Random Event Dice pause/resume and expanded analytics, including turn timelines and simulation to the end of a game.
- Player naming, additional player controls, configurable dashboard sizing, and timer visibility control.
- Browser tests, reproducible configuration scenarios, and demo recordings.
- Written explanations of the algorithms and performance measures used by 2048.

### Changed

- Reorganized Random Event Dice settings into a wider dialog and split configuration save actions.
- Changed Random Event Dice configuration durations to seconds in schema `2.1`, retaining import support for earlier millisecond-based schema `2.0`.
- Improved mobile layouts and hid unfinished game cards on the hub.

### Fixed

- Repaired a duplicated simulation call that prevented Random Event Dice from running.
- Added the missing validation-warning check before starting a game.
- Corrected test selectors and duplicated browser-test files.

## [Initial available snapshot] - 2026-01-06

The available history begins at root commit `86c1414`. Earlier development and release dates cannot be reconstructed from this repository. This entry describes the contents of that snapshot, not when each feature was originally introduced.

### Added

- Game hub with playable 2048, Sliding Puzzle, and Random Event Dice pages.
- 2048 AI controls, game analytics, deterministic configuration scenarios, and in-page tests.
- AI, analytics, and research dashboard backed by spreadsheet-derived experiment data.
- Definitions and research-reference pages supporting the dashboard.
- Sliding Puzzle logic and integration tests, plus Random Event Dice configuration and analytics tests.

[v3.03.00]: https://github.com/JoeyWilkes12/Games-01-public/compare/2716ad26eda4f76fc0a8fcb461e3d6c436ab833a...a533fbaf36cf29525472c873aa0faf70aea915ee
[v3.1.2]: https://github.com/JoeyWilkes12/Games-01-public/compare/2472ad2ffdcde343fb85499c150273e4d4f9cd73...2716ad26eda4f76fc0a8fcb461e3d6c436ab833a
[v3.1.1]: https://github.com/JoeyWilkes12/Games-01-public/compare/02c5c1d3054a64936dc5fa0a4b2d75d2606799f1...2472ad2ffdcde343fb85499c150273e4d4f9cd73
[v2.0.1]: https://github.com/JoeyWilkes12/Games-01-public/compare/17798e4e8dfe762a8dd565be828f17724c0981d6...02c5c1d3054a64936dc5fa0a4b2d75d2606799f1
[v2.0.0]: https://github.com/JoeyWilkes12/Games-01-public/compare/86c141417b00543cfff4b113759f910662795bb6...17798e4e8dfe762a8dd565be828f17724c0981d6
[Initial available snapshot]: https://github.com/JoeyWilkes12/Games-01-public/commit/86c141417b00543cfff4b113759f910662795bb6

[3.4.0-alpha.2]: https://github.com/JoeyWilkes12/Games-01-public/compare/a533fbaf36cf29525472c873aa0faf70aea915ee...codex/mobile-game-lab
