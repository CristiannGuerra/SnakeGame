import { Routes, Route } from 'react-router-dom';
import SnakeGame from './pages/SnakeGame';
import Top5Leaderboard from './pages/Top5Leaderboard';

function App() {
  return (
    <Routes>
      <Route index path="/" element={<SnakeGame />} />
      <Route path="/top5" element={<Top5Leaderboard />} />
    </Routes>
  );
}

export default App;