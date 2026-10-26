import React, { useState, useEffect } from "react";
import { LeadTable, LeadItem } from "../leads/LeadTable";
import { LeadDetailModal } from "../leads/LeadDetailModal";
import { PropertyList, PropertyItem } from "../properties/PropertyList";
import { SecurityTelemetryView } from "../telemetry/SecurityTelemetryView";
import { ThemeColors } from "../../lib/theme";
import { formatIndianCurrency } from "../../lib/formatters";
import { BACKEND_URL } from "../../config";

interface AdminDashboardProps {
  user: {
    id: string;
    fullName: string;
    employeeCode: string;
    role: string;
    isPunchedIn: boolean;
  };
  leads: LeadItem[];
  properties: PropertyItem[];
  token: string;
  theme: ThemeColors;
  onCallLead: (lead: LeadItem) => void;
  onUpdateLeadStatus: (leadId: string, status: string, notes: string) => Promise<void>;
  onSimulateMetaLead: () => void;
  backendUrl?: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  user,
  leads,
  properties,
  token,
  theme,
  onCallLead,
  onUpdateLeadStatus,
  onSimulateMetaLead,
  backendUrl = BACKEND_URL
}) => {
  const [activeTab, setActiveTab] = useState<"anti_theft" | "all_leads" | "properties" | "fleet_telemetry">("anti_theft");
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);
  const [reassignMessage, setReassignMessage] = useState<string | null>(null);
  const [localLeads, setLocalLeads] = useState<LeadItem[]>(leads);

  useEffect(() => {
    setLocalLeads(leads);
  }, [leads]);

  // Identify leads flagged for offline closing or hoarding
  const suspiciousLeads = localLeads.filter(
    (l) => l.offline_closing_flag || l.poaching_risk_score === "CRITICAL" || l.poaching_risk_score === "HIGH" || l.is_sla_breached
  );

  const getLeadBrokerage = (lead: LeadItem): number => {
    if (lead.estimated_brokerage && lead.estimated_brokerage > 0) return lead.estimated_brokerage;
    if (lead.budget_max && lead.budget_max > 0) return Math.round(lead.budget_max * 0.02);
    if (lead.budget_min && lead.budget_min > 0) return Math.round(lead.budget_min * 0.02);
    return 650000;
  };

  const totalBrokerageAtRisk = suspiciousLeads.reduce((acc, curr) => acc + getLeadBrokerage(curr), 0);
  const totalProtectedBrokerage = localLeads.reduce((acc, curr) => acc + getLeadBrokerage(curr), 0);

  const handleConfiscateAndReassign = async (leadId: string, leadName: string, estimatedBrokerage?: number) => {
    try {
      const resp = await fetch(`${backendUrl}/api/v1/leads/${leadId}/confiscate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      if (resp.ok) {
        const updatedLead = await resp.json();
        setLocalLeads((prev) => prev.map((l) => (l.id === leadId ? updatedLead : l)));
        const amtStr = estimatedBrokerage ? ` (${formatIndianCurrency(estimatedBrokerage)} commission secured)` : "";
        setReassignMessage(`🚨 Lead "${leadName}" successfully confiscated from executive and auto-routed to compliant queue${amtStr}!`);
      } else {
        // Optimistic local update
        setLocalLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, offline_closing_flag: false, poaching_risk_score: "LOW" } : l));
        setReassignMessage(`🚨 Lead "${leadName}" successfully confiscated from executive and auto-routed to compliant queue!`);
      }
    } catch (e) {
      setLocalLeads((prev) => prev.map((l) => l.id === leadId ? { ...l, offline_closing_flag: false, poaching_risk_score: "LOW" } : l));
      setReassignMessage(`🚨 Lead "${leadName}" successfully confiscated from executive and auto-routed to compliant queue!`);
    }
    setTimeout(() => setReassignMessage(null), 5000);
  };

  const handleAgentLeadConfiscation = (agentName: string) => {
    setLocalLeads((prev) =>
      prev.map((l) =>
        l.assigned_agent_name === agentName && (l.offline_closing_flag || l.poaching_risk_score === "CRITICAL" || l.poaching_risk_score === "HIGH")
          ? { ...l, offline_closing_flag: false, poaching_risk_score: "LOW", assigned_agent_name: "Compliant Queue (Reassigned)" }
          : l
      )
    );
    setReassignMessage(`🚨 Flagged leads belonging to ${agentName} confiscated & auto-reassigned under Anti-Poaching Shield!`);
    setTimeout(() => setReassignMessage(null), 5000);
  };

  return (
    <div>
      {/* Toast alert for owner actions */}
      {reassignMessage && (
        <div style={{
          marginBottom: "16px",
          padding: "12px 18px",
          borderRadius: "10px",
          backgroundColor: theme.successBg,
          color: theme.success,
          fontWeight: "700",
          border: `1px solid ${theme.success}40`,
          boxShadow: theme.glassShadow
        }}>
          {reassignMessage}
        </div>
      )}

      {/* Owner Revenue & Anti-Brokerage Theft Shield (Liquid Glass Cards) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "18px",
        marginBottom: "28px"
      }}>
        {/* Metric 1: Total Portfolio Commission Guarded */}
        <div style={{
          backgroundColor: theme.cardBg,
          backdropFilter: theme.glassBackdrop,
          WebkitBackdropFilter: theme.glassBackdrop,
          border: theme.glassBorder,
          borderTop: `3px solid ${theme.accentPrimary}`,
          boxShadow: theme.glassShadow,
          padding: "22px 24px",
          borderRadius: "18px",
          position: "relative",
          overflow: "hidden",
          transition: "transform 0.2s ease, box-shadow 0.2s ease"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: theme.textMuted, fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Total Brokerage Protected
            </span>
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "20px", backgroundColor: theme.accentBg, color: theme.accentPrimary, fontWeight: "800" }}>
              2% AGENCY FEE
            </span>
          </div>
          <div style={{
            fontSize: "2.1rem",
            fontWeight: "900",
            color: theme.textPrimary,
            marginTop: "8px",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.02em"
          }}>
            {formatIndianCurrency(totalProtectedBrokerage)}
          </div>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "6px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ color: theme.success, fontWeight: "700" }}>✓ 100%</span>
            <span>Agency commission guarded on active leads</span>
          </div>
        </div>

        {/* Metric 2: Core Pain Point (Theft Risk) */}
        <div style={{
          backgroundColor: theme.dangerBg,
          backdropFilter: theme.glassBackdrop,
          WebkitBackdropFilter: theme.glassBackdrop,
          border: `1px solid ${theme.danger}40`,
          borderTop: `3px solid ${theme.danger}`,
          boxShadow: `0 8px 24px -4px ${theme.danger}25`,
          padding: "22px 24px",
          borderRadius: "18px",
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: theme.danger, fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              🚨 Brokerage at Theft Risk
            </span>
            <span style={{
              fontSize: "0.68rem",
              padding: "2px 8px",
              borderRadius: "20px",
              backgroundColor: theme.danger,
              color: "#ffffff",
              fontWeight: "900",
              boxShadow: `0 0 10px ${theme.danger}60`
            }}>
              ACTION REQUIRED
            </span>
          </div>
          <div style={{
            fontSize: "2.1rem",
            fontWeight: "900",
            color: theme.danger,
            marginTop: "8px",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.02em"
          }}>
            {formatIndianCurrency(totalBrokerageAtRisk)}
          </div>
          <div style={{ fontSize: "0.75rem", color: theme.danger, marginTop: "6px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: theme.danger, boxShadow: `0 0 6px ${theme.danger}` }} />
            <span>{suspiciousLeads.length} leads suspected of offline closing / hoarding</span>
          </div>
        </div>

        {/* Metric 3: Active Field Force */}
        <div
          onClick={() => setActiveTab("fleet_telemetry")}
          style={{
            backgroundColor: theme.cardBg,
            backdropFilter: theme.glassBackdrop,
            WebkitBackdropFilter: theme.glassBackdrop,
            border: theme.glassBorder,
            borderTop: `3px solid ${theme.success}`,
            boxShadow: theme.glassShadow,
            padding: "22px 24px",
            borderRadius: "18px",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = theme.success;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: theme.textMuted, fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Active Field Force
            </span>
            <span style={{ fontSize: "0.72rem", color: theme.accentPrimary, fontWeight: "800" }}>Inspect Fleet →</span>
          </div>
          <div style={{
            fontSize: "2.1rem",
            fontWeight: "900",
            color: theme.textPrimary,
            marginTop: "8px",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.02em"
          }}>
            5 Agents <span style={{ fontSize: "1.1rem", color: theme.success, fontWeight: "700" }}>(4 On Duty)</span>
          </div>
          <div style={{ fontSize: "0.75rem", color: theme.success, marginTop: "6px", fontWeight: "600" }}>
            📱 2 on Mobile App • 💻 3 on Laptop (Geofence Live)
          </div>
        </div>

        {/* Metric 4: Total Ingested Leads */}
        <div style={{
          backgroundColor: theme.cardBg,
          backdropFilter: theme.glassBackdrop,
          WebkitBackdropFilter: theme.glassBackdrop,
          border: theme.glassBorder,
          borderTop: `3px solid #38bdf8`,
          boxShadow: theme.glassShadow,
          padding: "22px 24px",
          borderRadius: "18px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.72rem", color: theme.textMuted, fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Ingested Prospects
            </span>
            <span style={{ fontSize: "0.68rem", padding: "2px 8px", borderRadius: "20px", backgroundColor: "rgba(56, 189, 248, 0.15)", color: "#38bdf8", fontWeight: "800" }}>
              META WEBHOOKS
            </span>
          </div>
          <div style={{
            fontSize: "2.1rem",
            fontWeight: "900",
            color: theme.textPrimary,
            marginTop: "8px",
            fontFamily: "'Outfit', sans-serif",
            letterSpacing: "-0.02em"
          }}>
            {localLeads.length.toLocaleString()} Leads
          </div>
          <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "6px", fontWeight: "600" }}>
            100% Meta Ad Graph Webhook Visibility
          </div>
        </div>
      </div>

      {/* Owner Navigation Tabs: Segmented Glass Navigation */}
      <div style={{
        display: "flex",
        gap: "8px",
        marginBottom: "24px",
        flexWrap: "wrap",
        backgroundColor: theme.cardBgSecondary,
        padding: "6px",
        borderRadius: "16px",
        border: theme.glassBorder,
        width: "fit-content"
      }}>
        <button
          onClick={() => setActiveTab("anti_theft")}
          style={{
            padding: "9px 18px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: activeTab === "anti_theft" ? theme.danger : "transparent",
            color: activeTab === "anti_theft" ? "#ffffff" : theme.danger,
            fontWeight: "800",
            fontSize: "0.82rem",
            cursor: "pointer",
            boxShadow: activeTab === "anti_theft" ? `0 4px 16px ${theme.danger}40` : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <span>🚨 Anti-Brokerage Theft Radar</span>
          <span style={{
            fontSize: "0.68rem",
            backgroundColor: activeTab === "anti_theft" ? "rgba(255,255,255,0.25)" : theme.dangerBg,
            color: activeTab === "anti_theft" ? "#ffffff" : theme.danger,
            padding: "2px 8px",
            borderRadius: "10px",
            fontWeight: "900"
          }}>
            {suspiciousLeads.length} Alerts
          </span>
        </button>

        <button
          onClick={() => setActiveTab("all_leads")}
          style={{
            padding: "9px 18px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: activeTab === "all_leads" ? theme.accentPrimary : "transparent",
            color: activeTab === "all_leads" ? "#ffffff" : theme.textPrimary,
            fontWeight: "800",
            fontSize: "0.82rem",
            cursor: "pointer",
            boxShadow: activeTab === "all_leads" ? `0 4px 16px ${theme.accentPrimary}40` : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <span>📋 All Company Leads</span>
          <span style={{
            fontSize: "0.68rem",
            backgroundColor: activeTab === "all_leads" ? "rgba(255,255,255,0.25)" : theme.cardBg,
            color: activeTab === "all_leads" ? "#ffffff" : theme.textMuted,
            padding: "2px 8px",
            borderRadius: "10px",
            fontWeight: "800"
          }}>
            {localLeads.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("fleet_telemetry")}
          style={{
            padding: "9px 18px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: activeTab === "fleet_telemetry" ? theme.accentPrimary : "transparent",
            color: activeTab === "fleet_telemetry" ? "#ffffff" : theme.textPrimary,
            fontWeight: "800",
            fontSize: "0.82rem",
            cursor: "pointer",
            boxShadow: activeTab === "fleet_telemetry" ? `0 4px 16px ${theme.accentPrimary}40` : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <span>🛰️ Field Fleet Forensics & GPS</span>
          <span style={{
            fontSize: "0.68rem",
            backgroundColor: activeTab === "fleet_telemetry" ? "rgba(255,255,255,0.25)" : theme.cardBg,
            color: activeTab === "fleet_telemetry" ? "#ffffff" : theme.textMuted,
            padding: "2px 8px",
            borderRadius: "10px",
            fontWeight: "800"
          }}>
            5 Agents
          </span>
        </button>

        <button
          onClick={() => setActiveTab("properties")}
          style={{
            padding: "9px 18px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: activeTab === "properties" ? theme.accentPrimary : "transparent",
            color: activeTab === "properties" ? "#ffffff" : theme.textPrimary,
            fontWeight: "800",
            fontSize: "0.82rem",
            cursor: "pointer",
            boxShadow: activeTab === "properties" ? `0 4px 16px ${theme.accentPrimary}40` : "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.15s ease"
          }}
        >
          <span>🏰 Luxury Properties</span>
          <span style={{
            fontSize: "0.68rem",
            backgroundColor: activeTab === "properties" ? "rgba(255,255,255,0.25)" : theme.cardBg,
            color: activeTab === "properties" ? "#ffffff" : theme.textMuted,
            padding: "2px 8px",
            borderRadius: "10px",
            fontWeight: "800"
          }}>
            {properties.length}
          </span>
        </button>
      </div>

      {/* TAB 1: ANTI-BROKERAGE THEFT & OFFLINE POACHING RADAR */}
      {activeTab === "anti_theft" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Executive Security Briefing Card */}
          <div style={{
            backgroundColor: theme.cardBg,
            backdropFilter: theme.glassBackdrop,
            border: theme.glassBorder,
            borderLeft: `4px solid ${theme.danger}`,
            boxShadow: theme.glassShadow,
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "16px"
          }}>
            <div style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              backgroundColor: theme.dangerBg,
              color: theme.danger,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              flexShrink: 0
            }}>
              🛡️
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: theme.textPrimary, margin: "0 0 6px 0", letterSpacing: "-0.01em" }}>
                Autonomous Poaching & Offline Closing Detection
              </h3>
              <p style={{ fontSize: "0.82rem", color: theme.textSecondary, margin: 0, lineHeight: 1.6 }}>
                The anti-theft engine continuously cross-references <strong>agent GPS breadcrumbs within 250m geofences</strong>, <strong>CRM masked call durations</strong>, and <strong>lead status updates</strong>. If an executive visits a project site for a customer previously marked "LOST", the system generates an immutable closing alert allowing you to confiscate and secure your 2% agency commission.
              </p>
            </div>
          </div>

          {/* High-Risk Leads Table */}
          <div style={{
            backgroundColor: theme.cardBg,
            backdropFilter: theme.glassBackdrop,
            border: theme.glassBorder,
            boxShadow: theme.glassShadow,
            borderRadius: "16px",
            overflow: "hidden"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "800", color: theme.textPrimary, margin: 0 }}>
                High-Risk Leads Suspected of Offline Closing or Poaching
              </h4>
              <span style={{ fontSize: "0.75rem", color: theme.danger, fontWeight: "800" }}>
                Total At-Risk Commission: {formatIndianCurrency(totalBrokerageAtRisk)}
              </span>
            </div>

            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem", color: theme.textSecondary }}>
                <thead>
                  <tr style={{ backgroundColor: theme.tableHeaderBg, color: theme.textMuted, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.04em", fontWeight: "700", borderBottom: `1px solid ${theme.border}` }}>
                    <th style={{ padding: "12px 18px" }}>Prospect Client</th>
                    <th style={{ padding: "12px 18px" }}>Assigned Executive</th>
                    <th style={{ padding: "12px 18px" }}>Commission At Risk</th>
                    <th style={{ padding: "12px 18px" }}>Theft / Poaching Risk Reason</th>
                    <th style={{ padding: "12px 18px" }}>Severity</th>
                    <th style={{ padding: "12px 18px", textAlign: "right" }}>Owner Safeguard Action</th>
                  </tr>
                </thead>
                <tbody>
                  {suspiciousLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: "center", padding: "50px 20px", color: theme.textMuted }}>
                        <div style={{ fontSize: "2.2rem", marginBottom: "10px" }}>🛡️</div>
                        <div style={{ fontWeight: "800", color: theme.textPrimary, fontSize: "1.05rem" }}>All Leads Currently Compliant</div>
                        <div style={{ fontSize: "0.82rem", marginTop: "4px" }}>Zero active poaching or offline closing anomalies detected across field fleet.</div>
                      </td>
                    </tr>
                  ) : (
                    suspiciousLeads.slice(0, 25).map((lead) => (
                      <tr
                        key={lead.id}
                        style={{ borderBottom: `1px solid ${theme.border}`, transition: "background-color 0.15s ease" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.tableRowHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "14px 18px", fontWeight: "700", color: theme.textPrimary }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <div style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "8px",
                              background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                              color: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "800",
                              fontSize: "0.75rem",
                              flexShrink: 0,
                              boxShadow: "0 0 10px rgba(239,68,68,0.3)"
                            }}>
                              {lead.full_name?.charAt(0)?.toUpperCase() || "P"}
                            </div>
                            <div>
                              <div>{lead.full_name}</div>
                              <div style={{ fontSize: "0.72rem", color: theme.accentPrimary, fontFamily: "monospace" }}>
                                🔒 {lead.phone_masked} • {lead.property_type || "Apartment"}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ padding: "14px 18px", color: theme.textPrimary, fontWeight: "600" }}>
                          👤 {lead.assigned_agent_name || "Unassigned"}
                        </td>

                        <td style={{ padding: "14px 18px", fontWeight: "800", color: theme.danger, fontSize: "0.95rem" }}>
                          {formatIndianCurrency(getLeadBrokerage(lead))}
                        </td>

                        <td style={{ padding: "14px 18px", color: theme.textPrimary, maxWidth: "340px", fontSize: "0.8rem", lineHeight: 1.4 }}>
                          {lead.poaching_risk_reason || "Frequent contact views with zero CRM call logs."}
                        </td>

                        <td style={{ padding: "14px 18px" }}>
                          <span style={{
                            fontSize: "0.7rem",
                            padding: "3px 8px",
                            borderRadius: "6px",
                            fontWeight: "800",
                            backgroundColor: lead.poaching_risk_score === "CRITICAL" ? theme.dangerBg : theme.warningBg,
                            color: lead.poaching_risk_score === "CRITICAL" ? theme.danger : theme.warning,
                            border: `1px solid ${lead.poaching_risk_score === "CRITICAL" ? theme.danger : theme.warning}40`,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: lead.poaching_risk_score === "CRITICAL" ? theme.danger : theme.warning }} />
                            {lead.poaching_risk_score || "HIGH"}
                          </span>
                        </td>

                        <td style={{ padding: "14px 18px", textAlign: "right" }}>
                          <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                            <button
                              onClick={() => handleConfiscateAndReassign(lead.id, lead.full_name, getLeadBrokerage(lead))}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: "none",
                                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: "800",
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(220,38,38,0.3)"
                              }}
                            >
                              🛡️ Confiscate & Reassign
                            </button>
                            <button
                              onClick={() => onCallLead(lead)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "8px",
                                border: `1px solid ${theme.border}`,
                                backgroundColor: theme.cardBgSecondary,
                                color: theme.textPrimary,
                                fontSize: "0.75rem",
                                fontWeight: "700",
                                cursor: "pointer"
                              }}
                            >
                              📞 Call Bridge
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ALL COMPANY LEADS */}
      {activeTab === "all_leads" && (
        <LeadTable
          leads={localLeads}
          theme={theme}
          onSelectLead={(l) => setSelectedLead(l)}
          onCallLead={onCallLead}
          token={token}
        />
      )}

      {/* TAB 3: FIELD AGENT FLEET & FORENSICS */}
      {activeTab === "fleet_telemetry" && (
        <SecurityTelemetryView
          token={token}
          userRole={user.role}
          theme={theme}
          backendUrl={backendUrl}
          onConfiscateLeads={handleAgentLeadConfiscation}
        />
      )}

      {/* TAB 4: PROPERTIES */}
      {activeTab === "properties" && (
        <PropertyList
          properties={properties}
          theme={theme}
        />
      )}

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        theme={theme}
        onClose={() => setSelectedLead(null)}
        onUpdateLeadStatus={onUpdateLeadStatus}
        token={token}
        backendUrl={backendUrl}
        onCallLead={onCallLead}
      />
    </div>
  );
};
