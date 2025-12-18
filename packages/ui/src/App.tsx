import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GameLobbyPage from './pages/GameLobbyPage';
import GamePage from './pages/GamePage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lobby/:gameId" element={<GameLobbyPage />} />
          <Route path="/game/:gameId" element={<GamePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
