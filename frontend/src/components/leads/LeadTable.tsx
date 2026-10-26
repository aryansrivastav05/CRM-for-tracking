import React, { useState, useMemo } from "react";
import { ThemeColors } from "../../lib/theme";
import { formatIndianCurrency, formatBudgetRange } from "../../lib/formatters";

export interface LeadItem {
  id: string;
  full_name: string;
  phone_masked: string;
  email_masked?: string;
  source: string;
  status: string;
  property_type?: string;
  budget_min?: number;
  budget_max?: number;
  preferred_location?: string;
  notes?: string;
  assigned_agent_name?: string;
  sla_deadline?: string;
  is_sla_breached: boolean;
  estimated_brokerage?: number;
  poaching_risk_score?: string;
  poaching_risk_reason?: string;
  offline_closing_flag?: boolean;
  created_at: string;
}

interface LeadTableProps {
  leads: LeadItem[];
  theme: ThemeColors;
  onSelectLead: (lead: LeadItem) => void;
  onCallLead: (lead: LeadItem) => void;
  token: string;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  theme,
  onSelectLead,
  onCallLead
}) => {
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [quickTag, setQuickTag] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [riskFilterOnly, setRiskFilterOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(25);

  const totalPipelineValue = useMemo(() => {
    return leads.reduce((acc, curr) => acc + (curr.budget_max || curr.budget_min || 25000000), 0);
  }, [leads]);

  const totalBrokerageValue = useMemo(() => {
    return leads.reduce((acc, curr) => {
      if (curr.estimated_brokerage && curr.estimated_brokerage > 0) return acc + curr.estimated_brokerage;
      const b = curr.budget_max || curr.budget_min || 25000000;
      return acc + Math.round(b * 0.02);
    }, 0);
  }, [leads]);

  const slaBreachedCount = useMemo(() => leads.filter((l) => l.is_sla_breached).length, [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      // 1. Status Filter
      if (filterStatus !== "ALL" && l.status !== filterStatus) {
        return false;
      }

      // 2. Risk Filter
      if (riskFilterOnly && !l.offline_closing_flag && l.poaching_risk_score !== "CRITICAL" && l.poaching_risk_score !== "HIGH") {
        return false;
      }

      // 3. Quick Tag Filter
      if (quickTag === "SLA_BREACH" && !l.is_sla_breached) {
        return false;
      }
      if (quickTag === "SLA_ACTIVE" && (l.status !== "NEW" || l.is_sla_breached)) {
        return false;
      }
      if (quickTag === "ULTRA_LUXURY" && (!l.budget_max || l.budget_max < 50000000)) {
        return false;
      }
      if (quickTag === "META_ADS" && !l.source?.includes("FB") && !l.source?.includes("IG")) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = l.full_name?.toLowerCase().includes(q);
        const matchesPhone = l.phone_masked?.toLowerCase().includes(q);
        const matchesProp = l.property_type?.toLowerCase().includes(q);
        const matchesLoc = l.preferred_location?.toLowerCase().includes(q);
        const matchesAgent = l.assigned_agent_name?.toLowerCase().includes(q);
        const matchesSource = l.source?.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesProp && !matchesLoc && !matchesAgent && !matchesSource) {
          return false;
        }
      }

      return true;
    });
  }, [leads, filterStatus, riskFilterOnly, quickTag, searchQuery]);

  // Pagination slicing
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedLeads = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, safePage, pageSize]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getSlaBadge = (lead: LeadItem) => {
    if (lead.status !== "NEW") {
      return (
        <span style={{
          fontSize: "0.72rem",
          padding: "2px 8px",
          borderRadius: "6px",
          backgroundColor: theme.cardBgSecondary,
          color: theme.textMuted,
          fontWeight: "600",
          border: `1px solid ${theme.border}`,
          display: "inline-flex",
          alignItems: "center",
          gap: "5px"
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: theme.textMuted }} />
          Contacted
        </span>
      );
    }
    if (lead.is_sla_breached) {
      return (
        <span style={{
          fontSize: "0.72rem",
          padding: "2px 8px",
          borderRadius: "6px",
          backgroundColor: theme.dangerBg,
          color: theme.danger,
          fontWeight: "800",
          border: `1px solid ${theme.danger}40`,
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          boxShadow: `0 0 10px ${theme.danger}25`
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: theme.danger, boxShadow: `0 0 6px ${theme.danger}` }} />
          ⚠️ SLA BREACHED
        </span>
      );
    }
    return (
      <span style={{
        fontSize: "0.72rem",
        padding: "2px 8px",
        borderRadius: "6px",
        backgroundColor: theme.successBg,
        color: theme.success,
        fontWeight: "700",
        border: `1px solid ${theme.success}30`,
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        boxShadow: `0 0 10px ${theme.success}20`
      }}>
        <span style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: theme.success, boxShadow: `0 0 6px ${theme.success}` }} />
        ⏱️ 15m Active SLA
      </span>
    );
  };

  const getSourceBadge = (source: string) => {
    if (source.includes("FB")) {
      return (
        <span style={{
          fontSize: "0.7rem",
          padding: "2px 6px",
          borderRadius: "5px",
          backgroundColor: "#1877f215",
          color: "#2563eb",
          fontWeight: "700",
          border: "1px solid #1877f225"
        }}>
          Facebook Ad
        </span>
      );
    }
    if (source.includes("IG")) {
      return (
        <span style={{
          fontSize: "0.7rem",
          padding: "2px 6px",
          borderRadius: "5px",
          backgroundColor: "#e1306c15",
          color: "#e1306c",
          fontWeight: "700",
          border: "1px solid #e1306c25"
        }}>
          Instagram Lead
        </span>
      );
    }
    return (
      <span style={{
        fontSize: "0.7rem",
        padding: "2px 6px",
        borderRadius: "5px",
        backgroundColor: theme.cardBgSecondary,
        color: theme.textSecondary,
        fontWeight: "600",
        border: `1px solid ${theme.border}`
      }}>
        Website Direct
      </span>
    );
  };

  return (
    <div style={{
      backgroundColor: theme.cardBg,
      backdropFilter: theme.glassBackdrop,
      WebkitBackdropFilter: theme.glassBackdrop,
      borderRadius: "16px",
      border: theme.glassBorder,
      boxShadow: theme.glassShadow,
      overflow: "hidden"
    }}>
      {/* Filter & Search Toolbar */}
      <div style={{
        padding: "16px 20px",
        borderBottom: `1px solid ${theme.border}`,
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}>
        {/* Top Row: Title, Count, Search */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.textPrimary, margin: 0 }}>
              Prospect Inquiries & Pipeline Ledger
            </h2>
            <span style={{
              fontSize: "0.75rem",
              backgroundColor: theme.accentBg,
              color: theme.accentPrimary,
              padding: "2px 10px",
              borderRadius: "12px",
              fontWeight: "800",
              border: `1px solid ${theme.accentPrimary}30`
            }}>
              {filteredLeads.length} of {leads.length} Leads
            </span>
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: "1 1 240px", maxWidth: "380px" }}>
            <div style={{ position: "relative", width: "100%" }}>
              <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: theme.textMuted }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by client, property, location, agent..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  width: "100%",
                  padding: "9px 12px 9px 34px",
                  borderRadius: "10px",
                  border: `1px solid ${theme.border}`,
                  backgroundColor: theme.cardBgSecondary,
                  color: theme.textPrimary,
                  fontSize: "0.82rem",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: theme.textMuted,
                    cursor: "pointer",
                    fontSize: "0.8rem"
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Second Row: Status Filter Pills + Risk Toggle */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          {/* Status Buttons */}
          <div style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            maxWidth: "100%",
            paddingBottom: "4px"
          }}>
            {[
              { id: "ALL", label: "All Leads" },
              { id: "NEW", label: "New (15m SLA)" },
              { id: "CONTACTED", label: "Contacted" },
              { id: "SITE_VISIT_SCHEDULED", label: "Site Visit" },
              { id: "NEGOTIATION", label: "Negotiation" },
              { id: "WON", label: "Won (Closed)" },
              { id: "LOST", label: "Lost" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setFilterStatus(st.id);
                  setCurrentPage(1);
                }}
                style={{
                  fontSize: "0.72rem",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: filterStatus === st.id ? "none" : `1px solid ${theme.border}`,
                  cursor: "pointer",
                  backgroundColor: filterStatus === st.id ? theme.accentPrimary : theme.cardBgSecondary,
                  color: filterStatus === st.id ? "#ffffff" : theme.textSecondary,
                  fontWeight: filterStatus === st.id ? "800" : "600",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease"
                }}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Poaching Risk Toggle */}
          <button
            onClick={() => {
              setRiskFilterOnly(!riskFilterOnly);
              setCurrentPage(1);
            }}
            style={{
              fontSize: "0.72rem",
              padding: "6px 14px",
              borderRadius: "8px",
              border: `1px solid ${riskFilterOnly ? theme.danger : theme.border}`,
              backgroundColor: riskFilterOnly ? theme.dangerBg : theme.cardBgSecondary,
              color: riskFilterOnly ? theme.danger : theme.textSecondary,
              fontWeight: "800",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            <span>🚨</span>
            <span>{riskFilterOnly ? "Showing Flagged Risks Only" : "Filter High Risk Leads"}</span>
          </button>
        </div>

        {/* Third Row: Luxury KPI Sub-Strip + Quick Chips */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          paddingTop: "6px",
          borderTop: `1px dashed ${theme.border}`
        }}>
          {/* Quick Tag Chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.7rem", color: theme.textMuted, fontWeight: "700", textTransform: "uppercase" }}>
              Quick Presets:
            </span>
            {[
              { id: "ALL", label: "All Records" },
              { id: "SLA_BREACH", label: `⚠️ Breached (${slaBreachedCount})`, color: theme.danger },
              { id: "SLA_ACTIVE", label: "⏱️ Active SLA (15m)", color: theme.success },
              { id: "ULTRA_LUXURY", label: "💎 Ultra Luxury (> ₹5 Cr)", color: theme.accentPrimary },
              { id: "META_ADS", label: "📱 Meta Ads (FB/IG)", color: "#2563eb" }
            ].map((chip) => {
              const active = quickTag === chip.id;
              return (
                <button
                  key={chip.id}
                  onClick={() => {
                    setQuickTag(chip.id);
                    setCurrentPage(1);
                  }}
                  style={{
                    fontSize: "0.68rem",
                    padding: "3px 9px",
                    borderRadius: "6px",
                    border: active ? `1px solid ${chip.color || theme.accentPrimary}` : `1px solid ${theme.border}`,
                    backgroundColor: active ? (chip.color ? `${chip.color}20` : theme.accentBg) : "transparent",
                    color: active ? (chip.color || theme.accentPrimary) : theme.textMuted,
                    fontWeight: active ? "800" : "600",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Luxury Pipeline Metrics */}
          <div style={{ display: "flex", gap: "14px", alignItems: "center", fontSize: "0.72rem" }}>
            <span style={{ color: theme.textMuted }}>
              Pipeline Value: <strong style={{ color: theme.textPrimary }}>{formatIndianCurrency(totalPipelineValue)}</strong>
            </span>
            <span style={{ color: theme.textMuted }}>
              Protected Brokerage (2%): <strong style={{ color: theme.success }}>{formatIndianCurrency(totalBrokerageValue)}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Leads Table Container with Touch Momentum Scrolling */}
      <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.82rem", color: theme.textSecondary }}>
          <thead>
            <tr style={{
              borderBottom: `1px solid ${theme.border}`,
              backgroundColor: theme.tableHeaderBg,
              color: theme.textMuted,
              textTransform: "uppercase",
              fontSize: "0.68rem",
              letterSpacing: "0.04em",
              fontWeight: "700"
            }}>
              <th style={{ padding: "12px 16px" }}>Prospect Client</th>
              <th style={{ padding: "12px 16px" }}>Masked Phone (DLP)</th>
              <th style={{ padding: "12px 16px" }}>Property Tier</th>
              <th style={{ padding: "12px 16px" }}>Location</th>
              <th style={{ padding: "12px 16px" }}>Budget / Brokerage</th>
              <th style={{ padding: "12px 16px" }}>Source</th>
              <th style={{ padding: "12px 16px" }}>SLA Status</th>
              <th style={{ padding: "12px 16px" }}>Executive</th>
              <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "40px", color: theme.textMuted }}>
                  No customer leads match the selected filter.
                </td>
              </tr>
            ) : (
              paginatedLeads.map((lead) => {
                const brokerage = lead.estimated_brokerage || (lead.budget_max ? Math.round(lead.budget_max * 0.02) : 650000);
                const hasTheft = lead.offline_closing_flag || lead.poaching_risk_score === "CRITICAL" || lead.poaching_risk_score === "HIGH";

                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    style={{
                      borderBottom: `1px solid ${theme.border}`,
                      transition: "background-color 0.15s",
                      cursor: "pointer",
                      backgroundColor: hasTheft ? `${theme.dangerBg}` : "transparent"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.tableRowHover)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = hasTheft ? `${theme.dangerBg}` : "transparent")}
                  >
                    {/* Prospect Name + Risk Badge + Luxury Avatar */}
                    <td style={{ padding: "12px 16px", fontWeight: "700", color: theme.textPrimary }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "8px",
                          background: hasTheft
                            ? `linear-gradient(135deg, ${theme.danger} 0%, #b91c1c 100%)`
                            : `linear-gradient(135deg, ${theme.accentPrimary} 0%, #1e40af 100%)`,
                          color: "#ffffff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "800",
                          fontSize: "0.75rem",
                          flexShrink: 0,
                          boxShadow: hasTheft ? `0 0 10px ${theme.danger}40` : "0 2px 4px rgba(0,0,0,0.1)"
                        }}>
                          {lead.full_name?.charAt(0)?.toUpperCase() || "P"}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span>{lead.full_name}</span>
                            {hasTheft && (
                              <span style={{
                                fontSize: "0.62rem",
                                padding: "1px 5px",
                                borderRadius: "4px",
                                backgroundColor: theme.danger,
                                color: "#ffffff",
                                fontWeight: "800"
                              }}>
                                🚨 RISK
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.68rem", color: theme.textMuted, fontWeight: "500" }}>
                            Inquiry: {new Date(lead.created_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Masked Phone */}
                    <td style={{ padding: "12px 16px", fontFamily: "monospace", color: theme.accentPrimary, fontWeight: "600", whiteSpace: "nowrap" }}>
                      🔒 {lead.phone_masked}
                    </td>

                    {/* Property Preference */}
                    <td style={{ padding: "12px 16px", color: theme.textSecondary, whiteSpace: "nowrap" }}>
                      {lead.property_type || "Apartment"}
                    </td>

                    {/* Location */}
                    <td style={{ padding: "12px 16px", color: theme.textSecondary, whiteSpace: "nowrap" }}>
                      📍 {lead.preferred_location || "Downtown"}
                    </td>

                    {/* Budget & 2% Brokerage */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <div style={{ fontWeight: "700", color: theme.textPrimary }}>
                        {formatBudgetRange(lead.budget_min, lead.budget_max)}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: theme.success, fontWeight: "600" }}>
                        Brokerage: {formatIndianCurrency(brokerage)}
                      </div>
                    </td>

                    {/* Source */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      {getSourceBadge(lead.source)}
                    </td>

                    {/* SLA Monitor */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      {getSlaBadge(lead)}
                    </td>

                    {/* Assigned Agent */}
                    <td style={{ padding: "12px 16px", color: theme.textPrimary, fontWeight: "600", whiteSpace: "nowrap" }}>
                      👤 {lead.assigned_agent_name || "Unassigned"}
                    </td>

                    {/* Click-to-Call Masked Bridge */}
                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCallLead(lead);
                        }}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: theme.success,
                          color: "#ffffff",
                          fontWeight: "700",
                          fontSize: "0.72rem",
                          cursor: "pointer",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        📞 Call Bridge
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        padding: "14px 20px",
        borderTop: `1px solid ${theme.border}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: theme.cardBgSecondary,
        flexWrap: "wrap",
        gap: "12px"
      }}>
        {/* Page size selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.78rem", color: theme.textMuted }}>
          <span>Show:</span>
          {[25, 50, 100].map((size) => (
            <button
              key={size}
              onClick={() => {
                setPageSize(size);
                setCurrentPage(1);
              }}
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                border: pageSize === size ? "none" : `1px solid ${theme.border}`,
                backgroundColor: pageSize === size ? theme.accentPrimary : "transparent",
                color: pageSize === size ? "#ffffff" : theme.textSecondary,
                fontWeight: "700",
                fontSize: "0.75rem",
                cursor: "pointer"
              }}
            >
              {size}
            </button>
          ))}
          <span>leads per page</span>
        </div>

        {/* Page controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "0.78rem", color: theme.textMuted, marginRight: "8px" }}>
            Page <strong style={{ color: theme.textPrimary }}>{safePage}</strong> of <strong style={{ color: theme.textPrimary }}>{totalPages}</strong>
          </span>

          <button
            onClick={() => handlePageChange(1)}
            disabled={safePage === 1}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
              color: safePage === 1 ? theme.textMuted : theme.textPrimary,
              cursor: safePage === 1 ? "not-allowed" : "pointer",
              fontSize: "0.75rem",
              fontWeight: "700"
            }}
          >
            « First
          </button>

          <button
            onClick={() => handlePageChange(safePage - 1)}
            disabled={safePage === 1}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
              color: safePage === 1 ? theme.textMuted : theme.textPrimary,
              cursor: safePage === 1 ? "not-allowed" : "pointer",
              fontSize: "0.75rem",
              fontWeight: "700"
            }}
          >
            ‹ Prev
          </button>

          <button
            onClick={() => handlePageChange(safePage + 1)}
            disabled={safePage >= totalPages}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
              color: safePage >= totalPages ? theme.textMuted : theme.textPrimary,
              cursor: safePage >= totalPages ? "not-allowed" : "pointer",
              fontSize: "0.75rem",
              fontWeight: "700"
            }}
          >
            Next ›
          </button>

          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={safePage >= totalPages}
            style={{
              padding: "5px 10px",
              borderRadius: "6px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
              color: safePage >= totalPages ? theme.textMuted : theme.textPrimary,
              cursor: safePage >= totalPages ? "not-allowed" : "pointer",
              fontSize: "0.75rem",
              fontWeight: "700"
            }}
          >
            Last »
          </button>
        </div>
      </div>
    </div>
  );
};
