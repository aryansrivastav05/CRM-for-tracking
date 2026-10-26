import React, { useState, useEffect } from "react";
import { LeadItem } from "./LeadTable";
import { ThemeColors } from "../../lib/theme";
import { formatIndianCurrency, formatBudgetRange } from "../../lib/formatters";
import { BACKEND_URL } from "../../config";

interface ActivityItem {
  id: string;
  activity_type: string;
  metadata_json?: string;
  created_at: string;
}

interface LeadDetailModalProps {
  lead: LeadItem | null;
  theme: ThemeColors;
  onClose: () => void;
  onUpdateLeadStatus: (leadId: string, status: string, notes: string) => Promise<void>;
  token: string;
  backendUrl?: string;
  onCallLead?: (lead: LeadItem) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  theme,
  onClose,
  onUpdateLeadStatus,
  token,
  backendUrl = BACKEND_URL,
  onCallLead
}) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [currentStatus, setCurrentStatus] = useState(lead?.status || "NEW");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [callActive, setCallActive] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setCurrentStatus(lead.status);
    setNotes(lead.notes || "");
    setSaveSuccess(false);

    const fetchActivities = async () => {
      try {
        const resp = await fetch(`${backendUrl}/api/v1/leads/${lead.id}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          setActivities(data);
        }
      } catch (err) {}
    };

    fetchActivities();
  }, [lead?.id, token, backendUrl]);

  if (!lead) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateLeadStatus(lead.id, currentStatus, notes);
      setSaveSuccess(true);
      // Append local activity
      setActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          activity_type: notes ? "NOTE_ADDED & STAGE_CHANGED" : "STAGE_CHANGED",
          metadata_json: JSON.stringify({ status: currentStatus, notes }),
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCall = () => {
    setCallActive(true);
    if (onCallLead) {
      onCallLead(lead);
    }
    // Append call log to timeline
    setActivities((prev) => [
      {
        id: `call-${Date.now()}`,
        activity_type: "CALL_DIALED (Masked Bridge)",
        metadata_json: JSON.stringify({ masked_phone: lead.phone_masked, caller: "Executive" }),
        created_at: new Date().toISOString()
      },
      ...prev
    ]);
    setTimeout(() => setCallActive(false), 4000);
  };

  const getActivityBadge = (type: string) => {
    if (type.includes("VIEWED")) {
      return { label: "👁️ LEAD_VIEWED", bg: theme.accentBg, color: theme.accentPrimary };
    }
    if (type.includes("CALL")) {
      return { label: "📞 CALL_DIALED", bg: theme.successBg, color: theme.success };
    }
    if (type.includes("CONFISCATED")) {
      return { label: "🛡️ CONFISCATED", bg: theme.dangerBg, color: theme.danger };
    }
    if (type.includes("STAGE") || type.includes("NOTE")) {
      return { label: "📝 NOTE / STAGE UPDATE", bg: theme.warningBg, color: theme.warning };
    }
    if (type.includes("SITE_VISIT")) {
      return { label: "📍 SITE VISIT CHECK-IN", bg: theme.successBg, color: theme.success };
    }
    return { label: `⚡ ${type}`, bg: theme.cardBgSecondary, color: theme.textSecondary };
  };

  const estimatedBrokerage = lead.estimated_brokerage || (lead.budget_max ? Math.round(lead.budget_max * 0.02) : 650000);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(10, 15, 30, 0.75)",
      backdropFilter: "blur(14px)",
      WebkitBackdropFilter: "blur(14px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100000,
      padding: "16px"
    }}>
      <div style={{
        backgroundColor: theme.cardBg,
        backdropFilter: theme.glassBackdrop,
        WebkitBackdropFilter: theme.glassBackdrop,
        color: theme.textPrimary,
        borderRadius: "20px",
        padding: "clamp(16px, 3vw, 24px)",
        width: "100%",
        maxWidth: "680px",
        maxHeight: "92vh",
        overflowY: "auto",
        border: theme.glassBorder,
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.12)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: theme.textPrimary, margin: 0 }}>
                {lead.full_name}
              </h2>
              {lead.offline_closing_flag && (
                <span style={{
                  fontSize: "0.7rem",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontWeight: "800",
                  backgroundColor: theme.dangerBg,
                  color: theme.danger,
                  border: `1px solid ${theme.danger}40`
                }}>
                  🚨 POACHING RISK
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "6px", fontSize: "0.82rem", color: theme.textMuted, flexWrap: "wrap" }}>
              <span>🔒 Masked Phone: <strong style={{ color: theme.accentPrimary, fontFamily: "monospace" }}>{lead.phone_masked}</strong></span>
              <span>• Source: <strong style={{ color: theme.accentHover }}>{lead.source}</strong></span>
              <span>• Agency Commission: <strong style={{ color: theme.success }}>{formatIndianCurrency(estimatedBrokerage)}</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              color: theme.textMuted,
              fontSize: "1.4rem",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "8px",
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* DLP Immutable Audit Guarantee Banner */}
        <div style={{
          padding: "10px 14px",
          borderRadius: "10px",
          backgroundColor: theme.accentBg,
          border: `1px solid ${theme.accentPrimary}30`,
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: theme.accentPrimary, fontWeight: "700" }}>
            <span>🔒</span>
            <span>Immutable DLP Ledger Active: Profile access automatically recorded to security database</span>
          </div>
          <span style={{ fontSize: "0.7rem", padding: "2px 7px", borderRadius: "4px", backgroundColor: theme.cardBg, color: theme.success, fontWeight: "800", border: `1px solid ${theme.success}30` }}>
            ✓ AUTO-LOGGED
          </span>
        </div>

        {/* Lead Parameters Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          backgroundColor: theme.cardBgSecondary,
          padding: "14px",
          borderRadius: "12px",
          marginBottom: "18px",
          fontSize: "0.82rem",
          border: `1px solid ${theme.border}`
        }}>
          <div>
            <span style={{ color: theme.textMuted, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: "700" }}>Property Tier</span>
            <div style={{ fontWeight: "700", color: theme.textPrimary, marginTop: "2px" }}>{lead.property_type || "Apartment"}</div>
          </div>
          <div>
            <span style={{ color: theme.textMuted, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: "700" }}>Budget Bracket</span>
            <div style={{ fontWeight: "800", color: theme.accentPrimary, marginTop: "2px" }}>
              {formatBudgetRange(lead.budget_min, lead.budget_max)}
            </div>
          </div>
          <div>
            <span style={{ color: theme.textMuted, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: "700" }}>Assigned Executive</span>
            <div style={{ fontWeight: "700", color: theme.textPrimary, marginTop: "2px" }}>👤 {lead.assigned_agent_name || "Unassigned"}</div>
          </div>
          <div>
            <span style={{ color: theme.textMuted, fontSize: "0.7rem", textTransform: "uppercase", fontWeight: "700" }}>SLA Standard</span>
            <div style={{ fontWeight: "700", color: lead.is_sla_breached ? theme.danger : theme.success, marginTop: "2px" }}>
              {lead.is_sla_breached ? "⚠️ SLA BREACHED" : "✓ Active 15-min SLA"}
            </div>
          </div>
        </div>

        {/* Click-to-Call Masked Bridge Quick Dial */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderRadius: "12px",
          backgroundColor: theme.cardBgSecondary,
          border: `1px solid ${theme.border}`,
          marginBottom: "18px"
        }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.85rem", color: theme.textPrimary }}>
              📞 Encrypted Click-to-Call Bridge
            </div>
            <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>
              Dials customer via masked bridge without exposing raw phone number.
            </div>
          </div>

          <button
            onClick={handleCall}
            disabled={callActive}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: theme.success,
              color: "#ffffff",
              fontWeight: "700",
              fontSize: "0.8rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)"
            }}
          >
            {callActive ? "Connecting Bridge..." : "📞 Dial Call Bridge"}
          </button>
        </div>

        {/* Status & Notes Editing Form */}
        <div style={{
          padding: "16px",
          borderRadius: "14px",
          backgroundColor: theme.cardBgSecondary,
          border: `1px solid ${theme.border}`,
          marginBottom: "18px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: "800", color: theme.textPrimary }}>
              Update Pipeline Status & Follow-Up Log:
            </label>
            <span style={{ fontSize: "0.7rem", color: theme.textMuted }}>
              Optional executive update
            </span>
          </div>

          <select
            value={currentStatus}
            onChange={(e) => setCurrentStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
              color: theme.textPrimary,
              marginBottom: "10px",
              outline: "none",
              fontWeight: "700",
              fontSize: "0.85rem"
            }}
          >
            <option value="NEW">NEW INQUIRY</option>
            <option value="CONTACTED">CONTACTED (CALL LOGGED)</option>
            <option value="SITE_VISIT_SCHEDULED">SITE VISIT SCHEDULED</option>
            <option value="NEGOTIATION">PRICE NEGOTIATION / TERM SHEET</option>
            <option value="WON">WON (COMMISSION EARNED)</option>
            <option value="LOST">LOST / DISQUALIFIED</option>
          </select>

          <textarea
            rows={2}
            placeholder="Type follow-up interaction details (e.g., Client requested video walkthrough of 4 BHK Sky Villa)..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
              color: theme.textPrimary,
              outline: "none",
              resize: "none",
              fontSize: "0.82rem",
              boxSizing: "border-box",
              marginBottom: "10px"
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: saveSuccess ? theme.success : theme.textMuted, fontWeight: saveSuccess ? "700" : "500" }}>
              {saveSuccess ? "✅ Follow-up log saved to pipeline!" : "Changes are saved to the live CRM pipeline."}
            </span>

            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: theme.accentPrimary,
                color: "#ffffff",
                fontWeight: "700",
                fontSize: "0.8rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)"
              }}
            >
              {isSaving ? "Saving..." : "💾 Save Status & Notes"}
            </button>
          </div>
        </div>

        {/* Audit Activity Timeline */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: theme.textPrimary, margin: 0 }}>
              📋 Forensic Audit Timeline (Immutable DLP Activity Log)
            </h4>
            <span style={{ fontSize: "0.7rem", color: theme.success, fontWeight: "700" }}>
              ✓ Tamper-Proof Audit
            </span>
          </div>

          <div style={{
            maxHeight: "160px",
            overflowY: "auto",
            backgroundColor: theme.cardBgSecondary,
            borderRadius: "10px",
            padding: "10px 14px",
            fontSize: "0.8rem",
            border: `1px solid ${theme.border}`
          }}>
            {activities.length === 0 ? (
              <div style={{ color: theme.textMuted, padding: "8px 0" }}>Profile view recorded. Loading ledger...</div>
            ) : (
              activities.map((a) => {
                const badge = getActivityBadge(a.activity_type);
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "7px 0",
                      borderBottom: `1px solid ${theme.border}`
                    }}
                  >
                    <span style={{
                      fontSize: "0.72rem",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontWeight: "700",
                      backgroundColor: badge.bg,
                      color: badge.color
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ color: theme.textMuted, fontSize: "0.75rem" }}>
                      {new Date(a.created_at).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer / Close */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
          paddingTop: "14px",
          borderTop: `1px solid ${theme.border}`
        }}>
          <span style={{ fontSize: "0.72rem", color: theme.textMuted }}>
            Apex Sovereign CRM DLP Safeguard • Profile views cannot be undone
          </span>

          <button
            onClick={onClose}
            style={{
              padding: "8px 22px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBgSecondary,
              color: theme.textPrimary,
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.85rem"
            }}
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
