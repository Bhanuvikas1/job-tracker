import React, { useEffect, useMemo, useState } from "react";
import { getApplicationHistoryApi } from "../api/api";
import "./TimeModel.css";

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleString();
}

function statusClass(status) {
  const s = (status || "").toUpperCase();
  if (s === "APPLIED") return "tm-badge tm-applied";
  if (s === "INTERVIEW") return "tm-badge tm-interview";
  if (s === "OFFER") return "tm-badge tm-offer";
  if (s === "REJECTED") return "tm-badge tm-rejected";
  return "tm-badge";
}

export default function TimelineModel({ open, onClose, app }) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  const title = useMemo(() => {
    if (!app) return "Application Timeline";
    return `${app.company} — ${app.role}`;
  }, [app]);

  useEffect(() => {
    if (!open || !app?.id) return;

    let alive = true;

    (async () => {
      setLoading(true);
      setError("");

      try {
        const res = await getApplicationHistoryApi(app.id);
        if (!alive) return;

        const data = Array.isArray(res.data) ? res.data : [];

        data.sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt));

        setItems(data);
      } catch (e) {
        if (!alive) return;
        setError("Could not load timeline. Please try again.");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [open, app?.id]);

  // close on ESC
  useEffect(() => {
    if (!open) return;

    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="tm-overlay" onMouseDown={onClose}>
      <div className="tm-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="tm-header">
          <div>
            <div className="tm-title">{title}</div>
            <div className="tm-subtitle">Status change timeline</div>
          </div>

          <button className="tm-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="tm-body">
          {/* NOTES SECTION */}
          <div className="tm-notes">
            <div className="tm-notes-title">Notes</div>
            {app?.notes && app.notes.trim() ? (
              <div className="tm-notes-text">{app.notes}</div>
            ) : (
              <div className="tm-notes-empty">No notes added.</div>
            )}
          </div>

          {/* Timeline section */}
          <div className="tm-divider" />

          {loading && <div className="tm-info">Loading timeline…</div>}
          {!loading && error && <div className="tm-error">{error}</div>}

          {!loading && !error && items.length === 0 && (
            <div className="tm-info">No history yet.</div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="tm-list">
              {items.map((h, idx) => (
                <div key={h.id ?? idx} className="tm-item">
                  <div className="tm-left">
                    <div className="tm-dot" />
                    {idx !== items.length - 1 && <div className="tm-line" />}
                  </div>

                  <div className="tm-right">
                    <div className="tm-row">
                      <span className={statusClass(h.status)}>{h.status}</span>
                      <span className="tm-time">{formatDate(h.changedAt)}</span>
                    </div>

                    <div className="tm-desc">
                      Moved to <b>{(h.status || "").toUpperCase()}</b>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="tm-footer">
          <button className="tm-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
