# 2048 Algorithmic Performance Explanations

This document postulates why the observed results on the 2048 Dashboard occur, specifically analyzing the performance differences between **Monte Carlo (Mc)**, **Expectimax Tree (E)**, **IDDFS Graph Search (Igs)**, and **Reinforcement Learning (Rl)** across different grid sizes.

## 1. Summary of Results

Data from the dashboard reveals distinct performance tiers generally correlated with grid size constraints:

*   **4x4 Grid (Standard)**: Space is the primary constraint. **Expectimax (E)** tends to outperform others, providing the most consistent high scores.
*   **5x5 Grid (Large)**: Space is abundant. **IDDFS Graph Search (Igs)** shows surprisingly dominant performance, often rivaling or exceeding Expectimax. **Monte Carlo (Mc)** sees a massive performance boost compared to its 4x4 results.

---

## 2. Algorithm Analysis

### Expectimax Tree (E)
**Why it works well everywhere (especially 4x4):**
Expectimax is theoretically optimal for 2048 because it explicitly models the "Chance" nodes (random tile spawns).
*   **Risk Management**: On a 4x4 board, one bad move can lead to a "game over" quickly. Expectimax averages the outcomes of all possible random spawns, effectively "hedging its bets" against bad luck.
*   **Depth vs. Accuracy**: It searches deep enough (typically 3-4 ply) to see the consequences of filling up the board. This makes it superior in the tight, dangerous constraints of a 4x4 grid.

### IDDFS Graph Search (Igs)
**Why it dominates 5x5 but struggles on 4x4:**
*   **Graph vs. Tree**: IDDFS (Iterative Deepening Depth-First Search) combined with Graph Search usually employs a transposition table to detect repeated states.
*   **The 5x5 Advantage**: On a larger board, the "danger" of immediate death is lower. The algorithm can explore deeper chains of moves to optimize score without constantly hitting terminal "game over" states. Its systematic search finds highly optimized merge chains that probabilistic methods might miss because they are too "conservative."
*   **The 4x4 Weakness**: Without the explicit probabilistic modeling of Expectimax, Igs treats all future states as deterministic or equally likely (depending on implementation), which is fatal in the tight 4x4 space where a specific random spawn can ruin a run.

### Monte Carlo (Mc)
**Why it has high variance:**
Monte Carlo relies on random playouts (simulating random moves to the end of the game).
*   **4x4 Struggle**: In a 4x4 grid, most random playouts end very quickly (games are short/fragile). This gives the algorithm "noisy" data—it often can't distinguish a "great" move from a "lucky" one because the sample size of useful long games is small.
*   **5x5 Redemption**: On a 5x5 grid, random games last much longer. This provides the Monte Carlo simulation with more signal (higher scores are easier to reach randomly), allowing the algorithm to make better statistical decisions. However, it remains high-variance (inconsistent) compared to tree-based search.

### Reinforcement Learning (Rl)
**Why it lags behind Search algorithms:**
*   **Generalization vs. Computation**: RL relies on a pre-trained policy (a neural network or value table) rather than searching the future in real-time.
*   **Training Horizon**: Unless trained on millions of games specifically for high-tile states (4096, 8192), RL agents often "forget" or fail to value states they rarely see.
*   **Computational Disadvantage**: Search algorithms (E, Igs) use CPU time *during* the move to look ahead. RL uses CPU time *before* the game (during training). In a direct comparison where search algorithms are allowed time to think, they essentially "out-compute" the RL agent's heuristic.

---

## 3. The "Grid Size" Factor

The shift from 4x4 to 5x5 fundamentally changes the game from a **survival challenge** to an **optimization challenge**.

*   **Constraint vs. Greed**:
    *   **4x4 = Survival**: The best algorithm is the safest one (Expectimax).
    *   **5x5 = Optimization**: The best algorithm is the one that finds the longest, most efficient merge chains (IDDFS Graph Search).

This explains why `Igs` sees such a dramatic performance leap on the larger grid—it is unleashed from the fear of death and allowed to purely optimize score.
