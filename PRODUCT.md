# Game Hub

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Players of logic, dice, and strategy games, with mobile users prioritized (confirmed by the redesign brief). The research dashboard serves people exploring 2048 solver results.

## Product Purpose

Play games and explore the algorithmic ideas behind them. The 2048 dashboard should make recorded results understandable, comparable, and connected to supporting research.

## Operating Context

Static HTML, CSS, and JavaScript, with no application build step. Existing playable games: 2048, Bank, Random Event Dice, and Sliding Puzzle. Seeded randomness and game configuration enable repeatable play. The current repository contains recorded 2048 robot runs and research references.

## Capabilities and Constraints

Preserve playable game behavior, data, local configuration/import/export workflows, and existing routes. Redesign the frontend freely with responsive layouts and mobile priority. Work in an isolated Git worktree. Preserve main and origin/main. The user authorized publishing the worktree branch directly to GitHub Pages on 2026-10-12. Every HTML page supports Light, Dark, and live System appearance with a shared saved preference.

## Evidence on Hand

`dashboard_data.json`, `2048 Robots.xlsx`, `algorithmic_performance_explanations_2048.md`, and `sliding_puzzle_and_2048_resources_examples.md`. Research claims must be attributed, and observations from this dataset must not be presented as controlled benchmarks.

## Product Principles

- Make play immediately accessible on a phone.
- Start analysis with a clear question, then show comparisons and inspectable evidence.
- Keep source limitations visible beside conclusions.
- Retain a lightweight static application.
- Adopt the Agent Skills Resource Library visual system across the app: navy/paper/mint/coral, Georgia editorial headings, compact sans controls, square surfaces, and semantic light/dark roles. The original library DESIGN.md v0.3 and implemented CSS are the visual authority; the proposed global skill wrapper is absent.

## Open Decisions

The exact audience beyond players and research explorers is inferred from the existing app. No new commercial, performance, or release claims are authorized. The user delegated all aesthetic decisions.
