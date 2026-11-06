import React, { useEffect, useMemo, useRef, useState } from "react";
import { Activity, ArrowRight, Bell, BookOpen, Calculator, BarChart3, Clock3, Command, Compass, Database, Layers, ListChecks, Radar, Search, Shield, ShoppingCart, Swords, Target, Wallet, X, Zap } from "lucide-react";
import { searchGlobalActions } from "./global-actions.js";

const icons = {
  activity: Activity, bell: Bell, book: BookOpen, calculator: Calculator, chart: BarChart3,
  clock: Clock3, command: Command, compass: Compass, database: Database, layers: Layers,
  list: ListChecks, radar: Radar, shield: Shield, shopping: ShoppingCart, swords: Swords,
  target: Target, wallet: Wallet, zap: Zap
};

export default function GlobalActionDrawer({ open, onClose, items = [], onRun }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  const closeRef = useRef(onClose);
  const runRef = useRef(onRun);
  closeRef.current = onClose;
  runRef.current = onRun;
  const results = useMemo(() => searchGlobalActions(query, items, 12), [query, items]);

  useEffect(() => {
    if (!open) return undefined;
    setQuery("");
    setActive(0);
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = event => {
      if (event.key === "Escape") { event.preventDefault(); closeRef.current?.(); }
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);
  if (!open) return null;

  const runActive = () => { if (results.length) runRef.current?.(results[Math.min(active, results.length - 1)]); };
  const handleInputKeyDown = event => {
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(index => Math.min(results.length - 1, index + 1)); }
    if (event.key === "ArrowUp") { event.preventDefault(); setActive(index => Math.max(0, index - 1)); }
    if (event.key === "Enter") { event.preventDefault(); runActive(); }
  };

  return <div className="hubActionBackdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) closeRef.current?.(); }}>
    <section className="hubActionDrawer" role="dialog" aria-modal="true" aria-labelledby="hubActionTitle">
      <div className="hubActionHead">
        <div><span className="hubActionEyebrow"><Command size={12}/> OSRS HUB COMMAND</span><h2 id="hubActionTitle">Where do you want to go?</h2><p>Jump to a workspace, open a quick tool or find an item.</p></div>
        <button className="hubActionClose" onClick={() => closeRef.current?.()} aria-label="Close quick actions"><X size={18}/></button>
      </div>
      <label className="hubActionSearch"><Search size={18}/><input ref={inputRef} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={handleInputKeyDown} placeholder="Search pages, tools or OSRS items…" autoComplete="off"/><kbd>ESC</kbd></label>
      <div className="hubActionResults" role="listbox" aria-label="Quick actions">
        {results.length ? results.map((action, index) => {
          const Icon = icons[action.icon] || Compass;
          return <button key={action.id} role="option" aria-selected={active === index} className={active === index ? "active" : ""} onMouseEnter={() => setActive(index)} onClick={() => runRef.current?.(action)}>
            <span className="hubActionResultIcon">{action.resultType === "item" && action.item?.icon ? <img src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(String(action.item.icon).replace(/ /g, "_"))}`} alt="" onError={event => { event.currentTarget.style.visibility = "hidden"; }}/> : <Icon size={17}/>}</span>
            <span className="hubActionResultCopy"><strong>{action.label}</strong><small>{action.description}</small></span>
            <span className="hubActionResultGroup">{action.group || "Items"}</span><ArrowRight size={15}/>
          </button>;
        }) : <div className="hubActionEmpty"><Search size={20}/><strong>No matching action or item</strong><span>Try a page name, tool, item name or item ID.</span></div>}
      </div>
      <div className="hubActionFoot"><span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span><span><kbd>↵</kbd> Open</span><span><kbd>ESC</kbd> Close</span></div>
    </section>
  </div>;
}
