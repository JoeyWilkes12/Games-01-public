---
name: Game Hub
description: A daylight puzzle exhibit for play and inspectable evidence.
colors:
  teal: "#14706b"
  teal-dark: "#0b514e"
  teal-pale: "#d8ebe8"
  clay: "#c4532d"
  clay-deep: "#a44222"
  plum: "#6c609c"
  ground: "#edf4f4"
  paper: "#fff"
  ink: "#142f36"
  muted: "#4d676d"
  line: "#cadbdc"
  soft: "#e3eeee"
typography:
  display:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(2.15rem, 5vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "clamp(1.55rem, 3vw, 2.1rem)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  body:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
  data:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.85rem"
  game-metric:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "1.5rem"
    fontWeight: 400
rounded:
  tile: "6px"
  control: "8px"
  hub-button: "9px"
  compact: "10px"
  board: "12px"
  die: "14px"
  surface: "16px"
  play: "20px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  panel: "20px"
  lg: "24px"
  roomy: "28px"
  section: "32px"
  wide: "40px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.hub-button}"
    padding: "11px 20px"
  button-primary-hover:
    backgroundColor: "{colors.teal-dark}"
  button-game-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.hub-button}"
    padding: "11px 20px"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "9px 12px"
  navigation-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "9px 16px"
  source-tag:
    backgroundColor: "{colors.teal-pale}"
    textColor: "{colors.teal-dark}"
    padding: "3px 8px"
  comparison-surface:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
    padding: "28px"
  board-option-selected:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 20px"
  number-tile:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.paper}"
    rounded: "{rounded.play}"
    width: "112px"
  die:
    backgroundColor: "#f5f9f8"
    textColor: "{colors.ink}"
    rounded: "{rounded.die}"
    width: "88px"
    height: "88px"
---

# Design System: Game Hub

## Overview

**Creative North Star: "The Daylight Puzzle Exhibit"**

Game Hub presents play and algorithmic investigation as things to handle and inspect. A cool daylight ground supports white working surfaces, dark blue-green text, geometric headings, and deliberate teal actions. The visible mechanisms—numbered tiles, colored puzzle pieces, dice, score bars, and source rows—provide the character.

The interface is calm around the activity and expressive within it. The hub uses a rotated tile board and small game illustrations; playable routes put their boards or dice ahead of assistance and settings; the lab and reading pages use precise controls, clear comparisons, and nearby source context. The same exhibit identity supports daylight and night appearances; appearance defaults to the live system preference.

**Key Characteristics:**

- Flat daylight surfaces with restrained borders.
- Geometric display type, readable prose, and distinct numeric typography.
- Puzzle and dice geometry as the visual signature.
- Phone layouts that keep play, controls, and evidence readable in sequence.
- Source context and limitations visible beside analysis.

## Colors

The palette pairs cool structural neutrals with teal actions, clay outcomes, and supplementary plum.

### Primary

- **Exhibit Teal** (`teal`): primary actions, selected lab tabs, chart bars, and some game tiles.
- **Deep Teal** (`teal-dark`): action hover states, text links, selected-tab text, and stronger chart emphasis.
- **Pale Teal** (`teal-pale`): informational notes, research source tags, secondary-action hover, and the hub board stage.

### Secondary

- **Fired Clay** (`clay`): the hub's small brand accent, selected tile values, and root-page keyboard focus.
- **Deep Clay** (`clay-deep`): dice-event feedback and higher-contrast clay game tiles. Outcome feedback also uses a pale clay fill locally.

### Tertiary

- **Study Plum** (`plum`): supplementary game color and the shared playable-game focus outline. It is not a second primary-action color.

### Neutral

- **Daylight Ground** (`ground`): the page canvas.
- **White Paper** (`paper`): controls, cards, game surfaces, and dialogs.
- **Blue-Green Ink** (`ink`): headings, primary text, current navigation, and the hub's lab-entry panel.
- **Slate Caption** (`muted`): supporting copy, labels, citations, and explanatory metadata.
- **Cool Divider** (`line`): panel outlines, board structure, rules, and separators.
- **Soft Cell** (`soft`): empty play cells, secondary game controls, and quiet in-game feedback.

### Named Rules

**The Teal Action Rule.** Teal identifies actions and selected analytical controls; clay and plum remain game, feedback, or focus colors.

**The Scope-Before-Color Rule.** Comparisons carry board labels, values, and source context. A colored winner row or bar is accompanied by text, never the only explanation of the result.

### Page appearance

`theme.css` owns shared semantic colors and `theme.js` applies them before page paint. Light uses the daylight colors above. Dark uses ground `#101f25`, paper `#192e35`, ink `#e8f2f2`, muted `#b0c6ca`, teal `#70c7bb`, link teal `#91d8cf`, pale teal `#233f43`, clay `#f2a17e`, plum `#c2b0ef`, and divider `#405c63`. Secondary surfaces use `#263d44`. Primary actions retain `#14706b` with white labels in both modes. Charts use the same semantic tokens as their legends.

A native Appearance selector offers System, Light, and Dark after every page header. System is the initial value and reacts immediately to operating-system changes. Explicit choices persist across routes and tabs; storage-unavailable contexts still allow a choice for the current page. The preference is independent of each game's board palette, labeled accordingly in settings.

Game colors are a local vocabulary. The 2048 board progresses from pale cells through teal, clay, and plum to ink; Color Match has eight distinct tile hues. Both games retain selectable dark, pastel, and neon themes. Those opt-in palettes do not redefine the hub or research pages.

## Typography

**Display Font:** Space Grotesk, with a sans-serif fallback.

**Body Font:** DM Sans, with a sans-serif fallback.

**Label/Mono Font:** IBM Plex Mono, with a monospace fallback, for scores, codes, timers, chart values, and tabular numbers.

**Character:** Geometric headings give the exhibit a constructed quality; the body face keeps instructions and research comfortable to read. Monospaced figures distinguish measured values from explanation. Fonts are self-hosted with `font-display: swap`; the supplied weights are DM Sans 400/600/700, Space Grotesk 400/600/700, and IBM Plex Mono 400.

### Hierarchy

- **Display:** the frontmatter's fluid heading role is the root-page baseline. Hub headings use short lines; mobile lab page headings use a compact override. Game headings use their own smaller clamps to leave room for play.
- **Headline:** fluid section headings for the hub and reading pages. Lab findings use tighter local sizes and line lengths.
- **Title:** card titles and small panel headings. Research-paper titles use a slightly larger reading-oriented treatment.
- **Body:** the base reading role, with prose capped at 70 characters and definitions at 65 characters where those limits are set.
- **Label:** sentence-case control and game labels. Small citations, table headings, and source metadata are locally smaller; they do not become decorative headings.
- **Data:** compact numeric tables, codes, and chart metadata. Numeric columns align right and use tabular figures. Game scores and timers increase size according to their role; tile numerals use Space Grotesk rather than the data face.

### Named Rules

**The Number-and-Explanation Rule.** Use IBM Plex Mono for inspectable values and DM Sans for their explanation; use Space Grotesk for the playable tile or die itself.

## Layout

The hub, lab, definitions, and research share a centered reading frame with a maximum width of 1184 pixels and 32-pixel desktop side gutters. At 760 pixels and below the gutters reduce to 20 pixels, then to 14 pixels at 360 pixels and below. Definitions use a narrower 760-pixel prose column. Repeated gaps and padding follow the frontmatter spacing vocabulary; compact controls have smaller local gaps.

Desktop hub composition pairs the featured copy and tile exhibit, then lays out game entries in three columns. The phone layout places the exhibit above its copy and turns the remaining entries into compact illustration-and-text rows. The lab starts with board selection and tabs; comparison and interpretation share columns, while run inspection, spread, and reading follow the selected view. At 680 pixels and below the lab and research columns stack. The lab also has a 900-pixel intermediate layout adjustment.

The 2048 and Color Match play frames are capped at 540 and 580 pixels respectively. Bank and both Event Dice routes use a wider play area with a 320-pixel control or score column; at 760 pixels and below they stack into a phone-width frame. Play areas use fluid page and panel padding. Square boards retain their aspect ratio, equal cells, and visible gaps.

The lab's phone run log becomes a stacked row layout with the run identifier, strategy, score, and recorded note visible. The board-comparison table wraps its labels and values. These are source-preserving layout changes, not permission to drop data from exports or the underlying records.

## Elevation & Depth

Most panels and controls are flat: white fill, a thin cool border, and spacing establish hierarchy. Depth is reserved for tangible exhibit pieces and transient overlays. The hub board uses a soft ambient shadow and a small rotation; dice use a shallow shadow; selected board controls have a subtle separation shadow. Dialogs use an ink-tinted scrim and soft elevation. This is not a globally shadowless build.

### Shadow Vocabulary

- **Exhibit board** (`0 16px 30px #173c3c19`): the hub's rotated tile-board illustration.
- **Die** (`0 4px 12px rgb(20 47 54 / .07)`): a resting die in Bank and Event Dice.
- **Board selection** (`0 2px 4px #173c3c0a`): the active lab board option.
- **Dialog** (`0 16px 48px rgb(20 47 54 / .16)`): shared modal content; individual legacy dialog rules may still differ.

### Named Rules

**The Quiet Surface Rule.** Keep reading, comparison, settings, and analytics panels flat. Reserve lift for the puzzle exhibit, dice, and modal layers already present in the build.

Motion is brief and tied to interaction: root buttons change color and lift slightly, hub game illustrations move on hover, the linked 2048 tile reduces its rotation, and Color Match tiles scale slightly on hover. Game actions generally change color without lift. Reduced-motion rules suppress or nearly eliminate animation and transitions and disable smooth scrolling.

## Shapes

The recurring geometry is a softly rounded rectangle. Small play cells have tight corners; controls use the compact control radii; ordinary panels use the surface radius; main play frames use the play radius. Dice have their own rounded-square silhouette. The featured hub container has a larger local corner treatment rather than a new universal radius.

Boards rely on a repeated cell grid, square proportions, and a contrasting frame. The miniature board and linked 2048 tile are intentionally rotated; comparison cards, charts, and prose remain square to the reading axis. Ordinary surfaces use a one-pixel outline. SVG interface icons use simple unfilled strokes with rounded caps and joins; the shared root icon size is 20 pixels.

## Components

### Buttons

Clear, compact actions with ample touch area. Root primary actions use teal and white; secondary actions use transparent fill, ink text, and a cool outline. Root buttons are at least 48 pixels tall, use the hub-button radius, and move up one pixel while darkening on hover. Game primary actions also reach 48 pixels, use the control radius, and typically keep their position on hover. Game secondary actions use soft fill with a cool outline.

Root keyboard focus uses a three-pixel clay outline with a four-pixel offset. Shared game focus uses a three-pixel plum outline with a three-pixel offset. Disabled controls reduce opacity. Icon controls and ordinary fields generally retain a minimum 44-pixel touch area. Preserve visible labels or accessible names when icons stand alone.

### Chips

Source tags are quiet labels, not filter controls. The research tag uses pale teal, deep teal text, compact padding, and a small radius. Do not give this static tag an invented interaction or selected state.

### Cards / Containers

White analytical surfaces use a thin cool outline, the surface radius, and comfortable internal spacing. Comparison panels use roomy padding on desktop and reduce it on phones. Game controls and analytics panels use more compact padding. Hub game entries combine an illustration and text without wrapping every entry in another outlined white card.

Informational evidence notes use pale teal and plain, readable text. Source limits sit beside the conclusion they qualify. Research entries use horizontal separators and a title/citation column beside summary/commentary; they stack on phones. Native details disclosures keep longer commentary and background references secondary.

### Inputs / Fields

White fields use ink text, a thin cool outline, and compact rounded corners. The lab's fields have a seven-pixel local radius; game fields use the shared control radius. Labels remain above or beside their fields. Standard fields reach 44 pixels in height; compact phone lab selectors use a 40-pixel local variant. Focus inherits the relevant root or game outline. Range and checkbox accents use teal in the shared game foundation.

### Navigation

The root header combines the small four-square brand mark with two visible destinations. Links use muted text, rounded hover fill, and an ink-filled current state with white text. Phone spacing tightens without replacing navigation with an icon-only menu. Definitions and research keep the same header and link back to the lab. Game headers use a bordered back control with a left-arrow SVG, plus a title and route-specific controls.

The lab's tab row uses plain text and a teal bottom border for the selected tab. Board selection uses a pale segmented tray and white selected option. Preserve the semantic selected states and keyboard behavior present in those controls.

### Puzzle and Dice Signatures

The hub's miniature board makes the game itself the image. The lab's rotated teal 2048 tile is a real link to play, with an accessible name; its rotation relaxes on hover. The playable 2048 grid uses high-contrast numerals and a compact palette progression. Color Match places a miniature target beside instructions before the main board, and its hint uses an inset outline.

Bank and Event Dice show large square dice on quiet white surfaces. Event matches use clay feedback and descriptive text; Bank distinguishes seven and doubles with clay and teal. Scores, timers, and game statistics retain the separate numeric type treatment. Optional analytics and developer logs stay secondary to play and settings.

## Do's and Don'ts

### Do:

- **Do** start from the daylight ground, white surfaces, ink text, and teal action roles recorded above.
- **Do** preserve compact, square play geometry and put assistance after the primary activity.
- **Do** keep numeric evidence aligned, labeled, and connected to its board and source.
- **Do** place source limits beside findings and retain citations and original recorded notes.
- **Do** keep responsive layouts readable by stacking, wrapping, and reducing padding before compressing the activity.
- **Do** preserve visible focus, accessible icon names, touch-sized controls, and reduced-motion behavior.

### Don't:

- **Don't** turn clay or plum into competing global primary-action colors.
- **Don't** add elevated card treatment to every reading, settings, or analytics surface.
- **Don't** treat a local game theme or tile palette as the root website's palette.
- **Don't** use color alone to explain a selected result, chart value, or game outcome.
- **Don't** present imported observations as controlled benchmarks or invent missing time, move, win-rate, or maximum-tile metrics.
- **Don't** replace the self-hosted type hierarchy with a generic display face or use glyph characters as the reusable interface icon system.

Evidence: `style.css`, `dashboard.css`, `assets/fonts/fonts.css`, `apps/games/game-foundation.css`, the five game styles and lab overrides, and their current HTML/JavaScript. This source-based document does not assert browser verification. `.impeccable/design.json` schema version 2 extends these tokens with component previews, motion, breakpoints, and shadows; its generated tonal strips are preview aids, not additional implemented colors.

Not canonized: residual close-character icons and inherited legacy dialog styling are implementation inconsistencies, not new system rules. The optional game themes are recorded as local behavior rather than promoted to global tokens.
