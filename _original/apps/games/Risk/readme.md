# Risk

A strategy board game of diplomacy, conflict, and conquest. The goal is simple: to occupy every territory on the board and thus eliminate the other players.

## Game Mechanics
The board is a map of the world, divided into 42 territories, which are grouped into 6 continents. Turn-based gameplay involves:
- **Reinforcement**: Deploying troops based on territories held.
- **Attack**: engaging in dice-based combat to capture adjacent territories.
- **Fortification**: Moving troops to strengthen borders.

## Algorithmic Context
- **Graph Theory**: The board can be modeled as a graph where territories are nodes and borders are edges. Connectivity is key for bonus calculations.
- **Probability**: Combat outcomes are determined by dice rolls. Calculating the probability of winning a battle or a sequence of battles is a complex stochastic problem.
- **Game Theory**: Modeling player alliances, betrayals, and strategies for global domination.

## References
- [PyRisk Implementation](https://github.com/jbwilkes/pyrisk)


