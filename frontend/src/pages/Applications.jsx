import { useEffect, useMemo, useState } from "react";
import api from "../api/api";
import TimelineModel from "../components/TimelineModel";
import "./applications.css";

const STATUS_OPTIONS = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const FILTER_OPTIONS = ["ALL", ...STATUS_OPTIONS];

export default function Applications() {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("APPLIED");
  const [notes, setNotes] = useState("");

  const [applications, setApplications] = useState([]);


  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");


  const [pinnedIds, setPinnedIds] = useState(() => new Set());


  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("jt_status_filter");
    if (saved) {
      setStatusFilter(saved);
      localStorage.removeItem("jt_status_filter");
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      const res = await api.get("/api/applications");
      setApplications(res.data);
    } catch (err) {
      console.error(err);
      showToast("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }

  async function addApplication(e) {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      showToast("Please enter company and role.");
      return;
    }

    try {
      await api.post("/api/applications", {
        company: company.trim(),
        role: role.trim(),
        status,
        notes: notes.trim() ? notes.trim() : null,
      });

      setCompany("");
      setRole("");
      setStatus("APPLIED");
      setNotes("");
      showToast("Application added.");

     
      setPinnedIds(new Set());

      await loadApplications();
    } catch (err) {
      console.error(err);
      showToast("Failed to add application.");
    }
  }

  async function updateStatus(id, newStatus) {
    try {
      await api.put(`/api/applications/${id}/status`, { status: newStatus });

     
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );


      setPinnedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      showToast("Status updated.");
    } catch (err) {
      console.error(err);
      showToast("Failed to update status.");
    }
  }

  async function deleteApplication(id) {
    if (!confirm("Delete this application?")) return;
    try {
      await api.delete(`/api/applications/${id}`);
      setApplications((prev) => prev.filter((a) => a.id !== id));

      setPinnedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });

      showToast("Deleted.");
    } catch (err) {
      console.error(err);
      showToast("Failed to delete.");
    }
  }

  function openTimeline(app) {
    setSelectedApp(app);
    setTimelineOpen(true);
  }

  function closeTimeline() {
    setTimelineOpen(false);
    setSelectedApp(null);
  }

  const filteredApps = useMemo(() => {
    const q = search.trim().toLowerCase();

    return applications.filter((app) => {
      const matchesQuery =
        !q ||
        app.company.toLowerCase().includes(q) ||
        app.role.toLowerCase().includes(q);

      const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;

      const isPinned = pinnedIds.has(app.id);

      return matchesQuery && (matchesStatus || isPinned);
    });
  }, [applications, search, statusFilter, pinnedIds]);

  function badgeClass(s) {
    if (s === "APPLIED") return "badge applied";
    if (s === "INTERVIEW") return "badge interview";
    if (s === "OFFER") return "badge offer";
    if (s === "REJECTED") return "badge rejected";
    return "badge";
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("ALL");
    setPinnedIds(new Set());
  }

  return (
    <div className="applications-page">
      <div className="applications-wrap">
        {/* Header */}
        <div className="page-head">
          <div>
            <h1 className="page-title">Applications</h1>
            <p className="page-subtitle">
              Add, search, filter, update status, and view timeline history.
            </p>
          </div>
        </div>

        {/* Add form card */}
        <div className="card">
          <div className="card-title">Add Application</div>

          <form onSubmit={addApplication} className="form-grid">
            <div className="field">
              <label>Company</label>
              <input
                type="text"
                placeholder="e.g., Daxwell"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Role</label>
              <input
                type="text"
                placeholder="e.g., Frontend Developer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button className="primary-btn" type="submit">
              Add
            </button>

            {/* Notes full width (optional) */}
            <div className="field notes-field">
              <label>Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g., Referred by friend, follow up in 7 days..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </form>
        </div>

        {/* Filters */}
        <div className="card filter-card">
          <div className="filters">
            <div className="field grow">
              <label>Search</label>
              <input
                type="text"
                placeholder="Search by company or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {FILTER_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All Status" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="stats">
              Showing <b>{filteredApps.length}</b> of <b>{applications.length}</b>
            </div>

            <button className="ghost-btn" type="button" onClick={clearFilters}>
              Clear
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <div className="table-head">
            <div className="table-title">Your Applications</div>
            {loading && <div className="loading">Loading...</div>}
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th style={{ width: 220 }}>Edit Status</th>
                  <th style={{ width: 240 }}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty">
                      No matching applications.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const willBeHidden =
                      statusFilter !== "ALL" && app.status !== statusFilter;

                    const isPinned = pinnedIds.has(app.id);

                    return (
                      <tr key={app.id}>
                        <td className="cell-strong">{app.company}</td>
                        <td>{app.role}</td>
                        <td>
                          <span className={badgeClass(app.status)}>{app.status}</span>

                          {}
                          {isPinned && willBeHidden && (
                            <span
                              style={{
                                marginLeft: 8,
                                fontSize: 12,
                                padding: "3px 8px",
                                borderRadius: 999,
                                border: "1px solid #fdba74",
                                background: "#fff7ed",
                                color: "#9a3412",
                              }}
                            >
                              Showing (changed)
                            </span>
                          )}
                        </td>

                        <td>
                          <select
                            className="row-select"
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="actions-cell">
                          <button
                            className="timeline-btn"
                            type="button"
                            onClick={() => openTimeline(app)}
                          >
                            Timeline
                          </button>

                          <button
                            className="danger-btn"
                            type="button"
                            onClick={() => deleteApplication(app.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Toast */}
        {toast && <div className="toast">{toast}</div>}

        {/* Timeline modal */}
        <TimelineModel open={timelineOpen} onClose={closeTimeline} app={selectedApp} />
      </div>
    </div>
  );
}
