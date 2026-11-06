import React from "react";
import { LayoutDashboard, SlidersHorizontal } from "lucide-react";
import { DASHBOARD_WIDGETS, getDashboardTemplateWidgets, normaliseDashboardWidgets } from "./dashboard-layout.js";

const TEMPLATE_LABELS = { balanced: "Balanced", trading: "Trading Focus", workspace: "Workspace Focus" };

export default function DashboardLayoutControls({ template, setTemplate, widgets, setWidgets }) {
  const chooseTemplate = value => {
    setTemplate(value);
    setWidgets(getDashboardTemplateWidgets(value));
  };
  const toggleWidget = id => setWidgets(current => {
    const next = current.includes(id) ? current.filter(value => value !== id) : [...current, id];
    return normaliseDashboardWidgets(next);
  });

  return <section className="dashboardLayoutControls" aria-label="Personalise dashboard">
    <div className="dlcTitle"><span><LayoutDashboard size={14}/> YOUR DASHBOARD</span><strong><SlidersHorizontal size={14}/> Customise widgets</strong></div>
    <div className="dlcBody">
      <label className="dlcTemplate"><span>Layout template</span><select value={template} onChange={event => chooseTemplate(event.target.value)} aria-label="Dashboard layout template">
        {Object.entries(TEMPLATE_LABELS).map(([value,label]) => <option key={value} value={value}>{label}</option>)}
      </select></label>
      <div className="dlcWidgets" aria-label="Visible dashboard widgets">
        {DASHBOARD_WIDGETS.map(widget => <label key={widget.id} title={widget.description}>
          <input type="checkbox" checked={widgets.includes(widget.id)} disabled={widgets.length === 1 && widgets.includes(widget.id)} onChange={() => toggleWidget(widget.id)}/>
          <span>{widget.label}</span>
        </label>)}
      </div>
    </div>
  </section>;
}
