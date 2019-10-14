Two modes

* single - single player mode, everything runs in browser
* multi - multiplayer mode - WebSocket + backend

# Single mode
## Build
```bash
npm run build:single
```
Then open `./dist/single/index.html`

# Dev server
```bash
npm dev-server:single
```
Should auto open `localhost:8080` in browser.
Hot Module Replacement is on (single.html change will not trigger HMR).

# Multi mode
## Build
Builds frontend only
```bash
npm run build:multi
```

## Frontend dev server
```bash
npm dev-server:multi
```
Should auto open `localhost:8080` in browser.

Proxies WebSocket connections to backend at ws://localhost:8080/echo (need to run backend to work).

Hot Module Replacement is on (asteroids.html change will not trigger HMR).

## Backend
```bash
npm run start
```

* Serves client `/dist` at `/`
* WebSocket at ws://localhost:8080/echo
* server side Hot Moudle Replacement is on