// Direction 2: MOSS PAPER
// Bold editorial serif + tight grotesk body. Strong type hierarchy.
// Almost newspaper-like: heavy Fraunces display, Söhne-ish body, a
// single hot pastel accent that rotates by project.

const D2 = (() => {
  const { useState } = React;

  const palette = {
    light: {
      bg: "#EFEDE4",
      paper: "#FBFAF4",
      ink: "#141A15",
      ink2: "#3F4A3D",
      muted: "#6F7A6B",
      hair: "#D7D3C3",
      accent: "#3B4F3A",
      hl: "#F4D9A0",
    },
    dark: {
      bg: "#10130F",
      paper: "#171B15",
      ink: "#E7E4D6",
      ink2: "#ABB0A1",
      muted: "#7A8074",
      hair: "#262A22",
      accent: "#BCD1A6",
      hl: "#D9BF7A",
    },
  };

  const accentRing = ["#C9A0DC","#E9B7B0","#B6C9D1","#E8D99E","#9ECFA5"];

  function staleTxt(d) {
    if (d === 0) return "today";
    if (d === 1) return "yesterday";
    if (d < 7) return `${d} days`;
    if (d < 14) return `${Math.floor(d/7)} week`;
    return `${Math.floor(d/7)} weeks`;
  }

  function Dashboard({ mode = "light" }) {
    const p = palette[mode];
    const [filter, setFilter] = useState("all");
    const data = window.__DASHBOARD_DATA;
    const filtered = data.filter(d => filter === "all" || (filter === "stale" ? d.staleDays >= 14 : d.staleDays < 14));

    const styles = {
      shell: {
        width: 390, height: 844,
        background: p.bg, color: p.ink,
        fontFamily: "'Manrope', system-ui, sans-serif",
        fontSize: 14,
        overflow: "hidden",
        display: "flex", flexDirection: "column",
      },
      header: {
        padding: "48px 22px 18px",
        borderBottom: `1px solid ${p.hair}`,
        position: "relative",
      },
      dateline: {
        display: "flex", justifyContent: "space-between",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, letterSpacing: "0.12em",
        textTransform: "uppercase", color: p.muted,
        paddingBottom: 14, borderBottom: `1px solid ${p.hair}`,
        marginBottom: 14,
      },
      masthead: {
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        fontSize: 54,
        lineHeight: 0.95,
        letterSpacing: "-0.035em",
        color: p.ink,
      },
      mastheadIt: { fontStyle: "italic", fontWeight: 400, color: p.accent },
      tag: {
        marginTop: 14, fontSize: 12.5, color: p.ink2, lineHeight: 1.5,
      },
      filterStrip: {
        display: "flex", justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 22px", gap: 10,
        borderBottom: `1px solid ${p.hair}`,
        background: p.bg,
      },
      filters: { display: "flex", gap: 16 },
      fLink: (on) => ({
        background: "none", border: "none", cursor: "pointer",
        padding: 0, fontSize: 12,
        fontFamily: "'Manrope', sans-serif",
        color: on ? p.ink : p.muted,
        fontWeight: on ? 700 : 500,
        borderBottom: on ? `2px solid ${p.accent}` : "2px solid transparent",
        paddingBottom: 3,
      }),
      count: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, color: p.muted,
      },
      feed: {
        flex: 1, overflow: "auto",
      },
      article: {
        padding: "22px 22px 20px",
        borderBottom: `1px solid ${p.hair}`,
        position: "relative",
      },
      idx: {
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, letterSpacing: "0.1em",
        color: p.muted, marginBottom: 10,
        display: "flex", justifyContent: "space-between",
      },
      title: {
        fontFamily: "'Fraunces', serif",
        fontWeight: 600,
        fontSize: 30,
        lineHeight: 1,
        letterSpacing: "-0.025em",
        color: p.ink,
      },
      titleIt: { fontStyle: "italic", fontWeight: 400 },
      sub: {
        fontSize: 13, color: p.ink2,
        marginTop: 8, lineHeight: 1.45, maxWidth: 320,
      },
      priList: {
        listStyle: "none", margin: "16px 0 0", padding: 0,
        display: "flex", flexDirection: "column", gap: 10,
      },
      priRow: (accent) => ({
        display: "grid",
        gridTemplateColumns: "22px 1fr",
        gap: 10, alignItems: "flex-start",
        fontSize: 13.5, lineHeight: 1.4, color: p.ink,
        paddingBottom: 10,
        borderBottom: `1px dotted ${p.hair}`,
      }),
      priN: (accent) => ({
        fontFamily: "'Fraunces', serif",
        fontStyle: "italic",
        fontSize: 20,
        color: accent,
        lineHeight: 1,
      }),
      footer: {
        display: "flex", justifyContent: "space-between",
        marginTop: 14,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10, letterSpacing: "0.04em", color: p.muted,
      },
    };

    return (
      <div style={styles.shell}>
        <div style={styles.header}>
          <div style={styles.dateline}>
            <span>VOL. 04 · APR 22 2026</span>
            <span>DRIVER-CYBER</span>
          </div>
          <div style={styles.masthead}>
            The <span style={styles.mastheadIt}>quiet</span><br/>field book
          </div>
          <div style={styles.tag}>
            Five projects under cultivation. Priorities set by hand, every Sunday.
          </div>
        </div>

        <div style={styles.filterStrip}>
          <div style={styles.filters}>
            {["all","fresh","stale"].map(f => (
              <button key={f} style={styles.fLink(filter===f)} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          <div style={styles.count}>{filtered.length.toString().padStart(2,"0")} / {data.length.toString().padStart(2,"0")}</div>
        </div>

        <div style={styles.feed}>
          {filtered.map((d,i) => {
            const accent = accentRing[i % accentRing.length];
            return (
              <article key={d.repo} style={styles.article}>
                <div style={styles.idx}>
                  <span>№ {(i+1).toString().padStart(2,"0")}</span>
                  <span style={{color: accent}}>● {d.stack.split("·")[0].trim()}</span>
                </div>
                <h2 style={styles.title}>
                  {d.project.split(" ").map((w,j,a) => (
                    <span key={j} style={j === a.length-1 ? styles.titleIt : {}}>
                      {w}{j < a.length-1 ? " " : ""}
                    </span>
                  ))}
                </h2>
                <p style={styles.sub}>{d.description}</p>

                <ol style={styles.priList}>
                  {d.priorities.slice(0,3).map((t, j) => (
                    <li key={j} style={styles.priRow(accent)}>
                      <span style={styles.priN(accent)}>{j+1}</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ol>

                <div style={styles.footer}>
                  <span>LAST TOUCHED · {staleTxt(d.staleDays)}</span>
                  <span>{d.repo}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return Dashboard;
})();

window.D2 = D2;
