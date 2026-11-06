import React, { useMemo } from "react";
import { Activity, AlertCircle, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { buildItemMovementEvidence } from "./item-movement.js";

const percent = value => value == null ? "Not enough history" : `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
const number = value => value == null ? "Unavailable" : Number(value).toLocaleString("en-GB");
const date = value => value == null ? "—" : new Date(value).toLocaleString("en-GB", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" });

export default function ItemMovementEvidence({ item, history, range }) {
  const data = useMemo(() => buildItemMovementEvidence(history, item), [history, item?.volume]);
  const Icon = data.direction === "rising" ? ArrowUpRight : data.direction === "falling" ? ArrowDownRight : data.direction === "flat" ? Minus : AlertCircle;
  const directionLabel = data.direction === "rising" ? "Higher over this window" : data.direction === "falling" ? "Lower over this window" : data.direction === "flat" ? "Unchanged over this window" : "Not enough comparable history";
  return <section className="itemMovementEvidence">
    <div className="imeHeading"><div><span className="eyebrow"><Activity size={12}/> OBSERVED MARKET EVIDENCE</span><h3>Why is {item?.name || "this item"} moving?</h3><p>What the price history shows for the selected {range || "chart"} window.</p></div><span className={`imeDirection ${data.direction}`}><Icon size={15}/>{directionLabel}</span></div>
    {data.hasComparableHistory ? <div className="imeMetrics">
      <div><small>Mid-price change</small><strong>{percent(data.midChangePct)}</strong></div>
      <div><small>Buy-side change</small><strong>{percent(data.buyChangePct)}</strong></div>
      <div><small>Sell-side change</small><strong>{percent(data.sellChangePct)}</strong></div>
      <div><small>Current 24h volume</small><strong>{number(data.currentVolume)}</strong></div>
    </div> : <div className="imeUnavailable"><AlertCircle size={17}/><span><strong>Not enough comparable price points yet.</strong><small>{data.sampleCount} valid historical observation(s) were available in this window. A movement percentage needs at least two.</small></span></div>}
    <div className="imeEvidenceFoot"><span>{data.sampleCount} observations · {data.windowStart ? `${date(data.windowStart)} → ${date(data.windowEnd)}` : "History window not established"}</span><p>This is a comparison of observed buy/sell history and the latest reported 24h volume. It cannot establish the cause of a move, identify unverified news, or predict the next price or your fill.</p></div>
  </section>;
}
