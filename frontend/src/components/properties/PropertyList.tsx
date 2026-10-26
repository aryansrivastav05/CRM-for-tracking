import React, { useState } from "react";
import { ThemeColors } from "../../lib/theme";
import { formatIndianCurrency } from "../../lib/formatters";

export interface PropertyItem {
  id: string;
  title: string;
  project_name: string;
  property_type: string;
  location: string;
  price: number;
  price_formatted: string;
  carpet_area_sqft: number;
  bedrooms?: number;
  bathrooms?: number;
  status: string;
  amenities?: string;
  image_url?: string;
  featured: boolean;
}

interface PropertyListProps {
  properties: PropertyItem[];
  theme: ThemeColors;
  onSelectProperty?: (prop: PropertyItem) => void;
}

export const PropertyList: React.FC<PropertyListProps> = ({ properties, theme, onSelectProperty }) => {
  const [filterType, setFilterType] = useState<string>("ALL");

  const filtered = properties.filter((p) => {
    if (filterType === "ALL") return true;
    return p.property_type.includes(filterType) || p.status === filterType;
  });

  const getStatusBadge = (status: string) => {
    if (status === "AVAILABLE") {
      return (
        <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "6px", backgroundColor: theme.successBg, color: theme.success, fontWeight: "700", border: `1px solid ${theme.success}30` }}>
          AVAILABLE
        </span>
      );
    }
    if (status === "UNDER_OFFER") {
      return (
        <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "6px", backgroundColor: theme.warningBg, color: theme.warning, fontWeight: "700", border: `1px solid ${theme.warning}30` }}>
          UNDER OFFER
        </span>
      );
    }
    return (
      <span style={{ fontSize: "0.72rem", padding: "3px 8px", borderRadius: "6px", backgroundColor: theme.dangerBg, color: theme.danger, fontWeight: "700", border: `1px solid ${theme.danger}30` }}>
        SOLD
      </span>
    );
  };

  return (
    <div>
      {/* Property Filters */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        flexWrap: "wrap",
        gap: "10px"
      }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          {["ALL", "Villa", "Apartment", "Penthouse", "Commercial", "AVAILABLE"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                fontSize: "0.8rem",
                padding: "6px 14px",
                borderRadius: "8px",
                border: filterType === f ? "none" : `1px solid ${theme.border}`,
                cursor: "pointer",
                backgroundColor: filterType === f ? theme.accentPrimary : theme.cardBg,
                color: filterType === f ? "#ffffff" : theme.textSecondary,
                fontWeight: filterType === f ? "700" : "500",
                boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                transition: "all 0.15s ease"
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ fontSize: "0.85rem", color: theme.textMuted }}>
          Showing <strong>{filtered.length}</strong> Prime Projects
        </div>
      </div>

      {/* Property Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: "20px"
      }}>
        {filtered.map((p) => {
          let parsedAmenities: string[] = [];
          try {
            parsedAmenities = JSON.parse(p.amenities || "[]");
          } catch (e) {}

          return (
            <div
              key={p.id}
              onClick={() => onSelectProperty && onSelectProperty(p)}
              style={{
                backgroundColor: theme.cardBg,
                borderRadius: "14px",
                border: `1px solid ${theme.border}`,
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 20px -8px rgba(0, 0, 0, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
            >
              {/* Property Image with Price Tag */}
              <div style={{ position: "relative", height: "190px", backgroundColor: theme.cardBgSecondary }}>
                <img
                  src={p.image_url || "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80"}
                  alt={p.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                  {getStatusBadge(p.status)}
                </div>
                <div style={{
                  position: "absolute",
                  bottom: "12px",
                  left: "12px",
                  backgroundColor: "rgba(15, 23, 42, 0.8)",
                  backdropFilter: "blur(4px)",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  color: "#ffffff",
                  fontWeight: "800",
                  fontSize: "1.05rem"
                }}>
                  {p.price_formatted || formatIndianCurrency(p.price)}
                </div>
              </div>

              {/* Property Details */}
              <div style={{ padding: "16px" }}>
                <div style={{ fontSize: "0.72rem", color: theme.accentPrimary, fontWeight: "700", textTransform: "uppercase" }}>
                  {p.project_name}
                </div>
                <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: theme.textPrimary, margin: "4px 0 8px 0" }}>
                  {p.title}
                </h3>
                <div style={{ fontSize: "0.8rem", color: theme.textMuted, display: "flex", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
                  📍 {p.location}
                </div>

                {/* Specs */}
                <div style={{
                  display: "flex",
                  gap: "14px",
                  padding: "8px 0",
                  borderTop: `1px solid ${theme.border}`,
                  borderBottom: `1px solid ${theme.border}`,
                  fontSize: "0.8rem",
                  color: theme.textSecondary,
                  marginBottom: "12px"
                }}>
                  <div>📐 {p.carpet_area_sqft.toLocaleString()} sq.ft</div>
                  {p.bedrooms != null && p.bedrooms > 0 && <div>🛏️ {p.bedrooms} Beds</div>}
                  {p.bathrooms != null && p.bathrooms > 0 && <div>🚿 {p.bathrooms} Baths</div>}
                </div>

                {/* Amenity Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {parsedAmenities.slice(0, 3).map((a, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: "0.7rem",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: theme.cardBgSecondary,
                        color: theme.textMuted,
                        border: `1px solid ${theme.border}`
                      }}
                    >
                      {a}
                    </span>
                  ))}
                  {parsedAmenities.length > 3 && (
                    <span style={{ fontSize: "0.7rem", color: theme.textMuted, alignSelf: "center" }}>
                      +{parsedAmenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
