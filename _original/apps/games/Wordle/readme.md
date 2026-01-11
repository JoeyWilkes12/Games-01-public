# Wordle

A word-guessing game where the player attempts to identify a secret 5-letter word within six tries.

## Game Mechanics
After each guess, the game provides feedback for each letter:
- **Green**: Correct letter in the correct position.
- **Yellow**: Correct letter in the wrong position.
- **Gray**: Letter not in the word.

## Algorithmic Context
Wordle presents a fascinating problem in **Information Theory**.
- **Entropy**: We can quantify the expected information gain of a guess. The "best" guess is often the one that minimizes the expected size of the remaining pool of possible words.
- **Minimax**: Alternatively, one might aim to minimize the maximum number of guesses required in the worst-case scenario.
- **Constraint Satisfaction**: Each guess adds new constraints that the secret word must satisfy, progressively pruning the search space.


