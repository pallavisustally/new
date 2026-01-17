"use client";

import { useMemo, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showActions, setShowActions] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const data = useMemo(
    () => {
      const renewableEnergyStr = searchParams.get("renewableEnergy") || "0";
      const totalEnergyStr = searchParams.get("totalEnergy") || "0";
      
      // Extract numeric values (remove units like "kWh" if present)
      const renewableEnergy = parseFloat(renewableEnergyStr.replace(/[^\d.]/g, "")) || 0;
      const totalEnergy = parseFloat(totalEnergyStr.replace(/[^\d.]/g, "")) || 0;
      
      // Calculate renewable energy percentage: (Renewable Energy / Total Energy) × 100
      const renewablePercentage = totalEnergy > 0 
        ? parseFloat(((renewableEnergy / totalEnergy) * 100).toFixed(2))
        : 0;
      
      return {
        name: searchParams.get("name") || "-",
        mobile: searchParams.get("mobile") || "-",
        email: searchParams.get("email") || "-",
        company: searchParams.get("company") || "-",
        sector: searchParams.get("sector") || "-",
        natureOfBusiness: searchParams.get("natureOfBusiness") || "-",
        country: searchParams.get("country") || "-",
        renewableEnergy: renewableEnergyStr || "-",
        totalEnergy: totalEnergyStr || "-",
        renewablePercentage: renewablePercentage,
      };
    },
    [searchParams]
  );

  const rows = [
    { label: "Name", value: data.name },
    { label: "Mobile", value: data.mobile },
    { label: "Email", value: data.email },
    { label: "Company", value: data.company },
    { label: "Sector", value: data.sector },
    { label: "Nature of Business", value: data.natureOfBusiness },
    { label: "Country", value: data.country },
    { label: "Renewable Energy", value: data.renewableEnergy },
    { label: "Total Energy", value: data.totalEnergy },
    { label: "Renewable Energy Percentage", value: `${data.renewablePercentage}%` },
  ];

  // Pie chart data
  const pieChartData = [
    { name: "Renewable Energy", value: data.renewablePercentage },
    { name: "Non-Renewable Energy", value: 100 - data.renewablePercentage },
  ];

  const COLORS = {
    renewable: "#FF6B35", // Orange
    nonRenewable: "#808080", // Grey
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#1a1a1a",
            border: "1px solid #2f2f2f",
            borderRadius: "8px",
            padding: "12px",
            color: "#FFFFFF",
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ margin: "4px 0 0 0", color: "#FF6B35" }}>
            {payload[0].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const handleDownloadPDF = async () => {
    if (isGeneratingPDF || !contentRef.current) return;

    setIsGeneratingPDF(true);
    try {
      // Create a PDF document
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(255, 107, 53);
      pdf.text("Review Details", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Add subtitle
      pdf.setFontSize(12);
      pdf.setTextColor(229, 229, 229);
      pdf.text("Application Information", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 15;

      // Add review details
      pdf.setFontSize(10);
      pdf.setTextColor(181, 181, 181);
      const lineHeight = 8;
      const startX = margin;
      const labelWidth = 70;
      const valueX = startX + labelWidth;

      rows.forEach((row) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin - 20) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setTextColor(181, 181, 181);
        pdf.text(`${row.label}:`, startX, yPosition);
        pdf.setTextColor(0, 0, 0);
        
        // Handle long text by splitting into multiple lines
        const valueText = String(row.value);
        const maxWidth = pageWidth - valueX - margin;
        const splitText = pdf.splitTextToSize(valueText, maxWidth);
        
        pdf.text(splitText, valueX, yPosition);
        yPosition += lineHeight * Math.max(1, splitText.length);
        yPosition += 3; // Add spacing between rows
      });

      // Add energy distribution section
      yPosition += 10;
      if (yPosition > pageHeight - margin - 100) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFontSize(14);
      pdf.setTextColor(255, 255, 255);
      pdf.text("Energy Distribution", pageWidth / 2, yPosition, { align: "center" });
      yPosition += 10;

      // Capture the pie chart as an image
      const chartElement = document.querySelector(".recharts-wrapper");
      if (chartElement) {
        try {
          const canvas = await html2canvas(chartElement as HTMLElement, {
            backgroundColor: "#202020",
            scale: 2,
          });
          
          const imgData = canvas.toDataURL("image/png");
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Check if we need a new page for the chart
          if (yPosition + imgHeight > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.addImage(imgData, "PNG", margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        } catch (error) {
          console.error("Error capturing chart:", error);
          // If chart capture fails, just add text information
          pdf.setFontSize(10);
          pdf.setTextColor(255, 107, 53);
          pdf.text(`Renewable Energy: ${data.renewablePercentage}%`, pageWidth / 2, yPosition, { align: "center" });
          yPosition += 8;
          pdf.setTextColor(128, 128, 128);
          pdf.text(`Non-Renewable Energy: ${(100 - data.renewablePercentage).toFixed(2)}%`, pageWidth / 2, yPosition, { align: "center" });
          yPosition += 10;
        }
      }

      // Add footer
      const footerY = pageHeight - 10;
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        "Generated from Sustally Application System",
        pageWidth / 2,
        footerY,
        { align: "center" }
      );

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `review-details-${data.name || "application"}-${timestamp}.pdf`;

      // Save the PDF
      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      setNotification({ message: "Failed to generate PDF. Please try again.", type: "error" });
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#000000",
        padding: "40px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: "100%",
          maxWidth: "700px",
          border: "2px solid #FF6B35",
          borderRadius: "12px",
          padding: "40px",
          backgroundColor: "#1a1a1a",
          boxShadow: "0 8px 32px rgba(255, 107, 53, 0.2)",
        }}
      >
        <h2
          style={{
            color: "#FFFFFF",
            marginBottom: "24px",
            fontSize: "28px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Review Details
        </h2>

        <p
          style={{
            color: "#E5E5E5",
            marginBottom: "24px",
            textAlign: "center",
            fontSize: "15px",
          }}
        >
          Please confirm the information below before submitting.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {rows.map((row) => (
            <div
              key={row.label}
              style={{
                border: "1px solid #2f2f2f",
                borderRadius: "10px",
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#202020",
              }}
            >
              <span
                style={{
                  color: "#B5B5B5",
                  fontSize: "14px",
                  letterSpacing: "0.2px",
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "15px",
                  textAlign: "right",
                  maxWidth: "60%",
                  wordBreak: "break-word",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div
          style={{
            marginTop: "32px",
            padding: "24px",
            border: "1px solid #2f2f2f",
            borderRadius: "10px",
            backgroundColor: "#202020",
          }}
        >
          <h3
            style={{
              color: "#FFFFFF",
              marginBottom: "20px",
              fontSize: "20px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            Energy Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Renewable Energy"
                        ? COLORS.renewable
                        : COLORS.nonRenewable
                    }
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ color: "#FFFFFF" }}
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span style={{ color: "#FFFFFF" }}>
                    {value}: {entry.payload.value.toFixed(2)}%
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

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
            onClick={() => router.push("/")}
            style={{
              padding: "12px 20px",
              borderRadius: "8px",
              border: "1px solid #444444",
              backgroundColor: "transparent",
              color: "#FFFFFF",
              fontSize: "15px",
              fontWeight: "500",
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
            onClick={() => setShowActions(true)}
          >
            Confirm & Send
          </button>
        </div>

        {showActions && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginTop: "24px",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isGeneratingPDF ? "#999999" : "#4CAF50",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: "600",
                cursor: isGeneratingPDF ? "not-allowed" : "pointer",
                opacity: isGeneratingPDF ? 0.7 : 1,
              }}
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
            >
              {isGeneratingPDF ? "Generating..." : "Download PDF"}
            </button>
            <button
              type="button"
              style={{
                padding: "12px 20px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: isSendingEmail ? "#999999" : "#FF6B35",
                color: "#FFFFFF",
                fontSize: "15px",
                fontWeight: "600",
                cursor: isSendingEmail ? "not-allowed" : "pointer",
                opacity: isSendingEmail ? 0.7 : 1,
              }}
              onClick={async () => {
                if (isSendingEmail) return;
                
                setIsSendingEmail(true);
                try {
                  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                  const response = await fetch(`${apiUrl}/api/send-email`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data),
                  });

                  // Parse response as JSON
                  let result;
                  try {
                    result = await response.json();
                  } catch (parseError) {
                    // If JSON parsing fails, it might be a network error or empty response
                    console.error("Failed to parse response:", parseError);
                    setNotification({ 
                      message: "Failed to send email: Invalid response from server. Please check if the backend server is running.", 
                      type: "error" 
                    });
                    setTimeout(() => setNotification(null), 5000);
                    return;
                  }

                  // Check if response is ok and result indicates success
                  if (response.ok && result.success) {
                    setNotification({ message: "Email sent successfully!", type: "success" });
                    setTimeout(() => {
                      setNotification(null);
                      // Redirect to home page after successful email send
                      router.push("/");
                    }, 2000);
                  } else {
                    // Handle error response
                    const errorMessage = result.error || result.message || `Server error (${response.status})`;
                    setNotification({ message: `Failed to send email: ${errorMessage}`, type: "error" });
                    setTimeout(() => setNotification(null), 5000);
                  }
                } catch (error) {
                  console.error("Error sending email:", error);
                  // Handle network errors or other exceptions
                  if (error instanceof TypeError && error.message.includes("fetch")) {
                    setNotification({ 
                      message: "Failed to send email: Cannot connect to server. Please check if the backend server is running on port 3001.", 
                      type: "error" 
                    });
                  } else {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
                    setNotification({ 
                      message: `Failed to send email: ${errorMessage}. Please check if the backend server is running and SMTP settings are configured.`, 
                      type: "error" 
                    });
                  }
                  setTimeout(() => setNotification(null), 5000);
                } finally {
                  setIsSendingEmail(false);
                }
              }}
              disabled={isSendingEmail}
            >
              {isSendingEmail ? "Sending..." : "Send Email"}
            </button>
          </div>
        )}
      </div>

      {/* Notification Popup */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 10000,
            backgroundColor: notification.type === "success" ? "#1a1a1a" : "#2a1a1a",
            border: `2px solid ${notification.type === "success" ? "#4CAF50" : "#FF6B35"}`,
            borderRadius: "16px",
            padding: "24px 32px",
            boxShadow: `0 8px 32px rgba(${notification.type === "success" ? "76, 175, 80" : "255, 107, 53"}, 0.4)`,
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
                  backgroundColor: notification.type === "success" ? "rgba(76, 175, 80, 0.2)" : "rgba(255, 107, 53, 0.2)",
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
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFFFFF";
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#B5B5B5";
                e.currentTarget.style.backgroundColor = "transparent";
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

      {/* Backdrop overlay */}
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

      {/* Add CSS animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -60%);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%);
            }
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
        `
      }} />
    </main>
  );
}