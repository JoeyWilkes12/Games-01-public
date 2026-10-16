---
name: Game Hub — Library design system
description: Editorial field-guide foundations for play, recorded evidence, and quiet reading.
colors:
  navy-950: "#071b33"
  navy-800: "#16324f"
  paper-100: "#f6f1e8"
  paper-0: "#fffdf8"
  mint: "#aee7ce"
  mint-700: "#1c795e"
  coral: "#ff6954"
  surface-soft-light: "#eee8dc"
  surface-page-dark: "#061624"
  surface-raised-dark: "#0e2639"
  surface-soft-dark: "#153047"
  text-secondary-light: "#3f4e5c"
  text-primary-dark: "#edf4f7"
  text-secondary-dark: "#b7c5cf"
  text-accent-dark: "#9edfc6"
  text-inverse-muted: "#cfdfeb"
  link-evidence-light: "#075a4e"
  focus-light: "#bd3b2b"
  border-subtle-light: "rgb(7 27 51 / .16)"
  border-subtle-dark: "rgb(211 226 237 / .18)"
  accent-soft-light: "#e2eee1"
  accent-soft-dark: "#143c38"
typography:
  display:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(2.6rem, 5.8vw, 5.4rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  headline:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "clamp(1.8rem, 3.6vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: 'Georgia, "Times New Roman", serif'
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  body:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  reading:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: "1.04rem"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: 'Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    fontSize: ".8rem"
    fontWeight: 700
  data:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "1rem"
    fontWeight: 600
rounded:
  square: "0"
  micro: "2px"
  circle: "50%"
spacing:
  xs: "4px"
  sm: "8px"
  compact: "12px"
  md: "16px"
  control: "20px"
  lg: "24px"
  xl: "32px"
  section: "40px"
  large: "48px"
  reading-section: "56px"
  hero: "64px"
components:
  button-primary:
    backgroundColor: "{colors.navy-950}"
    textColor: "{colors.paper-0}"
    rounded: "{rounded.square}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.navy-800}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.square}"
    padding: "11px 20px"
  button-inverse:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.square}"
    padding: "11px 20px"
  input:
    backgroundColor: "{colors.paper-0}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.square}"
    padding: "10px 12px"
  appearance:
    backgroundColor: "{colors.paper-0}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.circle}"
    size: "48px"
  navigation-current:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.square}"
    padding: "9px 16px"
  evidence-receipt:
    backgroundColor: "{colors.paper-0}"
    textColor: "{colors.text-secondary-light}"
    rounded: "{rounded.square}"
    padding: "24px 32px"
  comparison:
    backgroundColor: "{colors.paper-0}"
    textColor: "{colors.navy-950}"
    rounded: "{rounded.square}"
    padding: "32px"
  board-option-selected:
    backgroundColor: "{colors.navy-950}"
    textColor: "{colors.paper-0}"
    rounded: "{rounded.square}"
    padding: "10px 16px"
  source-tag:
    textColor: "{colors.mint-700}"
    rounded: "{rounded.square}"
    padding: "0 0 4px"
---

# Design System: Game Hub — Library

## Overview

**Creative North Star: "The Playable Field Guide"**

Game Hub pairs the Library's editorial field-guide character with visible game mechanisms. Navy mastheads and Georgia headings establish the entrance; paper surfaces, mint accents, square geometry, and compact sans controls make play and evidence easy to inspect. A hero and overlapping source or context receipt carry the expressive moment on reading and analysis pages. The working content that follows stays quiet.

The visual authority is the first-party Agent Skills Resource Library `DESIGN.md` v0.3 and `app/globals.css`, pinned to commit `3eaa5ae64e405fd0d8ecb5be3cce279b813fc645`. This record extracts the implementation in `theme.css`, `style.css`, `docs.css`, `dashboard.css`, `apps/games/game-foundation.css`, and game overrides. At the initial adoption on 2026-10-12, the requested `library-design-system/SKILL.md` wrapper was absent. This follow-up consults the now-installed Library design-system reference; no global skill was modified. Library-specific trust ratings, guide governance, and content schemas remain optional source patterns. This snapshot is the unreleased `3.4.0-alpha.6` preview on `codex/library-after-dice`.

**Key Characteristics:**

- Navy editorial entrances followed by paper working surfaces.
- Georgia hierarchy, compact sans interaction, and system-monospace evidence.
- Square surfaces with circular icon controls and small board-specific exceptions.
- Source context, limitations, and recorded notes close to findings.
- Responsive stacking, native scrolling, and shared Light, Dark, and System appearance.

## Colors

Deep navy and warm paper establish the structure; mint supports interaction and evidence, while coral marks focus and caution.

### Primary

- **Deep Navy** (`navy-950`): inverse mastheads, heroes, code surfaces, and primary actions.
- **Secondary Navy** (`navy-800`): action hover and inverse navigation hover.
- **Soft Mint** (`mint`): selected navigation, inverse calls to action, and the featured puzzle stage.

### Secondary

- **Evidence Green** (`mint-700`): light-theme chart marks, evidence links, and source emphasis.
- **Bright Coral** (`coral`): inverse-surface focus, dark-theme focus, and caution rules. Light working surfaces use the darker `focus-light` variant.

### Neutral

- **Warm / Raised Paper** (`paper-100`, `paper-0`): light canvas and contained working surfaces.
- **Soft Working Surface** (`surface-soft-light`, `surface-soft-dark`): control groups, table headers, and secondary panels.
- **Night Canvas / Night Surface** (`surface-page-dark`, `surface-raised-dark`): dark canvas and contained surfaces.
- **Reading / Supporting Ink** (`text-secondary-light`, `text-primary-dark`, `text-secondary-dark`): text adapted to its surface.
- **Inverse Supporting Text** (`text-inverse-muted`): introductory copy and navigation on navy.
- **Subtle Rules** (`border-subtle-light`, `border-subtle-dark`): panel edges, dividers, and table rows.

### Semantic mapping

`theme.css` owns semantic roles. Components use those custom properties; frontmatter names identify their extracted values. Frontmatter component tokens describe the light baseline; the live semantic properties apply the dark variants.

| CSS role | Light value token | Dark value token |
| --- | --- | --- |
| `--surface-page` | `paper-100` | `surface-page-dark` |
| `--surface-raised` | `paper-0` | `surface-raised-dark` |
| `--surface-soft` | `surface-soft-light` | `surface-soft-dark` |
| `--surface-inverse` | `navy-950` | `navy-950` |
| `--text-primary` | `navy-950` | `text-primary-dark` |
| `--text-secondary` | `text-secondary-light` | `text-secondary-dark` |
| `--text-inverse` | `paper-0` | `paper-0` |
| `--text-accent` | `mint-700` | `text-accent-dark` |
| `--link-evidence` | `link-evidence-light` | `text-accent-dark` |
| `--focus-ring` | `focus-light` | `coral` |
| `--border-subtle` | `border-subtle-light` | `border-subtle-dark` |
| `--accent-soft` | `accent-soft-light` | `accent-soft-dark` |
| `--action-bg` / `--action-hover` | `navy-950` / `navy-800` | `navy-950` / `navy-800` |
| `--action-text` | `paper-0` | `paper-0` |

Control strokes use `--border-control`, a mix of primary text (48%) and the raised surface. The inverse masthead's appearance control uses bright coral focus in both themes.

Compatibility names `--ground`, `--paper`, `--ink`, `--muted`, `--teal`, `--teal-dark`, `--teal-pale`, `--clay`, `--plum`, `--line`, `--control-bg`, and `--feature-bg` alias semantic roles. The game foundation's `--lab-*` names bridge existing game CSS to these roles. Historic names do not restore the earlier teal/clay/plum system.

**The Semantic Surface Rule.** Choose colors through the page, raised, soft, inverse, text, action, and focus roles so Light, Dark, and System share one component vocabulary.

**The Scope-Before-Color Rule.** Pair chart marks, selected controls, caution states, and highlighted results with labels or values; keep board scope and source limitations visible.

## Typography

**Display Font:** Georgia with Times New Roman and serif fallback.
**Body Font:** Inter with UI and platform sans fallbacks.
**Label/Mono Font:** the body stack for controls and labels; UI monospace, SFMono-Regular, Consolas, and monospace for inspectable values and code.

**Character:** Editorial headings establish a reading rhythm. Sans copy and controls keep working content compact; monospace distinguishes records from explanations. Font stacks express fallbacks, not a guarantee that Inter is loaded on every route.

### Hierarchy

- **Display** (regular, responsive): the regular Georgia page title in frontmatter; hub heroes tighten line-height to (.98), while reading heroes use `clamp(3rem, 5.8vw, 5.4rem)` and tracking (-.055em).
- **Headline** (semibold, responsive): the shared section scale; reading section headings use weight (500), line-height (1.04), and `clamp(2rem, 3.6vw, 3.2rem)`.
- **Title** (semibold, compact): compact shared card and section headings; reading subheads enlarge to (1.6rem) with weight (500).
- **Body** (regular, readable): the shared interface scale. Long reading uses the reading scale, maximum measure (70ch), and (1rem) on small screens.
- **Label** (bold, compact): compact sans fields and controls; source metadata uses heavier small labels that identify actual fields.
- **Data** (semibold, tabular): monospace with tabular figures for scores, ranking values, filenames, chart scales, and table numbers. Playable tiles and dice use sans; Bank's central score uses the display serif.

**The Evidence Type Rule.** Use monospace for inspectable records and sans for their explanation; preserve the separate typography of the playable mechanism.

## Layout

Shared content centers at a maximum width (1120px) with desktop side gutters (32px). Reading shells widen to (1280px), while prose remains (70ch). Compact wrappers reduce gutters to (20px), then (16px); reading shells have their own narrow-screen adjustments. A (4px) base supports the reused spacing scale. Compact controls use gaps (8–16px), working panels use padding (24–32px), and reading sections use generous space and rules.

The hub's promoted game overlaps the lower edge of its introduction. Lab and document receipts overlap heroes with board/dataset or source/edition context. These information-bearing columns stack on phones.

Below (780px), comparison, research, and feature layouts stack. Below (540px), navigation uses two rows: brand and appearance first, full Play and 2048 lab links second. Hub actions become full-width. Larger dice routes collapse their two-column layouts below (760px), keeping play before secondary settings, scores, analytics, and developer tools.

Reading pages use a sticky contents rail on wide screens and native contents disclosure below (1180px). Long code and wide reference tables retain native horizontal scrolling. Lab comparison tables remain scrollable; run tables become labeled compact rows on phones. Preserve focusable scroll regions and readable columns rather than shrinking evidence to fit.

## Elevation & Depth

Hierarchy comes mainly from tonal surfaces, borders, rules, alignment, and overlap. Reading, settings, comparison panels, dice, and ordinary cards stay flat. Limited shadows belong to the promoted hub feature, illustrative board, and modal layers.

### Shadow Vocabulary

- **Promoted feature** (`box-shadow: 0 16px 40px rgb(7 27 51 / .08)`): the overlapping featured game surface.
- **Illustrative board** (`box-shadow: 0 16px 30px rgb(7 27 51 / .18)`): the tilted decorative board.
- **Modal layer** (`box-shadow: 0 16px 48px rgb(7 27 51 / .16)`): game dialogs with a themed scrim and bounded scrolling.

**The Quiet Surface Rule.** Let rules and surface tones organize reading and working content; reserve lift for the promoted feature, illustrative board, and modal layers implemented here.

## Shapes

Reading surfaces, labeled buttons, panels, receipts, and analytical bars are square. Icon-only affordances, the brand mark, and the appearance control use circles. Board tiles, dice, heatmap cells, and inline code may use the small (2px) exception. Rounded dice illustrations retain object geometry without defining the site's cards.

**The Square-and-Circle Rule.** Use square geometry for reading and action surfaces, circles for icon-only controls, and the micro radius only where the existing play or inline treatment calls for it.

## Components

### Buttons

Square, compact, and direct. Shared buttons have minimum height (48px), padding (11px 20px), and semibold sans labels. Primary actions use action roles; hover deepens navy and may lift (1px). Secondary actions use transparent fill, a visible stroke, and soft-accent hover. Inverse calls to action use mint/navy. Inverse secondary actions use light text and switch to mint on hover. Game overrides often keep hover movement static.

Focus uses a visible coral-family outline (3px), offset (3–4px). Light working surfaces use darker coral; the inverse appearance control uses bright coral. Disabled buttons retain native disabled behavior and reduced opacity.

### Inputs / Fields

Native inputs and selects use square raised surfaces, semantic text, control strokes, and minimum height (44px). Labels remain adjacent. Field padding is generally (10px 12px). Range and checkbox controls remain native with evidence-role accent colors. Placeholder text uses supporting ink at full opacity.

### Navigation

The inverse masthead combines a sans brand, persistent labeled links, and circular appearance. Current links use mint/navy; ordinary links use inverse supporting text with navy hover. Phone navigation preserves both destinations on its second row.

Appearance is a labeled native select with System, Light, and Dark options, displayed through inline SVG icons in a circular target (48px). Forced-colors mode exposes the native select. Saved preference is shared across pages; System follows live OS changes and storage events update open pages. Page appearance and optional game-board palettes are independent.

### Cards / Containers

Raised paper surfaces use subtle one-pixel borders, square corners, and restrained padding. Comparison panels use (32px), reducing on phones. Game entry links become visual-and-text rows on phones. Keep findings and prose free of unnecessary container decoration.

### Source / Context Receipts

A green top rule and concise definition-list metadata connect the inverse entrance to the working surface. Filenames and citations wrap. Preserve source limitations and original recorded notes. A context receipt conveys evidence or scope; it does not certify security or supply an invented trust rating.

### Tabs, Board Selection, and Source Tags

Lab tabs use text with an accent underline for selection. Square segmented board buttons use an inverse selected state, explicit board labels, and monospace run counts. Source tags are small underlined evidence labels. Labels explain state independently of color.

### Reading, Tables, and Sharing

Serif titles introduce narrow, generously led prose, section rules, contents disclosure, and source context. Tables and code scroll inside bounded regions. Evidence links remain underlined. Sharing blocks preserve supplied QR artwork on white backing with its existing quiet zone, including in dark appearance.

### Play and Dialogs

Boards, dice, timers, and scores carry game-specific character within the shared frame. Tile palettes and board themes remain local. Dialogs use square raised surfaces, themed scrims, bounded viewport dimensions, and internal scrolling. Motion explains interaction; reduced-motion preferences disable or minimize animation, transitions, and smooth scrolling.

## Do's and Don'ts

### Do:

- **Do** build from semantic surface, text, action, border, and focus roles in `theme.css`.
- **Do** keep the navy entrance expressive and the reading or evidence surface quiet.
- **Do** use Georgia headings, sans controls, and monospace recorded values in their established roles.
- **Do** preserve source context, caveats, recorded notes, and nearby evidence links.
- **Do** keep visible focus, accessible SVG icon names, native controls, and touch targets at least (44px).
- **Do** stack and wrap on small screens while preserving native scrolling for wide evidence.
- **Do** preserve the QR image's white backing and existing quiet zone in both themes.
- **Do** keep page appearance separate from board palettes and respect reduced-motion preferences.

### Don't:

- **Don't** use compatibility token names to restore the earlier teal/clay/plum palette.
- **Don't** apply rounded cards, pills, or decorative elevation to every working surface.
- **Don't** use color alone for selection, chart results, warnings, or game outcomes.
- **Don't** shrink tables, code, or citations at the expense of legibility.
- **Don't** invent missing performance metrics or present imported observations as controlled benchmarks.
- **Don't** treat Library-specific trust ratings or governance metadata as required Game Hub components.
- **Don't** introduce page-specific light/dark colors when an existing semantic role serves the same purpose.


### Random Event Dice motion

The 3D dice display extends the existing tangible-die treatment with six CSS faces, restrained face shading, and a single lifted tumble. Existing game colors and page themes remain authoritative. A visible 3D rolling / 2D fast control changes presentation independently of the seeded sample pool. Custom-sided dice use explicitly labeled numbered blocks. Results settle before event feedback; motion scales to the interval and respects reduced-motion, pause, stop, and hidden-page states.

The display switch and cube faces use local 7px corners, with 13px helper text and captions. A soft black cast shadow at 40% opacity supports the dark-theme cube. These are object/control-specific details, not new global card or typography tokens.

The combined Library preview uses shared body/control fonts and square display-selection controls for 3D/2D mode. The physical cube keeps its local face rounding; its pips, face values, and roll timing remain independent of the page design.
