import React, { useState } from "react";
import { LeadTable, LeadItem } from "../leads/LeadTable";
import { LeadDetailModal } from "../leads/LeadDetailModal";
import { PropertyList, PropertyItem } from "../properties/PropertyList";
import { ThemeColors } from "../../lib/theme";

import { BACKEND_URL } from "../../config";

interface ExecutiveDashboardProps {
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
  backendUrl?: string;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  user,
  leads,
  properties,
  token,
  theme,
  onCallLead,
  onUpdateLeadStatus,
  backendUrl = BACKEND_URL
}) => {
  const [activeTab, setActiveTab] = useState<"leads" | "properties">("leads");
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  // Strictly filter: Executives ONLY see leads assigned to them! Unassigned leads do not leak.
  const myLeads = leads.filter((l) => {
    if (!l.assigned_agent_name) return false;
    const agentName = l.assigned_agent_name.trim().toLowerCase();
    const currentName = user.fullName.trim().toLowerCase();
    return agentName === currentName || agentName.includes(currentName) || currentName.includes(agentName);
  });

  const newInquiries = myLeads.filter((l) => l.status === "NEW").length;
  const inNegotiation = myLeads.filter((l) => l.status === "NEGOTIATION").length;
  const wonDeals = myLeads.filter((l) => l.status === "WON").length;

  return (
    <div>
      {/* Executive Quick Stats (Liquid Glass Style) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* Metric 1 */}
        <div style={{
          backgroundColor: theme.cardBg,
          backdropFilter: theme.glassBackdrop,
          WebkitBackdropFilter: theme.glassBackdrop,
          border: theme.glassBorder,
          boxShadow: theme.glassShadow,
          padding: "20px",
          borderRadius: "16px"
        }}>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700", textTransform: "uppercase" }}>
            My Active Leads
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: "800", color: theme.textPrimary, marginTop: "4px" }}>
            {myLeads.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: theme.accentPrimary, marginTop: "4px", fontWeight: "600" }}>
            Assigned strictly to {user.fullName}
          </div>
        </div>

        {/* Metric 2 */}
        <div style={{
          backgroundColor: theme.cardBg,
          backdropFilter: theme.glassBackdrop,
          WebkitBackdropFilter: theme.glassBackdrop,
          border: theme.glassBorder,
          boxShadow: theme.glassShadow,
          padding: "20px",
          borderRadius: "16px"
        }}>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700", textTransform: "uppercase" }}>
            Urgent Follow-ups (SLA)
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: "800", color: newInquiries > 0 ? theme.warning : theme.textPrimary, marginTop: "4px" }}>
            {newInquiries}
          </div>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "4px" }}>
            15-minute response rule active
          </div>
        </div>

        {/* Metric 3 */}
        <div style={{
          backgroundColor: theme.cardBg,
          backdropFilter: theme.glassBackdrop,
          WebkitBackdropFilter: theme.glassBackdrop,
          border: theme.glassBorder,
          boxShadow: theme.glassShadow,
          padding: "20px",
          borderRadius: "16px"
        }}>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700", textTransform: "uppercase" }}>
            Deals in Negotiation
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: "800", color: theme.accentPrimary, marginTop: "4px" }}>
            {inNegotiation}
          </div>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "4px" }}>
            High-ticket buyer meetings
          </div>
        </div>

        {/* Metric 4 */}
        <div style={{
          backgroundColor: theme.cardBg,
          backdropFilter: theme.glassBackdrop,
          WebkitBackdropFilter: theme.glassBackdrop,
          border: theme.glassBorder,
          boxShadow: theme.glassShadow,
          padding: "20px",
          borderRadius: "16px"
        }}>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700", textTransform: "uppercase" }}>
            My Closed Deals
          </div>
          <div style={{ fontSize: "1.9rem", fontWeight: "800", color: theme.success, marginTop: "4px" }}>
            {wonDeals}
          </div>
          <div style={{ fontSize: "0.75rem", color: theme.success, marginTop: "4px", fontWeight: "600" }}>
            Agency Commission Credited
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex",
        gap: "10px",
        marginBottom: "20px"
      }}>
        <button
          onClick={() => setActiveTab("leads")}
          style={{
            padding: "10px 22px",
            borderRadius: "12px",
            border: activeTab === "leads" ? "none" : theme.glassBorder,
            backgroundColor: activeTab === "leads" ? theme.accentPrimary : theme.cardBg,
            backdropFilter: theme.glassBackdrop,
            color: activeTab === "leads" ? "#ffffff" : theme.textPrimary,
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            boxShadow: activeTab === "leads" ? "0 4px 14px rgba(37,99,235,0.3)" : theme.glassShadow,
            transition: "all 0.2s ease"
          }}
        >
          📋 My Assigned Leads ({myLeads.length})
        </button>

        <button
          onClick={() => setActiveTab("properties")}
          style={{
            padding: "10px 22px",
            borderRadius: "12px",
            border: activeTab === "properties" ? "none" : theme.glassBorder,
            backgroundColor: activeTab === "properties" ? theme.accentPrimary : theme.cardBg,
            backdropFilter: theme.glassBackdrop,
            color: activeTab === "properties" ? "#ffffff" : theme.textPrimary,
            fontWeight: "700",
            fontSize: "0.85rem",
            cursor: "pointer",
            boxShadow: activeTab === "properties" ? "0 4px 14px rgba(37,99,235,0.3)" : theme.glassShadow,
            transition: "all 0.2s ease"
          }}
        >
          🏢 Prime Properties & Pitch Decks ({properties.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "leads" && (
        <LeadTable
          leads={myLeads}
          theme={theme}
          onSelectLead={(l) => setSelectedLead(l)}
          onCallLead={onCallLead}
          token={token}
        />
      )}

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
