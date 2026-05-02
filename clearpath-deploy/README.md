# ClearPath — Traffic Intelligence App

Your personal commute app that aggregates TomTom + Google Maps for the most reliable routing.

---

## Folder Structure

```
clearpath/
├── netlify.toml                  ← Netlify config (routing + headers)
├── .env.example                  ← Template for your API keys
├── .gitignore                    ← Keeps .env out of git
├── public/
│   └── index.html               ← The app (served to users)
└── netlify/
    └── functions/
        ├── tomtom-traffic.js    ← TomTom proxy (flow + incidents + routing)
        └── google-maps.js       ← Google Maps proxy (directions + matrix)
```

---

## Deploy in 5 Steps

### Step 1 — Regenerate your API keys (IMPORTANT)
Both keys shared previously are compromised. Get fresh ones:

- **TomTom:** developer.tomtom.com → Dashboard → API Keys → Regenerate
- **Google Maps:** console.cloud.google.com → APIs & Services → Credentials → Regenerate
  - Enable: Directions API, Distance Matrix API
  - Add HTTP referrer restriction to your Netlify domain

### Step 2 — Create a GitHub repo
```bash
cd clearpath
git init
git add .
git commit -m "Initial ClearPath deploy"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/clearpath.git
git push -u origin main
```

### Step 3 — Connect to Netlify
1. Go to app.netlify.com → "Add new site" → "Import an existing project"
2. Connect your GitHub account → select the `clearpath` repo
3. Build settings are auto-detected from `netlify.toml`
4. Click **Deploy site**

### Step 4 — Add your API keys (keep them secret)
In Netlify dashboard:
- Site Settings → Environment Variables → Add variable

Add these two:
```
TOMTOM_API_KEY      = your_new_tomtom_key
GOOGLE_MAPS_API_KEY = your_new_google_maps_key
```

Then: Deploys → Trigger deploy → Deploy site

### Step 5 — Open your live URL
Netlify gives you a URL like `https://clearpath-abc123.netlify.app`
Bookmark it — works on desktop and mobile.

---

## Customise Your Commute

Edit `public/index.html` — find the CONFIG block near the top of the `<script>`:

```javascript
const CONFIG = {
  home: { lat: 17.9970, lon: -76.7936, label: "Home — Kingston" },
  work: { lat: 18.0100, lon: -76.7890, label: "Work — New Kingston" },
  bbox: "-76.85,17.95,-76.75,18.05",   // bounding box for incident search
  refreshMs: 60000,                      // auto-refresh interval (ms)
};
```

Change the coordinates to match your actual home and work locations.
Use Google Maps to find lat/lon: right-click any location → "What's here?"

---

## How the API Proxy Works

```
Browser  →  /api/tomtom-traffic   →  Netlify Function  →  TomTom API
Browser  →  /api/google-maps      →  Netlify Function  →  Google Maps API
```

Your API keys never leave the server. The browser only talks to your own Netlify domain.

---

## Features
- Live route comparison (Google Directions API with traffic)
- Real-time incident feed (TomTom Incidents API)
- Traffic flow heatmap (TomTom Flow API)
- Best departure time chart (congestion forecast)
- Saved home + work locations
- Auto-refreshes every 60 seconds
- Falls back to demo data if APIs are unavailable
