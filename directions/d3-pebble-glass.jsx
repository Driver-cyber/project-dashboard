// Direction 3: PEBBLE GLASS
// Modern, soft, Railway-inspired. Big rounded surfaces, glassy cards,
// pastel gradient header, buttery hover energy. Newsreader + Geist.

const D3 = (() => {
  const { useState } = React;

  const palette = {
    light: {
      bg: "#EDEFEA",
      surface: "#FFFFFF",
      surface2: "#F5F6F0",
      ink: "#161C19",
      ink2: "#4A5551",
      muted: "#8A938C",
      hair: "#E3E5DE",
      accent: "#3E5A47",
      pink: "#F2C1C1",
      peach: "#F7D8B5",
      sky: "#C8DBE0",
      violet: "#D7C6E5",
      butter: "#F2E1A7",
      mint: "#C4DCC3",
    },
    dark: {
      bg: "#0F1311",
      surface: "#181D1B",
      surface2: "#1F2522",
      ink: "#EAE9DE",
      ink2: "#B5BCB4",
      muted: "#818881",
      hair: "#262C29",
      accent: "#A8C3A0",
      pink: "#D99A9A",
      peach: "#D9B588",
      sky: "#9AB2B8",
      violet: "#B2A0C2",
      butter: "#D9C37E",
      mint: "#93B793",
    },
  };

  const tags = ["pink","peach","sky","violet","butter","mint"];

  function stale(d, p) {
    if (d === 0) return { label: "just now", tone: p.accent };
    if (d === 1) return { label: "yesterday", tone: p.accent };
    if (d < 7)  return { label: `${d}d ago`, tone: p.accent };
    if (d < 14) return { label: `${Math.floor(d/7)}w ago`, tone: "#C49A3B" };
    return { label: `${Math.floor(d/7)}w stale`, tone: "#C47A7A" };
  }

  const HillMark = ({ color, soft }) => (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" style={{display:"block"}}>
      <path d="M0 48 Q 18 28 36 42 T 72 40 T 120 34 L 120 60 L 0 60 Z" fill={soft}/>
      <path d="M0 52 Q 18 38 36 48 T 72 46 T 120 44 L 120 60 L 0 60 Z" fill={color}/>
      <circle cx="96" cy="18" r="7" fill={soft} opacity="0.9"/>
    </svg>
  );

  function Dashboard({ mode = "light" }) {
    const p = palette[mode];
    const [filter, setFilter] = useState("all");
    const data = window.__DASHBOARD_DATA;
    const filtered = data.filter(d => filter === "all" || (filter === "stale" ? d.staleDays >= 14 : d.staleDays < 14));

    const styles = {
      shell: {
        width: 390, height: 844,
        background: p.bg, color: p.ink,
        fontFamily: "'Geist', system-ui, sans-serif",
        fontSize: 14,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      },
      headerWrap: {
        position: "relative",
        padding: "48px 20px 28px",
        overflow: "hidden",
        background: mode === "light"
          ? `linear-gradient(180deg, ${p.mint}60 0%, ${p.bg} 100%)`
          : `linear-gradient(180deg, ${p.surface} 0%, ${p.bg} 100%)`,
      },
      topbar: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 22,
      },
      brand: {
        display: "flex", alignItems: "center", gap: 8,
        fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
        fontSize: 11, letterSpacing: "0.08em",
        color: p.ink2, textTransform: "uppercase",
      },
      logo: {
        width: 22, height: 22, borderRadius: 7,
        background: p.accent,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: mode==="light" ? "#fff" : "#0F1311",
        fontFamily: "'Newsreader', serif",
        fontStyle: "italic", fontWeight: 500, fontSize: 14,
      },
      toggle: {
        width: 32, height: 32, borderRadius: 10,
        background: p.surface, border: `1px solid ${p.hair}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, color: p.ink2, cursor: "pointer",
      },
      h1: {
        fontFamily: "'Newsreader', serif",
        fontWeight: 400,
        fontSize: 40,
        lineHeight: 1.02,
        letterSpacing: "-0.025em",
        color: p.ink,
      },
      h1It: { fontStyle: "italic", color: p.accent },
      sub: {
        marginTop: 10, fontSize: 13, color: p.ink2,
        lineHeight: 1.5, maxWidth: 290,
      },
      hill: {
        position: "absolute", bottom: -2, left: 0, right: 0,
        opacity: mode === "light" ? 0.55 : 0.35,
      },

      filterRow: {
        padding: "16px 20px 12px",
        display: "flex", gap: 6, alignItems: "center",
      },
      chip: (on) => ({
        fontSize: 12, fontWeight: on ? 600 : 500,
        padding: "7px 13px", borderRadius: 99,
        border: `1px solid ${on ? p.ink : p.hair}`,
        background: on ? p.ink : "transparent",
        color: on ? p.bg : p.ink2, cursor: "pointer",
        fontFamily: "'Geist', sans-serif",
      }),
      spacer: { flex: 1 },
      meta: {
        fontSize: 11, color: p.muted,
        fontFamily: "'Geist Mono', monospace",
      },

      feed: {
        flex: 1, overflow: "auto",
        padding: "4px 16px 32px",
        display: "flex", flexDirection: "column", gap: 12,
      },
      card: (tag) => ({
        background: p.surface,
        border: `1px solid ${p.hair}`,
        borderRadius: 22,
        padding: 18,
        position: "relative",
        overflow: "hidden",
      }),
      tagDot: (t) => ({
        position: "absolute", top: 0, right: 0,
        width: 68, height: 68,
        background: `radial-gradient(circle at 100% 0%, ${p[t]}cc 0%, transparent 70%)`,
        pointerEvents: "none",
      }),
      cardH: {
        display: "flex", justifyContent: "space-between",
        alignItems: "flex-start", gap: 10, marginBottom: 12,
      },
      pname: {
        fontFamily: "'Newsreader', serif",
        fontSize: 22,
        fontWeight: 500,
        letterSpacing: "-0.01em",
        color: p.ink,
        lineHeight: 1.1,
      },
      pdesc: {
        fontSize: 11.5, color: p.ink2,
        marginTop: 3, lineHeight: 1.4,
      },
      stat: (tone) => ({
        fontSize: 10,
        padding: "4px 9px",
        borderRadius: 99,
        background: tone + "22",
        color: tone,
        fontWeight: 500,
        whiteSpace: "nowrap",
        fontFamily: "'Geist Mono', monospace",
        letterSpacing: "0.02em",
      }),
      pri: {
        listStyle: "none", padding: 0, margin: 0,
        display: "flex", flexDirection: "column", gap: 7,
      },
      priRow: {
        display: "flex", gap: 10, alignItems: "flex-start",
        fontSize: 12.5, lineHeight: 1.42, color: p.ink,
      },
      bullet: (tag) => ({
        flexShrink: 0, marginTop: 5,
        width: 7, height: 7, borderRadius: 99,
        background: p[tag],
        boxShadow: `0 0 0 3px ${p[tag]}30`,
      }),
      stackRow: {
        marginTop: 12, paddingTop: 10,
        borderTop: `1px solid ${p.hair}`,
        display: "flex", justifyContent: "space-between",
        fontFamily: "'Geist Mono', monospace",
        fontSize: 10, color: p.muted,
        letterSpacing: "0.02em",
      },
    };

    return (
      <div style={styles.shell}>
        <div style={styles.headerWrap}>
          <div style={styles.topbar}>
            <div style={styles.brand}>
              <div style={styles.logo}>o</div>
              ordo · dashboard
            </div>
            <button style={styles.toggle}>{mode === "light" ? "☾" : "☀"}</button>
          </div>
          <h1 style={styles.h1}>
            Five things<br/>
            <span style={styles.h1It}>growing well.</span>
          </h1>
          <p style={styles.sub}>
            Live from GitHub. One card per project, top three priorities each.
          </p>
          <div style={styles.hill}><HillMark color={p.accent} soft={p.mint}/></div>
        </div>

        <div style={styles.filterRow}>
          {["all","fresh","stale"].map(f => (
            <button key={f} style={styles.chip(filter===f)} onClick={()=>setFilter(f)}>
              {f}
            </button>
          ))}
          <div style={styles.spacer}/>
          <div style={styles.meta}>↻ 14:22</div>
        </div>

        <div style={styles.feed}>
          {filtered.map((d,i) => {
            const st = stale(d.staleDays, p);
            const tag = tags[i % tags.length];
            return (
              <div key={d.repo} style={styles.card(tag)}>
                <div style={styles.tagDot(tag)}/>
                <div style={styles.cardH}>
                  <div style={{zIndex:1, position:"relative"}}>
                    <div style={styles.pname}>{d.project}</div>
                    <div style={styles.pdesc}>{d.description}</div>
                  </div>
                  <div style={styles.stat(st.tone)}>{st.label}</div>
                </div>
                <ol style={styles.pri}>
                  {d.priorities.slice(0,3).map((t, j) => (
                    <li key={j} style={styles.priRow}>
                      <span style={styles.bullet(tag)}/>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
                <div style={styles.stackRow}>
                  <span>{d.stack}</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return Dashboard;
})();

window.D3 = D3;
