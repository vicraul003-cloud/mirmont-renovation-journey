import { useState, useEffect, useRef, useCallback } from "react";
import { PHASE_IMAGES } from "./phaseImages";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set, get, onValue, push, remove } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

// ─── FIREBASE ────────────────────────────────────────────────────
const FB_CONFIG = {
  apiKey: "AIzaSyAkFRsCzFOHQswErbDuK1duQSlrnCOMKuE",
  authDomain: "mirmont-customer-portal.firebaseapp.com",
  databaseURL: "https://mirmont-customer-portal-default-rtdb.firebaseio.com",
  projectId: "mirmont-customer-portal",
  storageBucket: "mirmont-customer-portal.firebasestorage.app",
  messagingSenderId: "279070555968",
  appId: "1:279070555968:web:a7b4ac75794bbc313c44a5"
};
const fbApp  = getApps().length ? getApps()[0] : initializeApp(FB_CONFIG);
const db     = getDatabase(fbApp);
const auth   = getAuth(fbApp);

const IMGBB_KEY  = "fc64721f619cd9120c8751cf404d2313";
const DRIVE_URL  = "https://script.google.com/macros/s/AKfycbxN-f1n0TNzX6QiTYMcukrKiCzObPzFmZvt5MYLycmtZLZzjamV1zK4ii-09R3wNrMn/exec";
const SHEETS_URL = "https://script.google.com/macros/s/AKfycbz3uoeYn2phlRytmprQTE8EvoBaF1ztunE2oUeAIRuCJomriZMY6JoOALun6RqZSB_r/exec";

const DEFAULT_CODES = {
  "MRM-2024-001": "Smith Family",
  "MRM-2024-002": "Johnson Project",
  "MRM-2024-003": "Davis Renovation",
  "MRM-DEMO":     "Demo Client",
};
const SESSION_KEY  = "mirmont_session_v3";
const REMEMBER_KEY = "mirmont_remember_v3";

// ─── BRAND ───────────────────────────────────────────────────────
const C = {
  navyDark:"#091535",navy:"#0d1e4a",navyMid:"#132660",
  gold:"#c9a05a",goldLight:"#dbb97a",goldDark:"#a07a35",
  white:"#f8f5ef",offWhite:"#ede8df",textLight:"#c8c0b0",
  green:"#4a9a3a",red:"#e07070",
};

// ─── PHASE ICONS (SVG) ───────────────────────────────────────────
function PhaseIcon({name,size=20,color="#c9a05a"}){
  const s={width:size,height:size,stroke:color,fill:"none",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round"};
  switch(name){
    case "paint": return(
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M12 2a7 7 0 0 1 7 7c0 3.5-3.5 6-3.5 9H8.5C8.5 15 5 12.5 5 9a7 7 0 0 1 7-7z"/>
        <path d="M8.5 18h7"/><path d="M9 21h6"/>
        <path d="M12 6v4m-2-2h4"/>
      </svg>
    );
    case "floor": return(
      <svg viewBox="0 0 24 24" style={s}>
        <rect x="3" y="3" width="8" height="8" rx="1"/>
        <rect x="13" y="3" width="8" height="8" rx="1"/>
        <rect x="3" y="13" width="8" height="8" rx="1"/>
        <rect x="13" y="13" width="8" height="8" rx="1"/>
      </svg>
    );
    case "bath": return(
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M4 12h16v3a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-3z"/>
        <path d="M4 12V6a2 2 0 0 1 2-2h1a2 2 0 0 1 2 2v1"/>
        <path d="M8 20v2M16 20v2"/>
      </svg>
    );
    case "kitchen": return(
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M6 3v7c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V3"/>
        <path d="M3 3h18"/><path d="M12 12v9"/><path d="M8 21h8"/>
        <path d="M10 6h4"/>
      </svg>
    );
    case "door": return(
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M14 2H6a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V7z"/>
        <path d="M14 2v5h5"/><circle cx="16" cy="13" r="1" fill={color}/>
      </svg>
    );
    case "light": return(
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M9 18h6M10 22h4"/>
        <path d="M12 2a7 7 0 0 1 5 11.9V16a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2.1A7 7 0 0 1 12 2z"/>
        <path d="M12 6v4m-2-2h4"/>
      </svg>
    );
    case "check": return(
      <svg viewBox="0 0 24 24" style={s}>
        <path d="M9 12l2 2 4-4"/>
        <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
      </svg>
    );
    default: return null;
  }
}

// ─── PHASE DATA ──────────────────────────────────────────────────
const PHASES = [
  { label:"01", name:"Paint & Wall Finishes", icon:"paint", description:"Colors, sheens, and surface treatments for every room.",
    tasks:[
      {text:"Interior wall paint — living areas",note:"Select sheen finish",options:["Flat","Eggshell","Satin","Semi-Gloss","Gloss"]},
      {text:"Interior wall paint — bedrooms",note:"Select sheen finish",options:["Flat","Eggshell","Satin","Semi-Gloss","Gloss"]},
      {text:"Interior wall paint — bathrooms",note:"Moisture-resistant sheen",options:["Eggshell","Satin","Semi-Gloss"]},
      {text:"Interior wall paint — kitchen",note:"Select sheen finish",options:["Eggshell","Satin","Semi-Gloss"]},
      {text:"Ceiling paint color & finish",note:"Select ceiling finish",options:["Flat White (Standard)","Custom Color — Flat","Custom Color — Eggshell"]},
      {text:"Trim, baseboard & door casing paint",note:"Select trim sheen",options:["Satin","Semi-Gloss","High Gloss"]},
      {text:"Accent or feature wall",note:"Select treatment type",options:["Paint — Solid","Wallpaper","Shiplap / Board & Batten","Stone or Tile","None"]},
      {text:"Wall texture type",note:"Select texture style",options:["Smooth / Level 5","Skip Trowel","Orange Peel","Knockdown","Match Existing"]},
      {text:"Wainscoting or shiplap",note:"Select style if applying",options:["Wainscoting","Shiplap","Board & Batten","None"]},
      {text:"Exterior paint colors (if in scope)",note:"Select scope",options:["Full Exterior","Body Only","Trim Only","Front Door Only","Not in Scope"]},
    ]},
  { label:"02", name:"Flooring", icon:"floor", description:"Materials, patterns, and transitions for every surface.",
    tasks:[
      {text:"Living area flooring",note:"Select flooring type",options:["Hardwood","LVP / Luxury Vinyl","Tile","Carpet","Polished Concrete"]},
      {text:"Bedroom flooring",note:"Select flooring type",options:["Hardwood","LVP / Luxury Vinyl","Carpet","Tile","Same as Living Area"]},
      {text:"Kitchen flooring",note:"Select flooring type",options:["Tile","LVP / Luxury Vinyl","Hardwood","Same as Living Area"]},
      {text:"Primary bathroom floor tile finish",note:"Select tile surface",options:["Matte","Polished","Honed","Textured / Anti-Slip"]},
      {text:"Secondary/guest bathroom floor tile",note:"Select tile surface",options:["Matte","Polished","Honed","Textured / Anti-Slip","Same as Primary"]},
      {text:"Laundry room / mudroom flooring",note:"Select flooring type",options:["Tile","LVP / Luxury Vinyl","Epoxy","Same as Adjacent Area"]},
      {text:"Stair treads and risers",note:"Select stair material",options:["Hardwood — Stained","Hardwood — Painted","Carpet Runner","LVP","Not Applicable"]},
      {text:"Transition strips & thresholds",note:"Select transition material",options:["Aluminum","Wood — Stained","Wood — Painted","Match Floor Material"]},
      {text:"Floor grout type for tile areas",note:"Select grout type",options:["Sanded","Unsanded","Epoxy","Pre-Mixed"]},
      {text:"Underlayment type",note:"Select underlayment",options:["Standard Foam","Cork","Acoustic / Sound-Reducing","Cement Board (tile)","Not Required"]},
    ]},
  { label:"03", name:"Bathroom Selections", icon:"bath", description:"Tile, fixtures, vanities, hardware, and enclosures.",
    tasks:[
      {text:"Shower wall tile layout — primary bath",note:"Select tile pattern",options:["Straight Stack","Vertical Stack","Brick / Offset","Herringbone","Chevron"]},
      {text:"Shower wall tile layout — secondary bath",note:"Select tile pattern",options:["Straight Stack","Vertical Stack","Brick / Offset","Herringbone","Same as Primary"]},
      {text:"Shower floor tile or pan",note:"Select shower floor type",options:["Mosaic Tile","Pebble Stone","Solid Surface Pan","Large Format Tile","Matching Wall Tile"]},
      {text:"Shower grout type — walls",note:"Select grout type",options:["Standard Sanded","Standard Unsanded","Epoxy (stain-resistant)"]},
      {text:"Toilet style — primary bath",note:"Select toilet type",options:["Two-Piece Standard","One-Piece","Wall-Hung","Smart / Bidet Seat"]},
      {text:"Vanity cabinet door style",note:"Select door style",options:["Shaker","Flat Panel","Raised Panel","Open Shelving","Floating / Wall-Mount"]},
      {text:"Vanity countertop material",note:"Select countertop",options:["Quartz","Marble","Cultured Marble","Solid Surface","Porcelain Slab"]},
      {text:"Bathroom faucet finish",note:"Select finish",options:["Brushed Nickel","Matte Black","Polished Chrome","Brushed Gold / Brass","Oil-Rubbed Bronze"]},
      {text:"Shower head type",note:"Select shower head style",options:["Standard Fixed","Rain Head (ceiling)","Rain Head + Hand Wand","Multi-Function System","Body Sprays Included"]},
      {text:"Shower door / enclosure type",note:"Select enclosure style",options:["Frameless Glass — Pivot","Frameless Glass — Sliding","Semi-Frameless Sliding","Framed Sliding","Shower Curtain & Rod"]},
    ]},
  { label:"04", name:"Kitchen Selections", icon:"kitchen", description:"Cabinets, countertops, backsplash, sink, and appliances.",
    tasks:[
      {text:"Cabinet door style",note:"Select door style",options:["Shaker","Flat Panel / Slab","Raised Panel","Beadboard","Inset"]},
      {text:"Cabinet finish — uppers",note:"Select finish type",options:["Painted — White / Off-White","Painted — Gray","Painted — Navy / Dark","Stained Wood — Light","Stained Wood — Dark"]},
      {text:"Cabinet finish — lowers",note:"Select finish type",options:["Same as Uppers","Painted — Contrasting","Stained Wood — Light","Stained Wood — Dark","Two-Tone Custom"]},
      {text:"Cabinet hardware — style",note:"Select hardware type",options:["Bar Pulls","Cup Pulls","Knobs Only","Mixed Knobs & Pulls","Push-to-Open"]},
      {text:"Countertop material",note:"Select countertop",options:["Quartz","Granite","Quartzite","Marble","Butcher Block","Porcelain Slab"]},
      {text:"Kitchen backsplash material",note:"Select backsplash type",options:["Ceramic / Porcelain Tile","Glass Tile","Natural Stone","Slab — Matching Countertop","Zellige / Handmade Tile"]},
      {text:"Backsplash tile layout pattern",note:"Select layout pattern",options:["Straight / Grid","Brick / Offset","Vertical Stack","Herringbone","Chevron"]},
      {text:"Kitchen sink style",note:"Select sink type",options:["Undermount — Stainless","Undermount — Composite","Farmhouse / Apron-Front","Drop-In","Double Basin","Single Basin"]},
      {text:"Kitchen faucet style",note:"Select faucet style",options:["Pull-Down Sprayer","Pull-Out Sprayer","Single Handle Fixed","Bridge Faucet","Touch / Touchless"]},
      {text:"Appliance package finish",note:"Select appliance finish",options:["Stainless Steel","Black Stainless","Matte Black","Panel-Ready","White"]},
    ]},
  { label:"05", name:"Doors, Windows & Hardware", icon:"door", description:"Interior doors, hardware finishes, smart locks, window casing.",
    tasks:[
      {text:"Interior door style",note:"Select door panel style",options:["6-Panel","5-Panel Shaker","Flat / Flush","French / Glass Panel","Barn Door"]},
      {text:"Interior door core type",note:"Select door construction",options:["Hollow Core","Solid Core","Fire-Rated (where required)"]},
      {text:"Interior door hardware style",note:"Select handle style",options:["Lever — Round","Lever — Straight","Knob — Round","Knob — Crystal","Pocket Door Pull"]},
      {text:"Interior door hardware finish",note:"Must match throughout",options:["Brushed Nickel","Matte Black","Polished Chrome","Brushed Gold / Brass","Oil-Rubbed Bronze","Satin Brass"]},
      {text:"Closet door style",note:"Select closet door type",options:["Bifold","Sliding Bypass","Barn Door","Standard Swing","Open / No Door"]},
      {text:"Front door hardware finish",note:"Select entry hardware",options:["Brushed Nickel","Matte Black","Polished Chrome","Brushed Gold / Brass","Oil-Rubbed Bronze"]},
      {text:"Front door smart lock",note:"Select smart lock preference",options:["Yes — Keypad","Yes — App + Keypad","Yes — Fingerprint","Standard Key Lock Only"]},
      {text:"Window trim / casing profile",note:"Select casing style",options:["Colonial / Traditional","Craftsman / Flat with Sill","Modern / Minimal Reveal","Match Existing","New Profile — TBD"]},
    ]},
  { label:"06", name:"Lighting & Electrical", icon:"light", description:"Fixtures, dimmers, smart switches, and outlet placements.",
    tasks:[
      {text:"Dining / kitchen chandelier style",note:"Select fixture style",options:["Modern / Linear","Traditional / Crystal","Industrial / Metal","Farmhouse / Rustic","Drum Shade","No Chandelier"]},
      {text:"Living area ceiling fixture",note:"Select fixture type",options:["Ceiling Fan with Light","Flush Mount","Semi-Flush Mount","Pendant","Recessed Only"]},
      {text:"Bedroom ceiling fixture",note:"Select fixture type",options:["Ceiling Fan with Light","Flush Mount","Semi-Flush Mount","Pendant","Recessed Only"]},
      {text:"Exterior light fixture finish",note:"Select exterior finish",options:["Matte Black","Brushed Nickel","Bronze","Brass / Gold","White"]},
      {text:"Dimmer switches",note:"Select dimmer preference",options:["Yes — All Dimmable Circuits","Yes — Select Rooms Only","No — Standard Switches"]},
      {text:"Smart switches / smart home wiring",note:"Select smart switch preference",options:["Yes — Full Smart Home","Yes — Select Rooms Only","No — Standard Switches"]},
      {text:"USB / USB-C outlet placement",note:"Select USB outlet preference",options:["Kitchen Island","Master Bedroom","Home Office","Multiple Locations","Not Adding"]},
      {text:"Recessed can light trim finish",note:"Select recessed trim color",options:["White (standard)","Brushed Nickel","Matte Black","Matching Ceiling Color"]},
    ]},
  { label:"07", name:"Final Review & Sign-Off", icon:"check", description:"Confirm orders, schedule appointments, hand off to your contractor.",
    tasks:[
      {text:"All paint colors confirmed with contractor",note:"Final approval before painting",options:["Confirmed","Pending Review","Changes Needed"]},
      {text:"All tile and flooring orders placed",note:"Lead time confirmed",options:["Ordered — Lead Time Confirmed","Order Pending","Not Yet Selected"]},
      {text:"All plumbing fixtures ordered — bathrooms",note:"Confirm order status",options:["Ordered","Pending","Not Yet Selected"]},
      {text:"All plumbing fixtures ordered — kitchen",note:"Confirm order status",options:["Ordered","Pending","Not Yet Selected"]},
      {text:"All cabinetry ordered",note:"Delivery date confirmed",options:["Ordered — Delivery Scheduled","Order Pending","Not Yet Selected"]},
      {text:"Countertop template appointment scheduled",note:"Templating status",options:["Scheduled","Awaiting Cabinet Install","Not Yet Scheduled"]},
      {text:"Lighting and electrical fixtures ordered",note:"Confirm order status",options:["Ordered","Pending","Not Yet Selected"]},
      {text:"Final selections walk-through completed",note:"Last chance to adjust before orders lock",options:["Completed","Scheduled","Not Yet Scheduled"]},
    ]},
];

// ─── HELPERS ─────────────────────────────────────────────────────
function tk(pi,ti){ return `${pi}_${ti}`; }
function safeCode(c){ return c.replace(/[^a-zA-Z0-9]/g,"_"); }
function totalStats(checked,phases){
  let total=0,done=0;
  phases.forEach((p,pi)=>{ total+=p.tasks.length; done+=p.tasks.filter((_,ti)=>!!checked[tk(pi,ti)]).length; });
  return {total,done,pct:total?Math.round((done/total)*100):0};
}
function phaseStats(pi,checked){
  const t=PHASES[pi].tasks;
  const d=t.filter((_,ti)=>!!checked[tk(pi,ti)]).length;
  return {done:d,total:t.length,pct:t.length?Math.round((d/t.length)*100):0};
}
function escHtml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }
function timeStr(ts){
  const d=new Date(ts);
  return d.toLocaleDateString("en-US",{month:"short",day:"numeric"})+" "+d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
}

// ─── MINI UI ─────────────────────────────────────────────────────
function GoldRule({style={}}){
  return <div style={{width:48,height:2,background:C.gold,...style}}/>;
}
function ProgressRing({pct,size=52}){
  const r=(size-6)/2,circ=2*Math.PI*r,dash=(pct/100)*circ;
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(201,160,90,0.15)" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={pct===100?C.green:C.gold} strokeWidth={5}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{transition:"stroke-dasharray 0.5s ease"}}/>
    </svg>
  );
}
function SyncDot({status}){
  const bg=status==="synced"?C.green:status==="syncing"?C.gold:C.red;
  const label=status==="synced"?"Synced":status==="syncing"?"Saving...":"Sync error";
  return(
    <div style={{display:"flex",alignItems:"center",gap:6}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:bg,flexShrink:0,
        animation:status==="syncing"?"_pulse 1s infinite":"none"}}/>
      <span style={{fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:C.textLight}}>{label}</span>
    </div>
  );
}

// ─── LIGHTBOX ────────────────────────────────────────────────────
function Lightbox({url,onClose}){
  if(!url) return null;
  return(
    <div onClick={onClose} style={{
      position:"fixed",inset:0,background:"rgba(9,21,53,0.97)",zIndex:9999,
      display:"flex",alignItems:"center",justifyContent:"center",padding:"1rem",
    }}>
      <div style={{position:"relative",maxWidth:"90vw",maxHeight:"90vh",textAlign:"center"}} onClick={e=>e.stopPropagation()}>
        <img src={url} alt="Preview" style={{maxWidth:"90vw",maxHeight:"82vh",objectFit:"contain",border:"1px solid rgba(201,160,90,0.3)"}}/>
        <button onClick={onClose} style={{
          position:"absolute",top:-14,right:-14,width:30,height:30,borderRadius:"50%",
          background:C.gold,color:C.navyDark,border:"none",fontSize:16,fontWeight:700,cursor:"pointer",
        }}>×</button>
      </div>
    </div>
  );
}

// ─── LOGIN ───────────────────────────────────────────────────────
function LoginScreen({onLogin}){
  const [name,setName]=useState("");
  const [code,setCode]=useState("");
  const [remember,setRemember]=useState(false);
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const [validCodes,setValidCodes]=useState(DEFAULT_CODES);

  useEffect(()=>{
    onValue(ref(db,"admin_projects"),snap=>{
      setValidCodes({...DEFAULT_CODES,...(snap.val()||{})});
    });
    // Pre-fill from remember
    try{
      const r=JSON.parse(localStorage.getItem(REMEMBER_KEY)||"null");
      if(r){setName(r.name||"");setCode(r.code||"");setRemember(true);}
    }catch(_){}
  },[]);

  function handleLogin(e){
    e.preventDefault();
    const n=name.trim(), c=code.trim().toUpperCase();
    if(!n){setError("Please enter your name.");return;}
    if(!c){setError("Please enter your project code.");return;}
    const match=Object.keys(validCodes).find(k=>k.toUpperCase()===c);
    if(!match){setError("Project code not found. Please check with your Mirmont team.");return;}
    setError("");setLoading(true);
    const finalName=n||validCodes[match];
    if(remember) localStorage.setItem(REMEMBER_KEY,JSON.stringify({code:match,name:finalName}));
    else localStorage.removeItem(REMEMBER_KEY);
    // Anonymous Firebase auth then open
    signInAnonymously(auth).finally(()=>{ onLogin(match,finalName); });
  }

  return(
    <div style={{minHeight:"100vh",background:C.navyDark,display:"flex",alignItems:"center",
      justifyContent:"center",padding:"2rem",position:"relative",overflow:"hidden",
      fontFamily:"'Montserrat',sans-serif"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,rgba(201,160,90,0.025) 0,rgba(201,160,90,0.025) 1px,transparent 0,transparent 50%)",backgroundSize:"24px 24px"}}/>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:700,height:700,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(201,160,90,0.06) 0%,transparent 65%)",pointerEvents:"none"}}/>
      <div style={{position:"relative",zIndex:2,background:C.navy,
        border:"1px solid rgba(201,160,90,0.15)",padding:"3.5rem 3rem",
        maxWidth:460,width:"100%",textAlign:"center"}}>
        <div style={{position:"absolute",top:0,left:0,right:0,height:2,
          background:"linear-gradient(to right,transparent,#c9a05a,transparent)"}}/>
        <img src="/logo.png" alt="Mirmont Construction" style={{height:72,marginBottom:"1.5rem",objectFit:"contain"}}
          onError={e=>{e.target.style.display="none";}}/>
        <p style={{fontSize:10,letterSpacing:"0.35em",textTransform:"uppercase",color:C.gold,margin:"0 0 8px",fontWeight:600}}>Client Portal</p>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"2rem",fontWeight:600,
          color:C.white,lineHeight:1.2,margin:"0 0 8px"}}>
          Your Renovation<br/><em style={{fontStyle:"italic",color:C.goldLight}}>Selections</em>
        </h1>
        <p style={{fontSize:12,color:C.textLight,lineHeight:1.8,margin:"0 0 1.5rem"}}>
          Enter your name and project code<br/>provided by your Mirmont Construction team.
        </p>
        <div style={{width:40,height:1,background:"rgba(201,160,90,0.3)",margin:"0 auto 1.5rem"}}/>
        <form onSubmit={handleLogin} style={{textAlign:"left"}}>
          <div style={{marginBottom:"1.2rem"}}>
            <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:C.gold,marginBottom:6}}>Your Name</label>
            <input value={name} onChange={e=>{setName(e.target.value);setError("");}} placeholder="e.g. John & Sarah"
              style={{width:"100%",background:C.navyDark,border:"1px solid rgba(201,160,90,0.2)",
                color:C.white,fontFamily:"'Montserrat',sans-serif",fontSize:14,
                padding:"0.85rem 1.1rem",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <div style={{marginBottom:"0.5rem"}}>
            <label style={{display:"block",fontSize:10,fontWeight:600,letterSpacing:"0.22em",textTransform:"uppercase",color:C.gold,marginBottom:6}}>Project Code</label>
            <input value={code} onChange={e=>{setCode(e.target.value);setError("");}}
              placeholder="e.g. MRM-2024-001" autoCapitalize="characters" spellCheck={false}
              style={{width:"100%",background:C.navyDark,border:"1px solid rgba(201,160,90,0.2)",
                color:C.white,fontFamily:"'Montserrat',sans-serif",fontSize:14,
                padding:"0.85rem 1.1rem",outline:"none",letterSpacing:"0.1em",boxSizing:"border-box"}}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"0.5rem 0 1rem"}}>
            <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:"rgba(200,192,176,0.45)"}}>
              <div onClick={()=>setRemember(r=>!r)} style={{width:14,height:14,border:"1px solid rgba(201,160,90,0.25)",
                background:remember?C.gold:"transparent",flexShrink:0,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:9,color:C.navyDark,fontWeight:700,cursor:"pointer"}}>
                {remember?"✓":""}
              </div>
              Remember me
            </label>
          </div>
          {error&&<div style={{marginBottom:"1rem",fontSize:11,color:C.red,padding:"0.7rem 1rem",border:"1px solid rgba(224,112,112,0.25)",background:"rgba(224,112,112,0.06)"}}>{error}</div>}
          <button type="submit" disabled={loading} style={{
            width:"100%",background:loading?"rgba(201,160,90,0.5)":C.gold,color:C.navyDark,
            border:"none",fontFamily:"'Montserrat',sans-serif",fontSize:11,fontWeight:700,
            letterSpacing:"0.22em",textTransform:"uppercase",padding:"1rem",cursor:loading?"not-allowed":"pointer"}}>
            {loading?"Loading…":"Access My Selections"}
          </button>
        </form>
        <p style={{marginTop:"1.5rem",fontSize:10,color:"rgba(200,192,176,0.35)",lineHeight:1.7}}>
          Need your project code?{" "}
          <a href="mailto:info@mirmont.biz" style={{color:"rgba(201,160,90,0.5)",textDecoration:"none"}}>Contact us</a>
        </p>
      </div>
      <style>{`@keyframes _pulse{0%,100%{opacity:1}50%{opacity:0.3}} input:focus{border-color:rgba(201,160,90,0.6)!important;}`}</style>
    </div>
  );
}

// ─── TASK ROW ────────────────────────────────────────────────────
function TaskRow({pi,ti,task,checked,selection,attachment,threads,adminPhotos,
  onToggle,onOption,onSaveUrl,onUploadPhoto,onUploadDoc,onRemoveImg,onRemoveLink,onRemoveDoc,
  onSendThread,onLightbox,syncStatus}){
  const k=tk(pi,ti);
  const isChecked=!!checked[k];
  const sel=selection||"";
  const att=attachment||{imgs:[],links:[],docs:[]};
  const msgs=threads||{};
  const adminPics=adminPhotos||[];
  const msgEntries=Object.entries(msgs).sort((a,b)=>a[1].ts-b[1].ts);

  const [showCompose,setShowCompose]=useState(false);
  const [showThread,setShowThread]=useState(msgEntries.length>0);
  const [commentText,setCommentText]=useState("");
  const [commentPhoto,setCommentPhoto]=useState(null);
  const [commentPhotoName,setCommentPhotoName]=useState("");
  const [sendingComment,setSendingComment]=useState(false);
  const [showUrlInput,setShowUrlInput]=useState(false);
  const [urlVal,setUrlVal]=useState("");
  const [urlError,setUrlError]=useState("");
  const [fileStatus,setFileStatus]=useState("");
  const [showAttachMenu,setShowAttachMenu]=useState(false);

  useEffect(()=>{ if(msgEntries.length>0) setShowThread(true); },[Object.keys(msgs).length]);

  async function handleSendComment(){
    const text=commentText.trim();
    if(!text) return;
    setSendingComment(true);
    let photoUrl=null;
    if(commentPhoto){
      try{
        const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(commentPhoto);});
        const form=new FormData();form.append("image",b64.split(",")[1]);form.append("key",IMGBB_KEY);
        const res=await fetch("https://api.imgbb.com/1/upload",{method:"POST",body:form});
        const data=await res.json();
        if(data.success) photoUrl=data.data.url;
      }catch(_){}
    }
    await onSendThread(k,pi,ti,text,photoUrl);
    setCommentText("");setCommentPhoto(null);setCommentPhotoName("");setSendingComment(false);setShowCompose(false);
    setShowThread(true);
  }

  async function handleUploadPhoto(e){
    const file=e.target.files[0]; if(!file) return;
    setFileStatus("Uploading photo..."); e.target.value="";
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(file);});
      const form=new FormData();form.append("image",b64.split(",")[1]);form.append("key",IMGBB_KEY);
      const res=await fetch("https://api.imgbb.com/1/upload",{method:"POST",body:form});
      const data=await res.json();
      if(data.success){ onUploadPhoto(pi,ti,{url:data.data.url}); setFileStatus(""); }
      else throw new Error();
    }catch(_){ setFileStatus("Upload failed. Try a URL instead."); }
  }

  async function handleUploadDoc(e){
    const file=e.target.files[0]; if(!file) return;
    if(file.size>25*1024*1024){setFileStatus("File too large (max 25MB)");return;}
    setFileStatus("Uploading to Drive..."); e.target.value="";
    try{
      const b64=await new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result.split(",")[1]);r.onerror=rej;r.readAsDataURL(file);});
      const params=new URLSearchParams({fileName:file.name,mimeType:file.type||"application/octet-stream",data:b64});
      const res=await fetch(DRIVE_URL,{method:"POST",body:params});
      const data=await res.json();
      if(data.success){ onUploadDoc(pi,ti,{url:data.url,name:file.name}); setFileStatus(""); }
      else throw new Error(data.error||"Upload failed");
    }catch(e){ setFileStatus("Upload failed — "+e.message); }
  }

  function handleSaveUrl(){
    if(!urlVal.trim()){setUrlError("Please enter a URL.");return;}
    try{new URL(urlVal.trim());}catch(_){setUrlError("Please enter a valid URL.");return;}
    onSaveUrl(pi,ti,urlVal.trim()); setUrlVal(""); setUrlError(""); setShowUrlInput(false);
  }

  const hasPreviews=att.imgs.length>0||att.links.length>0||att.docs.length>0;

  return(
    <div style={{background:C.navy,border:`1px solid ${isChecked?"rgba(74,154,58,0.22)":"rgba(201,160,90,0.1)"}`,
      marginBottom:6,overflow:"hidden",transition:"border-color 0.2s"}}>

      {/* Task top row */}
      <div onClick={()=>onToggle(pi,ti)} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 16px",cursor:"pointer"}}>
        <div style={{width:20,height:20,flexShrink:0,marginTop:2,
          border:`1px solid ${isChecked?C.green:"rgba(201,160,90,0.35)"}`,
          background:isChecked?C.green:"transparent",
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"all 0.2s",fontSize:11,color:C.navyDark,fontWeight:700}}>
          {isChecked?"✓":""}
        </div>
        <div style={{flex:1}}>
          <p style={{fontSize:14,color:isChecked?"rgba(200,192,176,0.35)":C.offWhite,
            margin:"0 0 2px",lineHeight:1.5,textDecoration:isChecked?"line-through":"none"}}>{task.text}</p>
          <p style={{fontSize:11,color:"rgba(201,160,90,0.45)",fontStyle:"italic",margin:0}}>{task.note}</p>
          {sel&&<span style={{display:"inline-block",marginTop:5,padding:"1px 9px",
            border:`1px solid ${C.gold}`,color:C.gold,fontSize:9,letterSpacing:"0.16em",
            textTransform:"uppercase",fontWeight:600}}>{sel}</span>}
        </div>
      </div>

      {/* Options */}
      {task.options&&(
        <div style={{padding:"0 16px 12px 50px",display:"flex",flexWrap:"wrap",gap:6}}>
          {task.options.map(opt=>{
            const isSel=sel===opt;
            return(
              <button key={opt} onClick={e=>{e.stopPropagation();onOption(pi,ti,opt);}} style={{
                background:isSel?"rgba(201,160,90,0.1)":"transparent",
                border:isSel?`2px solid ${C.gold}`:`1px solid rgba(201,160,90,0.2)`,
                color:isSel?C.gold:"rgba(200,192,176,0.5)",
                fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:isSel?700:500,
                letterSpacing:"0.1em",textTransform:"uppercase",
                padding:isSel?"4px 11px":"4px 12px",cursor:"pointer",transition:"all 0.15s",whiteSpace:"nowrap"}}>
                {isSel?"✓  ":""}{opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Admin photos */}
      {adminPics.length>0&&(
        <div style={{padding:"6px 0 6px 50px"}}>
          <span style={{fontSize:9,letterSpacing:"0.2em",textTransform:"uppercase",color:C.gold,opacity:0.6,display:"block",marginBottom:5}}>📸 From Mirmont Construction</span>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {adminPics.map((p,i)=>(
              <img key={i} src={p.url} alt="Project update" onClick={()=>onLightbox(p.url)}
                style={{width:72,height:72,objectFit:"cover",border:"1px solid rgba(201,160,90,0.35)",cursor:"pointer"}}
                onError={e=>{e.target.style.opacity="0.3";}}/>
            ))}
          </div>
        </div>
      )}

      {/* Thread */}
      <div style={{borderTop:"1px solid rgba(201,160,90,0.07)",padding:"8px 14px 8px 50px"}}>
        {showThread&&msgEntries.length>0&&(
          <div style={{marginBottom:8}}>
            {msgEntries.map(([fbKey,m])=>(
              <div key={fbKey} style={{
                background:m.role==="contractor"?"rgba(201,160,90,0.07)":C.navyMid,
                borderLeft:`2px solid ${m.role==="contractor"?C.gold:"rgba(201,160,90,0.3)"}`,
                padding:"6px 10px",marginBottom:4}}>
                <p style={{fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",
                  color:m.role==="contractor"?C.goldLight:"rgba(201,160,90,0.45)",margin:"0 0 2px"}}>
                  {m.sender} · {timeStr(m.ts)}
                </p>
                <p style={{fontSize:12,color:C.offWhite,margin:0,lineHeight:1.6,
                  whiteSpace:"pre-wrap"}} dangerouslySetInnerHTML={{__html:escHtml(m.text).replace(/\n/g,"<br/>")}}/>
                {m.photos&&m.photos.map((url,i)=>(
                  <img key={i} src={url} alt="Photo" onClick={()=>onLightbox(url)}
                    style={{width:72,height:72,objectFit:"cover",marginTop:6,border:"1px solid rgba(201,160,90,0.3)",cursor:"pointer"}}/>
                ))}
              </div>
            ))}
          </div>
        )}
        {!showCompose?(
          <button onClick={()=>{setShowCompose(true);setShowThread(true);}} style={{
            background:"none",border:"none",fontFamily:"'Montserrat',sans-serif",fontSize:11,
            fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",
            color:"rgba(201,160,90,0.4)",cursor:"pointer",padding:"2px 0",display:"flex",alignItems:"center",gap:6}}>
            <span style={{width:5,height:5,borderRadius:"50%",background:"rgba(201,160,90,0.5)",display:"inline-block"}}/>
            {msgEntries.length>0?`${msgEntries.length} comment${msgEntries.length>1?"s":""} · Add reply`:"Leave a comment"}
          </button>
        ):(
          <div style={{marginTop:4}}>
            <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
              <textarea value={commentText} onChange={e=>setCommentText(e.target.value)}
                placeholder="Type a comment..." rows={2}
                style={{flex:1,background:C.navyDark,border:"1px solid rgba(201,160,90,0.18)",
                  color:C.white,fontFamily:"'Montserrat',sans-serif",fontSize:13,
                  padding:"7px 10px",outline:"none",resize:"none",minHeight:50,lineHeight:1.5}}/>
              <button disabled={sendingComment||!commentText.trim()} onClick={handleSendComment} style={{
                background:C.gold,color:C.navyDark,border:"none",fontFamily:"'Montserrat',sans-serif",
                fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",
                padding:"8px 12px",cursor:"pointer",whiteSpace:"nowrap",
                opacity:sendingComment||!commentText.trim()?0.5:1}}>
                {sendingComment?"Sending…":"Send"}
              </button>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap"}}>
              <label style={{display:"inline-flex",alignItems:"center",gap:6,
                background:"transparent",border:"1px solid rgba(201,160,90,0.22)",
                color:"rgba(201,160,90,0.6)",fontFamily:"'Montserrat',sans-serif",fontSize:10,
                fontWeight:600,letterSpacing:"0.12em",textTransform:"uppercase",
                padding:"5px 10px",cursor:"pointer"}}>
                📷 Attach Photo
                <input type="file" accept="image/*" style={{display:"none"}}
                  onChange={e=>{const f=e.target.files[0];if(f){setCommentPhoto(f);setCommentPhotoName(f.name);}e.target.value="";}}/>
              </label>
              {commentPhotoName&&<span style={{fontSize:10,color:"rgba(201,160,90,0.6)",fontStyle:"italic"}}>📎 {commentPhotoName}</span>}
              <button onClick={()=>{setShowCompose(false);setCommentText("");setCommentPhoto(null);setCommentPhotoName("");}} style={{
                background:"none",border:"none",fontFamily:"'Montserrat',sans-serif",fontSize:10,
                color:"rgba(201,160,90,0.4)",cursor:"pointer",padding:"5px 0",letterSpacing:"0.1em",textTransform:"uppercase"}}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attachments */}
      <div style={{borderTop:"1px solid rgba(201,160,90,0.07)",padding:"8px 14px 10px 50px"}}>
        {hasPreviews&&(
          <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8}}>
            {att.imgs.map((img,i)=>(
              <div key={i} style={{position:"relative",width:60,height:60,flexShrink:0}}>
                <img src={img.url} alt="" onClick={()=>onLightbox(img.url)}
                  style={{width:60,height:60,objectFit:"cover",border:"1px solid rgba(201,160,90,0.35)",cursor:"pointer"}}/>
                <button onClick={()=>onRemoveImg(pi,ti,i)} style={{position:"absolute",top:-6,right:-6,
                  width:16,height:16,borderRadius:"50%",background:C.gold,color:C.navyDark,
                  border:"none",fontSize:9,fontWeight:700,cursor:"pointer",display:"flex",
                  alignItems:"center",justifyContent:"center"}}>×</button>
              </div>
            ))}
            {att.links.map((lnk,i)=>(
              <div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,
                background:"rgba(201,160,90,0.08)",border:"1px solid rgba(201,160,90,0.2)",
                padding:"5px 10px",maxWidth:220,position:"relative"}}>
                <a href={lnk.url} target="_blank" rel="noreferrer"
                  style={{fontSize:10,color:C.gold,textDecoration:"none",overflow:"hidden",
                    textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:170}}>🔗 {lnk.url}</a>
                <button onClick={()=>onRemoveLink(pi,ti,i)} style={{background:"none",border:"none",
                  color:"rgba(201,160,90,0.4)",fontSize:12,cursor:"pointer",padding:0,lineHeight:1}}>×</button>
              </div>
            ))}
            {att.docs.map((doc,i)=>(
              <div key={i} style={{display:"inline-flex",alignItems:"center",gap:6,
                background:"rgba(201,160,90,0.06)",border:"1px solid rgba(201,160,90,0.2)",
                padding:"5px 10px",maxWidth:220}}>
                <a href={doc.url} target="_blank" rel="noreferrer"
                  style={{fontSize:10,color:C.goldLight,textDecoration:"none",overflow:"hidden",
                    textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:170}}>📄 {doc.name||"Document"}</a>
                <button onClick={()=>onRemoveDoc(pi,ti,i)} style={{background:"none",border:"none",
                  color:"rgba(201,160,90,0.4)",fontSize:12,cursor:"pointer",padding:0,lineHeight:1}}>×</button>
              </div>
            ))}
          </div>
        )}

        {/* Attach trigger */}
        <div style={{position:"relative",display:"inline-block"}}>
          <button onClick={()=>setShowAttachMenu(m=>!m)} style={{
            display:"flex",alignItems:"center",gap:6,background:"transparent",
            border:"1px solid rgba(201,160,90,0.22)",color:"rgba(201,160,90,0.6)",
            fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:600,
            letterSpacing:"0.14em",textTransform:"uppercase",padding:"5px 12px",cursor:"pointer"}}>
            <span style={{width:16,height:16,borderRadius:"50%",border:"1.5px solid currentColor",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,lineHeight:1}}>
              {showAttachMenu?"×":"+"}
            </span>
            Attach
            <span style={{fontSize:8,opacity:0.6}}>{showAttachMenu?"▴":"▾"}</span>
          </button>
          {showAttachMenu&&(
            <div style={{position:"absolute",bottom:"calc(100% + 6px)",left:0,minWidth:160,
              background:C.navy,border:"1px solid rgba(201,160,90,0.22)",
              boxShadow:"0 8px 32px rgba(0,0,0,0.55)",zIndex:200}}>
              <div onClick={()=>{setShowUrlInput(true);setShowAttachMenu(false);}} style={{
                display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                cursor:"pointer",fontSize:12,color:"rgba(200,192,176,0.7)",
                borderBottom:"1px solid rgba(201,160,90,0.07)"}}>
                🔗 Add Link
              </div>
              <label style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                cursor:"pointer",fontSize:12,color:"rgba(200,192,176,0.7)",
                borderBottom:"1px solid rgba(201,160,90,0.07)"}}>
                📷 Upload Photo
                <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{handleUploadPhoto(e);setShowAttachMenu(false);}}/>
              </label>
              <label style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",
                cursor:"pointer",fontSize:12,color:"rgba(200,192,176,0.7)"}}>
                📄 Upload Doc
                <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx" style={{display:"none"}} onChange={e=>{handleUploadDoc(e);setShowAttachMenu(false);}}/>
              </label>
            </div>
          )}
        </div>
        {fileStatus&&<span style={{fontSize:10,color:fileStatus.includes("fail")?"#e07070":"rgba(201,160,90,0.5)",fontStyle:"italic",marginLeft:10}}>{fileStatus}</span>}

        {showUrlInput&&(
          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
            <input value={urlVal} onChange={e=>{setUrlVal(e.target.value);setUrlError("");}}
              placeholder="https://..." type="url"
              onKeyDown={e=>{if(e.key==="Enter")handleSaveUrl();}}
              style={{flex:1,minWidth:180,background:C.navy,border:"1px solid rgba(201,160,90,0.2)",
                color:C.offWhite,fontFamily:"'Montserrat',sans-serif",fontSize:12,
                padding:"7px 10px",outline:"none"}}/>
            <button onClick={handleSaveUrl} style={{background:C.gold,color:C.navyDark,border:"none",
              fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:700,letterSpacing:"0.14em",
              textTransform:"uppercase",padding:"7px 14px",cursor:"pointer"}}>Save</button>
            <button onClick={()=>{setShowUrlInput(false);setUrlVal("");setUrlError("");}} style={{
              background:"none",border:"none",fontFamily:"'Montserrat',sans-serif",fontSize:10,
              color:"rgba(201,160,90,0.4)",cursor:"pointer",padding:"7px 4px"}}>Cancel</button>
            {urlError&&<span style={{fontSize:10,color:C.red,width:"100%"}}>{urlError}</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────
export default function App(){
  const [session,setSession]          = useState(null);
  const [checked,setChecked]          = useState({});
  const [selections,setSelections]    = useState({});
  const [attachments,setAttachments]  = useState({});
  const [threads,setThreads]          = useState({});
  const [adminPhotos,setAdminPhotos]  = useState({});
  const [activePhases,setActivePhases]= useState(null);
  const [syncStatus,setSyncStatus]    = useState("synced");
  const [view,setView]                = useState("journey");
  const [activePhaseIdx,setActivePhaseIdx] = useState(0);
  const [lightboxUrl,setLightboxUrl]  = useState(null);

  const fbProjectRef  = useRef(null);
  const threadRefs    = useRef({});
  const adminPhotoRef = useRef(null);
  const syncTimer     = useRef(null);
  const suppressRef   = useRef(false);

  // ── Restore session ──
  useEffect(()=>{
    try{
      const s=JSON.parse(sessionStorage.getItem(SESSION_KEY)||"null");
      if(s&&s.code&&s.name) handleLogin(s.code,s.name);
      else{
        const r=JSON.parse(localStorage.getItem(REMEMBER_KEY)||"null");
        if(r&&r.code&&r.name) handleLogin(r.code,r.name);
      }
    }catch(_){}
  },[]);

  function fbWrite(path,value){
    if(!fbProjectRef.current) return;
    setSyncStatus("syncing");
    clearTimeout(syncTimer.current);
    syncTimer.current=setTimeout(()=>{
      set(ref(db,`projects/${safeCode(session.code)}/${path}`),value)
        .then(()=>setSyncStatus("synced"))
        .catch(()=>setSyncStatus("error"));
    },500);
  }

  function handleLogin(code,name){
    const sc=safeCode(code);
    const pRef=ref(db,`projects/${sc}`);
    fbProjectRef.current=pRef;
    setSession({code,name});
    sessionStorage.setItem(SESSION_KEY,JSON.stringify({code,name}));
    setSyncStatus("syncing");

    // Load initial data
    get(pRef).then(snap=>{
      const d=snap.val()||{};
      setChecked(d.checked||{});
      setSelections(d.selections||{});
      setAttachments(d.attachments||{});
      const raw=d.activePhases?Object.values(d.activePhases):null;
      // Normalize: Firebase may store "1" or 1 instead of "01" — convert all to zero-padded strings
      const normalised=raw?raw.map(v=>String(v).padStart(2,"0")):null;
      console.log("[Mirmont] activePhases from Firebase:", raw, "→ normalised:", normalised);
      setActivePhases(normalised);
      setSyncStatus("synced");
    }).catch(()=>setSyncStatus("error"));

    // Live updates
    let firstEcho=true;
    onValue(pRef,snap=>{
      if(firstEcho){firstEcho=false;return;}
      if(suppressRef.current) return;
      const d=snap.val()||{};
      setChecked(d.checked||{});
      setSelections(d.selections||{});
      setAttachments(d.attachments||{});
      const raw2=d.activePhases?Object.values(d.activePhases):null;
      const normalised2=raw2?raw2.map(v=>String(v).padStart(2,"0")):null;
      setActivePhases(normalised2);
      setSyncStatus("synced");
    });

    // Listen threads for all tasks
    PHASES.forEach((phase,pi)=>{
      phase.tasks.forEach((_,ti)=>{
        const k=tk(pi,ti);
        const tRef=ref(db,`projects/${sc}/threads/${k}`);
        onValue(tRef,snap=>{
          setThreads(prev=>({...prev,[k]:snap.val()||{}}));
        });
        threadRefs.current[k]=tRef;
      });
    });

    // Listen admin photos
    const apRef=ref(db,`projects/${sc}/admin_photos`);
    adminPhotoRef.current=apRef;
    onValue(apRef,snap=>{
      const data=snap.val()||{};
      const out={};
      PHASES.forEach((phase,pi)=>{
        phase.tasks.forEach((_,ti)=>{
          const k=tk(pi,ti);
          out[k]=data[k]?Object.values(data[k]):[];
        });
      });
      setAdminPhotos(out);
    });
  }

  function handleLogout(){
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);setChecked({});setSelections({});setAttachments({});
    setThreads({});setAdminPhotos({});setSyncStatus("synced");
    setView("journey");fbProjectRef.current=null;
  }

  // ── Task actions ──
  function toggleTask(pi,ti){
    const k=tk(pi,ti); const next=!checked[k];
    suppressRef.current=true;
    setChecked(p=>({...p,[k]:next}));
    fbWrite(`checked/${k}`,next);
    setTimeout(()=>{suppressRef.current=false;},1000);
    // Log to sheets
    try{fetch(SHEETS_URL,{method:"POST",mode:"no-cors",body:new URLSearchParams({projectCode:session.code,clientName:session.name,phaseLabel:PHASES[pi].label,phaseName:PHASES[pi].name,taskText:PHASES[pi].tasks[ti].text,checked:next,timestamp:new Date().toISOString()})});}catch(_){}
  }

  function setOption(pi,ti,opt){
    const k=tk(pi,ti);
    suppressRef.current=true;
    setSelections(p=>({...p,[k]:opt}));
    setChecked(p=>({...p,[k]:true}));
    fbWrite(`selections/${k}`,opt);
    fbWrite(`checked/${k}`,true);
    setTimeout(()=>{suppressRef.current=false;},1000);
  }

  function getAtt(pi,ti){
    const raw=attachments[tk(pi,ti)];
    const def={imgs:[],links:[],docs:[]};
    if(!raw) return def;
    try{ const p=typeof raw==="string"?JSON.parse(raw):raw; return Object.assign(def,p); }catch{ return def; }
  }
  function saveAtt(pi,ti,att){
    const k=tk(pi,ti); const str=JSON.stringify(att);
    suppressRef.current=true;
    setAttachments(p=>({...p,[k]:str}));
    fbWrite(`attachments/${k}`,str);
    setTimeout(()=>{suppressRef.current=false;},1000);
  }
  function handleUploadPhoto(pi,ti,imgObj){ const att=getAtt(pi,ti); att.imgs.push(imgObj); saveAtt(pi,ti,att); }
  function handleUploadDoc(pi,ti,docObj){ const att=getAtt(pi,ti); att.docs.push(docObj); saveAtt(pi,ti,att); }
  function handleSaveUrl(pi,ti,url){ const att=getAtt(pi,ti); att.links.push({url}); saveAtt(pi,ti,att); }
  function handleRemoveImg(pi,ti,idx){ const att=getAtt(pi,ti); att.imgs.splice(idx,1); saveAtt(pi,ti,att); }
  function handleRemoveLink(pi,ti,idx){ const att=getAtt(pi,ti); att.links.splice(idx,1); saveAtt(pi,ti,att); }
  function handleRemoveDoc(pi,ti,idx){ const att=getAtt(pi,ti); att.docs.splice(idx,1); saveAtt(pi,ti,att); }

  async function handleSendThread(k,pi,ti,text,photoUrl){
    if(!fbProjectRef.current) return;
    const msg={text,role:"client",sender:session.name,ts:Date.now()};
    if(photoUrl) msg.photos=[photoUrl];
    await push(ref(db,`projects/${safeCode(session.code)}/threads/${k}`),msg);
  }

  const stats=totalStats(checked,PHASES);
  const visiblePhases=PHASES.filter(p=>!activePhases||activePhases.includes(p.label));

  // ── NOT LOGGED IN ──
  if(!session) return <LoginScreen onLogin={handleLogin}/>;

  // ── JOURNEY VIEW ──────────────────────────────────────────────
  if(view==="journey"||view==="summary"){
    const isSummary=view==="summary";
    return(
      <div style={{minHeight:"100vh",background:C.navyDark,fontFamily:"'Montserrat',sans-serif",color:C.white}}>
        <Lightbox url={lightboxUrl} onClose={()=>setLightboxUrl(null)}/>

        {/* Hero */}
        <div style={{background:C.navy,borderBottom:"1px solid rgba(201,160,90,0.15)",
          padding:"40px 20px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"repeating-linear-gradient(45deg,rgba(201,160,90,0.03) 0,rgba(201,160,90,0.03) 1px,transparent 0,transparent 50%)",backgroundSize:"24px 24px"}}/>
          <div style={{position:"relative",zIndex:2}}>
            <img src="/logo.png" alt="Mirmont Construction" style={{height:60,marginBottom:16,objectFit:"contain"}} onError={e=>{e.target.style.display="none";}}/>
            <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(1.8rem,6vw,3rem)",fontWeight:600,lineHeight:1.1,color:C.white,margin:"0 0 12px"}}>
              {isSummary?"Selections":"Your Renovation"}<br/>
              <em style={{fontStyle:"italic",color:C.goldLight}}>{isSummary?"Summary":"Journey Guide"}</em>
            </h1>
            <GoldRule style={{margin:"0 auto 14px"}}/>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(201,160,90,0.08)",
              border:"1px solid rgba(201,160,90,0.2)",padding:"5px 14px",marginBottom:16}}>
              <div style={{width:5,height:5,borderRadius:"50%",background:C.gold}}/>
              <span style={{fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color:C.gold,fontWeight:600}}>
                {session.name}
              </span>
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,
              background:"rgba(201,160,90,0.06)",border:"1px solid rgba(201,160,90,0.15)",
              padding:"12px 20px",maxWidth:300,margin:"0 auto"}}>
              <ProgressRing pct={stats.pct} size={48}/>
              <div style={{textAlign:"left"}}>
                <p style={{fontSize:9,letterSpacing:"0.28em",textTransform:"uppercase",color:C.gold,margin:"0 0 2px",fontWeight:600}}>Overall Progress</p>
                <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:C.white,margin:0,lineHeight:1}}>
                  {stats.done} <span style={{color:C.gold}}>/ {stats.total}</span>
                </p>
                <p style={{fontSize:10,color:C.textLight,margin:"2px 0 0"}}>{stats.pct}% complete</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",
          background:C.navyMid,borderBottom:"1px solid rgba(201,160,90,0.1)",padding:"0 16px"}}>
          <div style={{display:"flex"}}>
            {["journey","summary"].map(t=>(
              <button key={t} onClick={()=>setView(t)} style={{
                background:"none",border:"none",
                borderBottom:view===t?`2px solid ${C.gold}`:"2px solid transparent",
                color:view===t?C.gold:C.textLight,fontFamily:"'Montserrat',sans-serif",
                fontSize:10,fontWeight:600,letterSpacing:"0.2em",textTransform:"uppercase",
                padding:"13px 16px",cursor:"pointer",transition:"all 0.2s"}}>
                {t==="journey"?"Journey":"Summary"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <SyncDot status={syncStatus}/>
            <button onClick={handleLogout} style={{background:"none",border:"1px solid rgba(201,160,90,0.2)",
              color:"rgba(201,160,90,0.5)",fontFamily:"'Montserrat',sans-serif",fontSize:9,
              fontWeight:600,letterSpacing:"0.18em",textTransform:"uppercase",
              padding:"6px 12px",cursor:"pointer"}}>Sign Out</button>
          </div>
        </div>

        {/* Journey grid */}
        {!isSummary&&(
          <div style={{padding:"24px 14px 48px",maxWidth:900,margin:"0 auto"}}>
            <p style={{fontSize:10,letterSpacing:"0.28em",textTransform:"uppercase",
              color:"rgba(201,160,90,0.4)",marginBottom:18,textAlign:"center"}}>
              Tap a phase to begin your selections
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))",gap:10}}>
              {visiblePhases.map((phase,vpi)=>{
                const pi=PHASES.findIndex(p=>p.label===phase.label);
                if(pi===-1) return null;
                const ps=phaseStats(pi,checked);
                const complete=ps.done===ps.total;
                const inprog=ps.done>0&&!complete;
                return(
                  <button key={pi} onClick={()=>{setActivePhaseIdx(pi);setView("phase");}}
                    onMouseEnter={e=>{const el=e.currentTarget;el.style.background="#132660";el.style.borderColor=complete?"rgba(74,154,58,0.8)":inprog?"rgba(201,160,90,0.8)":"rgba(201,160,90,0.5)";el.style.transform="translateY(-3px)";el.style.boxShadow="0 10px 36px rgba(201,160,90,0.14)";}}
                    onMouseLeave={e=>{const el=e.currentTarget;el.style.background=C.navy;el.style.borderColor=complete?"rgba(74,154,58,0.4)":inprog?"rgba(201,160,90,0.3)":"rgba(201,160,90,0.1)";el.style.transform="translateY(0)";el.style.boxShadow="none";}}
                    style={{
                    background:C.navy,
                    border:`1px solid ${complete?"rgba(74,154,58,0.4)":inprog?"rgba(201,160,90,0.3)":"rgba(201,160,90,0.1)"}`,
                    borderRadius:20,
                    cursor:"pointer",padding:"22px",textAlign:"left",position:"relative",
                    transition:"all 0.2s ease"}}>

                    <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:12}}>
                      <div style={{flex:1,paddingRight:14}}>
                        <p style={{fontSize:10,letterSpacing:"0.28em",textTransform:"uppercase",color:"rgba(201,160,90,0.5)",margin:"0 0 6px"}}>Phase {phase.label}</p>
                        <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:C.white,margin:0,lineHeight:1.2}}>{phase.name}</h3>
                      </div>
                      {/* Square rounded photo thumbnail — top right */}
                      <div style={{
                        width:86,height:86,flexShrink:0,
                        borderRadius:14,
                        overflow:"hidden",
                        border:`1px solid ${complete?"rgba(74,154,58,0.4)":"rgba(201,160,90,0.25)"}`,
                        background:C.navyMid,
                        pointerEvents:"none",
                      }}>
                        <img src={PHASE_IMAGES[pi]} alt={phase.name}
                          style={{width:"100%",height:"100%",objectFit:"cover",objectPosition:"center",display:"block",pointerEvents:"none"}}
                          onError={e=>{e.target.style.display="none";}}/>
                      </div>
                    </div>
                    <p style={{fontSize:13,color:C.textLight,lineHeight:1.7,margin:"0 0 14px"}}>{phase.description}</p>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <span style={{fontSize:11,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:600,
                        color:complete?C.green:inprog?C.gold:"rgba(201,160,90,0.4)"}}>
                        {complete?"Complete ✓":inprog?`${ps.done} of ${ps.total} done`:`${ps.total} selections`}
                      </span>
                      <span style={{color:C.gold,fontSize:16}}>›</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Summary */}
        {isSummary&&(
          <div style={{maxWidth:720,margin:"0 auto",padding:"24px 14px 48px"}}>
            {PHASES.map((phase,pi)=>{
              const ps=phaseStats(pi,checked);
              const complete=ps.done===ps.total;
              const hasSel=phase.tasks.some((_,ti)=>selections[tk(pi,ti)]);
              return(
                <div key={pi} style={{marginBottom:10}}>
                  <button onClick={()=>{setActivePhaseIdx(pi);setView("phase");}} style={{
                    width:"100%",background:C.navy,
                    border:`1px solid ${complete?"rgba(74,154,58,0.3)":"rgba(201,160,90,0.15)"}`,
                    display:"flex",alignItems:"center",gap:14,padding:"12px 16px",cursor:"pointer",textAlign:"left"}}>
                    <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,minWidth:30,
                      color:complete?C.green:ps.done>0?C.gold:"rgba(201,160,90,0.2)"}}>
                      {phase.label}
                    </span>
                    <div style={{flex:1}}>
                      <p style={{fontSize:11,fontWeight:600,letterSpacing:"0.14em",textTransform:"uppercase",color:C.offWhite,margin:"0 0 1px",display:"flex",alignItems:"center",gap:6}}><PhaseIcon name={phase.icon} size={13}/>{phase.name}</p>
                      <p style={{fontSize:10,margin:0,letterSpacing:"0.08em",
                        color:complete?C.green:ps.done>0?C.gold:"rgba(201,160,90,0.35)"}}>
                        {complete?"Complete ✓":ps.done>0?`${ps.done} of ${ps.total} complete`:`${ps.total} tasks — not started`}
                      </p>
                    </div>
                    <span style={{fontSize:10,color:C.gold,letterSpacing:"0.1em",textTransform:"uppercase"}}>Edit ›</span>
                  </button>
                  {hasSel&&(
                    <div style={{background:"rgba(13,30,74,0.5)",border:"1px solid rgba(201,160,90,0.08)",borderTop:"none",padding:"10px 16px 10px 48px"}}>
                      {phase.tasks.map((task,ti)=>{
                        const sel=selections[tk(pi,ti)];
                        if(!sel) return null;
                        return(
                          <div key={ti} style={{display:"flex",gap:10,marginBottom:4,alignItems:"baseline"}}>
                            <p style={{fontSize:12,color:C.textLight,margin:0,flex:1,lineHeight:1.5}}>{task.text}</p>
                            <span style={{display:"inline-block",padding:"1px 8px",border:`1px solid ${C.gold}`,
                              color:C.gold,fontSize:9,letterSpacing:"0.15em",textTransform:"uppercase",fontWeight:600,whiteSpace:"nowrap"}}>
                              {sel}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Pending */}
            {(()=>{
              const pending=[];
              PHASES.forEach((phase,pi)=>phase.tasks.forEach((task,ti)=>{
                if(!checked[tk(pi,ti)]) pending.push({phase:phase.name,task:task.text,pi});
              }));
              if(!pending.length) return(
                <div style={{textAlign:"center",padding:"28px 20px",background:"rgba(74,154,58,0.08)",border:"1px solid rgba(74,154,58,0.25)",marginTop:8}}>
                  <p style={{fontSize:26,margin:"0 0 6px"}}>🎉</p>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,color:C.green,margin:"0 0 6px",fontWeight:600}}>All Selections Complete</p>
                  <p style={{fontSize:12,color:C.textLight,margin:0}}>Your renovation journey is fully mapped. Your Mirmont team has been notified.</p>
                </div>
              );
              return(
                <div style={{marginTop:8,background:C.navy,border:"1px solid rgba(201,160,90,0.15)",padding:"16px"}}>
                  <p style={{fontSize:10,letterSpacing:"0.3em",textTransform:"uppercase",color:C.gold,margin:"0 0 12px",fontWeight:600}}>
                    Pending Decisions ({pending.length})
                  </p>
                  {pending.slice(0,8).map((p,i)=>(
                    <div key={i} onClick={()=>{setActivePhaseIdx(p.pi);setView("phase");}} style={{
                      display:"flex",gap:10,padding:"6px 0",cursor:"pointer",
                      borderBottom:i<Math.min(pending.length,8)-1?"1px solid rgba(201,160,90,0.07)":"none"}}>
                      <span style={{width:5,height:5,borderRadius:"50%",background:"rgba(201,160,90,0.4)",flexShrink:0,marginTop:6}}/>
                      <div>
                        <p style={{fontSize:12,color:C.offWhite,margin:"0 0 1px",lineHeight:1.4}}>{p.task}</p>
                        <p style={{fontSize:10,color:"rgba(201,160,90,0.4)",margin:0,letterSpacing:"0.08em"}}>{p.phase}</p>
                      </div>
                    </div>
                  ))}
                  {pending.length>8&&<p style={{fontSize:10,color:"rgba(201,160,90,0.4)",margin:"8px 0 0",letterSpacing:"0.1em",textTransform:"uppercase"}}>+ {pending.length-8} more pending</p>}
                </div>
              );
            })()}
          </div>
        )}
        <style>{`@keyframes _pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    );
  }

  // ── PHASE DETAIL ──────────────────────────────────────────────
  if(view==="phase"){
    const phase=PHASES[activePhaseIdx];
    const ps=phaseStats(activePhaseIdx,checked);
    return(
      <div style={{minHeight:"100vh",background:C.navyDark,fontFamily:"'Montserrat',sans-serif",color:C.white}}>
        <Lightbox url={lightboxUrl} onClose={()=>setLightboxUrl(null)}/>

        {/* Sticky header */}
        <div style={{background:C.navy,borderBottom:"1px solid rgba(201,160,90,0.15)",
          padding:"14px 16px 10px",position:"sticky",top:0,zIndex:50}}>
          <div style={{maxWidth:720,margin:"0 auto"}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:8}}>
              <button onClick={()=>setView("journey")} style={{
                background:"none",border:"1px solid rgba(201,160,90,0.2)",color:C.gold,
                cursor:"pointer",padding:"5px 12px",fontSize:10,fontFamily:"'Montserrat',sans-serif",
                letterSpacing:"0.12em",textTransform:"uppercase",flexShrink:0}}>← Back</button>
              <div style={{flex:1}}>
                <p style={{fontSize:9,letterSpacing:"0.3em",textTransform:"uppercase",color:"rgba(201,160,90,0.5)",margin:"0 0 1px"}}>Phase {phase.label} of 07</p>
                <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:600,color:C.white,margin:0,display:"flex",alignItems:"center",gap:8}}><PhaseIcon name={phase.icon} size={18}/>{phase.name}</h2>
              </div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <ProgressRing pct={ps.pct} size={38}/>
                <p style={{fontSize:9,color:ps.pct===100?C.green:C.gold,margin:"1px 0 0",letterSpacing:"0.1em"}}>{ps.done}/{ps.total}</p>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{flex:1,height:2,background:"rgba(201,160,90,0.15)",borderRadius:1}}>
                <div style={{height:"100%",width:`${ps.pct}%`,borderRadius:1,
                  background:ps.pct===100?C.green:`linear-gradient(to right,${C.goldDark},${C.goldLight})`,
                  transition:"width 0.4s ease"}}/>
              </div>
              <SyncDot status={syncStatus}/>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div style={{maxWidth:720,margin:"0 auto",padding:"16px 14px 110px"}}>
          {phase.tasks.map((task,ti)=>(
            <TaskRow key={ti}
              pi={activePhaseIdx} ti={ti} task={task}
              checked={checked} selection={selections[tk(activePhaseIdx,ti)]}
              attachment={attachments[tk(activePhaseIdx,ti)]?
                (typeof attachments[tk(activePhaseIdx,ti)]==="string"
                  ? (() => { try{return JSON.parse(attachments[tk(activePhaseIdx,ti)]);}catch{return {imgs:[],links:[],docs:[]};} })()
                  : attachments[tk(activePhaseIdx,ti)])
                : {imgs:[],links:[],docs:[]}}
              threads={threads[tk(activePhaseIdx,ti)]||{}}
              adminPhotos={adminPhotos[tk(activePhaseIdx,ti)]||[]}
              onToggle={toggleTask} onOption={setOption}
              onSaveUrl={handleSaveUrl} onUploadPhoto={handleUploadPhoto}
              onUploadDoc={handleUploadDoc} onRemoveImg={handleRemoveImg}
              onRemoveLink={handleRemoveLink} onRemoveDoc={handleRemoveDoc}
              onSendThread={handleSendThread} onLightbox={setLightboxUrl}
              syncStatus={syncStatus}/>
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.navyMid,
          borderTop:"1px solid rgba(201,160,90,0.15)",padding:"12px 16px",
          display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,zIndex:50}}>
          <button onClick={()=>setActivePhaseIdx(i=>Math.max(0,i-1))} disabled={activePhaseIdx===0} style={{
            background:"none",border:"1px solid rgba(201,160,90,0.2)",
            color:activePhaseIdx===0?"rgba(201,160,90,0.25)":C.gold,
            fontFamily:"'Montserrat',sans-serif",fontSize:10,fontWeight:600,
            letterSpacing:"0.14em",textTransform:"uppercase",
            padding:"10px 14px",cursor:activePhaseIdx===0?"default":"pointer",flex:1}}>← Prev</button>
          <span style={{fontSize:9,letterSpacing:"0.18em",color:"rgba(201,160,90,0.45)",textTransform:"uppercase",textAlign:"center",flexShrink:0}}>
            {activePhaseIdx+1} / {PHASES.length}
          </span>
          {activePhaseIdx<PHASES.length-1?(
            <button onClick={()=>setActivePhaseIdx(i=>i+1)} style={{
              background:C.gold,border:"none",color:C.navyDark,fontFamily:"'Montserrat',sans-serif",
              fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",
              padding:"10px 14px",cursor:"pointer",flex:1}}>Next Phase →</button>
          ):(
            <button onClick={()=>setView("summary")} style={{
              background:C.green,border:"none",color:C.white,fontFamily:"'Montserrat',sans-serif",
              fontSize:10,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",
              padding:"10px 14px",cursor:"pointer",flex:1}}>View Summary →</button>
          )}
        </div>
        <style>{`@keyframes _pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>
    );
  }

  return null;
}
