import React, { useMemo, useState } from "react";
import { Activity, Bell, Check, CircleAlert, Cloud, Info, ShieldCheck, Trash2, X } from "lucide-react";
import { buildNotificationFeed } from "./notification-centre.js";

const READ_KEY = "osrshub-notification-read";
const readIds = () => {
  try { const raw = JSON.parse(localStorage.getItem(READ_KEY) || "[]"); return Array.isArray(raw) ? raw.slice(-1000) : []; }
  catch { return []; }
};
const timeLabel = value => value ? new Date(value).toLocaleString("en-GB", { day:"2-digit", month:"short", hour:"2-digit", minute:"2-digit" }) : "Workspace status";

const iconFor = tone => tone === "warning" ? CircleAlert : tone === "success" ? ShieldCheck : tone === "alert" ? Bell : tone === "info" ? Info : Activity;

export default function NotificationCentre({ alerts = [], alertRules = [], items = [], updated = null, loading = false, cloudUser = null, cloudSyncing = false, openItem, onNavigate, clearAlerts, close }) {
  const [filter, setFilter] = useState("all");
  const [read, setRead] = useState(readIds);
  const feed = useMemo(() => buildNotificationFeed({ alerts, alertRules, items, updated, loading, cloudUser, cloudSyncing }), [alerts, alertRules, items.length, updated, loading, cloudUser?.id, cloudSyncing]);
  const visible = feed.filter(entry => filter === "all" || entry.kind === filter);
  const unread = feed.filter(entry => !read.includes(entry.id)).length;
  const markRead = id => setRead(current => { const next = [...new Set([...current, id])].slice(-1000); try { localStorage.setItem(READ_KEY, JSON.stringify(next)); } catch {} return next; });
  const markAllRead = () => setRead(current => { const next = [...new Set([...current, ...feed.map(entry => entry.id)])].slice(-1000); try { localStorage.setItem(READ_KEY, JSON.stringify(next)); } catch {} return next; });
  const activate = entry => {
    markRead(entry.id);
    if (entry.target === "item" && entry.itemId != null) openItem?.(entry.itemId);
    else if (entry.target) onNavigate?.(entry.target);
    close?.();
  };

  return <section className="notificationCentre" role="dialog" aria-label="Global notifications">
    <header className="ncHeader">
      <div><span className="ncEyebrow"><Activity size={12}/> WORKSPACE ACTIVITY</span><h2>Notifications <small>{unread} unread</small></h2><p>Triggered alerts and live workspace status, using data the app actually knows.</p></div>
      <button className="ncClose" onClick={close} aria-label="Close notifications"><X size={17}/></button>
    </header>
    <nav className="ncTabs" aria-label="Notification filters">
      {[["all","All"],["alert","Price alerts"],["system","System"]].map(([key,label])=><button key={key} className={filter===key?"active":""} onClick={()=>setFilter(key)}>{label}{key==="alert"&&alerts.length>0?<b>{alerts.length}</b>:null}</button>)}
    </nav>
    <div className="ncActions"><button onClick={markAllRead} disabled={!unread}><Check size={13}/> Mark all read</button>{alerts.length>0&&<button onClick={clearAlerts}><Trash2 size={13}/> Clear alert history</button>}</div>
    <div className="ncList">
      {visible.length ? visible.map(entry => {
        const Icon = iconFor(entry.tone);
        const isRead = read.includes(entry.id);
        return <button className={`ncRow ${isRead?"isRead":"isUnread"} tone-${entry.tone}`} key={entry.id} onClick={()=>activate(entry)}>
          <span className="ncIcon"><Icon size={16}/></span>
          <span className="ncCopy"><strong>{entry.title}</strong><small>{entry.description}</small><em>{timeLabel(entry.at)}</em></span>
          {!isRead&&<i className="ncUnreadDot" aria-label="Unread"/>}
        </button>;
      }) : <div className="ncEmpty"><Bell size={21}/><strong>No notifications in this view</strong><span>New alerts and system updates will appear here.</span></div>}
    </div>
    <footer className="ncFooter"><Cloud size={13}/> <span>Workspace data only. No synthetic market events or estimated notifications.</span></footer>
  </section>;
}
