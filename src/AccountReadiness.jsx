import React,{useMemo,useState}from"react";
import{AlertCircle,BookOpen,Clock3,Database,ShieldCheck,UserRoundCheck}from"lucide-react";
import{assessAccountDataCoverage}from"./account-readiness.js";
const formatDate=v=>v?new Date(v).toLocaleString("en-GB",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}):"Not recorded";
export default function AccountReadiness({account}){
 const[showMissing,setShowMissing]=useState(false),data=useMemo(()=>assessAccountDataCoverage(account),[account]),hasQuests=data.questCoverage.rows>0,c=data.questCoverage.counts;
 return <section className="accountReadiness">
  <header className="arHeader"><div><span className="arEyebrow"><ShieldCheck size={12}/> ACCOUNT DATA AUDIT</span><h3>What does OSRS Hub actually know?</h3><p>Confirmed account fields are separated from missing or unknown information.</p></div><span className="arProfile">{data.hasProfile?<><UserRoundCheck size={14}/>{data.name}</>:<><AlertCircle size={14}/>No profile</>}</span></header>
  {data.hasProfile?<><div className="arCoverageGrid">
   <article><div className="arMetricIcon"><UserRoundCheck size={15}/></div><div><small>Skill levels loaded</small><strong>{data.skillCoverage.loaded} / {data.skillCoverage.total}</strong><span>{data.skillCoverage.missing.length?"Some skill data missing":"All 24 skill levels present"}</span></div></article>
   <article><div className="arMetricIcon"><BookOpen size={15}/></div><div><small>Quest rows received</small><strong>{data.questCoverage.rows||"—"}</strong><span>{hasQuests?data.questCoverage.source:"Completion state unknown"}</span></div></article>
   <article><div className="arMetricIcon"><Database size={15}/></div><div><small>Profile source</small><strong className="arSourceValue">{data.source}</strong><span>Source label from imported profile</span></div></article>
   <article><div className="arMetricIcon"><Clock3 size={15}/></div><div><small>Last profile sync</small><strong className="arSourceValue">{formatDate(data.syncedAt)}</strong><span>{data.syncedAt?"Timestamp recorded":"Timestamp unavailable"}</span></div></article>
  </div><div className="arProgress"><div><span>Skill data coverage</span><b>{Math.round(data.skillCoverage.loaded/data.skillCoverage.total*100)}%</b></div><i><b style={{width:`${data.skillCoverage.loaded/data.skillCoverage.total*100}%`}}/></i></div>
  <div className="arQuestSummary"><div className="arQuestTitle"><strong>Quest completion evidence</strong><small>{hasQuests?"Counts from received rows only; this is not assumed to be the full quest list.":"No quest completion rows were returned for this profile."}</small></div>
   {hasQuests?<div className="arStatusCounts"><span className="complete"><b>{c.completed}</b> completed</span><span className="progress"><b>{c.inProgress}</b> in progress</span><span className="pending"><b>{c.notStarted}</b> not started</span><span className="unknown"><b>{c.unknown}</b> unknown</span></div>:<div className="arUnknown"><AlertCircle size={15}/> Quest completion is unknown, not zero.</div>}
  </div>{data.skillCoverage.missing.length>0&&<div className="arMissing"><button onClick={()=>setShowMissing(v=>!v)} aria-expanded={showMissing}><span>{data.skillCoverage.missing.length} skill levels missing</span><b>{showMissing?"Hide":"Show"}</b></button>{showMissing&&<div className="arMissingList">{data.skillCoverage.missing.map(s=><span key={s}>{s}</span>)}</div>}</div>}</>
  :<div className="arNoProfile"><AlertCircle size={17}/><div><strong>No account profile loaded</strong><small>Sync a HiScores/WikiSync profile or import a profile containing confirmed skill and quest fields to populate this audit.</small></div></div>}
  <footer className="arFooter"><AlertCircle size={13}/><span>{data.message}</span></footer>
 </section>;
}
