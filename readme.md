# Overview

## Welcome
Welcome to my games repository! I explore logical aspects and algorithmic solutions to various puzzles and strategy games.

**Live Demo**: [Play the Games Here](https://joeywilkes12.github.io/Games-01-public/index.html)

---

## Game Gallery

### Game Hub
![Game Hub](screenshots/hub.png)

### Random Event Dice
![Random Event Dice](screenshots/random_event_dice.png)

### 2048
![2048 Game](screenshots/2048.png)

### Sliding Puzzle 3x3
![Sliding Puzzle](screenshots/sliding_puzzle.png)

---

## Playable Games
- [Random Event Dice (v2.0)](apps/games/Random%20Event%20Dice)
- [2048](apps/games/2048)
- [Sliding Puzzle 3x3](apps/games/Sliding%20Puzzle%203x3)

## Coming Soon / In Development
- [Acquire](apps/games/Acquire)
- [Mastermind](apps/games/Mastermind)
- [Queens](apps/games/Queens)
- [Wordle](apps/games/Wordle)
- [Risk](apps/games/Risk)

## Development & Deployment

### Virtual Environment & Reproducibility
This codebase consists largely of static web applications (HTML/CSS/JS) that do not require complex backend runtimes or build steps for the final user. Tests and local development servers differ slightly by game (some use Node.js for testing), but the core games are designed to be "unzipped and played" in any modern browser.

Reproducibility is ensured through semantic versioning of game logic and deterministic seeds in games like Random Event Dice and 2048, allowing users to replay specific scenarios.

### Deployment (GitHub Pages)
This repository is deployed using [GitHub Pages](https://pages.github.com/).
- **Method**: Static file serving from the `main` branch.
- **CI/CD**: Currently, there are no GitHub Actions or complex build pipelines. Updates are live immediately upon push to the main branch.

## Acknowledgements & AI Investment
This project was developed with significant assistance from advanced AI tools, representing a financial investment in state-of-the-art technology to explore the future of coding.

- **Financial Investment**: Google's AI Pro subscription (utilized even during trial periods to max capability).
- **Tools**:
    - **Antigravity**: An advanced agentic coding assistant by Google Deepmind.
    - **Models Used**:
        - **Gemini 3 Pro**: For primary reasoning, code generation, and complex task planning.
        - **Claude Opus 4.5**: Utilized for specific reasoning tasks and alternative perspectives within the agentic workflow.

---

## Game Descriptions

### Random Event Dice
A customizable dice rolling simulation designed for tabletop gaming or probability experiments. Features include event triggers, law of large numbers visualizations, and comprehensive analytics.

### 2048
A single-player sliding block puzzle using numbered tiles. Features an Expectimax AI solver, multiple themes, and seeded randomness for reproducible runs.

### Sliding Puzzle 3x3
A classic sliding tile puzzle where the player must rearrange scrambled tiles into a specific order.

### Acquire (Coming Soon)
A strategic board game involving the placement of tiles to form and expand corporations. Players buy stock in active chains and earn bonuses when chains merge.

### Mastermind (Coming Soon)
A logic-based code-breaking game where the player guesses a secret color pattern.

### Queens (Coming Soon)
A classic constraint satisfaction puzzle requiring the placement of N queens on an NxN chessboard so that no two queens threaten each other.

### Wordle (Coming Soon)
A word-guessing game relying on information theory and entropy to maximize information gain with each guess.

### Risk (Coming Soon)
A complex board game of global domination involving territory control, combat, and alliances.
