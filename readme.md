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
npm run dev-server:single
```
Should auto open `localhost:8000` in browser.
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
Should auto open `localhost:8000` in browser.

Proxies WebSocket connections to backend at ws://localhost:8000/echo (need to run backend to work).

Hot Module Replacement is on (asteroids.html change will not trigger HMR).

## Backend
```bash
npm run start
```

* Serves client `/dist` at `/`
* WebSocket at ws://localhost:8000/echo
* server side Hot Moudle Replacement is on

# Simulated latency (toxiproxy)

```
docker-compose up
```

Navigate to `http://localhost:8010`

* toxiproxy is proxying tcp `localhost:8010` to `docker.for.win.localhost:8000`
* toxiproxy control endpoint: `localhost:8474`

## Add latency of 300 ms, 100 ms jitter (both directions)
```
curl -X POST localhost:8474/proxies/asteroids/toxics --data '{"type": "latency", "stream":"downstream", "attributes": {"latency": 300, "jitter": 100}}'
curl -X POST localhost:8474/proxies/asteroids/toxics --data '{"type": "latency", "stream":"upstream", "attributes": {"latency": 300, "jitter": 100}}'
```

## Update latency
```
curl -X POST localhost:8474/proxies/asteroids/toxics/latency_downstream --data '{"attributes": {"latency": 50, "jitter": 10}}'
curl -X POST localhost:8474/proxies/asteroids/toxics/latency_upstream --data '{"attributes": {"latency": 50, "jitter": 10}}'
```
