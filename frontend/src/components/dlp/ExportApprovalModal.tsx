import React, { useState } from "react";
import { ThemeColors } from "../../lib/theme";
import { BACKEND_URL } from "../../config";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  theme: ThemeColors;
  totalLeadsCount: number;
  backendUrl?: string;
}

export const ExportApprovalModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  token,
  theme,
  totalLeadsCount,
  backendUrl = BACKEND_URL
}) => {
  const [reason, setReason] = useState("");
  const [recordsCount, setRecordsCount] = useState(Math.min(totalLeadsCount || 10, 50));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setErrorMessage("Business justification is mandatory for data export requests.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const resp = await fetch(`${backendUrl}/api/v1/exports/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason,
          records_count: Number(recordsCount)
        })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.detail || "Failed to submit export request");
      }

      const data = await resp.json();
      setSuccessMessage(`Request #${data.id.substring(0, 8)} submitted. Awaiting manager approval under Four-Eyes Policy.`);
      setTimeout(() => {
        onClose();
        setSuccessMessage(null);
        setReason("");
      }, 2500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(4px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 100000,
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: theme.cardBg,
        color: theme.textPrimary,
        borderRadius: "14px",
        padding: "24px",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
        border: `1px solid ${theme.border}`
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: theme.textPrimary, margin: 0 }}>
            🛡️ Request Lead Data Export
          </h3>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: theme.textMuted, cursor: "pointer", fontSize: "1.3rem" }}
          >
            ✕
          </button>
        </div>

        <div style={{
          backgroundColor: theme.warningBg,
          borderLeft: `4px solid ${theme.warning}`,
          padding: "12px",
          borderRadius: "6px",
          fontSize: "0.8rem",
          color: theme.textSecondary,
          marginBottom: "16px"
        }}>
          <strong>Four-Eyes Governance:</strong> Uncontrolled bulk exports are restricted. Submitting sends an automated review ticket to the Sales Director. The downloaded CSV will contain cryptographic tracking watermarks.
        </div>

        {errorMessage && (
          <div style={{ padding: "10px", backgroundColor: theme.dangerBg, color: theme.danger, borderRadius: "6px", marginBottom: "12px", fontSize: "0.85rem", border: `1px solid ${theme.danger}30` }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ padding: "10px", backgroundColor: theme.successBg, color: theme.success, borderRadius: "6px", marginBottom: "12px", fontSize: "0.85rem", border: `1px solid ${theme.success}30` }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: theme.textSecondary, marginBottom: "6px" }}>
              Records Count (Max 50)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={recordsCount}
              onChange={(e) => setRecordsCount(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBg,
                color: theme.textPrimary,
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: theme.textSecondary, marginBottom: "6px" }}>
              Business Justification / Reason *
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Preparing quarterly review for High Net Worth client meeting..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: "100%",
                padding: "9px 12px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.cardBg,
                color: theme.textPrimary,
                outline: "none",
                resize: "none"
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                backgroundColor: "transparent",
                color: theme.textSecondary,
                cursor: "pointer",
                fontWeight: "600"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isSubmitting ? theme.textMuted : theme.accentPrimary,
                color: "#ffffff",
                fontWeight: "700",
                cursor: isSubmitting ? "not-allowed" : "pointer"
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit for Approval"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
