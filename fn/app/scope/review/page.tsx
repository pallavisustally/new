"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ScopeReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Removed showActions, isSendingEmail, isGeneratingPDF as we go directly to certificate
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

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

  // ---------- Helpers ----------
  const FieldRow = ({ label, value }: { label: string; value: any }) => (
    <div
      style={{
        border: "1px solid #2f2f2f",
        borderRadius: "10px",
        padding: "12px 14px",
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        alignItems: "flex-start",
        backgroundColor: "#f4f3f3",
      }}
    >
      <span style={{ color: "#0f0f0f", fontSize: "14px" }}>{label}</span>

      <span
        style={{
          color: "#121111",
          fontWeight: 600,
          fontSize: "14px",
          textAlign: "right",
          maxWidth: "60%",
          wordBreak: "break-word",
        }}
      >
        {String(value)}
      </span>
    </div>
  );

  const Card = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <section
      style={{
        border: "1px solid #000000",
        borderRadius: "12px",
        padding: "20px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        minHeight: "200px",
      }}
    >
      <h2
        style={{
          color: "#000000",
          fontSize: "16px",
          fontWeight: "600",
          marginBottom: "16px",
          borderBottom: "1px solid #000000",
          paddingBottom: "8px",
        }}
      >
        {title}
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {children}
      </div>
    </section>
  );

  // ---------- PDF generation uses same old rows ----------
  const pdfRows = [
    { label: "State", value: data.state },
    { label: "Site Count", value: data.siteCount },
    { label: "Facility / Site Name", value: data.facilityName },
    { label: "Renewable Procurement", value: data.renewableProcurement },
    {
      label: "On-site Generation Exported (kWh)",
      value: data.onsiteExportedKwh,
    },
    { label: "Net Metering Applicable", value: data.netMeteringApplicable },
    { label: "Reporting Year", value: data.reportingYear },
    { label: "Reporting Period", value: data.reportingPeriod },
    { label: "Conditional Approach", value: data.conditionalApproach },
    { label: "Scope Boundary Notes", value: data.scopeBoundaryNotes },

    { label: "Energy Activity Input", value: data.energyActivityInput },
    { label: "Energy Category", value: data.energyCategory },
    { label: "Tracking Type", value: data.trackingType },
    {
      label: "Energy Supporting Evidence",
      value: data.energySupportingEvidenceFile,
    },
    { label: "Energy Source Description", value: data.energySourceDescription },

    { label: "Has Renewable Electricity", value: data.hasRenewableElectricity },
    ...(data.hasRenewableElectricity === "Yes"
      ? [
          { label: "Renewable Electricity", value: data.renewableElectricity },
          {
            label: "Renewable Energy Consumption",
            value: data.renewableEnergyConsumption,
          },
        ]
      : []),
    {
      label: "Renewable Supporting Evidence",
      value: data.renewableSupportingEvidenceFile,
    },
    {
      label: "Renewable Energy Source Description",
      value: data.renewableEnergySourceDescription,
    },
  ];

  // PDF generation removed - now goes directly to certificate page

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
          maxWidth: "1500px",
          border: "2px solid #faf9f8ff",
          borderRadius: "12px",
          padding: "40px",
          backgroundColor: "#f8f7f7ff",
          boxShadow: "0 8px 32px rgba(255, 107, 53, 0.2)",
        }}
      >
        <h2
          style={{
            color: "#000000",
            marginBottom: "10px",
            fontSize: "28px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Scope 2 Review Details
        </h2>

        <p
          style={{
            color: "#161414",
            marginBottom: "24px",
            textAlign: "center",
            fontSize: "15px",
          }}
        >
          Please confirm the information below before submitting.
        </p>

        {/* ===================== PAGE 1 REVIEW ===================== */}
        <div style={{ fontWeight: 800, marginBottom: "12px" }}>Page 1</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            color: "#000000",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #000",
          }}
        >
          <Card title="Define your reporting Boundary">
            <FieldRow label="State" value={data.state} />
            <FieldRow label="Site Count" value={data.siteCount} />
            <FieldRow label="Facility / Site Name" value={data.facilityName} />
          </Card>

          <Card title="Electricity Characteristics">
            <FieldRow
              label="Renewable electricity procurement"
              value={data.renewableProcurement}
            />
            <FieldRow
              label="On-site generation exported (kWh)"
              value={data.onsiteExportedKwh}
            />
            <FieldRow
              label="Net metering applicable"
              value={data.netMeteringApplicable}
            />
          </Card>

          <Card title="Reporting Period">
            <FieldRow label="Reporting Year" value={data.reportingYear} />
            <FieldRow label="Reporting Period" value={data.reportingPeriod} />
            <FieldRow label="Conditional Approach" value={data.conditionalApproach} />
          </Card>

          <Card title="Scope boundary notes">
            <FieldRow label="Notes" value={data.scopeBoundaryNotes} />
          </Card>
        </div>

        {/* ===================== PAGE 2 REVIEW ===================== */}
        <div style={{ fontWeight: 800, marginTop: "26px", marginBottom: "12px" }}>
          Page 2
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
            width: "100%",
            backgroundColor: "#FFFFFF",
            color: "#000000",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #000",
          }}
        >
          <Card title="Energy Activity">
            <FieldRow label="Energy activity input" value={data.energyActivityInput} />
            <FieldRow label="Energy category" value={data.energyCategory} />
            <FieldRow label="Are you tracking" value={data.trackingType} />
            <FieldRow
              label="Supporting evidence"
              value={data.energySupportingEvidenceFile}
            />
            <FieldRow
              label="Energy source description"
              value={data.energySourceDescription}
            />
          </Card>

          <Card title="Renewable Electricity">
            <FieldRow
              label="Do you have renewable electricity?"
              value={data.hasRenewableElectricity}
            />

            {data.hasRenewableElectricity === "Yes" && (
              <>
                <FieldRow
                  label="Renewable electricity"
                  value={data.renewableElectricity}
                />
                <FieldRow
                  label="Energy consumption"
                  value={data.renewableEnergyConsumption}
                />
              </>
            )}

            <FieldRow
              label="Supporting evidence"
              value={data.renewableSupportingEvidenceFile}
            />
            <FieldRow
              label="Energy source description"
              value={data.renewableEnergySourceDescription}
            />
          </Card>
        </div>

        {/* ACTION BUTTONS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "32px",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
            onClick={() => router.push("/scope")}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "1px solid #000",
              backgroundColor: "transparent",
              color: "#0b0a0a",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Edit Info
          </button>

          <button
            type="button"
            style={{
              padding: "12px 24px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#FF6B35",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
            }}
            onClick={() => {
              // Navigate directly to certificate page
              const params = new URLSearchParams();
              Object.entries(data).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== "-") {
                  params.append(key, String(value));
                }
              });
              router.push(`/scope/certificate?${params.toString()}`);
            }}
          >
            Confirm & Send
          </button>
        </div>

      </div>

      {/* Notification Popup (unchanged - kept from your code) */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            backgroundColor: notification.type === "success" ? "#1a1a1a" : "#2a1a1a",
            border: `2px solid ${
              notification.type === "success" ? "#4CAF50" : "#FF6B35"
            }`,
            borderRadius: "16px",
            padding: "24px 32px",
            boxShadow: `0 8px 32px rgba(${
              notification.type === "success"
                ? "76, 175, 80"
                : "255, 107, 53"
            }, 0.4)`,
            minWidth: "320px",
            maxWidth: "500px",
            animation: "slideIn 0.3s ease-out",
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor:
                    notification.type === "success"
                      ? "rgba(76, 175, 80, 0.2)"
                      : "rgba(255, 107, 53, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {notification.type === "success" ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#4CAF50"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                ) : (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FF6B35"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                )}
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#FFFFFF",
                  fontSize: "16px",
                  fontWeight: "500",
                  lineHeight: "1.5",
                }}
              >
                {notification.message}
              </p>
            </div>

            <button
              onClick={() => setNotification(null)}
              style={{
                background: "transparent",
                border: "none",
                color: "#B5B5B5",
                cursor: "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                transition: "all 0.2s",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}

      {notification && (
        <div
          onClick={() => setNotification(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            animation: "fadeIn 0.3s ease-out",
          }}
        />
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes slideIn {
            from { opacity: 0; transform: translate(-50%, -60%); }
            to { opacity: 1; transform: translate(-50%, -50%); }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `,
        }}
      />
    </main>
  );
}
