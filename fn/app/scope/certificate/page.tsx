"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import html2canvas from "html2canvas";

export default function ScopeCertificatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const data = useMemo(() => {
    return {
      // Page 1 - Box 1
      state: searchParams.get("state") || "-",
      siteCount: searchParams.get("siteCount") || "-",
      facilityName: searchParams.get("facilityName") || "-",

      // Page 1 - Box 2
      renewableProcurement: searchParams.get("renewableProcurement") || "-",
      onsiteExportedKwh: searchParams.get("onsiteExportedKwh") || "-",
      netMeteringApplicable: searchParams.get("netMeteringApplicable") || "-",

      // Page 1 - Box 3
      reportingYear: searchParams.get("reportingYear") || "-",
      reportingPeriod: searchParams.get("reportingPeriod") || "-",
      conditionalApproach: searchParams.get("conditionalApproach") || "-",

      // Page 1 - Box 4
      scopeBoundaryNotes: searchParams.get("scopeBoundaryNotes") || "-",

      // Page 2 - Box 1
      energyActivityInput: searchParams.get("energyActivityInput") || "-",
      energyCategory: searchParams.get("energyCategory") || "-",
      trackingType: searchParams.get("trackingType") || "-",
      energySupportingEvidenceFile:
        searchParams.get("energySupportingEvidenceFile") || "-",
      energySourceDescription: searchParams.get("energySourceDescription") || "-",

      // Page 2 - Box 2
      hasRenewableElectricity:
        searchParams.get("hasRenewableElectricity") || "-",
      renewableElectricity: searchParams.get("renewableElectricity") || "-",
      renewableEnergyConsumption:
        searchParams.get("renewableEnergyConsumption") || "-",
      renewableSupportingEvidenceFile:
        searchParams.get("renewableSupportingEvidenceFile") || "-",
      renewableEnergySourceDescription:
        searchParams.get("renewableEnergySourceDescription") || "-",
    };
  }, [searchParams]);

  const handleDownloadCertificate = async () => {
    if (isDownloading || !certificateRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `scope2-certificate-${data.facilityName || "application"}-${new Date().toISOString().split("T")[0]}.png`;
      link.href = imgData;
      link.click();
    } catch (error) {
      console.error("Error generating certificate:", error);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f3f2f2ff",
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1600px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Certificate Display */}
        <div
          ref={certificateRef}
          style={{
            width: "100%",
            aspectRatio: "16/9",
            backgroundColor: "#ffffff",
            border: "4px solid #FF6B35",
            borderRadius: "12px",
            padding: "60px 80px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Decorative Border */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              border: "2px solid #FF6B35",
              borderRadius: "8px",
              pointerEvents: "none",
            }}
          />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h1
              style={{
                fontSize: "48px",
                fontWeight: "700",
                color: "#FF6B35",
                marginBottom: "12px",
                letterSpacing: "2px",
              }}
            >
              SCOPE 2 CERTIFICATE
            </h1>
            <div
              style={{
                width: "200px",
                height: "3px",
                backgroundColor: "#FF6B35",
                margin: "0 auto",
              }}
            />
            <p
              style={{
                fontSize: "18px",
                color: "#666",
                marginTop: "12px",
                fontWeight: "500",
              }}
            >
              Application Review Details
            </p>
          </div>

          {/* Content Grid - Landscape Layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
              flex: 1,
            }}
          >
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Page 1 Section */}
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: "16px",
                    borderBottom: "2px solid #FF6B35",
                    paddingBottom: "8px",
                  }}
                >
                  Page 1 - Reporting Information
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      State:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.state}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Site Count:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.siteCount}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Facility Name:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.facilityName}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Renewable Procurement:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.renewableProcurement}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      On-site Exported (kWh):
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.onsiteExportedKwh}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Net Metering:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.netMeteringApplicable}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Reporting Year:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.reportingYear}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Reporting Period:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.reportingPeriod}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Conditional Approach:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.conditionalApproach}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Page 2 Section */}
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: "16px",
                    borderBottom: "2px solid #FF6B35",
                    paddingBottom: "8px",
                  }}
                >
                  Page 2 - Energy Details
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Energy Activity Input:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.energyActivityInput}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Energy Category:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.energyCategory}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Tracking Type:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.trackingType}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px solid #e0e0e0",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                      Has Renewable Electricity:
                    </span>
                    <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                      {data.hasRenewableElectricity}
                    </span>
                  </div>
                  {data.hasRenewableElectricity === "Yes" && (
                    <>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                          Renewable Electricity:
                        </span>
                        <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                          {data.renewableElectricity}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          padding: "8px 0",
                          borderBottom: "1px solid #e0e0e0",
                        }}
                      >
                        <span style={{ fontSize: "14px", color: "#666", fontWeight: "600" }}>
                          Energy Consumption:
                        </span>
                        <span style={{ fontSize: "14px", color: "#000", fontWeight: "500" }}>
                          {data.renewableEnergyConsumption}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Scope Boundary Notes */}
              <div>
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#000",
                    marginBottom: "16px",
                    borderBottom: "2px solid #FF6B35",
                    paddingBottom: "8px",
                  }}
                >
                  Scope Boundary Notes
                </h2>
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: "#f9f9f9",
                    borderRadius: "8px",
                    border: "1px solid #e0e0e0",
                    fontSize: "14px",
                    color: "#000",
                    lineHeight: "1.6",
                    minHeight: "80px",
                  }}
                >
                  {data.scopeBoundaryNotes}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "40px",
              textAlign: "center",
              borderTop: "2px solid #FF6B35",
              paddingTop: "20px",
            }}
          >
            <p
              style={{
                fontSize: "14px",
                color: "#666",
                marginBottom: "8px",
              }}
            >
              Generated by Sustally Application System
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#999",
              }}
            >
              Certificate Date: {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/scope/review")}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "1px solid #000",
              backgroundColor: "transparent",
              color: "#000",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back to Review
          </button>

          <button
            type="button"
            onClick={handleDownloadCertificate}
            disabled={isDownloading}
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: isDownloading ? "#999999" : "#FF6B35",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: "600",
              cursor: isDownloading ? "not-allowed" : "pointer",
              opacity: isDownloading ? 0.7 : 1,
            }}
          >
            {isDownloading ? "Downloading..." : "Download Certificate"}
          </button>
        </div>
      </div>
    </main>
  );
}
