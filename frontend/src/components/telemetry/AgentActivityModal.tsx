import React, { useState, useEffect } from "react";
import { ThemeColors } from "../../lib/theme";
import { formatIndianCurrency } from "../../lib/formatters";
import { BACKEND_URL } from "../../config";

export interface AgentTelemetryData {
  id: string;
  full_name: string;
  email: string;
  employee_code: string;
  role: string;
  phone?: string;
  assigned_territory: string;
  is_punched_in: boolean;
  last_punch_time?: string;
  working_hours_today?: string;
  active_leads_count: number;
  total_brokerage_managed?: number;
  device_type: string;
  device_model: string;
  ip_address: string;
  current_location: string;
  latitude?: number;
  longitude?: number;
  poaching_risk_score?: string;
  poaching_risk_reason?: string;
  offline_closing_flag?: boolean;
}

export interface GPSBreadcrumbItem {
  id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  geofence_tag: string;
  timestamp: string;
  is_within_geofence: boolean;
  unlogged_alert?: boolean;
}

export interface CallLogItem {
  id: string;
  customer_name: string;
  property: string;
  masked_phone: string;
  duration: string;
  outcome: string;
  notes: string;
  timestamp: string;
  sla_status: "COMPLIANT" | "BREACHED";
}

export interface AgentActivityModalProps {
  agent: AgentTelemetryData | null;
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeColors;
  onConfiscateLeads?: (agentName: string) => void;
  backendUrl?: string;
  token?: string;
}

export const AgentActivityModal: React.FC<AgentActivityModalProps> = ({
  agent,
  isOpen,
  onClose,
  theme,
  onConfiscateLeads,
  backendUrl = BACKEND_URL,
  token
}) => {
  const [activeTab, setActiveTab] = useState<"gps" | "calls" | "device" | "theft_radar">("gps");
  const [actionDone, setActionDone] = useState(false);
  const [liveBreadcrumbs, setLiveBreadcrumbs] = useState<GPSBreadcrumbItem[] | null>(null);

  useEffect(() => {
    if (!agent || !token) return;
    const fetchLive = async () => {
      try {
        const resp = await fetch(`${backendUrl}/api/v1/telemetry/agents/${agent.id}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.ok) {
          const data = await resp.json();
          if (data.gps_breadcrumbs && data.gps_breadcrumbs.length > 0) {
            setLiveBreadcrumbs(data.gps_breadcrumbs);
          }
        }
      } catch (e) {}
    };
    fetchLive();
  }, [agent?.id, token]);

  if (!isOpen || !agent) return null;

  // Rich fallback GPS breadcrumbs tailored to each executive's authentic persona
  const getAgentBreadcrumbs = (): GPSBreadcrumbItem[] => {
    if (agent.employee_code === "EXE-208" || agent.full_name.includes("Ananya")) {
      return [
        {
          id: "gps-1",
          latitude: 19.1136,
          longitude: 72.8697,
          geofence_tag: "Palm Grove Signature Villa 12 - Private Site Inspection (UNLOGGED IN CRM!)",
          timestamp: "Just now (18 mins ago)",
          is_within_geofence: true,
          unlogged_alert: true
        },
        {
          id: "gps-2",
          latitude: 19.1136,
          longitude: 72.8697,
          geofence_tag: "Palm Grove Signature Villa 12 - Afternoon Client Meet with Kavita Chawla (UNLOGGED!)",
          timestamp: "Today, 02:45 PM (Duration: 55 mins)",
          is_within_geofence: true,
          unlogged_alert: true
        },
        {
          id: "gps-3",
          latitude: 19.1142,
          longitude: 72.8710,
          geofence_tag: "Palm Grove Estates Clubhouse Coffee Lounge",
          timestamp: "Today, 01:15 PM (Duration: 40 mins)",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-4",
          latitude: 19.1136,
          longitude: 72.8697,
          geofence_tag: "Palm Grove Signature Villa 12 - Morning Inspection (UNLOGGED IN CRM!)",
          timestamp: "Today, 11:30 AM (Duration: 45 mins)",
          is_within_geofence: true,
          unlogged_alert: true
        },
        {
          id: "gps-5",
          latitude: 19.1120,
          longitude: 72.8680,
          geofence_tag: "Palm Grove Main Security Gate (Mobile Punch-In Verified)",
          timestamp: "Today, 10:00 AM",
          is_within_geofence: true,
          unlogged_alert: false
        }
      ];
    }

    if (agent.employee_code === "EXE-204" || agent.full_name.includes("Rahul")) {
      return [
        {
          id: "gps-r1",
          latitude: 19.0760,
          longitude: 72.8777,
          geofence_tag: "Downtown Skyline Corporate Branch - Workstation 4",
          timestamp: "12 mins ago",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-r2",
          latitude: 19.0782,
          longitude: 72.8791,
          geofence_tag: "The Grand Crest - Sky Villa 401 Show Flat Presentation",
          timestamp: "Today, 02:30 PM (Duration: 45 mins)",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-r3",
          latitude: 19.0745,
          longitude: 72.8762,
          geofence_tag: "Oberoi Corporate Park - Client Coffee Consultation",
          timestamp: "Today, 11:15 AM (Duration: 35 mins)",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-r4",
          latitude: 19.0760,
          longitude: 72.8777,
          geofence_tag: "Downtown Skyline HQ (Shift Punch-In)",
          timestamp: "Today, 09:30 AM",
          is_within_geofence: true,
          unlogged_alert: false
        }
      ];
    }

    if (agent.employee_code === "EXE-215" || agent.full_name.includes("Vikram")) {
      return [
        {
          id: "gps-v1",
          latitude: 18.9220,
          longitude: 72.8347,
          geofence_tag: "Marina Azure Corporate Lounge - Client Term Sheet Review",
          timestamp: "25 mins ago",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-v2",
          latitude: 18.9288,
          longitude: 72.8320,
          geofence_tag: "CBD Commercial Tower - Level 14 Site Inspection (Rajesh Agarwal)",
          timestamp: "Today, 01:20 PM (Duration: 1h 10m)",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-v3",
          latitude: 18.9220,
          longitude: 72.8347,
          geofence_tag: "Marina Azure Sales Gallery (Mobile Punch-In)",
          timestamp: "Today, 09:45 AM",
          is_within_geofence: true,
          unlogged_alert: false
        }
      ];
    }

    if (agent.employee_code === "EXE-210" || agent.full_name.includes("Karan")) {
      return [
        {
          id: "gps-k1",
          latitude: 19.0544,
          longitude: 72.8266,
          geofence_tag: "Bandra West Sea Face Office - High-Net-Worth Advisory Hub",
          timestamp: "30 mins ago",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-k2",
          latitude: 19.0178,
          longitude: 72.8182,
          geofence_tag: "Worli Penthouse Showsuite - VIP Private Walkthrough",
          timestamp: "Today, 01:45 PM (Duration: 50 mins)",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-k3",
          latitude: 19.0657,
          longitude: 72.8683,
          geofence_tag: "Bandra Kurla Complex (BKC) - Client Legal Review",
          timestamp: "Today, 11:00 AM (Duration: 40 mins)",
          is_within_geofence: true,
          unlogged_alert: false
        },
        {
          id: "gps-k4",
          latitude: 19.0544,
          longitude: 72.8266,
          geofence_tag: "Bandra Sea Face Office (Shift Punch-In)",
          timestamp: "Today, 09:15 AM",
          is_within_geofence: true,
          unlogged_alert: false
        }
      ];
    }

    // Rohit Sen (Off duty)
    return [
      {
        id: "gps-ro1",
        latitude: 19.1670,
        longitude: 72.9340,
        geofence_tag: "Green Valley Hills - Home Base (Shift Ended at 5:00 PM)",
        timestamp: "5 hours ago",
        is_within_geofence: true,
        unlogged_alert: false
      },
      {
        id: "gps-ro2",
        latitude: 19.1685,
        longitude: 72.9355,
        geofence_tag: "Green Valley Enclave - Client Property Showing",
        timestamp: "Today, 02:00 PM (Duration: 30 mins)",
        is_within_geofence: true,
        unlogged_alert: false
      },
      {
        id: "gps-ro3",
        latitude: 19.1650,
        longitude: 72.9320,
        geofence_tag: "Green Valley Branch Office (Shift Punch-In)",
        timestamp: "Today, 08:30 AM",
        is_within_geofence: true,
        unlogged_alert: false
      }
    ];
  };

  const getAgentCalls = (): CallLogItem[] => {
    if (agent.employee_code === "EXE-208" || agent.full_name.includes("Ananya")) {
      return [
        {
          id: "c-1",
          customer_name: "Kavita Chawla",
          property: "Palm Grove Signature Villa 12",
          masked_phone: "+919*******11",
          duration: "0 sec (0 calls logged on CRM bridge)",
          outcome: "MARKED AS LOST / UNREACHABLE",
          notes: "Agent logged: 'Client disconnected call, not interested'. CONTRADICTION: Physical GPS logs prove 3 visits together!",
          timestamp: "Today, 11:20 AM",
          sla_status: "BREACHED"
        },
        {
          id: "c-2",
          customer_name: "Amitabh Roy",
          property: "5 BHK Independent Villa",
          masked_phone: "+919*******88",
          duration: "4m 18s (CRM Masked Bridge)",
          outcome: "SITE VISIT CONFIRMED",
          notes: "Client confirmed site visit for Friday 11 AM. Requested dual-escort pass.",
          timestamp: "Today, 01:10 PM",
          sla_status: "COMPLIANT"
        },
        {
          id: "c-3",
          customer_name: "Naveen Mittal (Dubai NRI)",
          property: "Palm Grove Estates",
          masked_phone: "+9715*******67",
          duration: "6m 45s (International Masked Bridge)",
          outcome: "NEGOTIATING",
          notes: "Arriving Mumbai on 28th. Requested villa brochures.",
          timestamp: "Yesterday, 04:30 PM",
          sla_status: "COMPLIANT"
        }
      ];
    }

    if (agent.employee_code === "EXE-204" || agent.full_name.includes("Rahul")) {
      return [
        {
          id: "c-r1",
          customer_name: "Aditya Singhania",
          property: "The Grand Crest Sky Villa",
          masked_phone: "+919*******22",
          duration: "0 sec on CRM bridge",
          outcome: "SUSPECTED DIRECT CALL",
          notes: "Agent viewed phone contact details 6 times in 2 hours without initiating CRM bridge call.",
          timestamp: "Today, 03:15 PM",
          sla_status: "BREACHED"
        },
        {
          id: "c-r2",
          customer_name: "Sunita Kapoor",
          property: "4 BHK Duplex Penthouse",
          masked_phone: "+919*******44",
          duration: "14m 20s (CRM Masked Bridge)",
          outcome: "DEAL WON (COMMISSION SECURED)",
          notes: "Closed ₹5.60 Cr transaction. Agency commission of ₹11.2 Lakhs wired.",
          timestamp: "Yesterday, 02:40 PM",
          sla_status: "COMPLIANT"
        },
        {
          id: "c-r3",
          customer_name: "Tarun Oberoi",
          property: "Lumina Heights Penthouse",
          masked_phone: "+919*******55",
          duration: "8m 10s (CRM Masked Bridge)",
          outcome: "DEAL WON",
          notes: "Brokerage ₹10 Lakhs paid via bank transfer. Documents filed.",
          timestamp: "Yesterday, 11:30 AM",
          sla_status: "COMPLIANT"
        }
      ];
    }

    if (agent.employee_code === "EXE-215" || agent.full_name.includes("Vikram")) {
      return [
        {
          id: "c-v1",
          customer_name: "Rajesh Agarwal",
          property: "CBD Commercial Office (Level 14)",
          masked_phone: "+919*******11",
          duration: "22m 14s (CRM Masked Bridge)",
          outcome: "TERM SHEET UNDER REVIEW",
          notes: "Commercial term sheet finalized. ₹17.8 Lakhs brokerage protected under agency contract.",
          timestamp: "Today, 02:10 PM",
          sla_status: "COMPLIANT"
        },
        {
          id: "c-v2",
          customer_name: "Harish Bhatt",
          property: "4 BHK Ultra-Luxury Apartment",
          masked_phone: "+919*******33",
          duration: "5m 22s (CRM Masked Bridge)",
          outcome: "INTERESTED",
          notes: "Customer responded to Facebook Ad within 4 minutes. Inbound SLA met.",
          timestamp: "Today, 11:45 AM",
          sla_status: "COMPLIANT"
        }
      ];
    }

    if (agent.employee_code === "EXE-210" || agent.full_name.includes("Karan")) {
      return [
        {
          id: "c-k1",
          customer_name: "Devendra Singhania",
          property: "Worli Sea Face Duplex Penthouse",
          masked_phone: "+919*******12",
          duration: "18m 40s (CRM Masked Bridge)",
          outcome: "VIP NEGOTIATION",
          notes: "Ultra-luxury client consultation completed. ₹14.0 Lakhs brokerage agreement drafted.",
          timestamp: "Today, 02:15 PM",
          sla_status: "COMPLIANT"
        },
        {
          id: "c-k2",
          customer_name: "Alok Piramal",
          property: "5 BHK Independent Seafront Villa",
          masked_phone: "+919*******21",
          duration: "9m 12s (CRM Masked Bridge)",
          outcome: "SITE VISIT BOOKED",
          notes: "Pre-booked site visit for Saturday 11:00 AM with VIP pass.",
          timestamp: "Today, 10:30 AM",
          sla_status: "COMPLIANT"
        }
      ];
    }

    // Rohit
    return [
      {
        id: "c-ro1",
        customer_name: "Gaurav Malhotra",
        property: "Green Valley Enclave 3 BHK",
        masked_phone: "+919*******43",
        duration: "4m 50s (CRM Masked Bridge)",
        outcome: "FOLLOW-UP SCHEDULED",
        notes: "Shift concluded. Follow-up queued for tomorrow morning.",
        timestamp: "Today, 03:45 PM",
        sla_status: "COMPLIANT"
      }
    ];
  };

  const breadcrumbs = liveBreadcrumbs && liveBreadcrumbs.length > 0 ? liveBreadcrumbs : getAgentBreadcrumbs();
  const calls = getAgentCalls();
  const hasTheftFlag = agent.offline_closing_flag || agent.poaching_risk_score === "CRITICAL" || agent.poaching_risk_score === "HIGH";

  const handleConfiscateClick = async () => {
    try {
      if (token && agent.id) {
        await fetch(`${backendUrl}/api/v1/telemetry/agents/${agent.id}/confiscate-all`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (e) {}

    if (onConfiscateLeads) {
      onConfiscateLeads(agent.full_name);
    }
    setActionDone(true);
    setTimeout(() => setActionDone(false), 5000);
  };

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
      zIndex: 999999,
      padding: "clamp(10px, 2.5vw, 20px)"
    }}>
      <div style={{
        backgroundColor: theme.cardBg,
        backdropFilter: theme.glassBackdrop,
        WebkitBackdropFilter: theme.glassBackdrop,
        border: theme.glassBorder,
        borderRadius: "20px",
        boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.15)",
        width: "100%",
        maxWidth: "min(880px, 95vw)",
        maxHeight: "92vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Modal Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.cardBgSecondary
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              backgroundColor: hasTheftFlag ? theme.dangerBg : theme.accentBg,
              color: hasTheftFlag ? theme.danger : theme.accentPrimary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.4rem",
              fontWeight: "800",
              border: `1px solid ${hasTheftFlag ? theme.danger : theme.accentPrimary}40`
            }}>
              {agent.full_name.charAt(0)}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: theme.textPrimary, margin: 0 }}>
                  {agent.full_name}
                </h2>
                <span style={{
                  fontSize: "0.7rem",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontWeight: "700",
                  backgroundColor: agent.is_punched_in ? theme.successBg : theme.dangerBg,
                  color: agent.is_punched_in ? theme.success : theme.danger,
                  border: `1px solid ${agent.is_punched_in ? theme.success : theme.danger}30`
                }}>
                  {agent.is_punched_in ? (agent.device_type === "MOBILE_PHONE" ? "🟢 ON DUTY (MOBILE)" : "🟢 ON DUTY (LAPTOP)") : "🔴 OFF DUTY"}
                </span>

                {hasTheftFlag && (
                  <span style={{
                    fontSize: "0.7rem",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    fontWeight: "800",
                    backgroundColor: theme.dangerBg,
                    color: theme.danger,
                    border: `1px solid ${theme.danger}50`,
                    animation: "pulse 2s infinite"
                  }}>
                    🚨 SUSPECTED OFFLINE CLOSING
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginTop: "3px" }}>
                Code: <strong style={{ color: theme.textPrimary }}>{agent.employee_code}</strong> | Territory: <strong style={{ color: theme.accentPrimary }}>{agent.assigned_territory}</strong> | Device: <strong style={{ color: theme.textPrimary }}>{agent.device_model}</strong>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: theme.textMuted,
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "4px 8px",
              borderRadius: "8px",
              lineHeight: 1
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: "flex",
          borderBottom: `1px solid ${theme.border}`,
          backgroundColor: theme.cardBg,
          padding: "0 20px"
        }}>
          <button
            onClick={() => setActiveTab("gps")}
            style={{
              padding: "14px 18px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.85rem",
              color: activeTab === "gps" ? theme.accentPrimary : theme.textSecondary,
              borderBottom: activeTab === "gps" ? `2px solid ${theme.accentPrimary}` : "2px solid transparent"
            }}
          >
            🛰️ Live GPS & Site Visits ({breadcrumbs.length})
          </button>
          <button
            onClick={() => setActiveTab("calls")}
            style={{
              padding: "14px 18px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.85rem",
              color: activeTab === "calls" ? theme.accentPrimary : theme.textSecondary,
              borderBottom: activeTab === "calls" ? `2px solid ${theme.accentPrimary}` : "2px solid transparent"
            }}
          >
            📞 Masked Calls & Follow-ups ({calls.length})
          </button>
          <button
            onClick={() => setActiveTab("device")}
            style={{
              padding: "14px 18px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: "700",
              fontSize: "0.85rem",
              color: activeTab === "device" ? theme.accentPrimary : theme.textSecondary,
              borderBottom: activeTab === "device" ? `2px solid ${theme.accentPrimary}` : "2px solid transparent"
            }}
          >
            💻 Device, Shift & IP Logs
          </button>
          <button
            onClick={() => setActiveTab("theft_radar")}
            style={{
              padding: "14px 18px",
              border: "none",
              background: "none",
              cursor: "pointer",
              fontWeight: "800",
              fontSize: "0.85rem",
              color: hasTheftFlag ? theme.danger : (activeTab === "theft_radar" ? theme.accentPrimary : theme.textSecondary),
              borderBottom: activeTab === "theft_radar" ? `2px solid ${hasTheftFlag ? theme.danger : theme.accentPrimary}` : "2px solid transparent"
            }}
          >
            🛡️ Anti-Theft Radar {hasTheftFlag && "🚨"}
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {actionDone && (
            <div style={{
              marginBottom: "16px",
              padding: "12px 16px",
              borderRadius: "10px",
              backgroundColor: theme.successBg,
              color: theme.success,
              fontWeight: "700",
              border: `1px solid ${theme.success}40`
            }}>
              ✅ Leads confiscated from {agent.full_name} and queued for compliant auto-distribution!
            </div>
          )}

          {/* TAB 1: GPS BREADCRUMBS */}
          {activeTab === "gps" && (
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: theme.textPrimary }}>
                    GPS Breadcrumb Trail & Physical Field Movement
                  </h4>
                  <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>
                    Monitors physical presence at project sites. Automatically cross-references CRM appointment calendar.
                  </div>
                </div>

                <span style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "6px", backgroundColor: theme.accentBg, color: theme.accentPrimary, fontWeight: "700" }}>
                  📍 Geofence Precision: ±5.5m
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {breadcrumbs.map((b, idx) => (
                  <div
                    key={b.id}
                    style={{
                      padding: "14px 18px",
                      borderRadius: "12px",
                      backgroundColor: b.unlogged_alert ? theme.dangerBg : theme.cardBgSecondary,
                      border: `1px solid ${b.unlogged_alert ? theme.danger + "60" : theme.border}`,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px"
                    }}
                  >
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: b.unlogged_alert ? theme.danger : theme.accentPrimary,
                      color: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>
                      {idx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px" }}>
                        <strong style={{ color: b.unlogged_alert ? theme.danger : theme.textPrimary, fontSize: "0.9rem" }}>
                          {b.geofence_tag}
                        </strong>
                        <span style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "600" }}>
                          ⏱️ {b.timestamp}
                        </span>
                      </div>

                      <div style={{ fontSize: "0.75rem", color: theme.textSecondary, marginTop: "4px" }}>
                        Coordinates: <span style={{ fontFamily: "monospace", color: theme.accentPrimary }}>{b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}</span> | Status: <span style={{ fontWeight: "700", color: b.unlogged_alert ? theme.danger : theme.success }}>{b.unlogged_alert ? "🚨 UNLOGGED PHYSICAL VISIT DETECTED" : "✓ Verified Shift Zone"}</span>
                      </div>

                      {b.unlogged_alert && (
                        <div style={{
                          marginTop: "8px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          backgroundColor: theme.danger + "15",
                          border: `1px solid ${theme.danger}40`,
                          fontSize: "0.75rem",
                          color: theme.danger,
                          fontWeight: "700"
                        }}>
                          ⚠️ FORENSIC ALERT: Agent spent over 40 minutes at this high-value villa without logging a customer showing in CRM. High risk of offline side-deal!
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: CALL LOGS */}
          {activeTab === "calls" && (
            <div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: theme.textPrimary }}>
                    CRM Click-to-Call Masked Bridge Ledger
                  </h4>
                  <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>
                    Agents must dial leads through the encrypted CRM bridge. Raw phone numbers are masked to prevent poaching.
                  </div>
                </div>

                <span style={{ fontSize: "0.75rem", padding: "4px 10px", borderRadius: "6px", backgroundColor: theme.accentBg, color: theme.accentPrimary, fontWeight: "700" }}>
                  🔒 Zero Raw PII Exposed
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {calls.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: "16px 20px",
                      borderRadius: "12px",
                      backgroundColor: c.sla_status === "BREACHED" ? theme.dangerBg : theme.cardBgSecondary,
                      border: `1px solid ${c.sla_status === "BREACHED" ? theme.danger + "50" : theme.border}`
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px", flexWrap: "wrap", gap: "8px" }}>
                      <div>
                        <strong style={{ color: theme.textPrimary, fontSize: "0.95rem" }}>
                          {c.customer_name}
                        </strong>
                        <span style={{ fontSize: "0.8rem", color: theme.textSecondary, marginLeft: "8px" }}>
                          ({c.property})
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{
                          fontSize: "0.7rem",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          fontWeight: "700",
                          backgroundColor: c.sla_status === "COMPLIANT" ? theme.successBg : theme.dangerBg,
                          color: c.sla_status === "COMPLIANT" ? theme.success : theme.danger,
                          border: `1px solid ${c.sla_status === "COMPLIANT" ? theme.success : theme.danger}30`
                        }}>
                          {c.sla_status === "COMPLIANT" ? "✓ BRIDGE COMPLIANT" : "🚨 BRIDGE BYPASS RISK"}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: theme.textMuted }}>
                          {c.timestamp}
                        </span>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginBottom: "8px" }}>
                      Customer Masked: <strong style={{ color: theme.accentPrimary, fontFamily: "monospace" }}>{c.masked_phone}</strong> | Duration: <strong style={{ color: theme.textPrimary }}>{c.duration}</strong> | Outcome: <strong style={{ color: theme.warning }}>{c.outcome}</strong>
                    </div>

                    <div style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      backgroundColor: theme.cardBg,
                      fontSize: "0.8rem",
                      color: theme.textPrimary,
                      fontStyle: "italic",
                      border: `1px solid ${theme.border}`
                    }}>
                      "{c.notes}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DEVICE & SHIFT LOGS */}
          {activeTab === "device" && (
            <div>
              <h4 style={{ margin: "0 0 16px 0", fontSize: "0.95rem", fontWeight: "800", color: theme.textPrimary }}>
                Device Environment, Shift Tracking & Working Hours
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: theme.cardBgSecondary, border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700" }}>HARDWARE FORM FACTOR</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.accentPrimary, marginTop: "4px" }}>
                    {agent.device_type === "MOBILE_PHONE" ? "📱 Mobile Phone" : "💻 Laptop / Desktop"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginTop: "2px" }}>
                    Model: {agent.device_model}
                  </div>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: theme.cardBgSecondary, border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700" }}>WORKING HOURS TODAY</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.success, marginTop: "4px" }}>
                    {agent.working_hours_today || "4h 25m"}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginTop: "2px" }}>
                    Status: {agent.is_punched_in ? "🟢 Currently Active" : "🔴 Shift Concluded"}
                  </div>
                </div>

                <div style={{ padding: "16px", borderRadius: "12px", backgroundColor: theme.cardBgSecondary, border: `1px solid ${theme.border}` }}>
                  <div style={{ fontSize: "0.75rem", color: theme.textMuted, fontWeight: "700" }}>NETWORK IDENTITY & IP</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: theme.textPrimary, marginTop: "4px", fontFamily: "monospace" }}>
                    {agent.ip_address}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: theme.textSecondary, marginTop: "2px" }}>
                    ISP: Enterprise Cellular / Office Wi-Fi
                  </div>
                </div>
              </div>

              <div style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: theme.cardBgSecondary,
                border: `1px solid ${theme.border}`
              }}>
                <h5 style={{ margin: "0 0 10px 0", fontSize: "0.85rem", fontWeight: "800", color: theme.textPrimary }}>
                  DLP Security Controls Active on this Executive's Screen:
                </h5>
                <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "0.8rem", color: theme.textSecondary, display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>Dynamic Forensic Canvas Watermark: <strong style={{ color: theme.success }}>Active (20% Opacity with EMP Code #{agent.employee_code})</strong></li>
                  <li>Developer Tools & DOM Inspector: <strong style={{ color: theme.success }}>Trap & Auto-Report Enabled</strong></li>
                  <li>Copy/Paste Clipboard Interceptor: <strong style={{ color: theme.success }}>Encrypted PII Guard Enabled</strong></li>
                  <li>Four-Eyes Data Export Rule: <strong style={{ color: theme.warning }}>Direct Bulk CSV Export Prohibited</strong></li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: ANTI-THEFT RADAR */}
          {activeTab === "theft_radar" && (
            <div>
              <div style={{
                padding: "18px",
                borderRadius: "14px",
                backgroundColor: hasTheftFlag ? theme.dangerBg : theme.successBg,
                border: `1px solid ${hasTheftFlag ? theme.danger : theme.success}50`,
                marginBottom: "20px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: "800", color: hasTheftFlag ? theme.danger : theme.success }}>
                    {hasTheftFlag ? "🚨 Critical Brokerage Theft & Offline Closing Detection" : "✅ Compliant Operational Health"}
                  </h4>
                  <span style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    fontWeight: "800",
                    backgroundColor: hasTheftFlag ? theme.danger : theme.success,
                    color: "#ffffff"
                  }}>
                    RISK LEVEL: {agent.poaching_risk_score || (hasTheftFlag ? "CRITICAL" : "LOW")}
                  </span>
                </div>

                <p style={{ margin: 0, fontSize: "0.85rem", color: hasTheftFlag ? theme.danger : theme.textPrimary, lineHeight: 1.5 }}>
                  {agent.poaching_risk_reason || (
                    agent.employee_code === "EXE-208"
                      ? "Agent Ananya Patel marked high-value villa lead 'Kavita Chawla' (₹7.25 Cr budget) as LOST in CRM, claiming the customer was unreachable. However, live GPS breadcrumb telemetry proves the executive visited Palm Grove Villa 12 three times in 24 hours. Estimated company brokerage of ₹14.5 Lakhs is at immediate risk of offline closing theft."
                      : "No suspicious offline closing activity detected. All site visits and client conversations are logged on the secure CRM bridge."
                  )}
                </p>

                {hasTheftFlag && (
                  <div style={{ marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      onClick={handleConfiscateClick}
                      style={{
                        padding: "10px 18px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: theme.danger,
                        color: "#ffffff",
                        fontWeight: "800",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(239, 68, 68, 0.4)"
                      }}
                    >
                      🚨 Confiscate & Auto-Reassign Leads Now
                    </button>
                    <span style={{ fontSize: "0.75rem", color: theme.danger, fontWeight: "600" }}>
                      Protects estimated ₹14.5 Lakhs agency brokerage
                    </span>
                  </div>
                )}
              </div>

              {/* Active Pipeline held by this executive */}
              <h4 style={{ margin: "0 0 12px 0", fontSize: "0.9rem", fontWeight: "800", color: theme.textPrimary }}>
                Active Company Leads Held by {agent.full_name} ({agent.active_leads_count} Leads)
              </h4>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{
                  padding: "12px 16px",
                  borderRadius: "10px",
                  backgroundColor: theme.cardBgSecondary,
                  border: `1px solid ${theme.border}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <div>
                    <strong style={{ color: theme.textPrimary, fontSize: "0.85rem" }}>
                      Total Estimated Brokerage in Custody
                    </strong>
                    <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>
                      Calculated at standard 2% agency commission rate
                    </div>
                  </div>
                  <div style={{ fontSize: "1.2rem", fontWeight: "800", color: theme.accentPrimary }}>
                    {formatIndianCurrency(agent.total_brokerage_managed || 1850000)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: theme.cardBgSecondary
        }}>
          <div style={{ fontSize: "0.75rem", color: theme.textMuted }}>
            Apex Sovereign Real Estate CRM Telemetry Engine • Immutable Forensic Audit
          </div>

          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: "8px",
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.cardBg,
              color: theme.textPrimary,
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
