import React, { useState } from "react";
import { PunchClockWidget } from "../telemetry/PunchClockWidget";
import { DeviceCollector } from "../telemetry/DeviceCollector";
import { ThemeColors, ThemeMode } from "../../lib/theme";
import { BACKEND_URL } from "../../config";

interface HeaderProps {
  userName: string;
  employeeCode: string;
  role: string;
  isPunchedIn: boolean;
  token: string;
  themeMode: ThemeMode;
  theme: ThemeColors;
  onToggleTheme: () => void;
  onPersonaChange: (email: string, password: string) => void;
  onPunchStatusChange: (isPunchedIn: boolean) => void;
  onRequestExport: () => void;
  onSimulateMetaLead: () => void;
  backendUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({
  userName,
  employeeCode,
  role,
  isPunchedIn,
  token,
  themeMode,
  theme,
  onToggleTheme,
  onPersonaChange,
  onPunchStatusChange,
  onRequestExport,
  onSimulateMetaLead,
  backendUrl = BACKEND_URL
}) => {
  const [showCreds, setShowCreds] = useState(false);
  const isOwner = role === "OWNER" || role === "ADMIN";

  return (
    <header style={{
      backgroundColor: theme.headerBg,
      backdropFilter: theme.glassBackdrop,
      WebkitBackdropFilter: theme.glassBackdrop,
      borderBottom: `1px solid ${theme.border}`,
      padding: "14px 28px 10px 28px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      boxShadow: theme.glassShadow
    }}>
      {/* Top Tier: Luxury Brand Crest, Portal Switcher & Executive Actions */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px"
      }}>
        {/* Brand Crest & Security Classification */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            background: isOwner 
              ? "linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(217,119,6,0.3) 100%)"
              : "linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(79,70,229,0.3) 100%)",
            border: isOwner ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(99,102,241,0.4)",
            color: isOwner ? "#fbbf24" : "#818cf8",
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.4rem",
            boxShadow: isOwner ? "0 4px 14px rgba(245,158,11,0.25)" : "0 4px 14px rgba(99,102,241,0.25)",
            flexShrink: 0
          }}>
            {isOwner ? "👑" : "🏢"}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h1 style={{
                fontSize: "1.25rem",
                fontWeight: "900",
                color: theme.textPrimary,
                margin: 0,
                fontFamily: "'Outfit', sans-serif",
                letterSpacing: "0.06em",
                textTransform: "uppercase"
              }}>
                Apex Sovereign Realty
              </h1>
              <span style={{
                fontSize: "0.65rem",
                padding: "2px 8px",
                borderRadius: "20px",
                backgroundColor: isOwner ? theme.warningBg : theme.accentBg,
                color: isOwner ? theme.warning : theme.accentPrimary,
                border: `1px solid ${isOwner ? theme.warning : theme.accentPrimary}40`,
                fontWeight: "800",
                letterSpacing: "0.06em",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: isOwner ? theme.warning : theme.accentPrimary }} />
                {isOwner ? "OWNER COMMAND CENTER" : "EXECUTIVE PORTAL (DLP LOCKED)"}
              </span>
            </div>
            <div style={{ fontSize: "0.75rem", color: theme.textMuted, marginTop: "2px" }}>
              Logged in as: <strong style={{ color: theme.textPrimary }}>{userName}</strong> • {employeeCode}
            </div>
          </div>
        </div>

        {/* Executive Actions & Portal Switcher */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Dashboard Persona Switcher */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            backgroundColor: theme.cardBgSecondary,
            backdropFilter: theme.glassBackdrop,
            padding: "5px 10px",
            borderRadius: "10px",
            border: `1px solid ${theme.border}`
          }}>
            <span style={{ fontSize: "0.72rem", color: theme.textMuted, fontWeight: "700" }}>Switch:</span>
            <select
              value={employeeCode}
              onChange={(e) => {
                const code = e.target.value;
                if (code === "OWNER-01") onPersonaChange("owner@apexrealty.com", "OwnerPass2026!");
                else if (code === "DIR-100") onPersonaChange("admin@apexrealty.com", "AdminPass2026!");
                else if (code === "MGR-102") onPersonaChange("manager@apexrealty.com", "ManagerPass2026!");
                else if (code === "EXE-204") onPersonaChange("agent.rahul@apexrealty.com", "AgentPass2026!");
                else if (code === "EXE-208") onPersonaChange("agent.ananya@apexrealty.com", "AgentPass2026!");
                else if (code === "EXE-215") onPersonaChange("agent.vikram@apexrealty.com", "AgentPass2026!");
                else if (code === "EXE-210") onPersonaChange("agent.karan@apexrealty.com", "AgentPass2026!");
                else if (code === "EXE-220") onPersonaChange("agent.rohit@apexrealty.com", "AgentPass2026!");
              }}
              style={{
                backgroundColor: theme.cardBg,
                color: theme.textPrimary,
                border: `1px solid ${theme.borderSubtle}`,
                padding: "5px 10px",
                borderRadius: "8px",
                fontSize: "0.78rem",
                fontWeight: "700",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <optgroup label="👑 Owner & Management Views">
                <option value="OWNER-01">👑 Vikramaditya Singhania (Agency Owner)</option>
                <option value="DIR-100">🛡️ Sarah Jenkins (Director of Sales)</option>
                <option value="MGR-102">📊 Priya Sharma (Sales Manager)</option>
              </optgroup>
              <optgroup label="💼 Executive Portals (No Logs / No Leak Visibility)">
                <option value="EXE-204">💼 Rahul Verma (Sales Executive - Laptop)</option>
                <option value="EXE-208">💼 Ananya Patel (Luxury Villa - Mobile)</option>
                <option value="EXE-215">💼 Vikram Malhotra (Commercial - Mobile)</option>
                <option value="EXE-210">💼 Karan Mehta (Penthouse - Laptop)</option>
                <option value="EXE-220">💼 Rohit Sen (Junior Executive - Mobile)</option>
              </optgroup>
            </select>
            
            <button
              onClick={() => setShowCreds(!showCreds)}
              title="View Demo Credentials"
              style={{
                padding: "4px 8px",
                borderRadius: "6px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBg,
                color: theme.textMuted,
                fontSize: "0.72rem",
                fontWeight: "600",
                cursor: "pointer"
              }}
            >
              🔑 Demo Users
            </button>
          </div>

          {/* Quick Action: Ingest Lead */}
          <button
            onClick={onSimulateMetaLead}
            title="Simulate incoming Facebook/Instagram Instant Ad lead"
            style={{
              padding: "7px 14px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #6366f1 0%, #4338ca 100%)",
              color: "#ffffff",
              fontSize: "0.78rem",
              fontWeight: "800",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
              transition: "transform 0.15s ease"
            }}
          >
            <span>⚡</span>
            <span>Ingest Meta Lead</span>
          </button>

          {/* Quick Action: Export Audit (Owner only) */}
          {isOwner && (
            <button
              onClick={onRequestExport}
              title="Request Four-Eyes approved export"
              style={{
                padding: "7px 14px",
                borderRadius: "10px",
                border: `1px solid ${theme.warning}40`,
                backgroundColor: theme.warningBg,
                color: theme.warning,
                fontSize: "0.78rem",
                fontWeight: "800",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>📥</span>
              <span>Export Audit</span>
            </button>
          )}

          {/* Theme Toggle Pill */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${themeMode === "light" ? "Dark Glass" : "Light Glass"} Mode`}
            style={{
              padding: "7px 12px",
              borderRadius: "10px",
              border: `1px solid ${theme.borderSubtle}`,
              backgroundColor: theme.cardBgSecondary,
              backdropFilter: theme.glassBackdrop,
              color: theme.textPrimary,
              fontSize: "0.78rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            {themeMode === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>

      {/* Tier 2: Telemetry, Device Security & Shift Ribbon */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "10px",
        paddingTop: "8px",
        borderTop: `1px solid ${theme.borderSubtle}`,
        fontSize: "0.75rem"
      }}>
        {/* Security Classification */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", color: theme.textMuted }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: theme.success, boxShadow: `0 0 8px ${theme.success}` }} />
            <strong style={{ color: theme.textSecondary }}>Zero Leak DLP Active</strong>
          </span>
          <span>•</span>
          <span>Dynamic Canvas Watermarking</span>
          <span>•</span>
          <span>SHA-256 Deduplication</span>
        </div>

        {/* Telemetry Device & Shift Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <DeviceCollector token={token} theme={theme} backendUrl={backendUrl} />
          <PunchClockWidget
            initialPunchedIn={isPunchedIn}
            token={token}
            theme={theme}
            backendUrl={backendUrl}
            onPunchStatusChange={onPunchStatusChange}
          />
        </div>
      </div>

      {/* Pop-down Demo Credentials Card (For easy reference during dealer meeting) */}
      {showCreds && (
        <div style={{
          backgroundColor: theme.cardBg,
          backdropFilter: theme.glassBackdrop,
          border: theme.glassBorder,
          boxShadow: theme.glassShadow,
          borderRadius: "12px",
          padding: "14px 18px",
          fontSize: "0.8rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px"
        }}>
          <div>
            <strong style={{ color: theme.warning }}>👑 Owner / Dealer Account:</strong>
            <div style={{ color: theme.textPrimary, marginTop: "4px" }}>
              Email: <code style={{ backgroundColor: theme.cardBgSecondary, padding: "2px 6px", borderRadius: "4px" }}>owner@apexrealty.com</code>
            </div>
            <div style={{ color: theme.textPrimary, marginTop: "2px" }}>
              Password: <code style={{ backgroundColor: theme.cardBgSecondary, padding: "2px 6px", borderRadius: "4px" }}>OwnerPass2026!</code>
            </div>
            <div style={{ color: theme.textMuted, fontSize: "0.75rem", marginTop: "2px" }}>
              Full access to Anti-Theft Radar, Commission Shield, GPS breadcrumbs, and Audit logs.
            </div>
          </div>
          <div>
            <strong style={{ color: theme.accentPrimary }}>💼 Executive / Sales Rep Account:</strong>
            <div style={{ color: theme.textPrimary, marginTop: "4px" }}>
              Email: <code style={{ backgroundColor: theme.cardBgSecondary, padding: "2px 6px", borderRadius: "4px" }}>agent.rahul@apexrealty.com</code>
            </div>
            <div style={{ color: theme.textPrimary, marginTop: "2px" }}>
              Password: <code style={{ backgroundColor: theme.cardBgSecondary, padding: "2px 6px", borderRadius: "4px" }}>AgentPass2026!</code>
            </div>
            <div style={{ color: theme.textMuted, fontSize: "0.75rem", marginTop: "2px" }}>
              Restricted: Cannot see other leads, cannot see security logs, 20% watermark locked.
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
