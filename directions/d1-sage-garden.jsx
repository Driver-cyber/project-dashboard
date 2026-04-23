// Direction 1: SAGE GARDEN
// Editorial, airy, botanical. Instrument Serif display + Inter body.
// Soft sage/moss palette on pale stone. Pastel accents for staleness.

const D1 = (() => {
  const { useState, useEffect } = React;

  const palette = {
    light: {
      bg: "#F4F2EC",       // pale stone
      surface: "#FBFAF6",  // paper
      surface2: "#EEEBE1",
      ink: "#1E2A22",      // deep moss ink
      ink2: "#4A5A4E",
      muted: "#7E8C7F",
      hair: "#DCD7C8",
      accent: "#5A7A5B",   // sage
      pink: "#E9B7B0",     // dusty rose
      peach: "#EBC8A4",
      sky: "#B6C9D1",
      butter: "#E8D99E",
      moss: "#8FA68A",
    },
    dark: {
      bg: "#14181A",
      surface: "#1B2022",
      surface2: "#232A2B",
      ink: "#E8E6DC",
      ink2: "#B0B7A8",
      muted: "#7F887C",
      hair: "#2B3335",
      accent: "#A8C3A0",
      pink: "#D79991",
      peach: "#D4AC86",
      sky: "#9BB2BC",
      butter: "#D4C383",
      moss: "#8FA68A",
    },
  };

  function staleTone(days, p) {
    if (days <= 1) return { label: days === 0 ? "Today" : "Yesterday", tone: p.accent, bg: p.accent + "22" };
    if (days < 7)  return { label: `${days}d ago`, tone: p.moss, bg: p.moss + "22" };
    if (days < 14) return { label: `${Math.floor(days/7)}w — due`, tone: p.butter, bg: p.butter + "33" };
    return { label: `${Math.floor(days/7)}w — stale`, tone: p.pink, bg: p.pink + "33" };
  }

  const LeafMark = ({ color }) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3 C 22 3, 25 10, 24 18 C 23 24, 17 26, 12 24 C 6 22, 3 15, 5 9 C 7 4, 11 3, 14 3 Z"
        stroke={color} strokeWidth="1.2" fill="none"/>
      <path d="M14 5 C 13 11, 12 18, 10 23" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M13 10 L 17 8" stroke={color} strokeWidth="1" strokeLinecap="round"/>
      <path d="M12 14 L 17 12" stroke={color} strokeWidth="1" strokeLinecap="round"/>
      <path d="M11 18 L 16 16" stroke={color} strokeWidth="1" strokeLinecap="round"/>
    </svg>
  );

  function Dashboard({ mode = "light" }) {
    const p = palette[mode];
    const [filter, setFilter] = useState("all");
    const data = window.__DASHBOARD_DATA;
    const filtered = data.filter(d => filter === "all" || (filter === "stale" ? d.staleDays >= 14 : d.staleDays < 14));

    const styles = {
      shell: {
        width: 390,
        height: 844,
        background: p.bg,
        color: p.ink,
        fontFamily: "'Inter', system-ui, sans-serif",
        fontSize: 14,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        position: "relative",
      },
      header: {
        padding: "52px 20px 16px",
        position: "relative",
      },
      eyebrow: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: p.muted,
        display: "flex",
        alignItems: "center",
        gap: 8,
      },
      dot: { width: 6, height: 6, borderRadius: 99, background: p.accent, display: "inline-block" },
      h1: {
        fontFamily: "'Instrument Serif', serif",
        fontWeight: 400,
        fontSize: 44,
        lineHeight: 1.02,
        letterSpacing: "-0.02em",
        color: p.ink,
        marginTop: 10,
      },
      h1i: { fontStyle: "italic", color: p.accent },
      sub: {
        fontSize: 13,
        color: p.ink2,
        marginTop: 10,
        lineHeight: 1.5,
        maxWidth: 300,
      },
      leafPos: { position: "absolute", top: 52, right: 20, opacity: 0.9 },
      filterBar: {
        padding: "8px 20px 12px",
        display: "flex",
        gap: 6,
        alignItems: "center",
        justifyContent: "space-between",
      },
      pills: { display: "flex", gap: 4, background: p.surface2, padding: 3, borderRadius: 99 },
      pill: (on) => ({
        fontSize: 11,
        padding: "6px 12px",
        borderRadius: 99,
        border: "none",
        background: on ? p.surface : "transparent",
        color: on ? p.ink : p.muted,
        fontWeight: on ? 600 : 500,
        cursor: "pointer",
        fontFamily: "'Inter', sans-serif",
        boxShadow: on ? "0 1px 2px rgba(0,0,0,0.04)" : "none",
      }),
      refresh: {
        width: 32, height: 32, borderRadius: 99,
        background: p.surface, border: `1px solid ${p.hair}`,
        color: p.ink2, cursor: "pointer", fontSize: 14,
        display: "flex", alignItems: "center", justifyContent: "center",
      },
      feed: {
        flex: 1,
        overflow: "auto",
        padding: "4px 16px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      },
      card: {
        background: p.surface,
        border: `1px solid ${p.hair}`,
        borderRadius: 18,
        padding: 16,
        position: "relative",
      },
      cardHead: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 10,
        marginBottom: 10,
      },
      project: {
        fontFamily: "'Instrument Serif', serif",
        fontSize: 22,
        lineHeight: 1.1,
        letterSpacing: "-0.01em",
        color: p.ink,
      },
      desc: {
        fontSize: 11.5,
        color: p.ink2,
        marginTop: 3,
        lineHeight: 1.4,
      },
      stale: (st) => ({
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9.5,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "4px 8px",
        borderRadius: 99,
        background: st.bg,
        color: st.tone,
        whiteSpace: "nowrap",
        fontWeight: 500,
      }),
      priList: {
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        margin: 0,
        padding: 0,
      },
      priItem: {
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        fontSize: 12.5,
        lineHeight: 1.4,
        color: p.ink,
      },
      priNum: {
        fontFamily: "'Instrument Serif', serif",
        fontStyle: "italic",
        fontSize: 15,
        color: p.accent,
        width: 14,
        flexShrink: 0,
        lineHeight: 1.2,
      },
      stack: {
        marginTop: 10,
        paddingTop: 10,
        borderTop: `1px dashed ${p.hair}`,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 9.5,
        letterSpacing: "0.04em",
        color: p.muted,
      },
    };

    return (
      <div style={styles.shell}>
        <div style={styles.header}>
          <div style={styles.eyebrow}><span style={styles.dot}/>LIVE · 5 PROJECTS</div>
          <div style={styles.h1}>Ordo ab <span style={styles.h1i}>chao</span>.</div>
          <div style={styles.sub}>One quiet view of everything you're building this season.</div>
          <div style={styles.leafPos}><LeafMark color={p.accent}/></div>
        </div>

        <div style={styles.filterBar}>
          <div style={styles.pills}>
            {["all","fresh","stale"].map(f => (
              <button key={f} style={styles.pill(filter===f)} onClick={() => setFilter(f)}>
                {f[0].toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
          <button style={styles.refresh}>↻</button>
        </div>

        <div style={styles.feed}>
          {filtered.map((d,i) => {
            const st = staleTone(d.staleDays, p);
            return (
              <div key={d.repo} style={styles.card}>
                <div style={styles.cardHead}>
                  <div>
                    <div style={styles.project}>{d.project}</div>
                    <div style={styles.desc}>{d.description}</div>
                  </div>
                  <div style={styles.stale(st)}>{st.label}</div>
                </div>
                <ol style={styles.priList}>
                  {d.priorities.slice(0,3).map((t, j) => (
                    <li key={j} style={styles.priItem}>
                      <span style={styles.priNum}>{j+1}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>
                <div style={styles.stack}>{d.stack}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return Dashboard;
})();

window.D1 = D1;
