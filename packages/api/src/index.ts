import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { gameRoutes } from './routes/games';
import { actionRoutes } from './routes/actions';

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/games', gameRoutes);
app.use('/api/games', actionRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
});

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🎮 World Battle API server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🎲 API endpoint: http://localhost:${PORT}/api/games`);
  });
}

export { app };
