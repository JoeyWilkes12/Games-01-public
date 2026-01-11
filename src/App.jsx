import { Routes, Route } from 'react-router-dom'
import GameHub from './pages/GameHub'
import Definitions from './pages/Definitions'
import Dashboard from './pages/Dashboard'
import Research from './pages/Research'
import Bank from './games/Bank'
import Game2048 from './games/Game2048'
import SlidingPuzzle from './games/SlidingPuzzle'
import RandomEventDice from './games/RandomEventDice'

function App() {
  return (
    <Routes>
      <Route path="/" element={<GameHub />} />
      <Route path="/definitions" element={<Definitions />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/research" element={<Research />} />
      <Route path="/games/bank" element={<Bank />} />
      <Route path="/games/2048" element={<Game2048 />} />
      <Route path="/games/sliding-puzzle" element={<SlidingPuzzle />} />
      <Route path="/games/random-event-dice" element={<RandomEventDice />} />
    </Routes>
  )
}

export default App

