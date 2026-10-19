import { useEffect, useState } from "react";
import backgroundVideo from "./assets/video1.mp4";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function App() {
  const [screen, setScreen] = useState("Dashboard");
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [hotspots, setHotspots] = useState(null);
  const [pragyaOpen, setPragyaOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [listening, setListening] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", location: "", category: "", reporter: "Student User" });

  const fetchData = async () => {
    const [dashboardData, complaintsData, hotspotsData] = await Promise.all([
      fetch(`${API_URL}/dashboard`).then(r => r.json()),
      fetch(`${API_URL}/complaints`).then(r => r.json()),
      fetch(`${API_URL}/analytics/hotspots`).then(r => r.json()),
    ]);
    return { dashboardData, complaintsData, hotspotsData };
  };

  const loadData = async () => {
    try {
      const { dashboardData, complaintsData, hotspotsData } = await fetchData();
      setDashboard(dashboardData);
      setComplaints(complaintsData.complaints || []);
      setHotspots(hotspotsData);
    } catch (e) {
      console.error("Backend connection error", e);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchData()
      .then(({ dashboardData, complaintsData, hotspotsData }) => {
        if (cancelled) return;
        setDashboard(dashboardData);
        setComplaints(complaintsData.complaints || []);
        setHotspots(hotspotsData);
      })
      .catch(e => console.error("Backend connection error", e));
    return () => { cancelled = true; };
  }, []);

  const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submitForm = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) return;
    try {
      const res = await fetch(`${API_URL}/complaints`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setSubmitted(data);
        setForm({ title: "", description: "", location: "", category: "", reporter: "Student User" });
        await loadData();
        setTimeout(() => setSubmitted(null), 8000);
      }
    } catch (e) { console.error(e); }
  };

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Voice input is not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onresult = e => updateForm("description", e.results[0][0].transcript);
    recognition.start();
  };

  const askPragya = async () => {
    if (!question.trim()) return;
    try {
      const res = await fetch(`${API_URL}/pragya?question=${encodeURIComponent(question)}`);
      const data = await res.json();
      setAnswer(data.answer || "No answer available.");
    } catch { setAnswer("I couldn't reach the CivicFix backend."); }
  };

  const nav = [
    ["Dashboard", "⌂"], ["Complaints", "▤"], ["Workload", "⌁"], ["Hotspots", "◒"]
  ];

  const titleMap = { Dashboard: "Campus operations / Dashboard", Complaints: "Workspace / Complaints", Workload: "Workspace / Workload", Hotspots: "Workspace / Hotspots" };

  return (
    <div className="app">
      <video className="background-video" autoPlay loop muted playsInline><source src={backgroundVideo} type="video/mp4" /></video>
      <div className="background-shade"></div>
      <aside className="sidebar">
        <div className="logo-area"><div className="logo-mark">C</div><div><div className="logo-name">CivicFix</div><div className="logo-subtitle">Campus Operations</div></div></div>
        <div className="sidebar-group"><div className="sidebar-label">OVERVIEW</div>
          {nav.map(([name, icon]) => <button key={name} className={`side-link ${screen === name ? "active" : ""}`} onClick={() => setScreen(name)}><span className="side-icon">{icon}</span>{name}{name === "Complaints" && <span className="side-count">{complaints.length}</span>}</button>)}
        </div>
        <div className="sidebar-group"><div className="sidebar-label">SYSTEM</div><button className="side-link"><span className="side-icon">⚙</span>Settings</button><button className="side-link"><span className="side-icon">?</span>Support</button></div>
        <div className="sidebar-bottom"><div className="account"><div className="account-avatar">S</div><div className="account-info"><strong>Student User</strong><span>Student account</span></div><span className="account-more">•••</span></div></div>
      </aside>

      <main className="main">
        <header className="topbar"><div className="topbar-left"><div className="mobile-brand">CivicFix</div><div className="page-location"><span>WORKSPACE</span><strong>/ {titleMap[screen]?.split("/ ")[1]}</strong></div></div><div className="topbar-right"><button className="search"><span>⌕</span>Search anything<kbd>⌘ K</kbd></button><button className="icon-button" onClick={() => setPragyaOpen(true)}>♢<i></i></button><div className="top-profile"><div className="top-profile-avatar">S</div><span>Student</span><b>⌄</b></div></div></header>

        {screen === "Dashboard" && <Dashboard dashboard={dashboard} complaints={complaints} openForm={() => setShowForm(true)} setScreen={setScreen} />}
        {screen === "Complaints" && <Complaints complaints={complaints} refresh={loadData} openForm={() => setShowForm(true)} />}
        {screen === "Workload" && <Workload dashboard={dashboard} />}
        {screen === "Hotspots" && <Hotspots hotspots={hotspots} />}

        {showForm && <ComplaintModal form={form} updateForm={updateForm} close={() => setShowForm(false)} submit={submitForm} startVoice={startVoice} listening={listening} />}
        {submitted && <SubmissionToast data={submitted} />}

        <button className="pragya-fab" onClick={() => setPragyaOpen(true)} title="Ask PRAGYA">🤖</button>
        {pragyaOpen && <div className="pragya-panel"><div className="pragya-head"><div><strong>PRAGYA</strong><span>Smart campus assistant</span></div><button onClick={() => setPragyaOpen(false)}>×</button></div><div className="pragya-body"><div className="pragya-welcome">Ask me about complaints, workload, hotspots or assignments.</div>{answer && <div className="pragya-answer">{answer}</div>}</div><div className="pragya-input"><input value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => e.key === "Enter" && askPragya()} placeholder="Ask PRAGYA..."/><button onClick={askPragya}>→</button></div></div>}
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {nav.map(([name, icon]) => <button key={name} className={screen === name ? "active" : ""} onClick={() => setScreen(name)}><span>{icon}</span>{name}</button>)}
      </nav>
    </div>
  );
}

function Dashboard({ dashboard, complaints, openForm, setScreen }) {
  const s = dashboard?.summary || {};
  const critical = complaints.filter(c => c.priority === "Critical" && c.status !== "Resolved").slice(0, 4);
  return <>
    <section className="heading-row"><div><p className="eyebrow">TUESDAY · 16 SEPTEMBER 2026</p><h1>Campus operations<span> at a glance.</span></h1><p className="heading-description">Monitor issues, coordinate maintenance and keep your campus running smoothly.</p></div><button className="report-button" onClick={openForm}><span>＋</span>Report an issue</button></section>
    <section className="operations-hero"><div className="hero-video"><video autoPlay loop muted playsInline><source src={backgroundVideo} type="video/mp4" /></video><div className="hero-video-overlay"></div><div className="hero-content"><div className="hero-top"><div><span className="hero-label">CAMPUS HEALTH</span><div className="health-row"><div className="health-indicator"></div><strong>Operational</strong></div></div><div className="health-score"><span>{s.total ? Math.max(0, 100 - Math.round((s.sla_breached || 0) / s.total * 100)) : 100}</span><small>%</small></div></div><div className="hero-bottom"><div className="hero-stat"><span>OPEN ISSUES</span><strong>{String((s.new || 0) + (s.assigned || 0) + (s.in_progress || 0)).padStart(2,"0")}</strong></div><div className="hero-stat"><span>IN PROGRESS</span><strong>{String(s.in_progress || 0).padStart(2,"0")}</strong></div><div className="hero-stat"><span>RESOLVED</span><strong>{String(s.resolved || 0).padStart(2,"0")}</strong></div><div className="hero-update"><span className="live-dot"></span>Live campus data</div></div></div></div></section>
    <section className="dashboard-grid"><div className="surface priority-surface"><div className="surface-header"><div><span className="surface-eyebrow">NEEDS ATTENTION</span><h2>Priority queue</h2></div><button className="text-button" onClick={() => setScreen("Complaints")}>View all →</button></div><div className="priority-list">{(critical.length ? critical : complaints.filter(c => c.status !== "Resolved").slice(0,4)).map(c => <div className="priority-item" key={c.id}><div className={`priority-line ${c.priority?.toLowerCase()}`}></div><div className="issue-main"><div className="issue-heading"><strong>{c.title}</strong><span className={`priority-tag ${c.priority === "Critical" ? "high-tag" : c.priority === "Medium" ? "medium-tag" : "low-tag"}`}>{c.priority}</span></div><p>CMP-{String(c.id).padStart(3,"0")} · {c.category} · {c.location}</p></div><div className="issue-status pending-status">{c.status}</div></div>)}{!complaints.length && <div className="pragya-welcome">No complaints yet. Create the first issue.</div>}</div></div><div className="surface quick-surface"><div className="quick-icon">＋</div><span className="surface-eyebrow">QUICK ACTION</span><h2>See something that needs fixing?</h2><p>Report an issue in less than a minute. CivicFix will route it to the right team.</p><button className="quick-button" onClick={openForm}>Create complaint<span>↗</span></button><div className="quick-meta"><span className="green-check">✓</span>Smart categorization enabled</div></div></section>
    <section className="lower-grid"><div className="surface triage-surface"><div className="surface-header"><div><span className="surface-eyebrow">INTELLIGENT TRIAGE</span><h2>AI-assisted routing</h2></div><div className="ai-pill"><span></span>Active</div></div><div className="triage-layout"><div className="triage-input"><span>RECENT REPORT</span><p>{complaints[0] ? `“${complaints[0].title}”` : "“Water is leaking near the Block B staircase.”"}</p><small>{complaints[0] ? `Assigned to ${complaints[0].assigned_staff}` : "Waiting for first report"}</small></div><div className="triage-arrow">→</div><div className="triage-results"><div><span>CATEGORY</span><strong>{complaints[0]?.category || "Plumbing"}</strong></div><div><span>PRIORITY</span><strong className="danger-text">{complaints[0]?.priority || "Critical"}</strong></div><div><span>ROUTE</span><strong>{complaints[0]?.department || "Maintenance"}</strong></div></div></div></div><div className="surface activity-surface"><div className="surface-header"><div><span className="surface-eyebrow">LIVE ACTIVITY</span><h2>Maintenance teams</h2></div></div>{(dashboard?.staff_workload || []).slice(0,3).map(s => <div className="team-row" key={s.name}><div className="team-avatar">{s.name.split(" ").map(x=>x[0]).join("")}</div><div><strong>{s.department}</strong><span>{s.active_complaints} active complaint{s.active_complaints === 1 ? "" : "s"}</span></div><div className="team-state"><i></i>{s.available ? "Available" : "Busy"}</div></div>)}</div></section>
  </>;
}

function Complaints({ complaints, refresh, openForm }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All status");
  const filteredComplaints = complaints.filter(c => {
    const searchable = `${c.title} ${c.location} ${c.category} ${c.assigned_staff}`.toLowerCase();
    return searchable.includes(query.toLowerCase()) && (status === "All status" || c.status === status);
  });

  return <section className="screen-section">
    <div className="section-title page-heading"><div><p className="eyebrow">MAINTENANCE CONTROL</p><h1>Complaints<span> queue.</span></h1><p className="page-intro">Track every campus issue from first report to resolution.</p></div><button className="report-button" onClick={openForm}><span>＋</span>Report an issue</button></div>
    <div className="surface table-surface">
      <div className="queue-toolbar"><div><strong>{filteredComplaints.length} active records</strong><span>Latest campus reports</span></div><div className="queue-controls"><label className="search-field"><span>⌕</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search complaints" /></label><select value={status} onChange={e => setStatus(e.target.value)} aria-label="Filter by status"><option>All status</option><option>New</option><option>Assigned</option><option>In Progress</option><option>Resolved</option></select></div></div>
      <div className="complaint-table complaint-table-shell"><div className="complaint-table-head"><span>Issue</span><span>Priority</span><span>Assigned team</span><span>Status</span><span>SLA</span></div>{filteredComplaints.map(c => <div className="complaint-row" key={c.id}><div><strong>{c.title}</strong><span>CMP-{String(c.id).padStart(3,"0")} · {c.location} · {c.category}</span></div><b className={`priority-tag ${c.priority === "Critical" || c.priority === "High" ? "high-tag" : c.priority === "Medium" ? "medium-tag" : "low-tag"}`}>{c.priority}</b><span>{c.assigned_staff || "Awaiting assignment"}</span><span className="status-value">{c.status}</span><span className={c.escalation ? "danger-text" : "team-state"}>{c.escalation ? "⚠ SLA Breached" : c.sla_status}</span></div>)}{!filteredComplaints.length && <p className="empty-state">No complaints match your filters.</p>}</div>
      <button className="quick-button refresh-button" onClick={refresh}>Refresh queue ↻</button>
    </div>
  </section>
}

function Workload({ dashboard }) { return <section className="screen-section"><div className="section-title"><div><p className="eyebrow">RESOURCE MANAGEMENT</p><h1>Team<span> workload.</span></h1></div></div><div className="workload-grid">{(dashboard?.staff_workload || []).map(s => <div className="surface workload-card" key={s.name}><div className="team-avatar">{s.name.split(" ").map(x=>x[0]).join("")}</div><h2>{s.name}</h2><p>{s.department}</p><div className="load-number">{s.active_complaints}</div><span>active complaints</span><div className={`availability ${s.available ? "available" : "busy"}`}><i></i>{s.available ? "Available for assignment" : "Currently unavailable"}</div></div>)}{!dashboard?.staff_workload?.length && <div className="surface workload-card">Loading team data…</div>}</div></section> }

function Hotspots({ hotspots }) { return <section className="screen-section"><div className="section-title"><div><p className="eyebrow">PATTERN INTELLIGENCE</p><h1>Campus<span> hotspots.</span></h1></div></div><div className="hotspot-grid"><div className="surface chart-surface"><span className="surface-eyebrow">LOCATION HOTSPOTS</span><h2>Where issues cluster</h2>{(hotspots?.hotspots || []).map(x => <div className="bar-row" key={x.location}><div><strong>{x.location}</strong><span>{x.complaint_count} complaints</span></div><div className="bar"><i style={{width:`${Math.min(100, x.complaint_count / Math.max(1,(hotspots.hotspots[0]?.complaint_count || 1))*100)}%`}}></i></div></div>)}</div><div className="surface chart-surface"><span className="surface-eyebrow">RECURRING CATEGORIES</span><h2>What keeps repeating</h2>{(hotspots?.recurring_categories || []).map(x => <div className="category-row" key={x.category}><strong>{x.category}</strong><b>{x.complaint_count}</b></div>)}</div></div></section> }

function ComplaintModal({ form, updateForm, close, submit, startVoice, listening }) { return <div className="modal-layer"><div className="modal"><button className="modal-close" onClick={close}>×</button><div className="modal-header"><span>NEW COMPLAINT</span><h2>Report a campus issue</h2><p>Provide the details below. CivicFix will automatically assist with classification, priority and routing.</p></div><div className="smart-banner"><div className="smart-symbol">✦</div><div><strong>Smart triage is enabled</strong><span>AI will suggest category, severity, priority, action and responsible team.</span></div></div><div className="form-grid"><div className="form-field full"><label>Issue title</label><input value={form.title} onChange={e=>updateForm("title",e.target.value)} placeholder="What needs attention?" /></div><div className="form-field full"><label>Description</label><textarea value={form.description} onChange={e=>updateForm("description",e.target.value)} placeholder="Describe the issue clearly..." /><button type="button" className="voice-button" onClick={startVoice}>🎤 {listening ? "Listening…" : "Speak description"}</button></div><div className="form-field"><label>Location</label><input value={form.location} onChange={e=>updateForm("location",e.target.value)} placeholder="Block / Room" /></div><div className="form-field"><label>Category <small>(optional)</small></label><select value={form.category} onChange={e=>updateForm("category",e.target.value)}><option value="">AI will decide</option><option>Electrical</option><option>Plumbing</option><option>Furniture</option><option>Cleanliness</option><option>IT Support</option></select></div><div className="form-field full"><label>Photo evidence <small>(optional)</small></label><input type="file" accept="image/*" capture="environment" /></div></div><div className="modal-footer"><button className="cancel-button" onClick={close}>Cancel</button><button className="submit-button" onClick={submit}>Submit complaint <span>→</span></button></div></div></div> }
function SubmissionToast({ data }) { const a=data.ai_analysis||{}; const as=data.assignment||{}; return <div className="success-toast"><div className="success-icon">✓</div><div><strong>Complaint #{data.complaint_id} submitted · {a.priority}</strong><span>{a.category} → {as.staff} · SLA {a.priority === "Critical" ? "30 min" : a.priority === "High" ? "2 hrs" : a.priority === "Medium" ? "8 hrs" : "24 hrs"}</span></div></div> }

export default App;
