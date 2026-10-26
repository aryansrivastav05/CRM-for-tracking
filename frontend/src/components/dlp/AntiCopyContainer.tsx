import React, { useEffect } from "react";
import { BACKEND_URL } from "../../config";

interface AntiCopyContainerProps {
  children: React.ReactNode;
  backendUrl?: string;
  employeeCode?: string;
  token?: string;
}

export const AntiCopyContainer: React.FC<AntiCopyContainerProps> = ({
  children,
  backendUrl = BACKEND_URL,
  employeeCode = "AGENT",
  token
}) => {
  useEffect(() => {
    // 1. Inject Print Protection and Input Selection Stylesheet
    const style = document.createElement("style");
    style.id = "dlp-print-protection";
    style.innerHTML = `
      input, textarea, [contenteditable="true"] {
        user-select: text !important;
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
      }
      @media print {
        body * {
          display: none !important;
          visibility: hidden !important;
        }
        body:after {
          content: "CONFIDENTIAL PROPERTY OF APEX SOVEREIGN REALTY. UNAUTHORIZED PRINTING IS PROHIBITED AND MONITORED.";
          display: block !important;
          visibility: visible !important;
          font-size: 24pt;
          color: red;
          text-align: center;
          padding-top: 50mm;
        }
      }
    `;
    document.head.appendChild(style);

    // 2. Intercept Keyboard Shortcuts (Ctrl+C, Ctrl+P, DevTools)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Allow normal Ctrl+C inside editable form inputs for notes
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const isEditable = targetTag === "input" || targetTag === "textarea";

      // Print interception (Ctrl+P or Cmd+P)
      if (cmdOrCtrl && (e.key === "p" || e.key === "P")) {
        e.preventDefault();
        e.stopPropagation();
        reportDlpAlert("PRINT_ATTEMPTED", "HIGH", { key: e.key });
        alert("⚠️ Printing is disabled under Apex Sovereign Data Loss Prevention policies.");
        return false;
      }

      // Copy interception (Ctrl+C or Cmd+C) on CRM content (allow inside notes inputs)
      if (cmdOrCtrl && (e.key === "c" || e.key === "C") && !isEditable) {
        e.preventDefault();
        e.stopPropagation();
        reportDlpAlert("CLIPBOARD_COPY_BLOCKED", "MEDIUM", { key: e.key });
        return false;
      }

      // DevTools shortcuts (F12 or Ctrl+Shift+I / Cmd+Option+I)
      if (e.key === "F12" || (cmdOrCtrl && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j"))) {
        e.preventDefault();
        reportDlpAlert("DEVTOOLS_OPEN_ATTEMPT", "HIGH", { key: e.key });
        return false;
      }
    };

    const reportDlpAlert = (eventType: string, severity: string, details: Record<string, any>) => {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      fetch(`${backendUrl}/api/v1/telemetry/report-alert`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          event_type: eventType,
          severity,
          details: { ...details, employee_code: employeeCode }
        })
      }).catch(() => {});
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      const printStyle = document.getElementById("dlp-print-protection");
      if (printStyle) printStyle.remove();
    };
  }, [backendUrl, employeeCode, token]);

  return (
    <div
      onContextMenu={(e) => {
        // Allow right click inside inputs for paste/correct
        const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (targetTag !== "input" && targetTag !== "textarea") {
          e.preventDefault(); // Disable Right-Click Context Menu on lead data
        }
      }}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        minHeight: "100vh"
      }}
    >
      {children}
    </div>
  );
};
