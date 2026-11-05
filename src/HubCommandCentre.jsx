import React, { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Bell, BookOpen, Bot,
  Boxes, Calculator, CheckCircle2, ChevronRight, CircleDollarSign, Compass, Crosshair,
  Flame, Gauge, Gem, Layers3, LineChart, ListChecks, Map, Radar, Search, Shield,
  Sparkles, Swords, Target, TrendingUp, Wallet, Zap
} from "lucide-react";

const read = (key, fallback) => {
  try { const value = JSON.parse(localStorage.getItem(key) || "null"); return value ?? fallback; }
  catch { return fallback; }
};
const gp = value => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2).replace(/\.00$/, "") + "b";
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2).replace(/\.00$/, "") + "m";
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "k";
  return Math.round(n).toLocaleString("en-GB");
};
const shortName = value => String(value || "Unknown item").replace(/\s+/g, " ").trim();

const GROUPS = [
  {
    title: "Trading intelligence",
    intro: "Find, evaluate and manage opportunities across the Grand Exchange.",
    links: [
      ["market", "Live Market", "Live prices, item search and tax-aware margins", TrendingUp],
      ["terminal", "Trading Terminal", "Multi-chart workspace, order planning and profiles", LineChart],
      ["screener", "Opportunity Screener", "Build filters, sort columns and save scan profiles", Radar],
      ["movers", "Market Analysis", "Movers, market breadth and stability signals", Activity],
      ["heatmap", "Market Radar", "Visual market map by margin, volume and ROI", BarChart3],
      ["backtest", "Historical Backtester", "Replay observed price windows with explicit limitations", Crosshair],
      ["watch", "Watchlists", "Track ideas and keep separate market lists", Boxes],
      ["alerts", "Alerts", "Price triggers, notification history and Discord settings", Bell]
    ]
  },
  {
    title: "Account and combat",
    intro: "Turn your account data, goals and gear into a practical progression plan.",
    links: [
      ["account", "Account Studio", "Account tracker, loadouts, quests and calculators", Shield],
      ["combat", "Combat Studio", "Account-aware gear, combat scenarios and upgrades", Swords],
      ["quests", "Quest Pathway", "Quest goals, prerequisites and progress checklist", Map],
      ["levelling", "Levelling Planner", "Skill targets, XP requirements and training plans", Target]
    ]
  },
  {
    title: "OSRS knowledge",
    intro: "Understand items, monsters, drops, methods and the links between them.",
    links: [
      ["intelligence", "OSRS Brain", "Search the structured knowledge base and evidence", BookOpen],
      ["cool", "Tools and Utilities", "The OSRS tool shelf and supporting calculators", Calculator],
      ["recipes", "Recipes and Production", "Compare inputs, outputs and live recipe economics", Layers3],
      ["money", "Money Makers", "Browse methods by requirements and intensity", CircleDollarSign],
      ["highalch", "High Alcher", "Alchemy margins, rune costs and item checks", Flame]
    ]
  },
  {
    title: "Personal finance",
    intro: "Keep the trading activity and the longer-term GP plan connected.",
    links: [
      ["dashboard", "Dashboard", "Personal overview, saved tools and workspace pins", Gauge],
      ["finance", "Flip Journal and P&L", "Log trades, calculate realised profit and review habits", Wallet]
    ]
  }
];

function screeningRank(item) {
  const margin = Math.max(0, Number(item.margin) || 0);
  const buy = Math.max(1, Number(item.buy) || 1);
  const volume = Math.max(0, Number(item.volume) || 0);
  const flip = Math.max(0, Math.min(100, Number(item.flipScore) || 0));
  const risk = Math.max(0, Math.min(100, Number(item.riskScore) || 0));
  const liquidity = Math.min(22, Math.log10(volume + 1) * 7);
  const roi = Math.min(18, (margin / buy) * 100 * 1.2);
  return Math.round(Math.max(0, Math.min(100, flip * 0.55 + liquidity + roi - risk * 0.12)));
}

export default function HubCommandCentre({ items = [], watch = [], alerts = [], navigateTab, onSelect, loading = false, updated = null }) {
  const [bankroll, setBankroll] = useState(() => String(read("osrshub-command-bankroll", 10000000)));
  const [goalName, setGoalName] = useState(() => read("osrshub-command-goal-name", "Next upgrade"));
  const [goalTarget, setGoalTarget] = useState(() => String(read("osrshub-command-goal-target", 50000000)));
  const [goalCurrent, setGoalCurrent] = useState(() => String(read("osrshub-command-goal-current", 0)));
  const [pins, setPins] = useState(() => read("osrshub-command-pins", ["next", "market", "goal", "tools"]));
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("overview");

  useEffect(() => { localStorage.setItem("osrshub-command-bankroll", JSON.stringify(Number(bankroll) || 0)); }, [bankroll]);
  useEffect(() => { localStorage.setItem("osrshub-command-goal-name", JSON.stringify(goalName)); }, [goalName]);
  useEffect(() => { localStorage.setItem("osrshub-command-goal-target", JSON.stringify(Number(goalTarget) || 0)); }, [goalTarget]);
  useEffect(() => { localStorage.setItem("osrshub-command-goal-current", JSON.stringify(Number(goalCurrent) || 0)); }, [goalCurrent]);
  useEffect(() => { localStorage.setItem("osrshub-command-pins", JSON.stringify(pins)); }, [pins]);

  const ranked = useMemo(() => items
    .filter(x => Number(x.buy) > 0 && Number(x.sell) > Number(x.buy) && Number(x.margin) > 0 && Number(x.volume) > 0)
    .map(x => ({ ...x, hubRank: screeningRank(x) }))
    .sort((a, b) => b.hubRank - a.hubRank || (Number(b.margin) || 0) - (Number(a.margin) || 0))
    .slice(0, 8), [items]);
  const movers = useMemo(() => [...items]
    .filter(x => Number(x.volume) > 0 && Number(x.sell) > 0)
    .sort((a, b) => (Number(b.volume) || 0) - (Number(a.volume) || 0))
    .slice(0, 5), [items]);
  const eligibleCount = useMemo(() => items.filter(x => Number(x.buy) > 0 && Number(x.sell) > Number(x.buy) && Number(x.margin) > 0).length, [items]);
  const progress = Math.max(0, Math.min(100, Number(goalTarget) > 0 ? (Number(goalCurrent) / Number(goalTarget)) * 100 : 0));
  const filteredGroups = useMemo(() => GROUPS.map(group => ({
    ...group,
    links: group.links.filter(link => !query || (link[1] + " " + link[2]).toLowerCase().includes(query.toLowerCase()))
  })).filter(group => group.links.length), [query]);

  const togglePin = key => setPins(current => current.includes(key) ? current.filter(x => x !== key) : [...current, key]);
  const go = key => navigateTab?.(key);
  const best = ranked[0];

  return <section className="hubCommandPage">
    <header className="hubCommandHero">
      <div className="hubHeroAtmosphere" aria-hidden="true"><i/><i/><i/></div>
      <div className="hubHeroCopy">
        <div className="hubEyebrow"><span className="hubLiveDot"/> OSRS HUB · PERSONAL INTELLIGENCE</div>
        <h1>Your Gielinor.<br/><em>One clear next move.</em></h1>
        <p>Markets, account progression, combat planning and OSRS knowledge — connected in one workspace.</p>
        <div className="hubHeroActions">
          <button className="hubActionPrimary" onClick={() => go("terminal")}><LineChart size={16}/> Open trading terminal <ArrowRight size={15}/></button>
          <button className="hubActionSecondary" onClick={() => go("account")}><UserIcon/> Account workspace</button>
        </div>
      </div>
      <div className="hubHeroOrb" aria-hidden="true"><div className="hubOrbRing"/><div className="hubOrbCore"><Gem size={35}/></div><span className="hubOrbRune">ᚱ</span></div>
      <div className="hubHeroMeta"><span>{loading ? "Refreshing market snapshot" : "Market snapshot available"}</span><b>{updated ? new Date(updated).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "Awaiting first refresh"}</b></div>
    </header>

    <div className="hubMetricRow">
      <div className="hubMetric"><span>Loaded market items</span><strong>{items.length.toLocaleString("en-GB")}</strong><small>Current dataset</small></div>
      <div className="hubMetric"><span>Positive margins</span><strong>{eligibleCount.toLocaleString("en-GB")}</strong><small>Within loaded items</small></div>
      <div className="hubMetric"><span>Watchlist items</span><strong>{watch.length.toLocaleString("en-GB")}</strong><small>Active list</small></div>
      <div className="hubMetric"><span>Active alerts</span><strong>{alerts.length.toLocaleString("en-GB")}</strong><small>Stored notifications</small></div>
      <div className="hubMetric hubMetricStatus"><span>Data status</span><strong>{loading ? "Updating" : items.length ? "Connected" : "Waiting"}</strong><small>{items.length ? "Live market feed" : "No cached snapshot yet"}</small></div>
    </div>

    <nav className="hubSectionTabs" aria-label="Command Centre sections">
      {[["overview","Overview"],["trading","Trading"],["account","Account"],["knowledge","OSRS Brain"],["planner","GP planner"]].map(([key,label]) =>
        <button key={key} className={section === key ? "active" : ""} onClick={() => setSection(key)}>{label}</button>
      )}
    </nav>

    {section === "overview" && <>
      <div className="hubCommandTopGrid">
        <section className="hubPanel hubNextMove">
          <div className="hubPanelHeading"><div><span className="hubEyebrow">NEXT MOVE ENGINE</span><h2>Start with the strongest signal.</h2></div><span className="hubPanelIcon"><Sparkles size={18}/></span></div>
          {best ? <div className="hubNextItem">
            {best.icon && <img src={best.icon} alt="" onError={e => { e.currentTarget.style.display = "none"; }}/>}
            <div className="hubNextItemCopy"><strong>{shortName(best.name)}</strong><span>{gp(best.margin)} after-tax margin · {gp(best.volume)} volume</span><small>Screening rank {best.hubRank}/100 · inspect the item before placing an order</small></div>
            <div className="hubRank">{best.hubRank}<small>RANK</small></div>
            <button className="hubRoundButton" onClick={() => onSelect?.(best)} aria-label={"Open " + best.name}><ChevronRight size={18}/></button>
          </div> : <div className="hubEmpty">No qualifying positive-margin items in the current loaded snapshot. Open the market or adjust the screener filters.</div>}
          <div className="hubMethodNote">Transparent screening heuristic using the current margin, liquidity, flip score and risk score fields. It is not a fill prediction or a guaranteed-profit recommendation.</div>
          <button className="hubTextLink" onClick={() => go("screener")}>Refine in the opportunity screener <ArrowRight size={14}/></button>
        </section>

        <section className="hubPanel hubBriefing">
          <div className="hubPanelHeading"><div><span className="hubEyebrow">DAILY BRIEFING</span><h2>Your workspace at a glance.</h2></div><span className="hubPanelIcon"><Sparkles size={18}/></span></div>
          <div className="hubBriefRows">
            <div><span className="hubBriefIcon"><Activity size={15}/></span><p><strong>{eligibleCount.toLocaleString("en-GB")} loaded items</strong><small>currently show a positive after-tax margin</small></p><span className="hubBriefValue">Market</span></div>
            <div><span className="hubBriefIcon"><StarIcon/></span><p><strong>{watch.length} watched items</strong><small>in the active watchlist</small></p><span className="hubBriefValue">Track</span></div>
            <div><span className="hubBriefIcon"><Bell size={15}/></span><p><strong>{alerts.length} saved notifications</strong><small>review triggered alerts and reset conditions</small></p><span className="hubBriefValue">Alerts</span></div>
          </div>
          <button className="hubTextLink" onClick={() => go("dashboard")}>Open personal dashboard <ArrowRight size={14}/></button>
        </section>
      </div>

      <div className="hubCommandLowerGrid">
        <section className="hubPanel">
          <div className="hubPanelHeading"><div><span className="hubEyebrow">MARKET PULSE</span><h2>Liquid items to inspect.</h2></div><button className="hubMiniLink" onClick={() => go("market")}>Full market <ArrowUpRight size={14}/></button></div>
          <div className="hubMarketList">
            {movers.map((item, index) => <button className="hubMarketRow" key={item.id} onClick={() => onSelect?.(item)}>
              <span className="hubMarketIndex">{String(index + 1).padStart(2, "0")}</span>
              {item.icon && <img src={item.icon} alt="" onError={e => { e.currentTarget.style.display = "none"; }}/>}
              <span className="hubMarketName"><strong>{shortName(item.name)}</strong><small>{gp(item.volume)} 24h volume</small></span>
              <span className="hubMarketPrice"><strong>{gp(item.sell)} gp</strong><small>Sell-side snapshot</small></span>
              <ChevronRight size={15}/>
            </button>)}
            {!movers.length && <div className="hubEmpty">Market data will appear here after the first successful refresh.</div>}
          </div>
        </section>

        <section className="hubPanel hubGoalPanel">
          <div className="hubPanelHeading"><div><span className="hubEyebrow">PERSONAL GOAL</span><h2>Give your GP a destination.</h2></div><span className="hubPanelIcon"><Target size={18}/></span></div>
          <label className="hubField"><span>Goal name</span><input value={goalName} onChange={e => setGoalName(e.target.value)} maxLength={48}/></label>
          <div className="hubFieldPair"><label className="hubField"><span>Current GP</span><input inputMode="numeric" value={goalCurrent} onChange={e => setGoalCurrent(e.target.value.replace(/[^0-9]/g, ""))}/></label><label className="hubField"><span>Target GP</span><input inputMode="numeric" value={goalTarget} onChange={e => setGoalTarget(e.target.value.replace(/[^0-9]/g, ""))}/></label></div>
          <div className="hubGoalTrack"><span style={{width: progress + "%"}}/></div>
          <div className="hubGoalFoot"><strong>{progress.toFixed(0)}% complete</strong><span>{gp(Math.max(0, Number(goalTarget) - Number(goalCurrent)))} gp to go</span></div>
          <button className="hubTextLink" onClick={() => go("finance")}>Open Flip Journal and bankroll tools <ArrowRight size={14}/></button>
        </section>
      </div>

      <section className="hubPanel hubWorkspacePanel">
        <div className="hubPanelHeading"><div><span className="hubEyebrow">YOUR OSRS WORKSPACE</span><h2>Everything has a place.</h2><p>Pin the areas you use most. The original pages and tools remain available.</p></div><button className="hubMiniLink" onClick={() => setPins(GROUPS.flatMap(g => g.links.map(l => l[0])))}>Pin all areas</button></div>
        <div className="hubWorkspaceGrid">
          {GROUPS.flatMap(group => group.links).map(([key,label,description,Icon]) => <button key={key} className="hubWorkspaceTile" onClick={() => go(key)}>
            <span className="hubWorkspaceIcon"><Icon size={17}/></span><span><strong>{label}</strong><small>{description}</small></span><span className="hubWorkspaceArrow"><ArrowUpRight size={15}/></span>
          </button>)}
        </div>
      </section>
    </>}

    {section === "trading" && <>
      <section className="hubPanel">
        <div className="hubPanelHeading"><div><span className="hubEyebrow">TRADING INTELLIGENCE</span><h2>From discovery to review.</h2><p>Use a consistent workflow: scan, inspect, plan, execute, log and learn.</p></div></div>
        <div className="hubWorkflowSteps">
          {[["01","Discover","Filter liquid items and compare margins.","screener",Radar],["02","Research","Open the item dossier and inspect recent prices.","market",Search],["03","Plan","Compare candidates in the trading terminal.","terminal",LineChart],["04","Monitor","Save items and create alert rules.","watch",Bell],["05","Review","Record fills and analyse realised P&L.","finance",Wallet]].map(([n,title,desc,key,Icon]) => <button key={n} onClick={() => go(key)}><span>{n}</span><Icon size={19}/><strong>{title}</strong><small>{desc}</small><ArrowRight size={15}/></button>)}
        </div>
      </section>
      <section className="hubPanel"><div className="hubPanelHeading"><div><span className="hubEyebrow">CURRENT SNAPSHOT RANKING</span><h2>Top screening candidates.</h2></div><button className="hubMiniLink" onClick={() => go("screener")}>Open screener</button></div>
        <div className="hubMarketList">{ranked.map(x => <button className="hubMarketRow" key={x.id} onClick={() => onSelect?.(x)}><span className="hubRankMini">{x.hubRank}</span><span className="hubMarketName"><strong>{shortName(x.name)}</strong><small>{gp(x.margin)} margin · {gp(x.volume)} volume</small></span><span className="hubMarketPrice"><strong>{gp(x.buy)} / {gp(x.sell)} gp</strong><small>Buy / sell snapshot</small></span><ChevronRight size={15}/></button>)}</div>
      </section>
    </>}

    {section === "account" && <>
      <section className="hubPanel hubAccountIntro"><div><span className="hubEyebrow">ACCOUNT-TO-GOAL WORKFLOWS</span><h2>Make every upgrade part of a plan.</h2><p>Use your imported or manually maintained account data as the source of truth. Missing quest, item requirement or combat data must be shown as unknown — never assumed complete.</p></div><button className="hubActionPrimary" onClick={() => go("account")}>Open Account Studio <ArrowRight size={15}/></button></section>
      <div className="hubFeatureGrid">{[
        ["Bank-to-Build","Enter your GP budget, compare gear options and see the trade-offs.","combat",Swords],
        ["Quest-to-Upgrade","Trace the quest and skill unlocks behind an equipment goal.","quests",BookOpen],
        ["Boss Preparation Passport","Bring stats, gear, supplies and a budget into one preparation checklist.","combat",Shield],
        ["GP Efficiency Planner","Compare a money-making method against the GP and XP goal you care about.","money",CircleDollarSign],
        ["Skill Progress Map","Connect XP targets to your next account milestone.","levelling",Target],
        ["Account Readiness","Review missing account fields and data confidence before optimisation.","account",CheckCircle2]
      ].map(([title,desc,key,Icon]) => <button className="hubFeatureTile" key={title} onClick={() => go(key)}><Icon size={19}/><strong>{title}</strong><small>{desc}</small><span>Open workspace <ArrowRight size={13}/></span></button>)}</div>
    </>}

    {section === "knowledge" && <>
      <section className="hubPanel hubAccountIntro"><div><span className="hubEyebrow">OSRS BRAIN</span><h2>Explore how the game connects.</h2><p>Items, equipment, monsters, drops, quests, recipes and travel links belong in a source-backed knowledge system. Every uncertain field should retain its source and confidence.</p></div><button className="hubActionPrimary" onClick={() => go("intelligence")}>Open OSRS Brain <ArrowRight size={15}/></button></section>
      <div className="hubKnowledgeGrid">{[
        ["Item relationship explorer","Trace upgrades, variants, crafting inputs and alternatives.",Boxes],
        ["Monster and drop explorer","Review combat records and published drop evidence.",Swords],
        ["Quest dependency graph","Map confirmed prerequisite chains and unlocks.",Map],
        ["Evidence and provenance","See where a field came from and whether it is verified.",CheckCircle2],
        ["Production and recipe graph","Follow ingredients, outputs and market costs.",Layers3],
        ["Data change explorer","Review new, changed and missing dataset records.",Activity]
      ].map(([title,desc,Icon]) => <button className="hubKnowledgeCard" key={title} onClick={() => go("intelligence")}><Icon size={18}/><strong>{title}</strong><small>{desc}</small><span>Explore knowledge <ArrowRight size={13}/></span></button>)}</div>
    </>}

    {section === "planner" && <>
      <section className="hubPanel hubPlannerHero"><div><span className="hubEyebrow">BANKROLL ALLOCATOR</span><h2>Give every GP a job.</h2><p>Set a working bankroll, then launch the right tools. This is a planning input only; it does not place GE offers or reserve your in-game cash.</p></div><div className="hubBankrollValue">{gp(bankroll)}<small>GP working budget</small></div></section>
      <section className="hubPanel"><label className="hubField hubBankrollInput"><span>Available bankroll (GP)</span><input inputMode="numeric" value={bankroll} onChange={e => setBankroll(e.target.value.replace(/[^0-9]/g, ""))}/></label>
        <div className="hubBudgetPresets">{[1000000,5000000,10000000,50000000,100000000,250000000].map(v => <button key={v} className={Number(bankroll) === v ? "active" : ""} onClick={() => setBankroll(String(v))}>{gp(v)}</button>)}</div>
        <div className="hubFeatureGrid">{[
          ["Flip allocation","Split your budget across liquid GE opportunities.","terminal",Wallet],
          ["Combat upgrade budget","Find gear upgrades within an account and GP cap.","combat",Swords],
          ["Training budget","Compare methods against an XP target.","levelling",Target],
          ["Money-making plan","Filter income methods by requirements and intensity.","money",CircleDollarSign]
        ].map(([title,desc,key,Icon]) => <button className="hubFeatureTile" key={title} onClick={() => { try { localStorage.setItem("osrshub-planned-budget", String(Number(bankroll) || 0)); } catch {} go(key); }}><Icon size={19}/><strong>{title}</strong><small>{desc}</small><span>Use {gp(bankroll)} GP <ArrowRight size={13}/></span></button>)}</div>
      </section>
    </>}

    <div className="hubFooterNote"><Shield size={14}/> OSRS Hub is an intelligence and planning tool. Market snapshots can be stale, trades can fail to fill and estimates are not guarantees. Always verify important game requirements and source-backed data before acting.</div>
  </section>;
}

function UserIcon(){return <Compass size={16}/>}
function StarIcon(){return <Gem size={15}/>}


const HUB_BREADCRUMB_LABELS = {
  command:"Command Centre", market:"Market", terminal:"Trading Terminal", screener:"Screener",
  movers:"Analysis", intelligence:"OSRS Brain", account:"Account Studio", combat:"Combat Studio",
  quests:"Quest Pathway", levelling:"Levelling", dashboard:"Dashboard", watch:"Watchlists",
  alerts:"Alerts", finance:"Finance", money:"Money Makers", recipes:"Recipes",
  highalch:"High Alcher", cool:"Tools & Utilities", backtest:"Historical Backtester"
};
export function HubBreadcrumbs({ activeTab, navigateTab }) {
  const label = HUB_BREADCRUMB_LABELS[activeTab] || "OSRS Hub";
  return <nav className="hubBreadcrumbs" aria-label="Breadcrumb">
    <button type="button" onClick={() => navigateTab?.("command")}>OSRS Hub</button>
    <ChevronRight size={13} aria-hidden="true"/>
    <span aria-current="page">{label}</span>
  </nav>;
}
