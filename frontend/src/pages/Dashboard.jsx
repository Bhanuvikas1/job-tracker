import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import api from "../api/api";
import "./dashboard.css";

const STATUS_ORDER = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

const STATUS_META = {
  APPLIED:   { label: "Applied",   hint: "Sent your application" },
  INTERVIEW:{ label: "Interview", hint: "In progress" },
  OFFER:     { label: "Offer",     hint: "Great news!" },
  REJECTED:  { label: "Rejected",  hint: "Keep going" },
};

// Keep same colors you already use in charts/cards
const STATUS_COLORS = {
  APPLIED: "#3b82f6",
  INTERVIEW: "#f59e0b",
  OFFER: "#10b981",
  REJECTED: "#ef4444",
};

function StatusModal({ open, status, items, onClose, onGoApplications }) {
  if (!open) return null;

  return (
    <div className="jt-modal-backdrop" onClick={onClose}>
      <div className="jt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="jt-modal-head">
          <div className="jt-modal-title">
            <span className="jt-dot" style={{ background: STATUS_COLORS[status] }} />
            {STATUS_META[status]?.label} applications
          </div>

          <button className="jt-icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="jt-modal-sub">
          {items.length} {items.length === 1 ? "application" : "applications"} in{" "}
          <b>{STATUS_META[status]?.label}</b>
        </div>

        <div className="jt-modal-body">
          {items.length === 0 ? (
            <div className="jt-empty">No applications found for this status.</div>
          ) : (
            <div className="jt-list">
              {items.map((a) => (
                <div key={a.id} className="jt-list-row">
                  <div className="jt-list-main">
                    <div className="jt-company">{a.company}</div>
                    <div className="jt-role">{a.role}</div>
                  </div>

                  <span className="jt-badge" style={{ background: `${STATUS_COLORS[status]}1A`, color: STATUS_COLORS[status], borderColor: `${STATUS_COLORS[status]}55` }}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="jt-modal-actions">
          <button className="jt-btn" onClick={onClose}>Close</button>
          <button className="jt-btn jt-btn-solid" onClick={() => onGoApplications(status)}>
            View on Applications page
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStatus, setSelectedStatus] = useState(null);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/applications");
      setApps(res.data || []);
    } catch (e) {
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const counts = useMemo(() => {
    const map = { APPLIED: 0, INTERVIEW: 0, OFFER: 0, REJECTED: 0 };
    for (const a of apps) map[a.status] = (map[a.status] || 0) + 1;
    return map;
  }, [apps]);

  const pieData = useMemo(() => {
    return STATUS_ORDER.map((s) => ({
      name: s,
      value: counts[s] || 0,
    }));
  }, [counts]);

  const barData = useMemo(() => {
    return STATUS_ORDER.map((s) => ({
      status: s,
      count: counts[s] || 0,
      color: STATUS_COLORS[s],
    }));
  }, [counts]);

  const total = useMemo(() => STATUS_ORDER.reduce((sum, s) => sum + (counts[s] || 0), 0), [counts]);

  const filteredForModal = useMemo(() => {
    if (!selectedStatus) return [];
    return apps
      .filter((a) => a.status === selectedStatus)
      .sort((a, b) => (a.company || "").localeCompare(b.company || ""));
  }, [apps, selectedStatus]);

  const openStatus = (status) => setSelectedStatus(status);
  const closeModal = () => setSelectedStatus(null);

  const goApplications = (status) => {
    // store selected filter, Applications page reads it
    localStorage.setItem("jt_status_filter", status);
    window.location.href = "/applications";
  };

  return (
    <div className="dash-wrap">
      <div className="dash-hero">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-sub">A quick snapshot of where your applications stand.</p>
        </div>

        <button className="dash-refresh" onClick={fetchApps} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="dash-cards">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            className="stat-card"
            onClick={() => openStatus(status)}
            title={`Click to view ${STATUS_META[status]?.label} applications`}
            style={{ cursor: "pointer" }}
          >
            <div className="stat-top">
              <div className="stat-label">{status}</div>
              <div className="stat-value" style={{ color: STATUS_COLORS[status] }}>
                {counts[status] || 0}
              </div>
            </div>
            <div className="stat-hint">{STATUS_META[status]?.hint}</div>
          </button>
        ))}
      </div>

      <div className="dash-grid">
        <div className="dash-panel">
          <div className="panel-head">
            <div className="panel-title">Status Distribution</div>
            <div className="panel-sub">Hover for counts • Click a slice for details</div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  onClick={(d) => openStatus(d?.name)}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>

                <ReTooltip
                  formatter={(value, name) => [`${value}`, `${STATUS_META[name]?.label}`]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="donut-center">
              <div className="donut-total">{total}</div>
              <div className="donut-label">TOTAL</div>
            </div>

            <div className="legend">
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  className="legend-item"
                  onClick={() => openStatus(s)}
                  title={`Show ${STATUS_META[s]?.label}`}
                >
                  <span className="legend-dot" style={{ background: STATUS_COLORS[s] }} />
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="dash-panel">
          <div className="panel-head">
            <div className="panel-title">Counts by Status</div>
            <div className="panel-sub">Hover for counts • Click a bar for details</div>
          </div>

          <div className="chart-box">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={barData} onClick={(e) => {
                // recharts click often gives activeLabel in tooltip context,
                // but simplest: detect payload if available
                const payload = e?.activePayload?.[0]?.payload;
                if (payload?.status) openStatus(payload.status);
              }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count">
                  {barData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="dash-tip">
            <b>Tip:</b> status will update accordingly.
          </div>
        </div>
      </div>

      <StatusModal
        open={!!selectedStatus}
        status={selectedStatus}
        items={filteredForModal}
        onClose={closeModal}
        onGoApplications={goApplications}
      />
    </div>
  );
}
