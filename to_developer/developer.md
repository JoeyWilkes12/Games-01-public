# Developer Guide: Game Hub

Welcome! This guide will help you understand, run, modify, and deploy the Game Hub application. Whether you're new to web development or just new to this stack, this document will get you up to speed.

---

## Table of Contents

1. [Introduction to the Stack](#introduction-to-the-stack)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Understanding the Code](#understanding-the-code)
6. [Running Tests](#running-tests)
7. [Deploying to GitHub Pages](#deploying-to-github-pages)
8. [Making Changes](#making-changes)
9. [Learning Resources](#learning-resources)

---

## Introduction to the Stack

This project uses a modern web development stack:

### React 18
**What it is:** A JavaScript library for building user interfaces using components.

**Key concepts:**
- **Components**: Reusable UI pieces (like `GameCard`, `HomeButton`)
- **Hooks**: Functions that let you use state and effects (like `useState`, `useEffect`)
- **JSX**: HTML-like syntax in JavaScript files (`.jsx`)

```jsx
// Example: A simple React component
function Welcome({ name }) {
  return <h1>Hello, {name}!</h1>;
}
```

📚 [React Documentation](https://react.dev/learn)

### Vite
**What it is:** A fast build tool and development server.

**Why we use it:**
- Instant server start (no waiting)
- Hot Module Replacement (changes appear immediately)
- Optimized production builds

📚 [Vite Documentation](https://vitejs.dev/guide/)

### Tailwind CSS
**What it is:** A utility-first CSS framework.

**How it works:**
Instead of writing CSS files, you add classes directly to HTML:

```html
<!-- Traditional CSS approach -->
<div class="card">...</div>

<!-- Tailwind approach -->
<div class="bg-white rounded-lg shadow-md p-4">...</div>
```

**Key concepts:**
- `p-4` = padding of 1rem (16px)
- `bg-blue-500` = blue background
- `md:text-lg` = larger text on medium+ screens
- `hover:bg-blue-600` = darker on hover

📚 [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### React Router
**What it is:** Navigation for React applications.

**How it works:**
```jsx
<Routes>
  <Route path="/" element={<GameHub />} />
  <Route path="/games/2048" element={<Game2048 />} />
</Routes>
```

📚 [React Router Documentation](https://reactrouter.com/en/main)

---

## Prerequisites

Before starting, install these tools:

### 1. Node.js (v18 or higher)
Download from: https://nodejs.org/

Verify installation:
```bash
node --version  # Should show v18.x.x or higher
npm --version   # Should show 9.x.x or higher
```

### 2. Git
Download from: https://git-scm.com/

### 3. Code Editor (Recommended: VS Code)
Download from: https://code.visualstudio.com/

**Recommended VS Code extensions:**
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Prettier - Code formatter
- ESLint

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/JoeyWilkes12/Games-01-public.git
cd Games-01-public
```

### 2. Install Dependencies
```bash
npm install
```

This reads `package.json` and installs all required packages into `node_modules/`.

### 3. Start the Development Server
```bash
npm run dev
```

You should see:
```
  VITE v6.4.1  ready in 200 ms

  ➜  Local:   http://localhost:5173/Games-01-public/
  ➜  press h + enter to show help
```

### 4. Open in Browser
Navigate to: http://localhost:5173/Games-01-public/

**Hot Module Replacement (HMR):** Edit any file and save - changes appear instantly without refreshing!

### 5. Stop the Server
Press `Ctrl+C` in the terminal.

---

## Project Structure

```
Games-01-public/
├── index.html              # Entry HTML file
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS (used by Tailwind)
├── playwright.config.js    # Test configuration
│
├── src/                    # Source code
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Main app with routes
│   ├── index.css          # Global styles + Tailwind
│   │
│   ├── components/        # Reusable UI components
│   │   ├── GameCard.jsx
│   │   ├── HomeButton.jsx
│   │   ├── ConfirmExitModal.jsx
│   │   └── Toast.jsx
│   │
│   ├── pages/             # Page components
│   │   ├── GameHub.jsx    # Landing page
│   │   ├── Definitions.jsx
│   │   ├── Dashboard.jsx
│   │   └── Research.jsx
│   │
│   └── games/             # Individual games
│       ├── Bank/
│       │   ├── index.jsx          # Main component
│       │   ├── hooks/useBankGame.js  # Game logic
│       │   └── utils.js           # Helper functions
│       ├── Game2048/
│       ├── SlidingPuzzle/
│       └── RandomEventDice/
│
├── tests/                  # Playwright tests
│   └── react-migration.spec.js
│
├── dist/                   # Production build output
│
├── _original/              # Backup of original vanilla JS
│
└── to_developer/           # This documentation
    ├── developer.md
    └── alternatives.md
```

### Key Files Explained

| File | Purpose |
|------|---------|
| `package.json` | Lists dependencies and npm scripts |
| `vite.config.js` | Configures Vite (base path, plugins) |
| `tailwind.config.js` | Customizes Tailwind (colors, fonts) |
| `src/main.jsx` | Bootstraps React into the DOM |
| `src/App.jsx` | Defines all routes |
| `src/index.css` | Global styles and Tailwind directives |

---

## Understanding the Code

### Component Pattern

Each game follows this pattern:

```
games/[GameName]/
├── index.jsx              # UI Component (what you see)
├── hooks/use[GameName].js # Logic Hook (how it works)
└── utils.js               # Helper functions (optional)
```

**Example: 2048 Game**

```jsx
// hooks/useGame2048.js - The Logic
export default function useGame2048() {
  const [board, setBoard] = useState(/* initial state */);
  const [score, setScore] = useState(0);
  
  const move = (direction) => { /* move logic */ };
  const startNewGame = () => { /* reset logic */ };
  
  return { board, score, move, startNewGame };
}

// index.jsx - The UI
export default function Game2048() {
  const game = useGame2048();  // Get the logic
  
  return (
    <div>
      <h1>2048</h1>
      <GameGrid board={game.board} />
      <button onClick={game.startNewGame}>New Game</button>
    </div>
  );
}
```

### Responsive Design

Tailwind uses a mobile-first approach:

```jsx
// Default styles apply to mobile
// md: applies at 768px+
// lg: applies at 1024px+
// xl: applies at 1280px+

<div className="
  grid grid-cols-1    /* Mobile: 1 column */
  md:grid-cols-2      /* Tablet: 2 columns */
  lg:grid-cols-3      /* Desktop: 3 columns */
  xl:grid-cols-4      /* Large desktop: 4 columns */
">
```

---

## Running Tests

### Install Playwright Browsers
```bash
npx playwright install chromium
```

### Run All Tests
```bash
./run-all-tests.sh
```

### Run Specific Tests
```bash
# React migration tests
npx playwright test tests/react-migration.spec.js --project=react-tests

# With visible browser
npx playwright test --project=react-tests --headed

# Single test by name
npx playwright test --grep="2048"
```

### View Test Report
```bash
npx playwright show-report
```

📚 [Playwright Documentation](https://playwright.dev/docs/intro)

---

## Deploying to GitHub Pages

### Prerequisites
1. A GitHub account
2. Repository pushed to GitHub

### Step 1: Configure Vite for GitHub Pages

The `vite.config.js` is already configured:

```javascript
export default defineConfig({
  base: '/Games-01-public/',  // Your repo name
  // ...
})
```

### Step 2: Build the Production Bundle
```bash
npm run build
```

This creates optimized files in `dist/`.

### Step 3: Preview the Build Locally
```bash
npm run preview
```

Visit http://localhost:4173/Games-01-public/ to verify.

### Step 4: Deploy to GitHub Pages

**Option A: Manual Deploy**
```bash
# Install gh-pages package
npm install -D gh-pages

# Add to package.json scripts:
# "deploy": "gh-pages -d dist"

npm run build
npm run deploy
```

**Option B: GitHub Actions (Recommended)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Step 5: Configure GitHub Pages

1. Go to your repository on GitHub
2. Settings → Pages
3. Source: "Deploy from a branch"
4. Branch: `gh-pages` / `root`
5. Save

Your site will be live at: `https://[username].github.io/[repo-name]/`

---

## Making Changes

### Adding a New Game

1. Create folder structure:
```
src/games/MyNewGame/
├── index.jsx
└── hooks/useMyNewGame.js
```

2. Create the logic hook:
```jsx
// hooks/useMyNewGame.js
import { useState } from 'react';

export default function useMyNewGame() {
  const [score, setScore] = useState(0);
  // Add your game logic here
  return { score };
}
```

3. Create the component:
```jsx
// index.jsx
import { HomeButton } from '../../components';
import useMyNewGame from './hooks/useMyNewGame';

export default function MyNewGame() {
  const game = useMyNewGame();
  
  return (
    <div className="min-h-screen p-4">
      <HomeButton />
      <h1 className="text-4xl font-bold">My New Game</h1>
      <p>Score: {game.score}</p>
    </div>
  );
}
```

4. Add route in `App.jsx`:
```jsx
import MyNewGame from './games/MyNewGame';

// In Routes:
<Route path="/games/my-new-game" element={<MyNewGame />} />
```

5. Add card in `GameHub.jsx`:
```jsx
<GameCard
  name="My New Game"
  description="Description here"
  to="/games/my-new-game"
  icon="🎮"
  gradient="from-green-500 to-teal-600"
/>
```

### Modifying Styles

**Option 1: Tailwind Classes (Preferred)**
```jsx
<button className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded">
  Click Me
</button>
```

**Option 2: Custom CSS in index.css**
```css
/* src/index.css */
@layer components {
  .my-custom-button {
    @apply bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded;
  }
}
```

### Best Practices

1. **Keep components small** - If over 200 lines, split it
2. **Use semantic HTML** - `<header>`, `<main>`, `<section>`
3. **Extract logic to hooks** - Keep components focused on UI
4. **Mobile-first** - Design for small screens, enhance for large
5. **Test your changes** - Run `npm run build` before deploying

---

## Learning Resources

### React
- [Official React Tutorial](https://react.dev/learn)
- [React Hooks Guide](https://react.dev/reference/react)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

### Vite
- [Vite Getting Started](https://vitejs.dev/guide/)
- [Vite Config Reference](https://vitejs.dev/config/)

### Tailwind CSS
- [Tailwind Installation](https://tailwindcss.com/docs/installation)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Tailwind UI Examples](https://tailwindui.com/components/preview)

### Testing
- [Playwright Getting Started](https://playwright.dev/docs/intro)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)

### Deployment
- [GitHub Pages Guide](https://docs.github.com/en/pages)
- [Vite Deployment Docs](https://vitejs.dev/guide/static-deploy.html#github-pages)

### Video Tutorials
- [React Course for Beginners](https://www.youtube.com/watch?v=SqcY0GlETPk) - Programming with Mosh
- [Tailwind CSS Crash Course](https://www.youtube.com/watch?v=UBOj6rqRUME) - Traversy Media
- [Vite in 100 Seconds](https://www.youtube.com/watch?v=KCrXgy8qtjM) - Fireship

---

## Getting Help

1. **Check the console** - Browser DevTools (F12) shows errors
2. **Read error messages** - They often tell you exactly what's wrong
3. **Search the error** - Stack Overflow has most answers
4. **Ask AI assistants** - Describe your problem clearly

**Common Issues:**

| Problem | Solution |
|---------|----------|
| "Module not found" | Run `npm install` |
| Page blank | Check console for errors |
| Styles not applying | Ensure class names are correct |
| Build fails | Read error message, fix the issue |
| Tests fail | Run with `--headed` to see what's happening |

---

Happy coding! 🚀
