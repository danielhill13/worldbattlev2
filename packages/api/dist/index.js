"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const games_1 = require("./routes/games");
const actions_1 = require("./routes/actions");
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Routes
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/games', games_1.gameRoutes);
app.use('/api/games', actions_1.actionRoutes);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            code: 'NOT_FOUND',
            message: 'Route not found'
        }
    });
});
// Error handler
app.use((err, req, res, next) => {
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
//# sourceMappingURL=index.js.map