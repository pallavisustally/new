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
      state: searchParams.get("state") || "-",
      siteCount: searchParams.get("siteCount") || "-",
      facilityName: searchParams.get("facilityName") || "CHLOE ALLEN",
      reportingYear: searchParams.get("reportingYear") || "-",
      reportingPeriod: searchParams.get("reportingPeriod") || "-",
      scopeBoundaryNotes: searchParams.get("scopeBoundaryNotes") || "-",
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
      link.download = `scope2-certificate-${
        data.facilityName || "application"
      }-${new Date().toISOString().split("T")[0]}.png`;
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
          maxWidth: "1200px",
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
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            padding: "40px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* GREEN FRAME (like image) */}
          <div
            style={{
              border: "14px solid #3D5F2B",
              padding: "24px",
              position: "relative",
              backgroundColor: "#fff",
            }}
          >
            {/* inner thin frame */}
            <div
              style={{
                border: "2px solid #3D5F2B",
                padding: "40px 50px",
                position: "relative",
              }}
            >
              {/* Header / Logo */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Logo Placeholder */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "8px",
                    backgroundColor: "#d9ead3",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    color: "#3D5F2B",
                  }}
                >
                  ghg
                </div>

                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontSize: "22px", fontWeight: 800, color: "#3D5F2B" }}>
                    ghg{" "}
                    <span style={{ fontWeight: 600, fontSize: "16px", color: "#444" }}>
                      management
                    </span>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#666" }}>
                    institute
                  </div>
                </div>
              </div>

              {/* Title */}
              <div style={{ textAlign: "center", marginTop: "22px" }}>
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    letterSpacing: "2px",
                    color: "#333",
                    textTransform: "uppercase",
                  }}
                >
                  CERTIFICATE OF PROFICIENCY
                </div>

                <div
                  style={{
                    margin: "10px auto 0",
                    width: "60%",
                    height: "1px",
                    backgroundColor: "#333",
                    opacity: 0.5,
                  }}
                />
              </div>

              {/* Body */}
              <div style={{ textAlign: "center", marginTop: "28px" }}>
                <p style={{ fontSize: "15px", color: "#444", marginBottom: "12px" }}>
                  This is to certify that
                </p>

                <div
                  style={{
                    fontSize: "34px",
                    fontWeight: 800,
                    letterSpacing: "1px",
                    color: "#3D5F2B",
                    marginBottom: "10px",
                  }}
                >
                  {data.facilityName}
                </div>

                <p style={{ fontSize: "14px", color: "#444", marginBottom: "16px" }}>
                  has passed the proficiency examination and other requirements for
                  the course
                </p>

                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#222",
                    marginBottom: "18px",
                  }}
                >
                  201 Basics of Organizational GHG Accounting
                </div>

                <p style={{ fontSize: "13px", color: "#444", marginBottom: "24px" }}>
                  On{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <p style={{ fontSize: "13px", color: "#444" }}>In witness hereof</p>
              </div>

              {/* Signature + Seal */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  marginTop: "35px",
                }}
              >
                {/* Signature */}
                <div style={{ width: "45%", textAlign: "left" }}>
                  <div
                    style={{
                      height: "30px",
                      fontFamily: "cursive",
                      fontSize: "22px",
                      color: "#111",
                      marginBottom: "6px",
                    }}
                  >
                    M. Gillewater
                  </div>

                  <div style={{ borderTop: "2px solid #333", width: "220px" }} />

                  <div style={{ fontSize: "12px", marginTop: "6px", color: "#444" }}>
                    Michael Gillewater
                  </div>
                  <div style={{ fontSize: "12px", color: "#666" }}>Dean</div>
                </div>

                {/* Gold Seal */}
                <div style={{ width: "45%", display: "flex", justifyContent: "flex-end" }}>
                  <div
                    style={{
                      width: "110px",
                      height: "110px",
                      borderRadius: "999px",
                      background:
                        "radial-gradient(circle at 35% 35%, #fff6bf 0%, #d2a100 55%, #8a5a00 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "14px",
                      textAlign: "center",
                      fontSize: "11px",
                      fontWeight: 800,
                      color: "#2d1d00",
                      border: "3px solid rgba(0,0,0,0.15)",
                    }}
                  >
                    GHG
                    <br />
                    MANAGEMENT
                    <br />
                    INSTITUTE
                  </div>
                </div>
              </div>

              {/* IMPORTANT: FOOTER SAME AS YOUR CODE */}
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
                  Certificate Date:{" "}
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
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
            onClick={() => {
              const currentParams = searchParams.toString();
              const url = currentParams
                ? `/scope/review?${currentParams}`
                : "/scope/review";
              router.push(url);
            }}
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
