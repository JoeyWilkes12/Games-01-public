# Bank - Dice Game

A web-based implementation of the "Bank" dice game, based on rules from [ThunderHive Games](https://www.thunderhivegames.com/).

## How to Play

### Objective
Be the player with the most BANKED points after 10, 15, or 20 rounds!

### Setup
1. Add player names (2+ players)
2. Choose number of rounds (10, 15, or 20)
3. Start rolling!

### Gameplay

1. **Roll**: Click "Roll Dice" or press SPACE to roll both dice
2. **Score Accumulates**: Each roll's sum is added to the BANK
3. **BANK Your Points**: Click "BANK!" (or press B) to claim the current BANK score
4. **Sit Out**: Once you BANK, you sit out the rest of the round
5. **Next Round**: Round ends when a 7 is rolled OR everyone has banked

### Special Rules

| Roll | First 3 Rolls | After 3 Rolls |
|------|---------------|---------------|
| **7** | +70 points to BANK | Round ENDS (all unbanked points lost!) |
| **Doubles** | Face value only (e.g., 4+4 = +8) | DOUBLES the entire BANK! |

The first three rolls have "protection" - you can't lose to a 7 early!

### Winning
After all rounds complete, the player with the highest score wins!

## Features

- **Manual Rolling**: Click to roll (no automatic timer)
- **Visual Feedback**: Dice animations, score pulses, status indicators
- **Real-time Scoreboard**: See all players ranked by score
- **Sound Effects**: Optional audio feedback for events
- **Keyboard Shortcuts**: SPACE to roll, B to bank
- **Mobile Responsive**: Works on phones and tablets

## Default Configuration

```json
{
  "totalRounds": 20,
  "volume": 50,
  "players": [
    { "id": 1, "name": "Player 1" },
    { "id": 2, "name": "Player 2" },
    { "id": 3, "name": "Player 3" },
    { "id": 4, "name": "Player 4" }
  ]
}
```

## Files

| File | Description |
|------|-------------|
| `index.html` | Game UI and structure |
| `style.css` | Visual styling (dark theme) |
| `script.js` | BankGame class and logic |

## Strategy Tips

1. **Early Rolls Are Safe**: Use the first 3 rolls to build the bank without risk
2. **Watch for Doubles**: After roll 3, doubles can massively increase the bank
3. **Bank Before 7**: The odds of rolling a 7 are 1/6 (16.7%) - don't be greedy!
4. **Let Others Risk**: If the bank is high, consider banking early and letting others take the risk
5. **Last Player Advantage**: The last unbaked player can keep rolling and take all remaining points

## Credits

Game rules adapted from [ThunderHive Games](https://www.thunderhivegames.com/) BANK app.
