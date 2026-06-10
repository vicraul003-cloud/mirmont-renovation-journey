import { useState, useEffect } from "react";

// ─── BRAND TOKENS ───────────────────────────────────────────────
const C = {
  navyDark: "#091535",
  navy: "#0d1e4a",
  navyMid: "#132660",
  gold: "#c9a05a",
  goldLight: "#dbb97a",
  goldDark: "#a07a35",
  white: "#f8f5ef",
  offWhite: "#ede8df",
  textLight: "#c8c0b0",
  green: "#4a9a3a",
  red: "#e07070",
};

// ─── PHASE DATA ──────────────────────────────────────────────────
const PHASES = [
  {
    label: "01", name: "Paint & Wall Finishes",
    icon: "🎨",
    description: "Choose colors, sheens, and surface treatments for every room.",
    tasks: [
      { text: "Interior wall paint — living areas", note: "Select sheen finish", options: ["Flat","Eggshell","Satin","Semi-Gloss","Gloss"] },
      { text: "Interior wall paint — bedrooms", note: "Select sheen finish", options: ["Flat","Eggshell","Satin","Semi-Gloss","Gloss"] },
      { text: "Interior wall paint — bathrooms", note: "Moisture-resistant sheen", options: ["Eggshell","Satin","Semi-Gloss"] },
      { text: "Interior wall paint — kitchen", note: "Select sheen finish", options: ["Eggshell","Satin","Semi-Gloss"] },
      { text: "Ceiling paint color & finish", note: "Select ceiling finish", options: ["Flat White (Standard)","Custom Color — Flat","Custom Color — Eggshell"] },
      { text: "Trim, baseboard & door casing paint", note: "Select trim sheen", options: ["Satin","Semi-Gloss","High Gloss"] },
      { text: "Accent or feature wall selection", note: "Select treatment type", options: ["Paint — Solid","Wallpaper","Shiplap / Board & Batten","Stone or Tile","None"] },
      { text: "Wall texture type", note: "Select texture style", options: ["Smooth / Level 5","Skip Trowel","Orange Peel","Knockdown","Match Existing"] },
      { text: "Wainscoting or shiplap", note: "Select style if applying", options: ["Wainscoting","Shiplap","Board & Batten","None"] },
      { text: "Exterior paint colors (if in scope)", note: "Select scope", options: ["Full Exterior","Body Only","Trim Only","Front Door Only","Not in Scope"] },
    ]
  },
  {
    label: "02", name: "Flooring",
    icon: "🪵",
    description: "Select materials, patterns, and transitions for every surface.",
    tasks: [
      { text: "Living area flooring", note: "Select flooring type", options: ["Hardwood","LVP / Luxury Vinyl","Tile","Carpet","Polished Concrete"] },
      { text: "Bedroom flooring", note: "Select flooring type", options: ["Hardwood","LVP / Luxury Vinyl","Carpet","Tile","Same as Living Area"] },
      { text: "Kitchen flooring", note: "Select flooring type", options: ["Tile","LVP / Luxury Vinyl","Hardwood","Same as Living Area"] },
      { text: "Primary bathroom floor tile finish", note: "Select tile surface", options: ["Matte","Polished","Honed","Textured / Anti-Slip"] },
      { text: "Secondary/guest bathroom floor tile", note: "Select tile surface", options: ["Matte","Polished","Honed","Textured / Anti-Slip","Same as Primary"] },
      { text: "Laundry room / mudroom flooring", note: "Select flooring type", options: ["Tile","LVP / Luxury Vinyl","Epoxy","Same as Adjacent Area"] },
      { text: "Stair treads and risers", note: "Select stair material", options: ["Hardwood — Stained","Hardwood — Painted","Carpet Runner","LVP","Not Applicable"] },
      { text: "Transition strips & thresholds", note: "Select transition material", options: ["Aluminum","Wood — Stained","Wood — Painted","Match Floor Material"] },
      { text: "Floor grout type for tile areas", note: "Select grout type", options: ["Sanded","Unsanded","Epoxy","Pre-Mixed"] },
      { text: "Underlayment type", note: "Select underlayment", options: ["Standard Foam","Cork","Acoustic / Sound-Reducing","Cement Board (tile)","Not Required"] },
    ]
  },
  {
    label: "03", name: "Bathroom Selections",
    icon: "🛁",
    description: "Tile, fixtures, vanities, hardware, and enclosures for every bath.",
    tasks: [
      { text: "Shower wall tile layout — primary bath", note: "Select tile pattern", options: ["Straight Stack","Vertical Stack","Brick / Offset","Herringbone","Chevron"] },
      { text: "Shower wall tile layout — secondary bath", note: "Select tile pattern", options: ["Straight Stack","Vertical Stack","Brick / Offset","Herringbone","Same as Primary"] },
      { text: "Shower floor tile or pan material", note: "Select shower floor type", options: ["Mosaic Tile","Pebble Stone","Solid Surface Pan","Large Format Tile","Matching Wall Tile"] },
      { text: "Shower grout type — walls", note: "Select grout type", options: ["Standard Sanded","Standard Unsanded","Epoxy (stain-resistant)"] },
      { text: "Toilet style — primary bath", note: "Select toilet type", options: ["Two-Piece Standard","One-Piece","Wall-Hung","Smart / Bidet Seat"] },
      { text: "Vanity cabinet door style", note: "Select door style", options: ["Shaker","Flat Panel","Raised Panel","Open Shelving","Floating / Wall-Mount"] },
      { text: "Vanity countertop material", note: "Select countertop", options: ["Quartz","Marble","Cultured Marble","Solid Surface","Porcelain Slab"] },
      { text: "Bathroom faucet finish", note: "Select finish", options: ["Brushed Nickel","Matte Black","Polished Chrome","Brushed Gold / Brass","Oil-Rubbed Bronze"] },
      { text: "Shower head type", note: "Select shower head style", options: ["Standard Fixed","Rain Head (ceiling)","Rain Head + Hand Wand","Multi-Function System","Body Sprays Included"] },
      { text: "Shower door / enclosure type", note: "Select enclosure style", options: ["Frameless Glass — Pivot","Frameless Glass — Sliding","Semi-Frameless Sliding","Framed Sliding","Shower Curtain & Rod"] },
    ]
  },
  {
    label: "04", name: "Kitchen Selections",
    icon: "🍳",
    description: "Cabinets, countertops, backsplash, sink, appliances and more.",
    tasks: [
      { text: "Cabinet door style", note: "Select door style", options: ["Shaker","Flat Panel / Slab","Raised Panel","Beadboard","Inset"] },
      { text: "Cabinet finish — uppers", note: "Select finish type", options: ["Painted — White / Off-White","Painted — Gray","Painted — Navy / Dark","Stained Wood — Light","Stained Wood — Dark"] },
      { text: "Cabinet finish — lowers", note: "Select finish type", options: ["Same as Uppers","Painted — Contrasting","Stained Wood — Light","Stained Wood — Dark","Two-Tone Custom"] },
      { text: "Cabinet hardware — style", note: "Select hardware type", options: ["Bar Pulls","Cup Pulls","Knobs Only","Mixed Knobs & Pulls","Push-to-Open"] },
      { text: "Countertop material", note: "Select countertop", options: ["Quartz","Granite","Quartzite","Marble","Butcher Block","Porcelain Slab"] },
      { text: "Kitchen backsplash material", note: "Select backsplash type", options: ["Ceramic / Porcelain Tile","Glass Tile","Natural Stone","Slab — Matching Countertop","Zellige / Handmade Tile"] },
      { text: "Backsplash tile layout pattern", note: "Select layout pattern", options: ["Straight / Grid","Brick / Offset","Vertical Stack","Herringbone","Chevron"] },
      { text: "Kitchen sink style", note: "Select sink type", options: ["Undermount — Stainless","Undermount — Composite","Farmhouse / Apron-Front","Drop-In","Double Basin","Single Basin"] },
      { text: "Kitchen faucet style", note: "Select faucet style", options: ["Pull-Down Sprayer","Pull-Out Sprayer","Single Handle Fixed","Bridge Faucet","Touch / Touchless"] },
      { text: "Appliance package finish", note: "Select appliance finish", options: ["Stainless Steel","Black Stainless","Matte Black","Panel-Ready","White"] },
    ]
  },
  {
    label: "05", name: "Doors, Windows & Hardware",
    icon: "🚪",
    description: "Interior doors, hardware finishes, smart locks, and window casing.",
    tasks: [
      { text: "Interior door style", note: "Select door panel style", options: ["6-Panel","5-Panel Shaker","Flat / Flush","French / Glass Panel","Barn Door"] },
      { text: "Interior door core type", note: "Select door construction", options: ["Hollow Core","Solid Core","Fire-Rated (where required)"] },
      { text: "Interior door hardware style", note: "Select handle style", options: ["Lever — Round","Lever — Straight","Knob — Round","Knob — Crystal","Pocket Door Pull"] },
      { text: "Interior door hardware finish", note: "Must match throughout", options: ["Brushed Nickel","Matte Black","Polished Chrome","Brushed Gold / Brass","Oil-Rubbed Bronze","Satin Brass"] },
      { text: "Closet door style", note: "Select closet door type", options: ["Bifold","Sliding Bypass","Barn Door","Standard Swing","Open / No Door"] },
      { text: "Front door hardware finish", note: "Select entry hardware", options: ["Brushed Nickel","Matte Black","Polished Chrome","Brushed Gold / Brass","Oil-Rubbed Bronze"] },
      { text: "Front door smart lock", note: "Select smart lock preference", options: ["Yes — Keypad","Yes — App + Keypad","Yes — Fingerprint","Standard Key Lock Only"] },
      { text: "Window trim / casing profile", note: "Select casing style", options: ["Colonial / Traditional","Craftsman / Flat with Sill","Modern / Minimal Reveal","Match Existing","New Profile — TBD"] },
    ]
  },
  {
    label: "06", name: "Lighting & Electrical",
    icon: "💡",
    description: "Fixtures, dimmers, smart switches, and outlet placements.",
    tasks: [
      { text: "Dining / kitchen chandelier style", note: "Select fixture style", options: ["Modern / Linear","Traditional / Crystal","Industrial / Metal","Farmhouse / Rustic","Drum Shade","No Chandelier"] },
      { text: "Living area ceiling fixture", note: "Select fixture type", options: ["Ceiling Fan with Light","Flush Mount","Semi-Flush Mount","Pendant","Recessed Only"] },
      { text: "Bedroom ceiling fixture", note: "Select fixture type", options: ["Ceiling Fan with Light","Flush Mount","Semi-Flush Mount","Pendant","Recessed Only"] },
      { text: "Exterior light fixture finish", note: "Select exterior finish", options: ["Matte Black","Brushed Nickel","Bronze","Brass / Gold","White"] },
      { text: "Dimmer switches", note: "Select dimmer preference", options: ["Yes — All Dimmable Circuits","Yes — Select Rooms Only","No — Standard Switches"] },
      { text: "Smart switches / smart home wiring", note: "Select smart switch preference", options: ["Yes — Full Smart Home","Yes — Select Rooms Only","No — Standard Switches"] },
      { text: "USB / USB-C outlet placement", note: "Select USB outlet preference", options: ["Kitchen Island","Master Bedroom","Home Office","Multiple Locations","Not Adding"] },
      { text: "Recessed can light trim finish", note: "Select recessed trim color", options: ["White (standard)","Brushed Nickel","Matte Black","Matching Ceiling Color"] },
    ]
  },
  {
    label: "07", name: "Final Review & Sign-Off",
    icon: "✅",
    description: "Confirm orders, schedule appointments, and hand off to your contractor.",
    tasks: [
      { text: "All paint colors confirmed with contractor", note: "Final approval before painting", options: ["Confirmed","Pending Review","Changes Needed"] },
      { text: "All tile and flooring orders placed", note: "Lead time confirmed", options: ["Ordered — Lead Time Confirmed","Order Pending","Not Yet Selected"] },
      { text: "All plumbing fixtures ordered — bathrooms", note: "Confirm order status", options: ["Ordered","Pending","Not Yet Selected"] },
      { text: "All plumbing fixtures ordered — kitchen", note: "Confirm order status", options: ["Ordered","Pending","Not Yet Selected"] },
      { text: "All cabinetry ordered", note: "Delivery date confirmed", options: ["Ordered — Delivery Scheduled","Order Pending","Not Yet Selected"] },
      { text: "Countertop template appointment scheduled", note: "Templating status", options: ["Scheduled","Awaiting Cabinet Install","Not Yet Scheduled"] },
      { text: "Lighting and electrical fixtures ordered", note: "Confirm order status", options: ["Ordered","Pending","Not Yet Selected"] },
      { text: "Final selections walk-through completed", note: "Last chance to adjust before orders lock", options: ["Completed","Scheduled","Not Yet Scheduled"] },
    ]
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────
function tk(pi, ti) { return `${pi}_${ti}`; }

function totalStats(checked) {
  let total = 0, done = 0;
  PHASES.forEach((p, pi) => {
    total += p.tasks.length;
    done  += p.tasks.filter((_, ti) => !!checked[tk(pi, ti)]).length;
  });
  return { total, done, pct: total ? Math.round((done / total) * 100) : 0 };
}

function phaseStats(pi, checked) {
  const tasks = PHASES[pi].tasks;
  const done = tasks.filter((_, ti) => !!checked[tk(pi, ti)]).length;
  return { done, total: tasks.length, pct: tasks.length ? Math.round((done / tasks.length) * 100) : 0 };
}

// ─── MINI COMPONENTS ─────────────────────────────────────────────

function GoldRule({ style = {} }) {
  return <div style={{ width: 48, height: 2, background: C.gold, ...style }} />;
}

function ProgressRing({ pct, size = 56 }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`rgba(201,160,90,0.15)`} strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={pct === 100 ? C.green : C.gold}
        strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }}
      />
    </svg>
  );
}

function Badge({ children, color = C.gold }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      border: `1px solid ${color}`,
      color,
      fontSize: 10,
      fontFamily: "'Montserrat', sans-serif",
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      fontWeight: 600,
    }}>{children}</span>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function App() {
  const [checked, setChecked]         = useState({});
  const [selections, setSelections]   = useState({}); // option choices per task
  const [openPhase, setOpenPhase]     = useState(null);
  const [view, setView]               = useState("journey"); // "journey" | "phase" | "summary"
  const [activePhaseIdx, setActivePhaseIdx] = useState(0);

  const stats = totalStats(checked);

  function toggleTask(pi, ti) {
    const k = tk(pi, ti);
    setChecked(prev => ({ ...prev, [k]: !prev[k] }));
  }

  function setOption(pi, ti, opt) {
    const k = tk(pi, ti);
    setSelections(prev => ({ ...prev, [k]: opt }));
    // Auto-mark complete when option selected
    setChecked(prev => ({ ...prev, [k]: true }));
  }

  function openPhaseView(pi) {
    setActivePhaseIdx(pi);
    setView("phase");
  }

  // ── JOURNEY VIEW ───────────────────────────────────────────────
  if (view === "journey") {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.navyDark,
        fontFamily: "'Montserrat', sans-serif",
        color: C.white,
        overflowX: "hidden",
      }}>
        {/* HERO */}
        <div style={{
          background: C.navy,
          borderBottom: `1px solid rgba(201,160,90,0.15)`,
          padding: "48px 24px 40px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* subtle grid bg */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "repeating-linear-gradient(45deg,rgba(201,160,90,0.03) 0,rgba(201,160,90,0.03) 1px,transparent 0,transparent 50%)",
            backgroundSize: "24px 24px",
          }} />
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(201,160,90,0.05) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <p style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: C.gold, marginBottom: 10, fontWeight: 600 }}>
              Mirmont Construction
            </p>
            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "clamp(2.2rem, 7vw, 4rem)",
              fontWeight: 600,
              lineHeight: 1.1,
              color: C.white,
              margin: "0 0 16px",
            }}>
              Your Renovation<br /><em style={{ fontStyle: "italic", color: C.goldLight }}>Journey Guide</em>
            </h1>
            <GoldRule style={{ margin: "0 auto 16px" }} />
            <p style={{ fontSize: 13, color: C.textLight, lineHeight: 1.8, maxWidth: 480, margin: "0 auto 24px" }}>
              Seven phases. Every finish, fixture, and fixture decision — in one place. Work through each stage to finalize your selections before the build begins.
            </p>

            {/* Overall progress */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 20,
              background: "rgba(201,160,90,0.08)",
              border: `1px solid rgba(201,160,90,0.2)`,
              padding: "14px 24px",
              margin: "0 auto",
            }}>
              <ProgressRing pct={stats.pct} size={52} />
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, margin: "0 0 4px", fontWeight: 600 }}>Overall Progress</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: C.white, margin: 0, lineHeight: 1 }}>
                  {stats.done} <span style={{ color: C.gold }}>/ {stats.total}</span>
                </p>
                <p style={{ fontSize: 11, color: C.textLight, margin: "2px 0 0" }}>{stats.pct}% complete</p>
              </div>
            </div>

            {stats.pct === 100 && (
              <div style={{ marginTop: 16 }}>
                <Badge color={C.green}>🎉 All Selections Complete</Badge>
              </div>
            )}
          </div>
        </div>

        {/* NAV TABS */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 0,
          background: C.navyMid,
          borderBottom: `1px solid rgba(201,160,90,0.1)`,
        }}>
          {["Journey","Summary"].map(t => (
            <button key={t} onClick={() => setView(t.toLowerCase())} style={{
              background: "none", border: "none",
              borderBottom: view === t.toLowerCase() ? `2px solid ${C.gold}` : "2px solid transparent",
              color: view === t.toLowerCase() ? C.gold : C.textLight,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              padding: "14px 24px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>

        {/* PHASE CARDS GRID */}
        <div style={{ padding: "32px 16px 48px", maxWidth: 900, margin: "0 auto" }}>
          <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: `rgba(201,160,90,0.5)`, marginBottom: 24, textAlign: "center" }}>
            Tap a phase to begin your selections
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
            {PHASES.map((phase, pi) => {
              const ps = phaseStats(pi, checked);
              const isComplete = ps.done === ps.total;
              const inProgress = ps.done > 0 && !isComplete;
              return (
                <button key={pi} onClick={() => openPhaseView(pi)} style={{
                  background: C.navy,
                  border: `1px solid ${isComplete ? `rgba(74,154,58,0.4)` : inProgress ? `rgba(201,160,90,0.3)` : "rgba(201,160,90,0.1)"}`,
                  cursor: "pointer",
                  padding: "20px",
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.25s",
                }}>
                  {/* top accent bar */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: isComplete ? C.green : inProgress ? C.gold : "rgba(201,160,90,0.2)",
                  }} />

                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: `rgba(201,160,90,0.5)`, margin: "0 0 4px" }}>
                        Phase {phase.label}
                      </p>
                      <h3 style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 20, fontWeight: 600,
                        color: C.white, margin: 0, lineHeight: 1.2,
                      }}>{phase.name}</h3>
                    </div>
                    <div style={{ position: "relative" }}>
                      <ProgressRing pct={ps.pct} size={44} />
                      <span style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18,
                      }}>{phase.icon}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: 11, color: C.textLight, lineHeight: 1.7, margin: "0 0 14px" }}>
                    {phase.description}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{
                      fontSize: 10,
                      color: isComplete ? C.green : inProgress ? C.gold : `rgba(201,160,90,0.4)`,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                    }}>
                      {isComplete ? "Complete ✓" : inProgress ? `${ps.done} of ${ps.total} done` : `${ps.total} selections`}
                    </span>
                    <span style={{ color: C.gold, fontSize: 16 }}>›</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── PHASE DETAIL VIEW ─────────────────────────────────────────
  if (view === "phase") {
    const phase = PHASES[activePhaseIdx];
    const ps    = phaseStats(activePhaseIdx, checked);

    return (
      <div style={{ minHeight: "100vh", background: C.navyDark, fontFamily: "'Montserrat', sans-serif", color: C.white }}>

        {/* PHASE HEADER */}
        <div style={{
          background: C.navy,
          borderBottom: `1px solid rgba(201,160,90,0.15)`,
          padding: "24px 20px",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <button onClick={() => setView("journey")} style={{
                background: "none", border: `1px solid rgba(201,160,90,0.2)`,
                color: C.gold, cursor: "pointer", padding: "6px 12px",
                fontSize: 11, fontFamily: "'Montserrat', sans-serif",
                letterSpacing: "0.12em", textTransform: "uppercase",
              }}>← Back</button>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: `rgba(201,160,90,0.6)`, margin: "0 0 2px" }}>
                  Phase {phase.label} of 07
                </p>
                <h2 style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 22, fontWeight: 600, color: C.white, margin: 0,
                }}>{phase.icon} {phase.name}</h2>
              </div>
              <div style={{ textAlign: "right" }}>
                <ProgressRing pct={ps.pct} size={44} />
                <p style={{ fontSize: 10, color: ps.pct === 100 ? C.green : C.gold, margin: "2px 0 0", letterSpacing: "0.1em" }}>
                  {ps.done}/{ps.total}
                </p>
              </div>
            </div>

            {/* Phase progress bar */}
            <div style={{ height: 2, background: "rgba(201,160,90,0.15)", marginTop: 12, borderRadius: 1 }}>
              <div style={{
                height: "100%",
                width: `${ps.pct}%`,
                background: ps.pct === 100 ? C.green : `linear-gradient(to right,${C.goldDark},${C.goldLight})`,
                transition: "width 0.4s ease",
                borderRadius: 1,
              }} />
            </div>
          </div>
        </div>

        {/* TASKS */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px 80px" }}>
          {phase.tasks.map((task, ti) => {
            const k = tk(activePhaseIdx, ti);
            const isChecked  = !!checked[k];
            const selected   = selections[k];

            return (
              <div key={ti} style={{
                background: C.navy,
                border: `1px solid ${isChecked ? "rgba(74,154,58,0.25)" : "rgba(201,160,90,0.1)"}`,
                marginBottom: 8,
                overflow: "hidden",
                transition: "border-color 0.2s",
              }}>
                {/* Task row */}
                <div
                  onClick={() => toggleTask(activePhaseIdx, ti)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 18px", cursor: "pointer",
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 20, height: 20,
                    border: `1px solid ${isChecked ? C.green : "rgba(201,160,90,0.35)"}`,
                    background: isChecked ? C.green : "transparent",
                    flexShrink: 0, marginTop: 2,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                    fontSize: 12, color: C.navyDark, fontWeight: 700,
                  }}>
                    {isChecked ? "✓" : ""}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 14, color: isChecked ? "rgba(200,192,176,0.35)" : C.offWhite,
                      margin: "0 0 2px", lineHeight: 1.5,
                      textDecoration: isChecked ? "line-through" : "none",
                      transition: "all 0.2s",
                    }}>{task.text}</p>
                    <p style={{ fontSize: 11, color: "rgba(201,160,90,0.45)", fontStyle: "italic", margin: 0 }}>{task.note}</p>
                    {selected && (
                      <div style={{ marginTop: 6 }}>
                        <Badge color={C.gold}>{selected}</Badge>
                      </div>
                    )}
                  </div>
                </div>

                {/* Options */}
                {task.options && (
                  <div style={{
                    padding: "0 18px 14px 52px",
                    display: "flex", flexWrap: "wrap", gap: 6,
                  }}>
                    {task.options.map(opt => {
                      const isSel = selected === opt;
                      return (
                        <button
                          key={opt}
                          onClick={(e) => { e.stopPropagation(); setOption(activePhaseIdx, ti, opt); }}
                          style={{
                            background: isSel ? `rgba(201,160,90,0.12)` : "transparent",
                            border: isSel ? `2px solid ${C.gold}` : `1px solid rgba(201,160,90,0.2)`,
                            color: isSel ? C.gold : "rgba(200,192,176,0.5)",
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: 10,
                            fontWeight: isSel ? 700 : 500,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            padding: isSel ? "5px 12px" : "5px 13px",
                            cursor: "pointer",
                            transition: "all 0.15s",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {isSel ? "✓  " : ""}{opt}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* BOTTOM NAV */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: C.navyMid,
          borderTop: `1px solid rgba(201,160,90,0.15)`,
          padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          zIndex: 50,
        }}>
          <button
            onClick={() => setActivePhaseIdx(i => Math.max(0, i - 1))}
            disabled={activePhaseIdx === 0}
            style={{
              background: "none", border: `1px solid rgba(201,160,90,0.2)`,
              color: activePhaseIdx === 0 ? "rgba(201,160,90,0.25)" : C.gold,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase",
              padding: "10px 16px", cursor: activePhaseIdx === 0 ? "default" : "pointer",
              flex: 1,
            }}
          >← Prev</button>

          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 9, letterSpacing: "0.2em", color: `rgba(201,160,90,0.5)`, textTransform: "uppercase" }}>
              {activePhaseIdx + 1} / {PHASES.length}
            </p>
          </div>

          {activePhaseIdx < PHASES.length - 1 ? (
            <button
              onClick={() => setActivePhaseIdx(i => i + 1)}
              style={{
                background: C.gold, border: "none",
                color: C.navyDark,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                padding: "10px 16px", cursor: "pointer", flex: 1,
              }}
            >Next Phase →</button>
          ) : (
            <button
              onClick={() => setView("summary")}
              style={{
                background: C.green, border: "none",
                color: C.white,
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase",
                padding: "10px 16px", cursor: "pointer", flex: 1,
              }}
            >View Summary →</button>
          )}
        </div>
      </div>
    );
  }

  // ── SUMMARY VIEW ──────────────────────────────────────────────
  if (view === "summary") {
    return (
      <div style={{ minHeight: "100vh", background: C.navyDark, fontFamily: "'Montserrat', sans-serif", color: C.white }}>

        {/* Header */}
        <div style={{
          background: C.navy,
          borderBottom: `1px solid rgba(201,160,90,0.15)`,
          padding: "32px 20px 28px",
          textAlign: "center",
          position: "relative",
        }}>
          <button onClick={() => setView("journey")} style={{
            position: "absolute", top: 20, left: 20,
            background: "none", border: `1px solid rgba(201,160,90,0.2)`,
            color: C.gold, cursor: "pointer", padding: "6px 12px",
            fontSize: 11, fontFamily: "'Montserrat', sans-serif",
            letterSpacing: "0.12em", textTransform: "uppercase",
          }}>← Journey</button>

          <p style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: C.gold, margin: "0 0 8px", fontWeight: 600 }}>Mirmont Construction</p>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)", fontWeight: 600,
            color: C.white, margin: "0 0 12px",
          }}>Selections <em style={{ fontStyle: "italic", color: C.goldLight }}>Summary</em></h1>
          <GoldRule style={{ margin: "0 auto 16px" }} />

          <div style={{ display: "inline-flex", alignItems: "center", gap: 12, background: "rgba(201,160,90,0.08)", border: `1px solid rgba(201,160,90,0.2)`, padding: "10px 20px" }}>
            <ProgressRing pct={stats.pct} size={44} />
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24, fontWeight: 700, color: C.white, margin: 0,
            }}>{stats.done} <span style={{ color: C.gold }}>/ {stats.total}</span></p>
            <p style={{ fontSize: 11, color: C.textLight, margin: 0 }}>{stats.pct}% complete</p>
          </div>
        </div>

        {/* NAV TABS */}
        <div style={{ display: "flex", justifyContent: "center", background: C.navyMid, borderBottom: `1px solid rgba(201,160,90,0.1)` }}>
          {["Journey","Summary"].map(t => (
            <button key={t} onClick={() => setView(t.toLowerCase())} style={{
              background: "none", border: "none",
              borderBottom: view === t.toLowerCase() ? `2px solid ${C.gold}` : "2px solid transparent",
              color: view === t.toLowerCase() ? C.gold : C.textLight,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
              padding: "14px 24px", cursor: "pointer", transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>

        {/* Summary content */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px 48px" }}>
          {PHASES.map((phase, pi) => {
            const ps       = phaseStats(pi, checked);
            const isComplete = ps.done === ps.total;
            const hasSel   = phase.tasks.some((_, ti) => selections[tk(pi, ti)]);

            return (
              <div key={pi} style={{ marginBottom: 16 }}>
                {/* Phase title bar */}
                <button
                  onClick={() => openPhaseView(pi)}
                  style={{
                    width: "100%",
                    background: C.navy,
                    border: `1px solid ${isComplete ? "rgba(74,154,58,0.3)" : "rgba(201,160,90,0.15)"}`,
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 18px",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 26, fontWeight: 700,
                    color: isComplete ? C.green : ps.done > 0 ? C.gold : "rgba(201,160,90,0.2)",
                    minWidth: 36,
                  }}>{phase.label}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: C.offWhite, margin: "0 0 2px" }}>
                      {phase.icon} {phase.name}
                    </p>
                    <p style={{ fontSize: 10, color: isComplete ? C.green : ps.done > 0 ? C.gold : "rgba(201,160,90,0.35)", margin: 0, letterSpacing: "0.08em" }}>
                      {isComplete ? "Complete ✓" : ps.done > 0 ? `${ps.done} of ${ps.total} complete` : `${ps.total} tasks — not started`}
                    </p>
                  </div>
                  <span style={{ fontSize: 10, color: C.gold, letterSpacing: "0.1em", textTransform: "uppercase" }}>Edit ›</span>
                </button>

                {/* Selections list */}
                {hasSel && (
                  <div style={{
                    background: "rgba(13,30,74,0.5)",
                    border: `1px solid rgba(201,160,90,0.08)`,
                    borderTop: "none",
                    padding: "12px 18px 12px 52px",
                  }}>
                    {phase.tasks.map((task, ti) => {
                      const sel = selections[tk(pi, ti)];
                      if (!sel) return null;
                      return (
                        <div key={ti} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "baseline" }}>
                          <p style={{ fontSize: 12, color: C.textLight, margin: 0, flex: 1, lineHeight: 1.5 }}>{task.text}</p>
                          <Badge color={C.gold}>{sel}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Pending items */}
          {(() => {
            const pending = [];
            PHASES.forEach((phase, pi) => {
              phase.tasks.forEach((task, ti) => {
                if (!checked[tk(pi, ti)]) pending.push({ phase: phase.name, task: task.text, pi });
              });
            });
            if (!pending.length) return (
              <div style={{
                textAlign: "center", padding: "32px 24px",
                background: "rgba(74,154,58,0.08)",
                border: `1px solid rgba(74,154,58,0.25)`,
                marginTop: 8,
              }}>
                <p style={{ fontSize: 28, margin: "0 0 8px" }}>🎉</p>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: C.green, margin: "0 0 8px", fontWeight: 600 }}>All Selections Complete</p>
                <p style={{ fontSize: 12, color: C.textLight, margin: 0 }}>Your renovation journey is fully mapped. Share with your Mirmont team.</p>
              </div>
            );
            return (
              <div style={{ marginTop: 8, background: C.navy, border: `1px solid rgba(201,160,90,0.15)`, padding: "18px" }}>
                <p style={{ fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: C.gold, margin: "0 0 14px", fontWeight: 600 }}>
                  Pending Decisions ({pending.length})
                </p>
                {pending.slice(0, 8).map((p, i) => (
                  <div key={i} onClick={() => openPhaseView(p.pi)} style={{
                    display: "flex", gap: 10, padding: "8px 0",
                    borderBottom: i < Math.min(pending.length, 8) - 1 ? `1px solid rgba(201,160,90,0.07)` : "none",
                    cursor: "pointer",
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(201,160,90,0.4)", flexShrink: 0, marginTop: 6 }} />
                    <div>
                      <p style={{ fontSize: 12, color: C.offWhite, margin: "0 0 1px", lineHeight: 1.4 }}>{p.task}</p>
                      <p style={{ fontSize: 10, color: "rgba(201,160,90,0.4)", margin: 0, letterSpacing: "0.08em" }}>{p.phase}</p>
                    </div>
                  </div>
                ))}
                {pending.length > 8 && (
                  <p style={{ fontSize: 10, color: "rgba(201,160,90,0.4)", margin: "10px 0 0", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    + {pending.length - 8} more pending
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    );
  }

  return null;
}
