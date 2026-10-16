# Application versioning

The application uses [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html)
and a curated [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)
changelog. `version.json` is the source of truth for the application version.

The current worktree is **3.4.0-alpha.6**, an unreleased combined Library/dice
preview on `codex/library-after-dice`. PR #5 merged the approved dice and mobile
baseline into `main` as **3.4.0-alpha.5**. GitHub Pages still serves **3.4.0-alpha.3**
from `codex/mobile-game-lab`. The original `codex/library-design-system` branch
is preserved at its historical **3.4.0-alpha.4** preview. The intended
stable version is **3.4.0** because the work adds and reorganizes user-facing
features while preserving saved-game configuration compatibility. A visual
redesign alone does not require a major version.

## What the version covers

The application's compatibility contract includes saved configuration formats,
exported data formats, game rules, supported navigation URLs, and documented
JavaScript integrations. Styling, navigation organization, and dashboard layout
can evolve within that contract.

- Increment **PATCH** for compatible bug fixes and small presentation corrections.
- Increment **MINOR** for compatible new features, substantial interface improvements, or newly supported data.
- Increment **MAJOR** for incompatible changes to the contract, such as removing a supported configuration format or changing an exported data schema without backward compatibility.
- Use prereleases such as `3.4.0-alpha.1`, `3.4.0-beta.1`, and `3.4.0-rc.1` while the work is being validated. Increment the suffix when sharing a new preview.

Configuration `version` fields inside Bank, 2048, and Random Event Dice exports
identify their own schema. They are independent of the application release and
must not be rewritten to match the app version. Random Event Dice's existing
`2.0` and `2.1` schemas are an example.

The root npm package originally identified the Playwright test harness as
`games-01-playwright@1.0.0`. That historical package version does not establish an
application release. If the package becomes the application's build manifest,
synchronize it and its lockfile with `version.json`; until then, the shared JSON
manifest identifies the app.

## Displaying the version

The shared `scripts/version.js` loader reads `version.json` relative to its own
URL and updates elements with the `data-app-version` attribute. Use a readable
fallback so the page still identifies the preview if the manifest cannot load:

```html
<span data-app-version>v3.4.0-alpha.6 · Preview</span>
<script src="scripts/version.js" defer></script>
```

Nested game pages can load the same script using their relative path, for
example `../../../scripts/version.js`. Do not keep separate game footer version
constants. The manifest records `status: "unreleased"` for local-only work and
`status: "prerelease"` for a published alpha, beta, or release candidate. Both
carry the Preview label.

## Maintaining the changelog

Write short descriptions of meaningful user-facing behavior in `CHANGELOG.md`
under `Unreleased`. Use only applicable categories: Added, Changed, Deprecated,
Removed, Fixed, and Security. Keep entries newest first and retain historical
labels rather than quietly rewriting old release identities.

A release preparation should select its final SemVer, replace the `Unreleased`
entries with a dated section, update the manifest and any synchronized package
metadata, and verify the UI display and compatibility. Use the real release date,
not a planned date. A release tag should reference the approved release commit;
compare links should use real tags after those tags exist.

This policy does not authorize merging, publishing, deploying, or creating tags.
Those actions require the project's separate authorization and release workflow.

## Reconstruction evidence

Reconstructed on **2026-10-12** from the local repository. The inspected `main`
lineage has **46 commits**, is not shallow, and starts at imported root commit
`86c141417b00543cfff4b113759f910662795bb6` on 2026-01-06. `git tag --list`
returned no tags. Complete local ancestry does not prove a complete record of the
project's earlier development or deployment history.

| Recorded label | Evidence | Changelog boundary | Interpretation |
| --- | --- | --- | --- |
| No version label | Root commit `86c1414` | `86c1414` | Earliest available snapshot; earlier releases are unknown. |
| `v2.0.0` | Footer introduced at `17798e4` | `17798e4` | Historical development milestone. |
| `v2.0.1` | Footer changed at `02c5c1d` | `02c5c1d` | Intermediate branch milestone; no separate main merge or tag. |
| `v3.1.1` | Footer changed at `7bd6649`; PR #2 merged at `2472ad2` | `2472ad2` | Consolidated Bank and dice development. |
| `v3.1.2` | Footer changed at `718d721`; PR #3 merged at `2716ad2` | `2716ad2` | Bank interface improvements. |
| `v3.03.00` | Footer changed at `f086ffe`; PR #4 merged at `a533fba` with title `V3.3.0 bank byod, undo functionality` | `a533fba` | Original UI label retained in the changelog; the merged PR establishes intended `3.3.0` numbering. |

`v3.03.00` is not valid SemVer because numeric components contain leading zeros.
The preview uses `3.4.0-alpha.6`, continuing the **intended 3.3.0 sequence** from
PR #4. Historical versions are not retagged or retroactively certified as SemVer.
No standalone 3.0.0, 3.1.0, or 3.2.x release is invented to fill numbering gaps.

The remote-tracking branch `origin/v3.4.0` was inspected. It contains four
unmerged specification/dialogue commits beyond `f086ffe`, ending at `b1d996c` on
2026-01-12, and supplies no tag or merged-release evidence. Its name does not
establish a completed 3.4.0 release. Likewise, unmerged algorithm and React
migration branches are excluded from the changelog for `main`.

Dates in historical changelog headings are commit dates for footer milestones
and merge dates for merged milestones, recorded in the original Git metadata.
No production deployment log or GitHub published-release record was used in that historical reconstruction.
Compare links use full commit IDs whose ancestry was checked locally. They
identify code changes, not proof of publication.

## Tags recorded on 2026-10-16

| Tag | Source | Meaning |
| --- | --- | --- |
| `v3.3.0` | Existing `origin/main` commit `a533fbaf36cf29525472c873aa0faf70aea915ee` | Retrospective normalized baseline, matching PR #4's intended version; the historical UI label remains documented. |
| `v3.4.0-alpha.3` | Mobile worktree commit `1f9415dff1e55e4a71ec92df4eeaf8b8c7db61f4` | Exact previously published mobile/reading-page preview from which dice development branched. |
| `v3.4.0-alpha.5` | Approved dice PR source commit | New 3D/2D display and timing prerelease, including the mobile baseline. |

These annotated tags are created at their existing source commits; neither historical
baseline is rewritten. Tag creation is recorded on 2026-10-16, separately from
older commit/deployment dates. No GitHub Release object or new Pages deployment
is implied. The next combined integration preview should use a new prerelease
identifier rather than moving a published tag. `alpha.4` remains the separate
Library branch's preview identity.

`previousVersion` records the direct preview baseline, while
`stableBaselineVersion` records the normalized stable baseline. Saved-game
configuration versions and the Playwright package version remain independent.

## Integrating the parallel work

PR #5 merged the mobile baseline and approved 3D dice into `main` on
2026-10-16 at `bb773525b278fa45f093e396cdcd567d3ed90581`.
The follow-up branch `codex/library-after-dice` starts from that merge and
replays the two Library commits (`614312d`, `6393643`) as a focused change.
The original Library branch remains preserved; no published branch history
or version tag is rewritten.

The combined preview uses `3.4.0-alpha.6` with status `unreleased` while its
specific PR is reviewed. It retains the alpha.5 dice feature and all published
tag boundaries. Its changelog entries remain under Unreleased until release
approval. Any eventual alpha.6 tag must reference the final approved commit.

Sequential PRs are the selected workflow; a separate integration branch is not
needed. PR #5's explicit merge approval does not grant approval to merge the
new Library PR. Every specific PR merge still requires the user's approval.
