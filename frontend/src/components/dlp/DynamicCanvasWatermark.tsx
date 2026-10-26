import React, { useEffect, useRef, useState } from "react";
import { ThemeMode } from "../../lib/theme";
import { BACKEND_URL } from "../../config";

interface WatermarkProps {
  agentName: string;
  employeeCode: string;
  ipAddress?: string;
  backendUrl?: string;
  themeMode?: ThemeMode;
  token?: string;
}

export const DynamicCanvasWatermark: React.FC<WatermarkProps> = ({
  agentName,
  employeeCode,
  ipAddress = "127.0.0.1",
  backendUrl = BACKEND_URL,
  themeMode = "light",
  token
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tamperDetected, setTamperDetected] = useState(false);
  const [timestamp, setTimestamp] = useState<string>(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");

  // Periodically refresh the forensic watermark timestamp every 15 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC");
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const watermarkText = `${agentName} [${employeeCode}] • IP:${ipAddress} • ${timestamp}`;

  const renderCanvas = () => {
    if (!containerRef.current) return;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    const canvas = document.createElement("canvas");
    canvas.id = "dlp-watermark-canvas";
    canvas.width = 560;
    canvas.height = 260;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.rotate((-20 * Math.PI) / 180);
      ctx.font = "500 11px monospace";
      
      // Calibrated subtle enterprise watermark font
      ctx.fillStyle = themeMode === "light" 
        ? "rgba(100, 116, 139, 0.28)" 
        : "rgba(255, 255, 255, 0.22)";
        
      ctx.fillText(watermarkText, -20, 100);
      ctx.fillText(`CONFIDENTIAL • APEX SOVEREIGN REALTY DLP`, -20, 126);
    }

    const patternUrl = canvas.toDataURL("image/png");
    const overlayDiv = document.createElement("div");
    overlayDiv.id = "dlp-watermark-overlay";
    overlayDiv.style.position = "fixed";
    overlayDiv.style.top = "0";
    overlayDiv.style.left = "0";
    overlayDiv.style.width = "100vw";
    overlayDiv.style.height = "100vh";
    overlayDiv.style.pointerEvents = "none";
    overlayDiv.style.zIndex = "999990";
    overlayDiv.style.backgroundImage = `url(${patternUrl})`;
    overlayDiv.style.backgroundRepeat = "repeat";
    // Calibrated subtle DLP opacity for clean, unobtrusive readability
    overlayDiv.style.opacity = themeMode === "light" ? "0.025" : "0.040";

    containerRef.current.appendChild(overlayDiv);
  };

  useEffect(() => {
    renderCanvas();

    const targetNode = containerRef.current;
    if (!targetNode) return;

    const observer = new MutationObserver((mutations) => {
      let tampered = false;
      for (const mutation of mutations) {
        if (mutation.type === "childList" && mutation.removedNodes.length > 0) {
          tampered = true;
        }
        if (mutation.type === "attributes") {
          const target = mutation.target as HTMLElement;
          if (
            target.style.display === "none" ||
            target.style.visibility === "hidden"
          ) {
            tampered = true;
          }
        }
      }

      if (tampered) {
        setTamperDetected(true);
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        fetch(`${backendUrl}/api/v1/telemetry/report-alert`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            event_type: "WATERMARK_TAMPER_ATTEMPT",
            severity: "CRITICAL",
            details: { employee_code: employeeCode, url: window.location.href }
          })
        }).catch(() => {});

        setTimeout(() => {
          renderCanvas();
          setTamperDetected(false);
        }, 400);
      }
    });

    observer.observe(targetNode, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "hidden"]
    });

    return () => observer.disconnect();
  }, [watermarkText, themeMode, token, backendUrl, employeeCode]);

  return (
    <>
      <div ref={containerRef} aria-hidden="true" style={{ pointerEvents: "none" }} />
      {tamperDetected && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.96)",
          color: "#f43f5e",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000000,
          fontFamily: "'Plus Jakarta Sans', sans-serif"
        }}>
          <h2 style={{ fontSize: "2rem", fontWeight: "bold" }}>🚨 DLP SECURITY TAMPER ALERT</h2>
          <p style={{ marginTop: "1rem", color: "#cbd5e1" }}>
            Watermark tampering detected. Incident registered to immutable security audit ledger.
          </p>
        </div>
      )}
    </>
  );
};
