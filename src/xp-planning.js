export function xpForLevel(level){const l=Math.max(1,Math.min(99,Number(level)||1));let total=0;for(let i=1;i<l;i++)total+=Math.floor(i+300*Math.pow(2,i/7));return Math.floor(total/4)}
export function xpRangeToTarget(currentLevel,currentXp,targetLevel){
 const level=Math.max(1,Math.min(99,Math.floor(Number(currentLevel)||1))),target=Math.max(level,Math.min(99,Math.floor(Number(targetLevel)||level))),targetXp=xpForLevel(target),baseXp=xpForLevel(level);
 if(target<=level)return{min:0,max:0,exact:true};
 const hasXp=currentXp!==null&&currentXp!==undefined&&currentXp!==""&&Number.isFinite(Number(currentXp));
 const xp=hasXp?Number(currentXp):NaN,nextLevelXp=xpForLevel(Math.min(99,level+1));
 if(hasXp&&xp>=baseXp&&xp<(level<99?nextLevelXp:Infinity))return{min:Math.max(0,targetXp-xp),max:Math.max(0,targetXp-xp),exact:true};
 const min=Math.max(0,targetXp-(nextLevelXp-1)),max=Math.max(0,targetXp-baseXp);
 return{min:Math.min(min,max),max:Math.max(min,max),exact:false};
}
export function estimateXpHours(range,xpPerHour){const rate=Number(String(xpPerHour??"").replace(/,/g,""));if(!range||!Number.isFinite(rate)||rate<=0)return null;return{minHours:range.min/rate,maxHours:range.max/rate,exact:!!range.exact}}
