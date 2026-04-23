// Shared mock data pulled from the real repo state
window.__DASHBOARD_DATA = [
  {
    project: "Project Dashboard",
    repo: "project-dashboard",
    description: "Personal command center — cross-project dashboard",
    updated: "2026-04-22",
    staleDays: 0,
    priorities: [
      "Rewrite dashboard to fetch live from GitHub Contents API",
      "Configure Cloudflare Pages auto-deploy",
      "Wire up first project card (self-referential)",
    ],
    stack: "Cloudflare Pages · GitHub API · Vanilla JS",
  },
  {
    project: "Kasette",
    repo: "kasette",
    description: "Mixtape-era audio sketchpad for long-form listening",
    updated: "2026-04-15",
    staleDays: 7,
    priorities: [
      "Ship side-A / side-B crossfade engine",
      "Design tape-deck transport controls",
      "Import from local folder → virtual cassette",
    ],
    stack: "Web Audio · Svelte · IndexedDB",
  },
  {
    project: "Tiny Path",
    repo: "tiny-path",
    description: "Micro-GPS route keeper for neighborhood walks",
    updated: "2026-04-08",
    staleDays: 14,
    priorities: [
      "Geolocation polyline simplification pass",
      "Offline-first tile caching",
      "Share-a-walk export as image postcard",
    ],
    stack: "PWA · Leaflet · Service Worker",
  },
  {
    project: "Cadence",
    repo: "cadence",
    description: "Gentle rhythm tracker for daily writing practice",
    updated: "2026-03-28",
    staleDays: 25,
    priorities: [
      "Streak view with calm non-shaming visuals",
      "Local-first markdown capture",
    ],
    stack: "SvelteKit · Local-first",
  },
  {
    project: "ORDOBook",
    repo: "ORDOBook",
    description: "Long-form field notebook for the ORDO projects",
    updated: "2026-04-20",
    staleDays: 2,
    priorities: [
      "Table of contents auto-generation",
      "Cross-link backref sidebar",
      "Print-perfect stylesheet",
    ],
    stack: "Astro · MDX · Pagedjs",
  },
];
