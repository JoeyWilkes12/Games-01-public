# Reading the 2048 algorithm results

This guide has been superseded by the [reviewed source notes](docs/research-notes.md), [interactive lab](dashboard.html) and [metric definitions](definitions.html).

The controlling source is `2048 Robots.xlsx`, worksheet Record, A2:F149. It contains 148 historical observations imported from another app, not controlled benchmarks of the current browser solver.

| Board | Observed mean-score leader | Runs per strategy |
| --- | --- | ---: |
| 4×4 | Monte Carlo, 13,052.20 points | 20 |
| 5×5 | IDDFS Graph Search, 120,758.82 points | 17 |

The previous guide incorrectly identified Expectimax as the 4×4 leader. Original scores are preserved, including the anomalous 11,525-point record. Names use the workbook code mapping because the Full Name field is malformed.

Compare strategies within a board size. Seeds, search budgets, timing, training details, move counts and complete maximum-tile outcomes are absent. The records do not explain why a strategy leads, establish win rates or prove a universal algorithm ranking.

Published research can guide new experiments. [Page-linked reading notes](research.html) discuss heuristics, chance nodes, search depth and learned evaluation while keeping external study results separate from the imported runs.
