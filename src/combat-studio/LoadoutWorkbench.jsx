import React, { useEffect, useMemo, useState } from "react";
import { ArrowDownRight, ArrowRightLeft, Bookmark, Check, ChevronDown, Coins, Search, ShieldCheck, Sparkles, Swords } from "lucide-react";
import { estimateLoadout, inferEquipmentSlot, questAccessStatus } from "./optimizer.js";
import { equipmentIconUrl } from "./item-icons.js";
import "./loadout-workbench.css";

const SLOT_ORDER = ["Head", "Cape", "Neck", "Ammo", "Weapon", "Body", "Legs", "Shield", "Hands", "Feet", "Ring"];
const money = value => Number.isFinite(Number(value)) ? Math.round(Number(value)).toLocaleString("en-GB") + " gp" : "—";
const normal = value => String(value ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
const itemName = item => String(item?._name ?? item?.name ?? item?.item_name ?? "");
const slotAliases = Object.freeze({
  head: "Head", helmet: "Head", headslot: "Head",
  cape: "Cape", back: "Cape",
  neck: "Neck", amulet: "Neck",
  ammo: "Ammo", ammunition: "Ammo",
  weapon: "Weapon",
  body: "Body", chest: "Body",
  legs: "Legs",
  shield: "Shield",
  hands: "Hands", gloves: "Hands",
  feet: "Feet", boots: "Feet",
  ring: "Ring",
});
const equipmentSlotOf = item => {
  const raw = item?.engineSlot ?? item?.slot ?? item?.equipment_slot ?? item?.equipmentSlot
    ?? item?.equip_slot ?? item?.slot_name;
  if (raw !== undefined && raw !== null && String(raw).trim()) {
    // Canonical engine slot metadata is authoritative. Do not guess another
    // slot from the item name when the engine has supplied an unknown value.
    return slotAliases[normal(raw)] ?? null;
  }
  return inferEquipmentSlot(item);
};
const itemId = item => {
  const id = Number(item?._id ?? item?.id ?? item?.item_id ?? item?.itemId);
  return Number.isInteger(id) && id > 0 ? id : null;
};
const requirementStatus = (item, stats) => {
  const requirements = item?.requirements ?? item?.level_requirements ?? item?.skill_requirements ?? {};
  if (!requirements || typeof requirements !== "object" || Array.isArray(requirements)) return "unknown";
  const aliases = {att:"Attack",attack:"Attack",atk:"Attack",str:"Strength",strength:"Strength",def:"Defence",defence:"Defence",ranged:"Ranged",range:"Ranged",magic:"Magic",prayer:"Prayer"};
  let unknown = false;
  for (const [raw, requirement] of Object.entries(requirements)) {
    const skill = aliases[normal(raw)];
    const level = Number(typeof requirement === "object" ? requirement?.level ?? requirement?.value : requirement);
    if (!skill || !Number.isFinite(level) || level <= 1) continue;
    const supplied = stats?.[skill] ?? stats?.[skill.toLowerCase()];
    const actual = Number(typeof supplied === "object" ? supplied?.level ?? supplied?.lvl ?? supplied?.value : supplied);
    if (!Number.isFinite(actual)) unknown = true;
    else if (actual < level) return "locked";
  }
  return unknown ? "unknown" : "available";
};
const iconSource = item => equipmentIconUrl(itemName(item), item?._icon ?? item?.icon_url ?? item?.wiki_image ?? item?.icon ?? item?.image ?? "");
const itemPrice = item => {
  for (const value of [item?._price, item?.sell, item?.high, item?.price, item?.buy]) {
    const price = Number(value);
    if (Number.isFinite(price) && price > 0) return price;
  }
  return null;
};
const setupCost = (slots, items) => slots.reduce((sum, [, name, id, knownPrice]) => {
  if (!name || name === "—") return sum;
  const match = id
    ? items.find(item => itemId(item) === Number(id))
    : items.find(item => normal(itemName(item)) === normal(name));
  return sum + (Number(knownPrice) > 0 ? Number(knownPrice) : itemPrice(match) ?? 0);
}, 0);

/**
 * A budget-aware workbench around the existing transparent gear estimator.
 * Scores are labelled as estimates; this component never presents them as DPS.
 */
export default function LoadoutWorkbench({ account, items = [], currentSlots = [], targetName = "", onDraftChange, excluded = [], allowedItems = [], questOverrides = {}, targetRecords = [], catalogLoading = false, styleValue, budgetValue, onStyleChange, onBudgetChange, activeSlotValue, onActiveSlotChange }) {
  const [budget, setBudget] = useState(String(budgetValue ?? "5000000"));
  const [style, setStyle] = useState(styleValue ?? "Melee");
  const [showRecommendations, setShowRecommendations] = useState(false);
  useEffect(() => { if (styleValue && styleValue !== style) setStyle(styleValue); }, [styleValue]);
  useEffect(() => { if (budgetValue != null && String(budgetValue) !== budget) setBudget(String(budgetValue)); }, [budgetValue]);
  const [accountAware, setAccountAware] = useState(true);
  const [search, setSearch] = useState("");
  const [activeSlot, setActiveSlot] = useState(activeSlotValue || "Weapon");
  const [visibleItemCount, setVisibleItemCount] = useState(80);
  const [draft, setDraft] = useState(() => currentSlots.map(pair => [...pair]));
  useEffect(() => {
    if (activeSlotValue && SLOT_ORDER.includes(activeSlotValue) && activeSlotValue !== activeSlot) {
      setActiveSlot(activeSlotValue);
      setSearch("");
      setVisibleItemCount(80);
    }
  }, [activeSlotValue]);
  useEffect(() => { setDraft(currentSlots.map(pair => [...pair])); }, [currentSlots]);
  const [activeBuild, setActiveBuild] = useState("current");
  const [saveName, setSaveName] = useState("");
  const [savedBuilds, setSavedBuilds] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem("osrshub-combat-saved-builds") || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  });

  const stats = account?.stats ?? {};
  const quests = Array.isArray(account?.quests) ? account.quests : [];
  const numericBudget = Math.max(0, Number(budget) || 0);
  const options = useMemo(() => {
    if (!showRecommendations || catalogLoading || !numericBudget || !items.length) return [];
    return [
      { id: "budget", label: "Budget", detail: "Spend carefully", cap: Math.max(1, Math.round(numericBudget * 0.35)) },
      { id: "balanced", label: "Balanced", detail: "Room to upgrade", cap: Math.max(1, Math.round(numericBudget * 0.7)) },
      { id: "best", label: "Best within budget", detail: "Use the full cap", cap: numericBudget },
    ].map(tier => ({
      ...tier,
      estimate: estimateLoadout({
        items, target: targetName, targetRecords, style, budget: tier.cap, stats, quests,
        accountAware, excluded, allowedItems, questOverrides, 
      }),
    }));
  }, [items, targetName, targetRecords, style, numericBudget, stats, quests, accountAware, excluded, allowedItems, questOverrides, catalogLoading, showRecommendations]);

  const currentCost = setupCost(draft, items);
  const selectedEstimate = options.find(option => option.id === activeBuild);
  const filteredItems = useMemo(() => items
    .filter(item => equipmentSlotOf(item) === activeSlot)
    .filter(item => !search.trim() || itemName(item).toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => {
      const priceDelta = (itemPrice(a) ?? Infinity) - (itemPrice(b) ?? Infinity);
      return priceDelta || itemName(a).localeCompare(itemName(b));
    }), [items, activeSlot, search]);
  const visibleItems = filteredItems.slice(0, visibleItemCount);
  const excludedNames = new Set(excluded.map(normal));
  const allowedNames = new Set(allowedItems.map(normal));
  const itemAvailability = item => {
    const name = normal(itemName(item));
    if (excludedNames.has(name)) return { selectable: false, note: "Manually excluded" };
    const levels = requirementStatus(item, stats);
    if (accountAware && levels === "locked") return { selectable: false, note: "Account level requirement not met" };
    if (accountAware && questAccessStatus(item, quests, questOverrides) === "locked" && !allowedNames.has(name)) {
      return { selectable: false, note: "Required quest marked incomplete" };
    }
    if (accountAware && (levels === "unknown" || questAccessStatus(item, quests, questOverrides) === "unknown")) {
      return { selectable: true, note: "Requirement data incomplete — verify before use" };
    }
    return { selectable: true, note: item.tradeable === false || item.tradable === false ? "Untradeable" : "Eligible for this slot" };
  };

  const toCanonicalSlotPairs = pairs => (pairs ?? []).map(([slot, name, suppliedId, suppliedPrice]) => {
    if (!name || name === "—") return [slot, "—", null, null];
    const item = suppliedId != null
      ? items.find(candidate => itemId(candidate) === Number(suppliedId))
      : items.find(candidate => normal(itemName(candidate)) === normal(name));
    return [
      slot,
      name,
      suppliedId ?? itemId(item),
      suppliedPrice ?? itemPrice(item),
    ];
  });
  const setSlot = slot => {
    setActiveSlot(slot);
    onActiveSlotChange?.(slot);
    setSearch("");
    setVisibleItemCount(80);
  };
  const chooseItem = item => {
    const name = itemName(item);
    const availability = itemAvailability(item);
    if (!name || !availability.selectable) return;
    const next = draft.map(([slot, currentName]) => slot === activeSlot
      ? [slot, name, itemId(item), itemPrice(item)]
      : [slot, currentName, itemId(items.find(candidate => normal(itemName(candidate)) === normal(currentName))), itemPrice(items.find(candidate => normal(itemName(candidate)) === normal(currentName)))]);
    setDraft(next);
    setActiveBuild("custom");
    onDraftChange?.(next);
  };
  const applyEstimate = option => {
    const next = toCanonicalSlotPairs(option?.estimate?.slots ?? []);
    if (!next.length) return;
    setDraft(next);
    setActiveBuild(option.id);
    onDraftChange?.(next);
  };
  const saveBuild = () => {
    const name = saveName.trim();
    if (!name || !draft.length) return;
    const entry = { id: Date.now(), name, style, targetName, budget: numericBudget, slots: draft.map(pair => [...pair]), savedAt: new Date().toISOString() };
    const next = [entry, ...savedBuilds.filter(build => build.name.toLowerCase() !== name.toLowerCase())].slice(0, 20);
    setSavedBuilds(next);
    try { localStorage.setItem("osrshub-combat-saved-builds", JSON.stringify(next)); } catch {}
    setSaveName("");
  };
  const restoreBuild = build => {
    setStyle(build.style || style);
    setBudget(String(build.budget || numericBudget));
    const next = (build.slots || []).map(pair => [...pair]);
    setDraft(next);
    setActiveBuild("custom");
    onDraftChange?.(next);
  };
  const currentNames = new Map(draft.map(([slot, name]) => [slot, name]));
  const recommendedSlots = selectedEstimate?.estimate?.slots ?? [];
  const recommendedNames = new Map(recommendedSlots.map(([slot, name]) => [slot, name]));
  const priceForName = name => { const match = items.find(item => normal(itemName(item)) === normal(name)); return itemPrice(match); };
  const comparisonRows = SLOT_ORDER.map(slot => ({ slot, current: currentNames.get(slot) || "—", recommended: recommendedNames.get(slot) || "—" })).filter(row => row.current !== row.recommended);
  const applyRecommendedSlot = (slot, name) => {
    const item = items.find(candidate => normal(itemName(candidate)) === normal(name));
    const next = draft.map(([currentSlot, currentName]) => currentSlot === slot
      ? [currentSlot, name, itemId(item), itemPrice(item)]
      : [currentSlot, currentName, itemId(items.find(candidate => normal(itemName(candidate)) === normal(currentName))), itemPrice(items.find(candidate => normal(itemName(candidate)) === normal(currentName)))]);
    setDraft(next);
    setActiveBuild("custom");
    onDraftChange?.(next);
  };
  const missingPrices = draft.filter(([, name]) => name && name !== "—" && !items.some(item => normal(itemName(item)) === normal(name) && itemPrice(item) !== null));

  return <section className="cs-workbench cs-panel" aria-labelledby="cs-workbench-title">
    <header className="cs-workbench-head">
      <div><small>LOADOUT LAB · ACCOUNT AND BUDGET AWARE</small><h2 id="cs-workbench-title"><Sparkles size={18}/> Loadout Workbench</h2><p>Compare affordable setups, inspect gear by slot and save builds. Scores are equipment estimates, not verified DPS.</p></div>
      <div className="cs-workbench-total"><small>Draft gear cost</small><strong>{money(currentCost)}</strong><span>{numericBudget ? money(Math.max(0, numericBudget - currentCost)) + " budget left" : "Set a GP budget"}</span></div>
    </header>
    <div className="cs-workbench-controls">
      <label>Combat style<select value={style} onChange={event => { setStyle(event.target.value); onStyleChange?.(event.target.value); setActiveBuild("custom"); }}><option>Melee</option><option>Ranged</option><option>Magic</option></select></label>
      <label>Budget (GP)<input inputMode="numeric" value={budget} onChange={event => { const next = event.target.value.replace(/[^0-9]/g, ""); setBudget(next); onBudgetChange?.(next); }} placeholder="5000000"/></label>
      <label className="cs-workbench-toggle"><input type="checkbox" checked={accountAware} onChange={event => setAccountAware(event.target.checked)}/> Respect known account requirements</label>
    </div>
    <div className="cs-workbench-recommend-toggle"><span>Budget gear suggestions run only when requested to keep style changes responsive.</span><button type="button" onClick={() => setShowRecommendations(value => !value)}>{showRecommendations ? "Hide budget suggestions" : "Calculate budget suggestions"}</button></div>
    <div className="cs-workbench-builds" aria-label="Suggested loadouts">
      {options.map(option => <article className={activeBuild === option.id ? "active" : ""} key={option.id}>
        <div className="cs-workbench-build-top"><span>{option.id === "budget" ? "01" : option.id === "balanced" ? "02" : "03"}</span><small>{option.detail}</small></div>
        <h3>{option.label}</h3><strong>{money(option.estimate.totalCost)}</strong>
        <div className="cs-workbench-meter" role="progressbar" aria-label={option.label + " budget usage"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={option.cap ? Math.min(100, Math.round(option.estimate.totalCost / option.cap * 100)) : 0}><i style={{ width: option.cap ? Math.min(100, option.estimate.totalCost / option.cap * 100) + "%" : "0%" }}/></div>
        <p>{option.estimate.candidateCount} candidates reviewed · {option.estimate.warnings.length ? "Data caveats" : "Source fields available"}</p>
        <button type="button" onClick={() => applyEstimate(option)} disabled={!option.estimate.slots?.length}><Check size={14}/> Use this setup</button>
      </article>)}
      {!options.length && <p className="cs-workbench-empty">Select “Calculate budget suggestions” to compare ranked setups when you need them.</p>}
    </div>
    <div className="cs-workbench-compare">
      <div className="cs-workbench-editor-head"><div><h3><ArrowRightLeft size={16}/> Slot-by-slot comparison</h3><p>Compare your draft with the selected budget recommendation before applying it.</p></div><span>{comparisonRows.length} slot changes</span></div>
      {comparisonRows.length ? <div className="cs-workbench-compare-table" role="table" aria-label="Loadout slot comparison">
        <div className="cs-workbench-compare-row heading" role="row"><span>Slot</span><span>Current draft</span><span>Recommended</span><span>Cost change</span><span/></div>
        {comparisonRows.map(row => { const oldPrice = priceForName(row.current); const newPrice = priceForName(row.recommended); const delta = oldPrice == null || newPrice == null ? null : newPrice - oldPrice; return <div className="cs-workbench-compare-row" role="row" key={row.slot}><strong>{row.slot}</strong><span title={row.current}>{row.current}</span><span title={row.recommended}>{row.recommended}</span><b className={delta == null ? "" : delta > 0 ? "up" : delta < 0 ? "down" : ""}>{delta == null ? "Price unknown" : (delta > 0 ? "+" : "") + money(delta)}</b><button type="button" onClick={() => applyRecommendedSlot(row.slot, row.recommended)} disabled={row.recommended === "—"}>Apply</button></div>; })}
      </div> : <p className="cs-workbench-empty">Your draft matches the selected recommendation in every slot, or no recommendation is available yet.</p>}
    </div>
    <div className="cs-workbench-editor">
      <div className="cs-workbench-editor-head"><div><h3><Swords size={16}/> Gear by slot</h3><p>Choose an item to update the draft used by the live calculation panel.</p></div><span>{draft.filter(([, name]) => name && name !== "—").length} slots filled</span></div>
      <div className="cs-workbench-slots">{SLOT_ORDER.map(slot => <button type="button" key={slot} className={activeSlot === slot ? "active" : ""} onClick={() => setSlot(slot)}><small>{slot}</small><strong>{currentNames.get(slot) || "Empty"}</strong></button>)}</div>
      <label className="cs-workbench-search"><Search size={15}/><input value={search} onChange={event => { setSearch(event.target.value); setVisibleItemCount(80); }} placeholder={"Search " + activeSlot.toLowerCase() + " equipment"}/></label>
      <div className="cs-workbench-item-list">{visibleItems.map(item => {
        const availability = itemAvailability(item);
        const price = itemPrice(item);
        return <button type="button" key={itemId(item) ?? itemName(item)} disabled={!availability.selectable} onClick={() => chooseItem(item)} title={availability.note}>
          <span className="cs-workbench-item-icon">{iconSource(item) ? <img src={iconSource(item)} alt="" onError={event => { event.currentTarget.style.display = "none"; }}/> : <ShieldCheck size={16}/>}</span>
          <span><strong>{itemName(item)}</strong><small>{availability.note} · {item.members === false ? "F2P" : "Membership data as supplied"}</small></span>
          <b>{price === null ? "Unpriced" : price > numericBudget ? "Over budget · " + money(price) : money(price)}</b><ChevronDown size={14}/>
        </button>;
      })}{!filteredItems.length && <p className="cs-workbench-empty">No equipment records belong to this slot in the canonical engine catalogue.</p>}</div>
      {filteredItems.length > visibleItems.length && <button type="button" className="cs-workbench-more" onClick={() => setVisibleItemCount(value => value + 80)}>Show {Math.min(80, filteredItems.length - visibleItems.length)} more ({filteredItems.length - visibleItems.length} remaining)</button>}
      {missingPrices.length > 0 && <p className="cs-workbench-warning"><Coins size={14}/> {missingPrices.length} selected item(s) have no usable price record. Total cost may be incomplete.</p>}
    </div>
    <div className="cs-workbench-saved">
      <div><h3><Bookmark size={15}/> Saved loadouts</h3><p>Saved locally on this device; they are not synced unless your account sync feature supports this key.</p></div>
      <label><input value={saveName} onChange={event => setSaveName(event.target.value)} placeholder="Name this loadout" maxLength={60}/><button type="button" onClick={saveBuild} disabled={!saveName.trim()}><Bookmark size={14}/> Save</button></label>
      {savedBuilds.length > 0 && <div className="cs-workbench-saved-list">{savedBuilds.map(build => <button type="button" key={build.id} onClick={() => restoreBuild(build)}><span><strong>{build.name}</strong><small>{build.style} · {build.targetName || "No target"} · {money(build.budget)}</small></span><ArrowRightLeft size={15}/></button>)}</div>}
    </div>
    {selectedEstimate?.estimate?.warnings?.length > 0 && <p className="cs-workbench-warning"><ArrowDownRight size={14}/> Estimator notes: {selectedEstimate.estimate.warnings.join(" ")}</p>}
  </section>;
}
