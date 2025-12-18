# Troubleshooting: "Game Not Found" Error

## Issue
Getting "Game not found" error when trying to join a game, even with the correct game code.

## Common Causes

### 1. API Server Not Running
The games are stored **in-memory** on the API server. If the server restarts, all games are lost.

**Solution:**
```bash
# Make sure API server is running
cd packages/api
npm run dev

# Should see: "World Battle API server running on http://localhost:3000"
```

### 2. Wrong API URL
The UI might be pointing to the wrong API endpoint.

**Check:**
1. Open browser console (F12)
2. Look for API requests - should be going to `http://localhost:3000/api`
3. Check for CORS errors

**Fix if needed:**
Create `packages/ui/.env.local`:
```bash
VITE_API_URL=http://localhost:3000/api
```

### 3. Game Code Formatting
Make sure you're copying the **full UUID**, not a shortened version.

**Correct format:**
```
550e8400-e29b-41d4-a716-446655440000
```

### 4. API Server Restarted
If you restart the API server, all games in memory are lost.

**Solution:**
- Don't restart the API server between creating and joining
- Or create and join from the same browser session quickly

## Debugging Steps

### Step 1: Test API Directly

Run the test script:
```bash
# From project root
node test-api.js
```

This will:
- Create a game
- Get the game
- Join the game
- List all games

If this works, the API is fine. If it fails, there's an API issue.

### Step 2: Check Browser Console

1. Open browser dev tools (F12)
2. Go to Console tab
3. Try to join a game
4. Look for:
   - `API Request: POST http://localhost:3000/api/games/.../join`
   - `API Response: 404` or `200`
   - Any error messages

### Step 3: Check Network Tab

1. Open browser dev tools (F12)
2. Go to Network tab
3. Try to join a game
4. Click on the `/join` request
5. Check:
   - Request URL
   - Request payload (should have playerName)
   - Response (error message)

### Step 4: Verify Game Exists

```bash
# Get the game ID from the lobby URL
# e.g., http://localhost:5173/lobby/550e8400-e29b-41d4-a716-446655440000

# Test with curl
curl http://localhost:3000/api/games/550e8400-e29b-41d4-a716-446655440000

# Should return game data, not 404
```

## Working Test Flow

Here's a flow that should work:

### Terminal 1: API Server
```bash
cd packages/api
npm run dev
# Leave running
```

### Terminal 2: UI Dev Server
```bash
cd packages/ui
npm run dev
# Leave running
```

### Browser 1: Create Game
1. Go to http://localhost:5173
2. Enter name "Alice"
3. Click "Create New Game"
4. You're now in lobby
5. **Don't close this tab**
6. Copy the full game ID from the URL or the game code display

### Browser 2: Join Game (Incognito or different browser)
1. Go to http://localhost:5173
2. Enter name "Bob"
3. **Paste the full game ID** into game code field
4. Click "Join Game"
5. Should work!

## Still Not Working?

### Check if game actually exists:

```bash
# List all games
curl http://localhost:3000/api/games

# Should return array with your game
```

### Create a game with curl and try to join:

```bash
# Create game
RESPONSE=$(curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestUser"}')

echo $RESPONSE

# Extract gameId from response
GAME_ID=$(echo $RESPONSE | grep -o '"gameId":"[^"]*' | grep -o '[^"]*$')

echo "Game ID: $GAME_ID"

# Try to join
curl -X POST http://localhost:3000/api/games/$GAME_ID/join \
  -H "Content-Type: application/json" \
  -d '{"playerName":"TestUser2"}'

# Should succeed
```

## Known Issues

1. **In-memory storage** - Games are lost on API restart
2. **No persistence** - Refreshing browser may cause issues
3. **Polling** - Lobby polls every 2 seconds, so there may be slight delays

## Quick Fix Test

Try this minimal flow:

```bash
# 1. Make sure API is running
cd packages/api && npm run dev

# 2. In another terminal, run the test
cd ../..
node test-api.js

# If this works, the API is fine
# If not, there's an issue with the API setup
```

If test script works but UI doesn't:
- Check browser console for errors
- Verify UI is hitting correct API URL
- Check for CORS errors
- Try clearing browser cache

## Need More Help?

Share:
1. Browser console output
2. Network tab screenshot showing the failed request
3. Output of `node test-api.js`
4. Output of `curl http://localhost:3000/health`
