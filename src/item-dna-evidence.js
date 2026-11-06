const finite=value=>{if(value===null||value===undefined||value==="")return null;const n=Number(value);return Number.isFinite(n)?n:null};
const positive=value=>{const n=finite(value);return n!=null&&n>0?n:null};
export function buildItemDnaProfile(item={}){
 const buy=positive(item.buy),limit=positive(item.limit),volume=finite(item.volume),marginAfterTax=finite(item.margin),roiPct=finite(item.roi),flipScore=finite(item.flipScore),riskScore=finite(item.riskScore),safeVolume=volume!=null&&volume>=0?volume:null,safeLimit=limit!=null?Math.floor(limit):null;
 return{name:String(item.name||"Item"),itemId:Number.isSafeInteger(Number(item.id))&&Number(item.id)>0?Number(item.id):null,buy,sell:positive(item.sell),marginAfterTax,roiPct,volume24h:safeVolume,geLimit:safeLimit,buyCapitalAtLimit:buy!=null&&safeLimit!=null?buy*safeLimit:null,flipScore:flipScore!=null&&flipScore>=0&&flipScore<=100?flipScore:null,riskScore:riskScore!=null&&riskScore>=0&&riskScore<=100?riskScore:null,scoreType:"heuristic"};
}
