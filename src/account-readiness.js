export const OSRS_SKILLS=["Attack","Defence","Strength","Hitpoints","Ranged","Prayer","Magic","Cooking","Woodcutting","Fletching","Fishing","Firemaking","Crafting","Smithing","Mining","Herblore","Agility","Thieving","Slayer","Farming","Runecraft","Hunter","Construction"];
const statusOf=value=>{const s=String(value??"").trim().toUpperCase().replace(/[\s-]+/g,"_");if(["FINISHED","COMPLETE","COMPLETED"].includes(s))return"completed";if(["IN_PROGRESS","STARTED","ONGOING"].includes(s))return"inProgress";if(["NOT_STARTED","NOTSTARTED","UNSTARTED"].includes(s))return"notStarted";return"unknown"};
export function assessAccountDataCoverage(account){
 const stats=account?.stats&&typeof account.stats==="object"&&!Array.isArray(account.stats)?account.stats:{};
 const loaded=OSRS_SKILLS.filter(skill=>{const level=Number(stats[skill]?.level);return Number.isInteger(level)&&level>=1&&level<=99});
 const missing=OSRS_SKILLS.filter(skill=>!loaded.includes(skill));
 const rows=(Array.isArray(account?.quests)?account.quests:[]).filter(q=>q&&typeof q.title==="string"&&q.title.trim()).map(q=>({title:q.title.trim(),status:statusOf(q.status)}));
 const counts={completed:rows.filter(q=>q.status==="completed").length,inProgress:rows.filter(q=>q.status==="inProgress").length,notStarted:rows.filter(q=>q.status==="notStarted").length,unknown:rows.filter(q=>q.status==="unknown").length};
 const synced=Number(account?.syncedAt);
 return{hasProfile:!!account&&typeof account==="object",name:String(account?.name||account?.displayName||"Account profile"),skillCoverage:{loaded:loaded.length,total:OSRS_SKILLS.length,missing},questCoverage:{rows:rows.length,source:rows.length?String(account?.questSource||"Imported quest data"):"No quest completion data returned",counts,rowsData:rows},source:String(account?.source||"Source not recorded"),syncedAt:Number.isFinite(synced)&&synced>0?synced:null,readiness:"not_assessed",message:"Data coverage only. Boss, quest and gear readiness require verified requirement records that are not inferred from missing fields."};
}
