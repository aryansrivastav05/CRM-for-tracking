import React, { useState, useEffect } from "react";
import { ThemeColors } from "../../lib/theme";
import { BACKEND_URL } from "../../config";

interface PunchClockProps {
  initialPunchedIn: boolean;
  token: string;
  theme: ThemeColors;
  backendUrl?: string;
  onPunchStatusChange?: (isPunchedIn: boolean) => void;
}

export const PunchClockWidget: React.FC<PunchClockProps> = ({
  initialPunchedIn,
  token,
  theme,
  backendUrl = BACKEND_URL,
  onPunchStatusChange
}) => {
  const [isPunchedIn, setIsPunchedIn] = useState(initialPunchedIn);
  const [loading, setLoading] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isPunchedIn) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn]);

  const getCoordinates = (): Promise<{ lat: number; lng: number } | null> => {
    return new Promise((resolve) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCurrentCoords(coords);
            resolve(coords);
          },
          () => {
            const mock = { lat: 19.0760, lng: 72.8777 };
            setCurrentCoords(mock);
            resolve(mock);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        resolve(null);
      }
    });
  };

  const handleTogglePunch = async () => {
    setLoading(true);
    const nextAction = isPunchedIn ? "PUNCH_OUT" : "PUNCH_IN";
    const coords = await getCoordinates();

    try {
      const resp = await fetch(`${backendUrl}/api/v1/telemetry/punch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          action: nextAction,
          latitude: coords?.lat,
          longitude: coords?.lng
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setIsPunchedIn(data.is_punched_in);
        if (onPunchStatusChange) onPunchStatusChange(data.is_punched_in);
      }
    } catch (err) {
      alert("Failed to update punch clock. Please check connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "12px",
      backgroundColor: theme.cardBgSecondary,
      padding: "6px 14px",
      borderRadius: "8px",
      border: `1px solid ${isPunchedIn ? theme.success + "60" : theme.border}`,
      boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
    }}>
      {/* Shift Status Indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{
          width: "9px",
          height: "9px",
          borderRadius: "50%",
          backgroundColor: isPunchedIn ? theme.success : theme.danger,
          boxShadow: isPunchedIn ? `0 0 8px ${theme.success}` : "none"
        }} />
        <div>
          <div style={{ fontSize: "0.7rem", color: theme.textMuted, textTransform: "uppercase", fontWeight: "700" }}>
            Shift Status
          </div>
          <div style={{ fontSize: "0.8rem", fontWeight: "700", color: isPunchedIn ? theme.success : theme.danger }}>
            {isPunchedIn ? "ON DUTY (ACTIVE)" : "OFF DUTY"}
          </div>
        </div>
      </div>

      {/* Live Working Hours Stopwatch */}
      {isPunchedIn && (
        <div style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: "12px" }}>
          <div style={{ fontSize: "0.7rem", color: theme.textMuted }}>Hours</div>
          <div style={{ fontSize: "0.85rem", fontWeight: "700", color: theme.textPrimary, fontFamily: "monospace" }}>
            ⏱️ {formatTime(elapsedSeconds)}
          </div>
        </div>
      )}

      {/* GPS Geolocation Ping Indicator */}
      {currentCoords && (
        <div style={{ borderLeft: `1px solid ${theme.border}`, paddingLeft: "12px", fontSize: "0.7rem", color: theme.textSecondary }}>
          <div style={{ color: theme.textMuted }}>GPS Location</div>
          <div style={{ color: theme.accentPrimary, fontFamily: "monospace", fontWeight: "600" }}>
            📍 {currentCoords.lat.toFixed(3)}, {currentCoords.lng.toFixed(3)}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={handleTogglePunch}
        disabled={loading}
        style={{
          marginLeft: "auto",
          padding: "5px 12px",
          borderRadius: "6px",
          fontWeight: "700",
          fontSize: "0.75rem",
          cursor: loading ? "wait" : "pointer",
          border: "none",
          backgroundColor: isPunchedIn ? theme.danger : theme.success,
          color: "#ffffff",
          transition: "background-color 0.15s",
          boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
        }}
      >
        {loading ? "..." : isPunchedIn ? "Punch Out" : "Punch In"}
      </button>
    </div>
  );
};
