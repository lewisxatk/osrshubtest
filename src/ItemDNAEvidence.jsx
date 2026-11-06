import React,{useMemo}from"react";
import{Activity,BarChart3,Coins,Layers3,ShieldAlert,ShoppingBag,Wallet}from"lucide-react";
import{buildItemDnaProfile}from"./item-dna-evidence.js";
const gp=v=>v==null?"Unavailable":`${Math.round(v).toLocaleString("en-GB")} gp`;
const count=v=>v==null?"Unavailable":Math.round(v).toLocaleString("en-GB");
const pct=v=>v==null?"Unavailable":`${v>0?"+":""}${v.toFixed(2)}%`;
export default function ItemDNAEvidence({item}){
 const data=useMemo(()=>buildItemDnaProfile(item),[item]);
 const metrics=[
  {label:"GE buy price",value:gp(data.buy),icon:Coins,note:"Latest loaded buy quote"},
  {label:"GE sell price",value:gp(data.sell),icon:ShoppingBag,note:"Latest loaded sell quote"},
  {label:"After-tax margin",value:gp(data.marginAfterTax),icon:Wallet,note:"Current snapshot field"},
  {label:"ROI",value:pct(data.roiPct),icon:BarChart3,note:"Hub market calculation"},
  {label:"24h volume",value:count(data.volume24h),icon:Activity,note:"Reported traded volume"},
  {label:"GE buy limit",value:count(data.geLimit),icon:Layers3,note:"Limit from item data"},
  {label:"Capital at full limit",value:gp(data.buyCapitalAtLimit),icon:Wallet,note:"Buy price × GE limit"}
 ];
 return <section className="itemDnaEvidence" aria-label="Item market profile">
  <header className="ideHeader"><div><span className="ideEyebrow"><Activity size={12}/> ITEM DNA · MARKET PROFILE</span><h3>Current market facts</h3><p>{data.name} · item {data.itemId??"ID unavailable"}</p></div>
   <div className="ideScores"><div><small>Hub flip score</small><strong>{data.flipScore==null?"—":`${data.flipScore}/100`}</strong><em>Heuristic rank</em></div><div><small>Hub risk score</small><strong>{data.riskScore==null?"—":`${data.riskScore}/100`}</strong><em>Heuristic rank</em></div></div>
  </header>
  <div className="ideMetrics">{metrics.map(metric=>{const Icon=metric.icon;return <article key={metric.label}><span className="ideMetricIcon"><Icon size={14}/></span><div><small>{metric.label}</small><strong>{metric.value}</strong><em>{metric.note}</em></div></article>})}</div>
  <footer className="ideFoot"><ShieldAlert size={13}/><p>These are observations from the currently loaded market snapshot. Hub flip and risk scores are ranking heuristics, not probabilities, profit guarantees, historical stability measurements or OSRS game mechanics. Missing fields remain unavailable.</p></footer>
 </section>;
}
