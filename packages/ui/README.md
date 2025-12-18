# World Battle UI

React frontend for World Battle game.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
# Start dev server (runs on http://localhost:5173)
npm run dev
```

Make sure the API server is running on http://localhost:3000

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components (routes)
├── hooks/          # Custom React hooks
├── utils/          # Utilities (API client, helpers)
├── types/          # TypeScript type definitions
├── App.tsx         # Main app component with routing
├── main.tsx        # React entry point
└── index.css       # Global styles (Tailwind)
```

## Features

### Checkpoint 3.1 (Current)
- ✅ Home page (create/join game)
- ✅ Game lobby (player list, start game)
- ✅ API client integration
- ✅ Routing setup
- ✅ Tailwind styling

### Coming Soon
- Game map visualization
- Turn-based gameplay UI
- Attack/fortify controls
- Card trading
- Battle animations

## Environment Variables

Create `.env.local` file:

```bash
VITE_API_URL=http://localhost:3000/api
```

## API Proxy

The dev server proxies `/api/*` requests to `http://localhost:3000` automatically (configured in `vite.config.ts`).

## Development Workflow

1. Start API server: `cd packages/api && npm run dev`
2. Start UI dev server: `cd packages/ui && npm run dev`
3. Open http://localhost:5173
4. Make changes (hot reload enabled)

## Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code

## Styling

Using Tailwind CSS with custom theme:

- Dark mode by default
- Custom player colors
- Component classes (btn, card, input)
- Responsive design

See `tailwind.config.js` for theme configuration.
