# Galaxy Navigation — Reference for Wild Stewart Homeschool

**Source repo:** `driver-cyber/project-dashboard`
**Live demo:** `projects.chadstewartcpa.com` → Galaxy tab
**Author note:** This reference was extracted specifically for adapting the galaxy scene into a lesson-navigation UI. Planets = lessons, ship flies between them, tapping a planet opens its content.

---

## What to copy / what to adapt

| Element | In project-dashboard | In Wild Stewart |
|---|---|---|
| `.galaxy-wrap` background | Dark radial gradient — space scene | Keep as-is |
| `.galaxy-sun` | Center of the galaxy | Replace with spaceship sprite (or keep sun and add ship) |
| Planets | One per project repo | One per lesson |
| Planet size | Scaled by accomplishment count | Scaled by lesson length / activities |
| `.planet.dim` | Zero-count repos (muted) | Completed lessons (muted/checked style) |
| Moons | Accomplishments orbiting a planet | Sub-activities / steps within a lesson |
| `PLANET_PALETTE` | Color per repo | Color per subject or unit |
| `learned-log.json` merge | Rich data from log file | **Not needed** — lesson data comes from your own data structure |
| `warpTo()` zoom | Zooms to clicked planet, then shows detail | Same — or swap detail view for lesson content |
| Ship animation | Not present | Add: CSS `@keyframes` translating a ship sprite from center to clicked planet before warp |

---

## HTML Structure

```html
<section id="panel-galaxy" class="tab-panel">
  <div class="galaxy-wrap" id="galaxy-wrap">
    <div class="galaxy-hud">
      Lessons
      <span class="sub">Tap a planet to begin</span>
    </div>
    <div class="galaxy-stage" id="galaxy-stage">
      <!-- stars, orbit rings, planets injected by JS -->
      <div class="galaxy-sun"></div>
      <!-- Optional: add a .galaxy-ship div here for the spaceship sprite -->
    </div>
    <div class="galaxy-stats" id="galaxy-stats"></div>
    <div class="planet-detail" id="planet-detail">
      <button class="planet-detail-back" id="planet-detail-back">← Back</button>
      <div class="planet-detail-center" id="planet-detail-center"></div>
      <div class="moon-field" id="moon-field"></div>
    </div>
  </div>
</section>
```

---

## CSS

```css
/* ===================== GALAXY TAB ===================== */
#panel-galaxy { padding: 0; }
.galaxy-wrap {
  position: relative;
  width: 100%;
  height: calc(100vh - 180px);
  min-height: 540px;
  background: radial-gradient(ellipse at center, #1a2236 0%, #0a0e1c 55%, #05070f 100%);
  overflow: hidden;
  border-radius: 0;
  isolation: isolate;
}
.galaxy-stage {
  position: absolute; inset: 0;
  transform-origin: 50% 50%;
  transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1);
}
.galaxy-stage.warping { transform: scale(8) translateZ(0); }

/* Star field */
.star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  pointer-events: none;
  transform-origin: 50% 50%;
  transition: transform 1.2s cubic-bezier(0.7, 0, 0.3, 1), opacity 0.5s ease;
}
.galaxy-stage.warping .star {
  transform: scaleY(40) translateY(0);
  opacity: 0.6;
}
.star.s1 { width: 1px;  height: 1px;  opacity: 0.45; }
.star.s2 { width: 2px;  height: 2px;  opacity: 0.7;  }
.star.s3 { width: 3px;  height: 3px;  opacity: 0.9;  box-shadow: 0 0 4px rgba(255,255,255,0.6); }
@keyframes twinkle { 0%, 100% { opacity: var(--o, 0.6); } 50% { opacity: 0.15; } }
.star.tw { animation: twinkle 4s ease-in-out infinite; }

/* Sun / center body */
.galaxy-sun {
  position: absolute;
  left: 50%; top: 50%;
  width: 64px; height: 64px;
  margin-left: -32px; margin-top: -32px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #FFE9A8 0%, #F2C46A 40%, #B8732A 80%);
  box-shadow:
    0 0 30px rgba(255, 200, 120, 0.7),
    0 0 70px rgba(255, 170, 80, 0.4),
    0 0 130px rgba(255, 140, 60, 0.25);
  pointer-events: none;
  z-index: 3;
  animation: sun-pulse 6s ease-in-out infinite;
}
@keyframes sun-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }

/* Orbital rings (subtle dashed) */
.orbit-ring {
  position: absolute;
  left: 50%; top: 50%;
  border: 1px dashed rgba(255,255,255,0.06);
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

/* Planets */
.planet {
  position: absolute;
  border-radius: 50%;
  cursor: pointer;
  z-index: 2;
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease, opacity 0.4s ease;
  transform-origin: 50% 50%;
}
.planet:hover { transform: scale(1.15); }
.planet.dim { opacity: 0.45; filter: saturate(0.6); }  /* completed lessons */
.planet.dim:hover { opacity: 0.75; }
.planet-glyph {
  position: absolute;
  left: 50%; top: 105%;
  transform: translateX(-50%);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.78);
  white-space: nowrap;
  text-shadow: 0 0 8px rgba(0,0,0,0.6);
  pointer-events: none;
  transition: opacity 0.4s ease;
}
.galaxy-stage.warping .planet-glyph { opacity: 0; }
.planet-glyph .count {
  display: inline-block;
  margin-left: 6px;
  padding: 1px 6px;
  font-size: 10px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  color: rgba(255,255,255,0.85);
}

/* HUD (top-left title) */
.galaxy-hud {
  position: absolute;
  top: 16px; left: 18px;
  color: rgba(255,255,255,0.85);
  font-size: 22px;
  letter-spacing: 0.02em;
  pointer-events: none;
  z-index: 5;
  text-shadow: 0 0 12px rgba(0,0,0,0.7);
}
.galaxy-hud .sub {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-top: 4px;
}

/* Stats (bottom-left) */
.galaxy-stats {
  position: absolute;
  bottom: 18px; left: 18px;
  color: rgba(255,255,255,0.55);
  font-size: 11px;
  line-height: 1.7;
  pointer-events: none;
  z-index: 5;
}
.galaxy-stats b { color: rgba(255,255,255,0.85); font-weight: 500; }
.galaxy-stats .row { white-space: nowrap; }

/* Planet detail view */
.planet-detail {
  position: absolute;
  inset: 0;
  display: none;
  z-index: 10;
  background: radial-gradient(ellipse at center, #1a2236 0%, #05070f 80%);
  animation: fade-in 0.6s ease;
}
.planet-detail.active { display: block; }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

.planet-detail-back {
  position: absolute;
  top: 16px; left: 16px;
  padding: 8px 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.85);
  border-radius: 999px;
  font-size: 13px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  z-index: 12;
  transition: background 0.15s ease;
}
.planet-detail-back:hover { background: rgba(255,255,255,0.12); }

.planet-detail-center {
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  z-index: 11;
}
.planet-hero {
  width: 96px; height: 96px;
  border-radius: 50%;
  margin: 0 auto 18px;
  box-shadow: 0 0 60px rgba(255,255,255,0.18);
}
.planet-detail-center h2 {
  font-size: 36px;
  color: rgba(255,255,255,0.95);
  margin-bottom: 6px;
  font-weight: 400;
}
.planet-detail-center .meta {
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.planet-detail-center .meta-tags {
  margin-top: 10px;
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  max-width: 320px;
}

/* Moons */
.moon-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
@keyframes moon-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.moon-ring {
  position: absolute;
  left: 50%; top: 50%;
  transform-origin: 50% 50%;
  border-radius: 50%;
  animation: moon-orbit linear infinite;
}
.moon {
  position: absolute;
  width: 18px; height: 18px;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: auto;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  transform: translate(-50%, -50%);
}
.moon:hover {
  transform: translate(-50%, -50%) scale(1.45);
  box-shadow: 0 0 18px rgba(255,255,255,0.5);
}
.moon.aha::after {
  content: '✦';
  position: absolute;
  left: 50%; top: -14px;
  transform: translateX(-50%);
  font-size: 11px;
  color: #FFD27A;
  text-shadow: 0 0 6px #FFD27A;
}
.moon.first::before {
  content: '★';
  position: absolute;
  left: 50%; top: -14px;
  transform: translateX(-50%);
  font-size: 11px;
  color: #B8E0FF;
  text-shadow: 0 0 6px #B8E0FF;
}

/* Moon detail card */
.moon-card {
  position: absolute;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: min(92%, 520px);
  max-height: 56vh;
  overflow-y: auto;
  background: rgba(20, 26, 40, 0.92);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 18px 20px 20px;
  color: rgba(255,255,255,0.92);
  font-size: 13.5px;
  line-height: 1.55;
  z-index: 13;
  box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  animation: card-rise 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes card-rise {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
.moon-card .mc-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.moon-card .mc-mood { font-size: 18px; }
.moon-card .mc-title {
  font-size: 19px;
  color: rgba(255,255,255,0.96);
  margin-bottom: 12px;
  line-height: 1.3;
  font-weight: 400;
}
.moon-card .mc-section {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.moon-card .mc-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}
.moon-card .mc-label {
  display: block;
  font-size: 10px;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.moon-card .mc-tags {
  display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px;
}
.moon-card .mc-tag {
  padding: 2px 9px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
  font-size: 11px;
  color: rgba(255,255,255,0.72);
}
.moon-card .mc-close {
  position: absolute;
  top: 10px; right: 12px;
  width: 26px; height: 26px;
  background: transparent;
  border: 0;
  color: rgba(255,255,255,0.5);
  font-size: 18px;
  cursor: pointer;
  line-height: 1;
}
.moon-card .mc-close:hover { color: rgba(255,255,255,0.95); }

/* Empty state */
.galaxy-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.6);
  font-size: 22px;
  letter-spacing: 0.02em;
}

/* ---- SHIP ANIMATION (add for Wild Stewart) ----
   Place a .galaxy-ship div inside .galaxy-stage.
   Before calling warpTo(), animate ship from center to planet coords,
   then trigger warp after ship arrives (~600ms).

.galaxy-ship {
  position: absolute;
  left: 50%; top: 50%;
  width: 32px; height: 32px;
  margin-left: -16px; margin-top: -16px;
  font-size: 28px;           /* use an emoji or SVG sprite */
  line-height: 1;
  z-index: 4;
  pointer-events: none;
  transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              top  0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
---- */
```

---

## JavaScript

The JS below is self-contained. For Wild Stewart, replace `PLANET_PALETTE` with your lesson color map and replace `mergeAccomplishments()` with your own lesson data loader. The warp + detail + moon machinery can be reused as-is.

```js
// ===================== GALAXY =====================

// Color palette keyed by lesson id or subject slug
const PLANET_PALETTE = {
  'lesson-1': { core: '#D4BC7A', glow: '#F4DDA0', name: 'Lesson 1' },
  'lesson-2': { core: '#8FA9C9', glow: '#B6CCE5', name: 'Lesson 2' },
  // add one entry per lesson / subject
};
const DEFAULT_PALETTE = { core: '#888', glow: '#bbb', name: 'unknown' };
function paletteFor(id) { return PLANET_PALETTE[id] || DEFAULT_PALETTE; }

let galaxyInited = false;
let galaxyData = null; // { byRepo: { id: { displayName, accomplishments:[] } }, allEntries:[] }
let galaxyProjectsList = []; // ordered list — drive order from your lesson list

async function initGalaxy() {
  if (galaxyInited) return;
  galaxyInited = true;

  // --- Replace this block with your lesson data loader ---
  // In project-dashboard this fetches projects.json + learned-log.json
  // + waits for tracker fetches to populate loadedResults.
  // For Wild Stewart: supply lessons array + completed items directly.
  //
  // Example shape expected by renderGalaxy():
  //   galaxyProjectsList = [{ repo: 'lesson-1' }, { repo: 'lesson-2' }, ...]
  //   galaxyData = {
  //     byRepo: {
  //       'lesson-1': {
  //         repo: 'lesson-1',
  //         displayName: 'Lesson 1 Title',
  //         accomplishments: [
  //           { title: 'Completed activity', date: '2026-04-30', tags: ['reading'], learned: '...' }
  //         ]
  //       }
  //     },
  //     allEntries: []   // flat array — drives stats HUD counts for aha/first_ever
  //   }
  // --------------------------------------------------------

  renderGalaxy();
}

function renderGalaxy() {
  const stage = document.getElementById('galaxy-stage');
  const wrap  = document.getElementById('galaxy-wrap');
  if (!stage || !galaxyData) return;

  // Clean prior planets/stars but keep the sun
  [...stage.querySelectorAll('.star, .planet, .orbit-ring')].forEach(el => el.remove());

  const rect = wrap.getBoundingClientRect();
  const w = rect.width  || window.innerWidth;
  const h = rect.height || 600;
  const cx = w / 2, cy = h / 2;

  // Star field
  const starCount = Math.min(180, Math.floor((w * h) / 1800));
  for (let i = 0; i < starCount; i++) {
    const s = document.createElement('div');
    const tier = Math.random();
    s.className = 'star ' + (tier < 0.55 ? 's1' : tier < 0.9 ? 's2' : 's3')
                + (Math.random() < 0.3 ? ' tw' : '');
    s.style.left = Math.random() * 100 + '%';
    s.style.top  = Math.random() * 100 + '%';
    s.style.setProperty('--o', (0.3 + Math.random() * 0.6).toFixed(2));
    s.style.animationDelay = (Math.random() * 4) + 's';
    stage.appendChild(s);
  }

  // Two elliptical orbit rings
  const a = Math.min(w * 0.40, 320);
  const b = Math.min(h * 0.34, 200);
  const ring1 = { a: a * 0.62, b: b * 0.62 };
  const ring2 = { a, b };

  [ring1, ring2].forEach(r => {
    const el = document.createElement('div');
    el.className = 'orbit-ring';
    el.style.width  = (r.a * 2) + 'px';
    el.style.height = (r.b * 2) + 'px';
    el.style.marginLeft = -r.a + 'px';
    el.style.marginTop  = -r.b + 'px';
    stage.appendChild(el);
  });

  // Place planets
  const projects = galaxyProjectsList.length
    ? galaxyProjectsList
    : Object.keys(galaxyData.byRepo).map(repo => ({ repo }));
  const N = projects.length;

  projects.forEach((p, i) => {
    const repo     = p.repo;
    const projData = galaxyData.byRepo[repo] || { accomplishments: [] };
    const count    = projData.accomplishments.length;
    const palette  = paletteFor(repo);

    const ring = (i % 2 === 0) ? ring1 : ring2;
    const angleOffset = (i % 2 === 0) ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / N;
    const theta = angleOffset + (i / N) * Math.PI * 2;
    const px = cx + ring.a * Math.cos(theta);
    const py = cy + ring.b * Math.sin(theta);

    // Size 18px (dim/empty) → 22–56px scaled by sqrt(count)
    const size = count === 0
      ? 18
      : Math.max(22, Math.min(56, 22 + Math.sqrt(count) * 6));

    const planet = document.createElement('div');
    planet.className = 'planet' + (count === 0 ? ' dim' : '');
    planet.style.width      = size + 'px';
    planet.style.height     = size + 'px';
    planet.style.left       = px + 'px';
    planet.style.top        = py + 'px';
    planet.style.marginLeft = -size / 2 + 'px';
    planet.style.marginTop  = -size / 2 + 'px';
    planet.style.background = `radial-gradient(circle at 32% 30%, ${palette.glow} 0%, ${palette.core} 60%, ${palette.core} 100%)`;
    planet.style.boxShadow  = `0 0 ${size * 0.7}px ${palette.core}66, inset -${size * 0.1}px -${size * 0.15}px ${size * 0.4}px rgba(0,0,0,0.35)`;
    planet.dataset.repo     = repo;

    const glyph = document.createElement('span');
    glyph.className = 'planet-glyph';
    glyph.innerHTML = `${palette.name}<span class="count">${count}</span>`;
    planet.appendChild(glyph);

    planet.addEventListener('click', () => warpTo(repo, planet, px, py));
    stage.appendChild(planet);
  });

  // Stats HUD
  const totalShipped  = Object.values(galaxyData.byRepo).reduce((s, p) => s + p.accomplishments.length, 0);
  const projectsLit   = Object.values(galaxyData.byRepo).filter(p => p.accomplishments.length > 0).length;
  const allTags       = new Set();
  Object.values(galaxyData.byRepo).forEach(p => p.accomplishments.forEach(a => (a.tags || []).forEach(t => allTags.add(t))));
  const ahaCount      = galaxyData.allEntries.filter(e => e.aha).length;
  const firstCount    = galaxyData.allEntries.filter(e => e.first_ever).length;
  document.getElementById('galaxy-stats').innerHTML = `
    <div class="row"><b>${totalShipped}</b> items across <b>${projectsLit}</b> active lesson${projectsLit === 1 ? '' : 's'}</div>
    <div class="row"><b>${allTags.size}</b> skills · <b>${ahaCount}</b> aha moments · <b>${firstCount}</b> firsts</div>
  `;
}

function warpTo(repo, planetEl, px, py) {
  const wrap  = document.getElementById('galaxy-wrap');
  const stage = document.getElementById('galaxy-stage');
  if (!stage) return;

  // Set transform-origin to clicked planet position so scale zooms toward it
  const rect = wrap.getBoundingClientRect();
  const ox = (px / rect.width)  * 100;
  const oy = (py / rect.height) * 100;
  stage.style.transformOrigin = `${ox}% ${oy}%`;

  // Optional ship animation — move .galaxy-ship to planet before warping:
  // const ship = document.querySelector('.galaxy-ship');
  // if (ship) { ship.style.left = px + 'px'; ship.style.top = py + 'px'; }

  requestAnimationFrame(() => {
    stage.classList.add('warping');
    setTimeout(() => showPlanetDetail(repo), 950); // 950ms matches CSS transition
  });
}

function showPlanetDetail(repo) {
  const detail    = document.getElementById('planet-detail');
  const center    = document.getElementById('planet-detail-center');
  const moonField = document.getElementById('moon-field');
  const stage     = document.getElementById('galaxy-stage');
  const palette   = paletteFor(repo);
  const proj      = galaxyData.byRepo[repo] || { accomplishments: [] };

  document.querySelectorAll('.moon-card').forEach(c => c.remove());

  const allTags = new Set();
  proj.accomplishments.forEach(a => (a.tags || []).forEach(t => allTags.add(t)));

  center.innerHTML = `
    <div class="planet-hero" style="background: radial-gradient(circle at 32% 30%, ${palette.glow} 0%, ${palette.core} 60%, ${palette.core} 100%); box-shadow: 0 0 80px ${palette.core}88, inset -10px -14px 36px rgba(0,0,0,0.35);"></div>
    <h2>${esc(palette.name)}</h2>
    <div class="meta">${proj.accomplishments.length} item${proj.accomplishments.length === 1 ? '' : 's'} · ${allTags.size} skill${allTags.size === 1 ? '' : 's'}</div>
    ${allTags.size ? `<div class="meta-tags">${[...allTags].slice(0, 12).join(' · ')}</div>` : ''}
  `;

  // Moons in orbit rings
  moonField.innerHTML = '';
  if (proj.accomplishments.length === 0) {
    const noteEl = document.createElement('div');
    noteEl.className = 'galaxy-empty';
    noteEl.style.cssText = 'bottom:20%; top:auto;';
    noteEl.textContent = 'Nothing here yet.';
    moonField.appendChild(noteEl);
  } else {
    const items = proj.accomplishments;
    const perRing = 8;
    const rings = Math.ceil(items.length / perRing);
    for (let r = 0; r < rings; r++) {
      const ringItems  = items.slice(r * perRing, (r + 1) * perRing);
      const ringRadius = 130 + r * 60;
      const ring = document.createElement('div');
      ring.className = 'moon-ring';
      ring.style.width  = (ringRadius * 2) + 'px';
      ring.style.height = (ringRadius * 2) + 'px';
      ring.style.marginLeft = -ringRadius + 'px';
      ring.style.marginTop  = -ringRadius + 'px';
      ring.style.animationDuration  = (60 + r * 25) + 's';
      if (r % 2 === 1) ring.style.animationDirection = 'reverse';

      ringItems.forEach((item, i) => {
        const angle = (i / ringItems.length) * Math.PI * 2;
        const mx = Math.cos(angle) * ringRadius;
        const my = Math.sin(angle) * ringRadius;
        const moon = document.createElement('div');
        const cls = ['moon'];
        if (item.aha)       cls.push('aha');
        if (item.first_ever) cls.push('first');
        moon.className = cls.join(' ');
        const baseSize = ({ quick: 14, session: 17, deep_dive: 20, marathon: 24 })[item.intensity] || 16;
        moon.style.width  = baseSize + 'px';
        moon.style.height = baseSize + 'px';
        moon.style.left = `calc(50% + ${mx}px)`;
        moon.style.top  = `calc(50% + ${my}px)`;
        moon.style.background = `radial-gradient(circle at 32% 30%, ${palette.glow} 0%, ${palette.core} 70%)`;
        moon.style.boxShadow  = `0 0 8px ${palette.core}aa`;
        moon.title = item.title;
        moon.addEventListener('click', e => { e.stopPropagation(); showMoonCard(item, palette); });
        ring.appendChild(moon);
      });
      moonField.appendChild(ring);
    }
  }

  detail.classList.add('active');
  stage.classList.remove('warping');
  stage.style.transformOrigin = '50% 50%';
}

function showMoonCard(item, palette) {
  document.querySelectorAll('.moon-card').forEach(c => c.remove());
  const card = document.createElement('div');
  card.className = 'moon-card';

  const fmtDate      = item.date ? item.date : '—';
  const intensityLabel = item.intensity ? item.intensity.replace('_', ' ') : '';
  const sections = [];

  if (item.learned)          sections.push(`<div class="mc-section"><span class="mc-label">Learned</span>${esc(item.learned)}</div>`);
  if (item.aha)              sections.push(`<div class="mc-section"><span class="mc-label">Aha ✦</span>${esc(item.aha)}</div>`);
  if (item.struggle)         sections.push(`<div class="mc-section"><span class="mc-label">Struggle</span>${esc(item.struggle)}</div>`);
  if (item.frustration_peak) sections.push(`<div class="mc-section"><span class="mc-label">Frustration peak</span>${esc(item.frustration_peak)}</div>`);
  if (item.wonder)           sections.push(`<div class="mc-section"><span class="mc-label">Wonder</span>${esc(item.wonder)}</div>`);
  if (item.curiosity_trail)  sections.push(`<div class="mc-section"><span class="mc-label">Curiosity trail</span>${esc(item.curiosity_trail)}</div>`);
  if (item.first_ever)       sections.push(`<div class="mc-section"><span class="mc-label">First-ever ★</span>${esc(item.first_ever)}</div>`);
  if (item.session_note)     sections.push(`<div class="mc-section"><span class="mc-label">Note</span>${esc(item.session_note)}</div>`);
  if (item.artifact)         sections.push(`<div class="mc-section"><span class="mc-label">Artifact</span><code style="color:rgba(255,255,255,0.85);font-size:12px;">${esc(item.artifact)}</code></div>`);

  const tags = (item.tags || []).map(t => `<span class="mc-tag">${esc(t)}</span>`).join('');
  if (tags) sections.push(`<div class="mc-section"><div class="mc-tags">${tags}</div></div>`);

  card.innerHTML = `
    <button class="mc-close" aria-label="Close">×</button>
    <div class="mc-head">
      <span>${esc(fmtDate)}${intensityLabel ? ' · ' + esc(intensityLabel) : ''}${item.real_world_use ? ' · used real-world' : ''}</span>
      <span class="mc-mood">${item.mood || ''}</span>
    </div>
    <div class="mc-title">${esc(item.title)}</div>
    ${sections.join('')}
  `;
  card.querySelector('.mc-close').addEventListener('click', () => card.remove());
  document.getElementById('planet-detail').appendChild(card);
}

function backToGalaxy() {
  document.getElementById('planet-detail').classList.remove('active');
  document.querySelectorAll('.moon-card').forEach(c => c.remove());
  const stage = document.getElementById('galaxy-stage');
  stage.classList.remove('warping');
  stage.style.transformOrigin = '50% 50%';
}

document.getElementById('planet-detail-back').addEventListener('click', backToGalaxy);

// Re-render on resize (debounced)
let galaxyResizeT = null;
window.addEventListener('resize', () => {
  if (!galaxyInited) return;
  clearTimeout(galaxyResizeT);
  galaxyResizeT = setTimeout(() => {
    // only re-render if galaxy tab is active
    if (document.querySelector('.tab-btn.active')?.dataset.tab === 'galaxy') renderGalaxy();
  }, 200);
});

// Kick off — call this when user taps the Galaxy tab
// initGalaxy();
```

---

## Data shape (what accomplishments[] items look like)

```js
{
  title: "What was completed",          // required — shown in moon card title
  date:  "YYYY-MM-DD",                  // optional — shown in card header
  tags:  ["swift", "css"],              // optional — shown as pills + counted in HUD
  learned: "Skill acquired",            // optional — shown in card
  aha:    "What clicked",               // optional — adds ✦ glyph above moon
  first_ever: "Label for first-time",   // optional — adds ★ glyph above moon
  struggle: "What was hard",            // optional
  frustration_peak: "Near-rage-quit",   // optional
  wonder: "What delighted you",         // optional
  curiosity_trail: "Question opened",   // optional
  session_note: "Brief context",        // optional
  artifact: "path/or/url",             // optional — shown as code
  intensity: "quick|session|deep_dive|marathon", // optional — drives moon size
  mood: "🔥",                           // optional — shown as emoji in card
  real_world_use: true,                 // optional — adds "used real-world" badge
  energy_in: "low|medium|high",         // optional — not currently rendered, reserved
}
```

---

## Adapting for Wild Stewart Homeschool — concrete substitutions

1. **Planets = lessons.** Replace `projects.json` fetch with your lessons array: `[{ repo: 'lesson-1' }, ...]`. The `repo` field is just an ID — rename it `id` if you prefer and update the references.

2. **`PLANET_PALETTE` → lesson colors.** Key by lesson slug or subject (`math`, `reading`, etc.) and set a color per subject so all math lessons share a color family.

3. **Completed lessons → `.planet.dim`.** Add `dim` class to planets whose lesson is marked complete. The CSS already handles the muted appearance: `opacity: 0.45; filter: saturate(0.6)`.

4. **No `learned-log.json` merge needed.** Replace `mergeAccomplishments()` with a simple function that maps your lesson data into the `galaxyData` shape. Only `title` is required in each accomplishment object.

5. **Spaceship at center.** Add `<div class="galaxy-ship">🚀</div>` inside `.galaxy-stage`. Before calling `stage.classList.add('warping')` in `warpTo()`, set `ship.style.left = px + 'px'; ship.style.top = py + 'px'` and wait 600ms for the ship transition to complete, then trigger the warp.

6. **Detail view = lesson content.** In `showPlanetDetail()`, replace the moon field with your lesson content (text, images, activities). Or open a separate panel/modal — the warp zoom is just an entry animation; what you show after is up to you.

7. **`esc()` helper** — make sure this utility exists in scope (it's a simple XSS escape used throughout):
   ```js
   function esc(s) {
     return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
   }
   ```

