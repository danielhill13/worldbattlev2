import { useParams } from 'react-router-dom';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="card max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🎮 Game In Progress
        </h1>
        <p className="text-gray-400 mb-6">
          Game ID: {gameId}
        </p>
        <p className="text-gray-500">
          Game UI coming in next checkpoint...
        </p>
      </div>
    </div>
  );
}
