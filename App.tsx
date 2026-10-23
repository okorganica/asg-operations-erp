import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, Boxes, BriefcaseBusiness, Building2,
  CalendarClock, CheckCircle2, ChevronDown, CircleDollarSign, ClipboardList, Clock3,
  Download, FileBarChart, FileText, Gauge, Globe2, HardHat, Headphones, LayoutDashboard,
  Menu, Package, Plus, Search, Settings, ShieldCheck, ShoppingCart, Users, Wallet,
  Wrench, X, Languages, LogOut, RefreshCw, Save, Trash2, Edit3, Filter
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { supabase, isSupabaseConfigured } from "./lib/supabase";
import { demoLeads, demoProjects, demoTickets, revenueSeries } from "./data/demo";
import type { ModuleKey, RecordItem } from "./lib/types";

const nav: { label: ModuleKey; icon: typeof LayoutDashboard; group: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { label: "CRM", icon: Users, group: "Commercial" },
  { label: "Sales & Quotes", icon: FileText, group: "Commercial" },
  { label: "Projects", icon: HardHat, group: "Operations" },
  { label: "Inventory", icon: Boxes, group: "Operations" },
  { label: "Procurement", icon: ShoppingCart, group: "Operations" },
  { label: "Finance", icon: Wallet, group: "Management" },
  { label: "Service & AMC", icon: Headphones, group: "Management" },
  { label: "HR & Workforce", icon: BriefcaseBusiness, group: "Management" },
  { label: "Reports", icon: FileBarChart, group: "System" },
  { label: "Admin", icon: Settings, group: "System" }
];

const modules: Record<Exclude<ModuleKey, "Dashboard">, { description: string; table: string; singular: string; fields: { key: string; label: string; type?: string; required?: boolean; options?: string[] }[] }> = {
  "CRM": { description: "Manage accounts, leads, contacts and follow-up activities.", table: "crm_leads", singular: "Lead", fields: [{key:"name",label:"Lead / Company",required:true},{key:"contact_name",label:"Contact person"},{key:"email",label:"Email",type:"email"},{key:"phone",label:"Phone"},{key:"city",label:"City"},{key:"product_interest",label:"Product / Service"},{key:"estimated_value",label:"Estimated value (PKR)",type:"number"},{key:"status",label:"Stage",type:"select",options:["New","Qualified","Site Survey","Proposal","Negotiation","Won","Lost"],required:true},{key:"next_follow_up",label:"Next follow-up",type:"date"}] },
  "Sales & Quotes": { description: "Track quotations, BOQs, tax, revisions and customer approvals.", table: "sales_quotes", singular: "Quotation", fields: [{key:"quote_number",label:"Quote number",required:true},{key:"customer_name",label:"Customer",required:true},{key:"title",label:"Project / scope",required:true},{key:"amount",label:"Amount (PKR)",type:"number",required:true},{key:"tax_percent",label:"Tax %",type:"number"},{key:"valid_until",label:"Valid until",type:"date"},{key:"status",label:"Status",type:"select",options:["Draft","Submitted","Approved","Rejected","Converted"],required:true}] },
  "Projects": { description: "Coordinate surveys, milestones, installation, commissioning and handover.", table: "projects", singular: "Project", fields: [{key:"project_code",label:"Project code",required:true},{key:"name",label:"Project name",required:true},{key:"customer_name",label:"Customer",required:true},{key:"city",label:"City"},{key:"project_manager",label:"Project manager"},{key:"budget",label:"Budget (PKR)",type:"number"},{key:"start_date",label:"Start date",type:"date"},{key:"due_date",label:"Target completion",type:"date"},{key:"status",label:"Status",type:"select",options:["Planning","In Progress","On Track","At Risk","On Hold","Completed"],required:true}] },
  "Inventory": { description: "Track stock, serial numbers, warehouse locations and reorder alerts.", table: "inventory_items", singular: "Item", fields: [{key:"sku",label:"SKU",required:true},{key:"name",label:"Item name",required:true},{key:"category",label:"Category"},{key:"warehouse",label:"Warehouse / branch"},{key:"quantity",label:"Quantity",type:"number",required:true},{key:"reorder_level",label:"Reorder level",type:"number"},{key:"unit_cost",label:"Unit cost (PKR)",type:"number"},{key:"serial_tracking",label:"Serial tracking",type:"select",options:["No","Yes"]}] },
  "Procurement": { description: "Manage suppliers, purchase requests, purchase orders and goods receipts.", table: "purchase_orders", singular: "Purchase order", fields: [{key:"po_number",label:"PO number",required:true},{key:"vendor_name",label:"Vendor",required:true},{key:"description",label:"Description",required:true},{key:"amount",label:"Amount (PKR)",type:"number",required:true},{key:"requested_by",label:"Requested by"},{key:"expected_date",label:"Expected delivery",type:"date"},{key:"status",label:"Status",type:"select",options:["Draft","Pending Approval","Approved","Ordered","Partially Received","Received","Cancelled"],required:true}] },
  "Finance": { description: "Monitor invoices, receipts, expenses and outstanding balances.", table: "finance_invoices", singular: "Invoice", fields: [{key:"invoice_number",label:"Invoice number",required:true},{key:"customer_name",label:"Customer / supplier",required:true},{key:"invoice_type",label:"Type",type:"select",options:["Receivable","Payable","Expense"],required:true},{key:"amount",label:"Amount (PKR)",type:"number",required:true},{key:"due_date",label:"Due date",type:"date"},{key:"status",label:"Status",type:"select",options:["Draft","Unpaid","Partially Paid","Paid","Overdue"],required:true}] },
  "Service & AMC": { description: "Handle support tickets, service visits, warranties, SLA and AMC renewals.", table: "service_tickets", singular: "Service ticket", fields: [{key:"ticket_number",label:"Ticket number",required:true},{key:"customer_name",label:"Customer",required:true},{key:"site",label:"Site / branch"},{key:"issue",label:"Issue summary",required:true},{key:"priority",label:"Priority",type:"select",options:["Low","Normal","High","Critical"],required:true},{key:"assigned_to",label:"Assigned technician"},{key:"due_at",label:"Due date",type:"date"},{key:"status",label:"Status",type:"select",options:["Open","In Progress","Scheduled","Resolved","Closed"],required:true}] },
  "HR & Workforce": { description: "Maintain employee records, skills, attendance and site assignments.", table: "employees", singular: "Employee", fields: [{key:"employee_code",label:"Employee code",required:true},{key:"full_name",label:"Full name",required:true},{key:"department",label:"Department"},{key:"job_title",label:"Job title"},{key:"email",label:"Work email",type:"email"},{key:"phone",label:"Phone"},{key:"branch",label:"Branch"},{key:"employment_status",label:"Status",type:"select",options:["Active","On Leave","Inactive"],required:true}] },
  "Reports": { description: "Export operational records and review activity summaries.", table: "audit_logs", singular: "Report", fields: [] },
  "Admin": { description: "Configure organization settings and review user roles.", table: "profiles", singular: "User profile", fields: [] }
};

const formatPKR = (value: number) => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }).format(value);
const initialRows: Record<string, RecordItem[]> = { "CRM": demoLeads, "Projects": demoProjects, "Service & AMC": demoTickets };

function App() {
  const [active, setActive] = useState<ModuleKey>("Dashboard");
  const [urdu, setUrdu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Record<string, any> | null>(null);
  const [rows, setRows] = useState<Record<string, any[]>>(initialRows);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (!supabase) { setSessionChecked(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setUserEmail(data.session?.user.email ?? "");
      setSessionChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserEmail(session?.user.email ?? ""));
    return () => listener.subscription.unsubscribe();
  }, []);

  const isSignedIn = !isSupabaseConfigured || Boolean(userEmail);
  const currentConfig = active === "Dashboard" ? null : modules[active];
  const filteredRows = useMemo(() => {
    const data = rows[active] ?? [];
    if (!search.trim()) return data;
    const term = search.toLowerCase();
    return data.filter(r => Object.values(r).some(v => String(v ?? "").toLowerCase().includes(term)));
  }, [rows, active, search]);

  async function loadModule(key: ModuleKey) {
    setActive(key); setSearch(""); setMobileOpen(false); setError(""); setNotice("");
    if (key === "Dashboard" || !supabase || !modules[key as Exclude<ModuleKey, "Dashboard">]) return;
    const config = modules[key as Exclude<ModuleKey, "Dashboard">];
    if (!config.fields.length) return;
    setLoading(true);
    const { data, error: queryError } = await supabase.from(config.table).select("*").order("created_at", { ascending: false }).limit(100);
    if (queryError) {
      setError(`Could not load ${key}. Check that the Supabase schema is installed and your user has permission. ${queryError.message}`);
    } else {
      setRows(prev => ({ ...prev, [key]: data ?? [] }));
    }
    setLoading(false);
  }

  function openCreate() { setEditing({}); setShowForm(true); }
  function openEdit(row: any) { setEditing({ ...row }); setShowForm(true); }

  async function saveRecord(formData: Record<string, any>) {
    if (!currentConfig || !currentConfig.fields.length) return;
    setError(""); setNotice("");
    const payload = { ...formData };
    Object.keys(payload).forEach(k => { if (payload[k] === "") payload[k] = null; });
    if (supabase) {
      const result = editing?.id
        ? await supabase.from(currentConfig.table).update(payload).eq("id", editing.id).select().single()
        : await supabase.from(currentConfig.table).insert(payload).select().single();
      if (result.error) { setError(result.error.message); return; }
      setRows(prev => ({ ...prev, [active]: editing?.id ? (prev[active] ?? []).map(r => r.id === editing.id ? result.data : r) : [result.data, ...(prev[active] ?? [])] }));
    } else {
      const record = { ...payload, id: editing?.id ?? `${active.slice(0,3).toUpperCase()}-${Date.now()}`, created_at: new Date().toISOString() };
      setRows(prev => ({ ...prev, [active]: editing?.id ? (prev[active] ?? []).map(r => r.id === editing.id ? record : r) : [record, ...(prev[active] ?? [])] }));
      setNotice("Demo mode: changes are temporary. Connect Supabase to save shared, persistent records.");
    }
    setShowForm(false); setEditing(null);
  }

  async function deleteRecord(row: any) {
    if (!currentConfig || !confirm(`Delete this ${currentConfig.singular.toLowerCase()}? This cannot be undone.`)) return;
    if (supabase) {
      const { error: deleteError } = await supabase.from(currentConfig.table).delete().eq("id", row.id);
      if (deleteError) { setError(deleteError.message); return; }
    } else setNotice("Demo mode: deletion is temporary.");
    setRows(prev => ({ ...prev, [active]: (prev[active] ?? []).filter(r => r.id !== row.id) }));
  }

  async function signIn(email: string, password: string) {
    if (!supabase) return;
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) setError(authError.message); else setError("");
  }

  async function signOut() { if (supabase) await supabase.auth.signOut(); }

  if (!sessionChecked) return <div className="boot-screen"><div className="brand-mark">A</div><p>Loading ASG Operations ERP…</p></div>;
  if (isSupabaseConfigured && !isSignedIn) return <Login onLogin={signIn} error={error} />;

  return (
    <div className={`app-shell ${urdu ? "rtl" : ""}`} dir={urdu ? "rtl" : "ltr"}>
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="brand"><div className="brand-mark">A</div><div><strong>ASG <span>Systems</span></strong><small>OPERATIONS ERP</small></div><button className="mobile-close icon-btn" onClick={() => setMobileOpen(false)}><X size={18}/></button></div>
        <div className="workspace-switch"><div className="workspace-icon"><Building2 size={17}/></div><div><b>ASG Pakistan</b><small>All branches</small></div><ChevronDown size={15}/></div>
        {["Overview","Commercial","Operations","Management","System"].map(group => <div className="nav-group" key={group}><p className="nav-caption">{group}</p>{nav.filter(n=>n.group===group).map(item=>{const Icon=item.icon;return <button key={item.label} className={`nav-item ${active===item.label?"active":""}`} onClick={()=>loadModule(item.label)}><Icon size={18}/><span>{item.label}</span>{item.label==="Service & AMC"&&<em>3</em>}</button>})}</div>)}
        <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><ShieldCheck size={17}/></div><b>Operations support</b><p>Keep projects, service and teams moving.</p><button onClick={()=>loadModule("Service & AMC")}>Open service desk <span>↗</span></button></div><div className="profile-row"><div className="avatar">AS</div><div className="profile-copy"><b>{userEmail || "ASG Administrator"}</b><small>Administrator</small></div><button className="icon-btn" title="Sign out" onClick={signOut}><LogOut size={16}/></button></div></div>
      </aside>
      {mobileOpen && <div className="mobile-scrim" onClick={()=>setMobileOpen(false)} />}
      <main className="main-area">
        <header className="topbar"><div className="topbar-left"><button className="icon-btn mobile-menu" onClick={()=>setMobileOpen(true)}><Menu size={20}/></button><div className="breadcrumb">ASG Pakistan <span>/</span> <b>{active}</b></div></div><div className="top-actions"><div className="global-search"><Search size={16}/><input placeholder="Search anything..." value={search} onChange={e=>setSearch(e.target.value)}/><kbd>⌘ K</kbd></div><button className="language-btn" onClick={()=>setUrdu(!urdu)}><Languages size={17}/>{urdu?"اردو":"EN / اردو"}</button><button className="icon-btn notification" title="Notifications"><Bell size={18}/><i/></button><div className="top-avatar">AS</div></div></header>
        <div className="page-content">
          {active==="Dashboard" ? <Dashboard onNavigate={loadModule}/> : <ModulePage active={active} config={currentConfig!} rows={filteredRows} allRows={rows[active]??[]} search={search} setSearch={setSearch} loading={loading} error={error} notice={notice} onCreate={openCreate} onEdit={openEdit} onDelete={deleteRecord} onRefresh={()=>loadModule(active)} onNavigate={loadModule}/>}
        </div>
      </main>
      {showForm && currentConfig && <RecordModal config={currentConfig} initial={editing ?? {}} onClose={()=>{setShowForm(false);setEditing(null)}} onSave={saveRecord}/>}
    </div>
  );
}

function Dashboard({ onNavigate }: { onNavigate: (key: ModuleKey)=>void }) {
  const metrics = [
    { label:"Revenue this month", value:"PKR 29.7M", change:"+9.6%", up:true, icon:CircleDollarSign, color:"blue" },
    { label:"Receivables outstanding", value:"PKR 18.4M", change:"12 overdue", up:false, icon:Wallet, color:"orange" },
    { label:"Active projects", value:"24", change:"4 need attention", up:true, icon:HardHat, color:"purple" },
    { label:"Open service tickets", value:"18", change:"3 high priority", up:false, icon:Headphones, color:"green" }
  ];
  return <div className="dashboard-page">
    <div className="page-heading"><div><div className="eyebrow"><span className="live-dot"/> OPERATIONS OVERVIEW</div><h1>Good evening, ASG team <span>✦</span></h1><p>Here’s what’s happening across your operations today.</p></div><div className="heading-actions"><button className="btn btn-secondary" onClick={()=>onNavigate("Reports")}><Download size={16}/> Export report</button><button className="btn btn-primary" onClick={()=>onNavigate("Projects")}><Plus size={17}/> New project</button></div></div>
    <div className="insight-banner"><div className="insight-icon"><Activity size={20}/></div><div><b>Operations pulse</b><p>2 projects are at risk and 3 high-priority service tickets need review.</p></div><button onClick={()=>onNavigate("Projects")}>Review priorities <span>→</span></button></div>
    <div className="metric-grid">{metrics.map((m,i)=>{const Icon=m.icon;return <div className="metric-card" key={m.label}><div className="metric-top"><span>{m.label}</span><div className={`metric-icon ${m.color}`}><Icon size={18}/></div></div><h2>{m.value}</h2><div className={`metric-change ${m.up?"positive":"attention"}`}>{m.up?<ArrowUpRight size={15}/>:<ArrowDownRight size={15}/>}<b>{m.change}</b><span>{i===0?"vs last month":i===1?"require follow-up":i===2?"active portfolio":"across all branches"}</span></div></div>})}</div>
    <div className="dashboard-grid"><section className="panel revenue-panel"><div className="panel-heading"><div><h3>Revenue & collections</h3><p>Monthly performance · PKR millions</p></div><button className="select-chip">Last 6 months <ChevronDown size={14}/></button></div><div className="chart-legend"><span><i className="legend-blue"/> Revenue</span><span><i className="legend-teal"/> Collections</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={revenueSeries} margin={{top:12,right:6,left:-18,bottom:0}}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2d6cdf" stopOpacity={0.19}/><stop offset="100%" stopColor="#2d6cdf" stopOpacity={0}/></linearGradient><linearGradient id="col" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#18a999" stopOpacity={0.16}/><stop offset="100%" stopColor="#18a999" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9eef4"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#8492a6",fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#8492a6",fontSize:11}}/><Tooltip formatter={(v:any)=>`PKR ${v}M`} contentStyle={{border:"1px solid #e8edf3",borderRadius:10,fontSize:12}}/><Area type="monotone" dataKey="revenue" stroke="#2d6cdf" strokeWidth={2.5} fill="url(#rev)"/><Area type="monotone" dataKey="collection" stroke="#18a999" strokeWidth={2.5} fill="url(#col)"/></AreaChart></ResponsiveContainer></div><div className="chart-foot"><span><i className="status-dot green-dot"/> Collection rate</span><b>81.8%</b><span className="foot-note">Target: 85%</span></div></section>
      <section className="panel project-panel"><div className="panel-heading"><div><h3>Project portfolio</h3><p>Recent delivery updates</p></div><button className="text-action" onClick={()=>onNavigate("Projects")}>View all <span>→</span></button></div><div className="project-list">{demoProjects.slice(0,4).map((p,i)=><div className="project-row" key={p.id}><div className={`project-symbol ps-${i}`}><Building2 size={17}/></div><div className="project-info"><b>{p.title}</b><small>{p.subtitle}</small><div className="progress-line"><i style={{width:["72%","38%","21%","86%"][i]}}/></div></div><div className="project-end"><span className={`status-pill ${p.status==="At Risk"?"risk":p.status==="Planning"?"planning":p.status==="On Track"?"success":"progress"}`}>{p.status}</span><small>{p.date}</small></div></div>)}</div></section>
    </div>
    <div className="dashboard-grid lower-grid"><section className="panel"><div className="panel-heading"><div><h3>Priority service queue</h3><p>Issues requiring action</p></div><button className="text-action" onClick={()=>onNavigate("Service & AMC")}>Open service desk →</button></div>{demoTickets.map(t=><div className="ticket-row" key={t.id}><div className="ticket-icon"><Wrench size={17}/></div><div className="ticket-copy"><b>{t.title}</b><small>{t.subtitle}</small></div><span className={`status-pill ${t.status==="High"?"risk":t.status==="Open"?"progress":"planning"}`}>{t.status}</span></div>)}</section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Common workflows</p></div><span className="small-muted">SHORTCUTS</span></div><div className="quick-grid"><button onClick={()=>onNavigate("CRM")}><div className="quick-icon qi-blue"><Users size={18}/></div><b>New lead</b><small>CRM pipeline</small></button><button onClick={()=>onNavigate("Sales & Quotes")}><div className="quick-icon qi-purple"><FileText size={18}/></div><b>Create quote</b><small>Sales & BOQ</small></button><button onClick={()=>onNavigate("Procurement")}><div className="quick-icon qi-orange"><ShoppingCart size={18}/></div><b>Purchase order</b><small>Procurement</small></button><button onClick={()=>onNavigate("Service & AMC")}><div className="quick-icon qi-green"><CalendarClock size={18}/></div><b>Schedule visit</b><small>Service & AMC</small></button></div></section></div>
    <div className="dashboard-footer"><span><CheckCircle2 size={15}/> Dashboard overview</span><span>Demo values shown until live records are connected · PKR</span></div>
  </div>;
}

function ModulePage({ active, config, rows, allRows, search, setSearch, loading, error, notice, onCreate, onEdit, onDelete, onRefresh, onNavigate }: any) {
  const Icon = nav.find(n=>n.label===active)?.icon ?? ClipboardList;
  const isReadOnly = ["Reports","Admin"].includes(active);
  return <div className="module-page"><div className="page-heading"><div><div className="eyebrow">ASG OPERATIONS <span className="eyebrow-divider">/</span> {active.toUpperCase()}</div><h1>{active}</h1><p>{config?.description ?? "Manage your operations."}</p></div><div className="heading-actions"><button className="btn btn-secondary" onClick={onRefresh}><RefreshCw size={16}/> Refresh</button>{!isReadOnly&&<button className="btn btn-primary" onClick={onCreate}><Plus size={17}/> New {config?.singular ?? "record"}</button>}</div></div>
    <div className="module-stat-grid"><div className="module-stat"><div className="module-stat-icon"><Icon size={19}/></div><div><small>Total records</small><b>{allRows.length}</b></div></div><div className="module-stat"><div className="module-stat-icon teal"><CheckCircle2 size={19}/></div><div><small>Active / open</small><b>{allRows.filter((r:any)=>!["Completed","Closed","Paid","Won","Lost"].includes(r.status)).length}</b></div></div><div className="module-stat"><div className="module-stat-icon amber"><Clock3 size={19}/></div><div><small>Needs attention</small><b>{allRows.filter((r:any)=>["At Risk","High","Overdue","Pending Approval"].includes(r.status)).length}</b></div></div><div className="module-stat"><div className="module-stat-icon violet"><Activity size={19}/></div><div><small>Data source</small><b className="source-label">{isSupabaseConfigured?"Cloud database":"Demo mode"}</b></div></div></div>
    {notice&&<div className="notice success-notice">{notice}</div>}{error&&<div className="notice error-notice">{error}</div>}
    {!isSupabaseConfigured&&<div className="notice demo-notice"><Globe2 size={17}/><div><b>Demo mode</b><p>Records created here stay in browser memory only. Configure Supabase to enable shared persistent storage and secure sign-in.</p></div></div>}
    <section className="panel records-panel"><div className="records-toolbar"><div><h3>{active} records</h3><p>{rows.length} record{rows.length===1?"":"s"} {search?"matching your search": "shown"}</p></div><div className="records-tools"><div className="table-search"><Search size={16}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search records..."/></div><button className="btn btn-secondary compact-btn" onClick={()=>alert("Advanced filters are planned for the next iteration.")}><Filter size={15}/> Filter</button></div></div>
      {loading?<div className="empty-state"><RefreshCw className="spin" size={24}/><b>Loading records…</b></div>:rows.length===0?<div className="empty-state"><div className="empty-icon"><Icon size={24}/></div><b>No records found</b><p>{search?"Try a different search term.":"Create your first record to get started."}</p>{!isReadOnly&&<button className="btn btn-primary" onClick={onCreate}><Plus size={16}/> Add {config?.singular}</button>}</div>:<div className="table-scroll"><table><thead><tr><th>Record</th><th>Details</th><th>Status</th><th>Value / Owner</th><th>Due / Date</th><th className="actions-head">Actions</th></tr></thead><tbody>{rows.map((r:any,i:number)=><tr key={r.id??i}><td><div className="record-title"><span className="record-bullet">{String(r.id??"R").slice(0,2).toUpperCase()}</span><div><b>{r.name??r.title??r.project_code??r.quote_number??r.sku??r.po_number??r.invoice_number??r.ticket_number??r.employee_code??"Record"}</b><small>{r.id?.toString().slice(0,12)}</small></div></div></td><td><span className="details-cell">{r.subtitle??r.customer_name??r.city??r.description??r.issue??r.department??r.product_interest??"—"}</span></td><td><span className={`status-pill ${["At Risk","High","Critical","Overdue","Lost"].includes(r.status??r.priority)?"risk":["Completed","Paid","Won","Resolved","Approved"].includes(r.status)?"success":["Planning","Draft","New","Open"].includes(r.status??r.priority)?"planning":"progress"}`}>{r.status??r.priority??r.employment_status??"Active"}</span></td><td><b className="value-cell">{r.amount||r.estimated_value||r.budget||r.unit_cost?formatPKR(Number(r.amount??r.estimated_value??r.budget??r.unit_cost)):r.owner??r.project_manager??r.assigned_to??r.vendor_name??r.full_name??"—"}</b></td><td>{r.date??r.due_date??r.valid_until??r.next_follow_up??r.expected_date??r.due_at??r.start_date??"—"}</td><td><div className="row-actions"><button className="icon-btn" title="Edit" onClick={()=>onEdit(r)}><Edit3 size={15}/></button><button className="icon-btn danger-action" title="Delete" onClick={()=>onDelete(r)}><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div>}
      <div className="table-footer"><span>Showing {rows.length} of {allRows.length} records</span><span>Page 1 <button disabled>‹</button><button disabled>›</button></span></div>
    </section>
    {active==="Reports"&&<div className="panel report-note"><FileBarChart size={22}/><div><b>Reports & exports</b><p>CSV export and advanced financial/project reports are not enabled in this starter build. The audit log table is available in the database schema.</p></div></div>}
    {active==="Admin"&&<div className="panel report-note"><ShieldCheck size={22}/><div><b>Access control setup</b><p>Role-management UI is not complete. Database row-level security is provided in the schema, but policies must be tested and assigned to your organization's roles before production use.</p></div></div>}
  </div>;
}

function RecordModal({ config, initial, onClose, onSave }: any) {
  const [form, setForm] = useState<Record<string, any>>(() => ({...initial}));
  const [saving, setSaving] = useState(false);
  const [validation, setValidation] = useState("");
  function update(key: string, value: any) { setForm((prev:any)=>({...prev,[key]:value})); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const missing = config.fields.filter((f:any)=>f.required&&!String(form[f.key]??"").trim());
    if (missing.length) { setValidation(`Please complete required fields: ${missing.map((f:any)=>f.label).join(", ")}.`); return; }
    for (const f of config.fields) if (f.type==="number" && form[f.key]!==undefined && form[f.key]!=="" && Number(form[f.key])<0) { setValidation(`${f.label} cannot be negative.`); return; }
    setSaving(true); await onSave(form); setSaving(false);
  }
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="record-modal"><div className="modal-heading"><div><div className="eyebrow">{initial?.id?"UPDATE RECORD":"NEW RECORD"}</div><h2>{initial?.id?"Edit":"Create"} {config.singular}</h2><p>Enter the record details below.</p></div><button className="icon-btn" onClick={onClose}><X size={19}/></button></div><form onSubmit={submit}><div className="form-grid">{config.fields.map((f:any)=><label key={f.key} className={f.type==="textarea"?"span-two":""}><span>{f.label}{f.required&&<i> *</i>}</span>{f.type==="select"?<select value={form[f.key]??""} onChange={e=>update(f.key,e.target.value)} required={f.required}><option value="">Select {f.label.toLowerCase()}</option>{f.options.map((o:string)=><option key={o}>{o}</option>)}</select>:<input type={f.type??"text"} value={form[f.key]??""} onChange={e=>update(f.key,e.target.value)} required={f.required} min={f.type==="number"?0:undefined} placeholder={`Enter ${f.label.toLowerCase()}`}/>}</label>)}</div>{validation&&<div className="form-error">{validation}</div>}<div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}><Save size={16}/>{saving?"Saving…":"Save record"}</button></div></form></div></div>;
}

function Login({ onLogin, error }: { onLogin:(email:string,password:string)=>Promise<void>; error:string }) {
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  return <div className="login-screen"><div className="login-card"><div className="brand-mark large-mark">A</div><div className="eyebrow">ASG SYSTEMS PAKISTAN</div><h1>Welcome back</h1><p>Sign in to your Operations ERP workspace.</p><form onSubmit={e=>{e.preventDefault();void onLogin(email,password)}}><label>Email address<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com"/></label><label>Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password"/></label>{error&&<div className="form-error">{error}</div>}<button className="btn btn-primary login-submit">Sign in <span>→</span></button></form><small>Ask your ERP administrator for an account if you do not have one.</small></div></div>;
}

export default App;