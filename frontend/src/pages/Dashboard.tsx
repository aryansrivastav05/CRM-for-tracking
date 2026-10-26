import React, { useState, useEffect } from "react";
import { Header } from "../components/layout/Header";
import { AdminDashboard } from "../components/dashboards/AdminDashboard";
import { ExecutiveDashboard } from "../components/dashboards/ExecutiveDashboard";
import { LeadItem } from "../components/leads/LeadTable";
import { PropertyItem } from "../components/properties/PropertyList";
import { ExportApprovalModal } from "../components/dlp/ExportApprovalModal";
import { DynamicCanvasWatermark } from "../components/dlp/DynamicCanvasWatermark";
import { AntiCopyContainer } from "../components/dlp/AntiCopyContainer";
import { themes, ThemeMode } from "../lib/theme";
import { BACKEND_URL } from "../config";

export const Dashboard: React.FC = () => {
  const backendUrl = BACKEND_URL;

  // Liquid Glass Theme State (defaults to Liquid Glass Dark, toggleable to Liquid Glass Light)
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const theme = themes[themeMode];

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // User state
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<{
    id: string;
    fullName: string;
    employeeCode: string;
    role: string;
    isPunchedIn: boolean;
  }>({
    id: "",
    fullName: "Vikramaditya Singhania",
    employeeCode: "OWNER-01",
    role: "OWNER",
    isPunchedIn: true
  });

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [callNotification, setCallNotification] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Authenticate user session
  const authenticateUser = async (email = "owner@apexrealty.com", password = "OwnerPass2026!") => {
    try {
      const resp = await fetch(`${backendUrl}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          device_type: email.includes("ananya") || email.includes("vikram") ? "MOBILE_APP" : "LAPTOP"
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        setToken(data.access_token);
        setUser({
          id: data.user_id,
          fullName: data.full_name,
          employeeCode: data.employee_code,
          role: data.role,
          isPunchedIn: data.is_punched_in
        });
        const isOwnerPortal = data.role === "OWNER" || data.role === "ADMIN" || data.role === "MANAGER";
        setToastMessage(`Switched to ${isOwnerPortal ? "👑 Owner Command Center" : "💼 Executive Portal"} as ${data.full_name}.`);
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error("Authentication failed:", err);
    }
  };

  useEffect(() => {
    authenticateUser();
  }, []);

  // Fetch leads and properties
  const fetchAllData = async () => {
    if (!token) return;
    try {
      const leadResp = await fetch(`${backendUrl}/api/v1/leads`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (leadResp.ok) {
        setLeads(await leadResp.json());
      }

      const propResp = await fetch(`${backendUrl}/api/v1/properties`);
      if (propResp.ok) {
        setProperties(await propResp.json());
      }
    } catch (err) {
      console.error("Data refresh failed:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
      const interval = setInterval(fetchAllData, 10000);
      return () => clearInterval(interval);
    }
  }, [token]);

  // Click-to-Call handler
  const handleCallLead = async (lead: LeadItem) => {
    try {
      const resp = await fetch(`${backendUrl}/api/v1/leads/${lead.id}/call`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        setCallNotification(`📞 ${data.message} (Bridge ID: ${data.call_bridge_id})`);
        fetchAllData();
        setTimeout(() => setCallNotification(null), 6000);
      }
    } catch (err) {
      alert("Failed to initiate masked call bridge.");
    }
  };

  // Simulate incoming Meta lead
  const handleSimulateMetaLead = async () => {
    try {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const resp = await fetch(`${backendUrl}/api/v1/webhooks/meta/simulate-test-lead?leadgen_id=leadgen_${randomId}`, {
        method: "POST"
      });
      if (resp.ok) {
        const data = await resp.json();
        setToastMessage(`⚡ Meta Lead Ingested via Webhook! Auto-assigned to ready executive.`);
        fetchAllData();
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      alert("Simulation failed.");
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string, notes: string) => {
    try {
      await fetch(`${backendUrl}/api/v1/leads/${leadId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, notes })
      });
      fetchAllData();
    } catch (err) {}
  };

  const isOwner = user.role === "OWNER" || user.role === "ADMIN" || user.role === "MANAGER";

  return (
    <AntiCopyContainer backendUrl={backendUrl} employeeCode={user.employeeCode} token={token}>
      {/* 20% Visible Liquid Glass Watermark */}
      <DynamicCanvasWatermark
        agentName={user.fullName}
        employeeCode={user.employeeCode}
        themeMode={themeMode}
        backendUrl={backendUrl}
        token={token}
      />

      <div style={{
        minHeight: "100vh",
        background: theme.bg,
        color: theme.textPrimary,
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        transition: "background 0.3s ease, color 0.3s ease"
      }}>
        {/* Navigation & Header */}
        <Header
          userName={user.fullName}
          employeeCode={user.employeeCode}
          role={user.role}
          isPunchedIn={user.isPunchedIn}
          token={token}
          themeMode={themeMode}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onPersonaChange={authenticateUser}
          onPunchStatusChange={(punched) => setUser((prev) => ({ ...prev, isPunchedIn: punched }))}
          onRequestExport={() => setIsExportModalOpen(true)}
          onSimulateMetaLead={handleSimulateMetaLead}
          backendUrl={backendUrl}
        />

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div style={{
            margin: "14px 24px 0 24px",
            padding: "12px 18px",
            backgroundColor: theme.cardBg,
            backdropFilter: theme.glassBackdrop,
            border: theme.glassBorder,
            color: theme.textPrimary,
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "0.85rem",
            boxShadow: theme.glassShadow,
            display: "inline-flex",
            alignItems: "center",
            gap: "8px"
          }}>
            {toastMessage}
          </div>
        )}

        {callNotification && (
          <div style={{
            margin: "14px 24px 0 24px",
            padding: "12px 18px",
            backgroundColor: theme.successBg,
            backdropFilter: theme.glassBackdrop,
            border: `1px solid ${theme.success}40`,
            color: theme.success,
            borderRadius: "12px",
            fontWeight: "700",
            fontSize: "0.85rem",
            boxShadow: theme.glassShadow
          }}>
            {callNotification}
          </div>
        )}

        {/* Main Workspace: Conditionally Renders Owner Dashboard vs Executive Dashboard */}
        <main style={{ padding: "clamp(12px, 2.5vw, 24px)" }}>
          {isOwner ? (
            <AdminDashboard
              user={user}
              leads={leads}
              properties={properties}
              token={token}
              theme={theme}
              onCallLead={handleCallLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onSimulateMetaLead={handleSimulateMetaLead}
              backendUrl={backendUrl}
            />
          ) : (
            <ExecutiveDashboard
              user={user}
              leads={leads}
              properties={properties}
              token={token}
              theme={theme}
              onCallLead={handleCallLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              backendUrl={backendUrl}
            />
          )}
        </main>

        {/* Four-Eyes Export Request Modal */}
        <ExportApprovalModal
          isOpen={isExportModalOpen}
          theme={theme}
          onClose={() => setIsExportModalOpen(false)}
          token={token}
          totalLeadsCount={leads.length}
          backendUrl={backendUrl}
        />
      </div>
    </AntiCopyContainer>
  );
};
export default Dashboard;
