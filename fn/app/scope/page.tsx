"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type YesNo = "Yes" | "No" | "";

type FormDataType = {
  // Page 1 - Box 1
  state: string;
  siteCount: string;
  facilityName: string;

  // Page 1 - Box 2
  renewableProcurement: YesNo;
  onsiteExportedKwh: string;
  netMeteringApplicable: YesNo;

  // Page 1 - Box 3
  reportingYear: Date | null;
  reportingPeriod: "Monthly" | "Quarterly" | "Annually" | "";
  conditionalApproach:
  | "Operational Control"
  | "Equity Share"
  | "Financial Control"
  | "";

  // Page 1 - Box 4
  scopeBoundaryNotes: string;

  // ---------------- PAGE 2 ----------------

  // Page 2 - Box 1 (Energy Activity)
  energyActivityInput: "Monthly" | "Yearly" | "";
  energyCategory: string;
  trackingType: "Unit consumption" | "Spend amount" | "Both" | "";
  energySupportingEvidenceFile: File | null;
  energySourceDescription: string;

  // Page 2 - Box 2 (Renewable Electricity)
  hasRenewableElectricity: YesNo;
  renewableElectricity: string;
  renewableEnergyConsumption: string;
  renewableSupportingEvidenceFile: File | null;
  renewableEnergySourceDescription: string;
};

export default function TemplatePage() {
  const router = useRouter();
  const [page, setPage] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<FormDataType>({
    // Page 1
    state: "",
    siteCount: "",
    facilityName: "",

    renewableProcurement: "",
    onsiteExportedKwh: "",
    netMeteringApplicable: "",

    reportingYear: null,
    reportingPeriod: "",
    conditionalApproach: "",

    scopeBoundaryNotes: "",

    // Page 2 - Box 1
    energyActivityInput: "",
    energyCategory: "",
    trackingType: "",
    energySupportingEvidenceFile: null,
    energySourceDescription: "",

    // Page 2 - Box 2
    hasRenewableElectricity: "",
    renewableElectricity: "",
    renewableEnergyConsumption: "",
    renewableSupportingEvidenceFile: null,
    renewableEnergySourceDescription: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (name: keyof FormDataType, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Page 1 validations
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.siteCount.trim()) newErrors.siteCount = "Site Count is required";
    if (!formData.facilityName.trim()) newErrors.facilityName = "Facility Name is required";
    if (!formData.renewableProcurement) newErrors.renewableProcurement = "Please select an option";
    if (!formData.onsiteExportedKwh.trim()) newErrors.onsiteExportedKwh = "On-site generation exported is required";
    if (!formData.netMeteringApplicable) newErrors.netMeteringApplicable = "Please select an option";
    if (!formData.reportingYear) newErrors.reportingYear = "Reporting Year is required";
    if (!formData.reportingPeriod) newErrors.reportingPeriod = "Reporting Period is required";
    if (!formData.conditionalApproach) newErrors.conditionalApproach = "Conditional Approach is required";
    if (!formData.scopeBoundaryNotes.trim()) newErrors.scopeBoundaryNotes = "Scope boundary notes is required";

    // Page 2 validations
    if (!formData.energyActivityInput) newErrors.energyActivityInput = "Energy activity input is required";
    if (!formData.energyCategory.trim()) newErrors.energyCategory = "Energy category is required";
    if (!formData.trackingType) newErrors.trackingType = "Tracking type is required";
    if (!formData.energySourceDescription.trim()) newErrors.energySourceDescription = "Energy source description is required";
    if (!formData.hasRenewableElectricity) newErrors.hasRenewableElectricity = "Please select an option";
    if (!formData.renewableEnergySourceDescription.trim()) newErrors.renewableEnergySourceDescription = "Energy source description is required";

    // Conditional validations for renewable electricity
    if (formData.hasRenewableElectricity === "Yes") {
      if (!formData.renewableElectricity.trim()) newErrors.renewableElectricity = "Renewable electricity is required";
      if (!formData.renewableEnergyConsumption.trim()) newErrors.renewableEnergyConsumption = "Energy consumption is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Prepare data for API (convert File objects to filenames)
      const submitData: any = {};
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          submitData[key] = value.name;
        } else if (value !== null && value !== undefined) {
          submitData[key] = String(value);
        }
      });

      // Save to Payload CMS
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const saveResponse = await fetch(`${apiUrl}/api/save-scope2`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const saveResult = await saveResponse.json();

      if (!saveResponse.ok || !saveResult.success) {
        throw new Error(saveResult.error || "Failed to save application");
      }

      // Navigate to review page with data
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          params.append(key, value.name);
        } else if (value !== null && value !== undefined) {
          params.append(key, String(value));
        }
      });

      router.push(`/scope/review?${params.toString()}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(error instanceof Error ? error.message : "Failed to submit form. Please try again.");
      setIsSubmitting(false);
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
          maxWidth: "1500px",
          border: "2px solid #faf9f8ff",
          borderRadius: "12px",
          padding: "40px",
          backgroundColor: "#f8f7f7ff",
          boxShadow: "0 8px 32px rgba(255, 107, 53, 0.2)",
        }}
      >
        {/* HEADER */}
        <h1
          style={{
            color: "#080707ff",
            marginBottom: "8px",
            fontSize: "32px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {page === 1 ? "Book Your Scope 2 Assignment" : "Book Your Scope 2 Assignment"}
        </h1>

        <p
          style={{
            color: "#050404ff",
            marginBottom: "24px",
            textAlign: "center",
            fontSize: "15px",
          }}
        >
          {page === 1
            ? "Please fill in all the required information below"
            : "Energy Activity and Renewable Electricity Details"}
        </p>

        <form onSubmit={handleSubmit}>
          {/* ===================== PAGE 1 ===================== */}
          {page === 1 && (
            <>
              {/* 2x2 Grid Layout */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                }}
              >
                {[
                  { title: "Define your reporting Boundary" },
                  { title: "Electricity Characteristics" },
                  { title: "Reporting Period" },
                  { title: "Scope boundary notes" },
                ].map((card, idx) => (
                  <section
                    key={card.title}
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
                      {card.title}
                    </h2>

                    {/* ===================== BOX 1 ===================== */}
                    {idx === 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "18px",
                        }}
                      >
                        {/* State */}
                        <div>
                          <label
                            htmlFor="state"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            State <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <input
                            type="text"
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Enter state"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                              color: "#000000",
                              fontSize: "15px",
                              outline: "none",
                            }}
                          />
                        </div>

                        {/* Site Count */}
                        <div>
                          <label
                            htmlFor="siteCount"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Site Count <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <input
                            type="number"
                            id="siteCount"
                            name="siteCount"
                            value={formData.siteCount}
                            onChange={handleChange}
                            placeholder="Enter site count"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                              color: "#000000",
                              fontSize: "15px",
                              outline: "none",
                            }}
                          />
                        </div>

                        {/* Facility / Site Name */}
                        <div>
                          <label
                            htmlFor="facilityName"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Facility / Site Name{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <input
                            type="text"
                            id="facilityName"
                            name="facilityName"
                            value={formData.facilityName}
                            onChange={handleChange}
                            placeholder="Enter facility/site name"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                              color: "#000000",
                              fontSize: "15px",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* ===================== BOX 2 ===================== */}
                    {idx === 1 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "18px",
                        }}
                      >
                        {/* 1) Renewable procurement yes/no */}
                        <div>
                          <div
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Do you have renewable electricity procurement?{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </div>

                          <div style={{ display: "flex", gap: "20px" }}>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="renewableProcurement"
                                checked={formData.renewableProcurement === "Yes"}
                                onChange={() =>
                                  handleRadioChange(
                                    "renewableProcurement",
                                    "Yes"
                                  )
                                }
                              />
                              Yes
                            </label>

                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="renewableProcurement"
                                checked={formData.renewableProcurement === "No"}
                                onChange={() =>
                                  handleRadioChange("renewableProcurement", "No")
                                }
                              />
                              No
                            </label>
                          </div>
                        </div>

                        {/* 2) On-site generation exported */}
                        <div>
                          <label
                            htmlFor="onsiteExportedKwh"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            On-site generation exported (kWh){" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <input
                            type="number"
                            id="onsiteExportedKwh"
                            name="onsiteExportedKwh"
                            value={formData.onsiteExportedKwh}
                            onChange={handleChange}
                            placeholder="e.g., 1000"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                              color: "#000000",
                              fontSize: "15px",
                              outline: "none",
                            }}
                          />
                        </div>

                        {/* 3) Net metering applicable yes/no */}
                        <div>
                          <div
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Net metering applicable?{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </div>

                          <div style={{ display: "flex", gap: "20px" }}>
                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="netMeteringApplicable"
                                checked={formData.netMeteringApplicable === "Yes"}
                                onChange={() =>
                                  handleRadioChange(
                                    "netMeteringApplicable",
                                    "Yes"
                                  )
                                }
                              />
                              Yes
                            </label>

                            <label
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              <input
                                type="radio"
                                name="netMeteringApplicable"
                                checked={formData.netMeteringApplicable === "No"}
                                onChange={() =>
                                  handleRadioChange(
                                    "netMeteringApplicable",
                                    "No"
                                  )
                                }
                              />
                              No
                            </label>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===================== BOX 3 ===================== */}
                    {idx === 2 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "18px",
                        }}
                      >
                        {/* Reporting Year */}
                        {/* Reporting Year */}
                        <div>
                          <label
                            htmlFor="reportingYear"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Reporting Year <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <DatePicker
                            selected={formData.reportingYear}
                            onChange={(date: Date | null) =>
                              setFormData((prev) => ({
                                ...prev,
                                reportingYear: date,
                              }))
                            }
                            showYearPicker
                            dateFormat="yyyy"
                            placeholderText="Select year"
                            wrapperClassName="w-full"
                            className="yearPickerInput"
                          />

                        </div>


                        {/* Reporting Period Buttons */}
                        <div>
                          <div
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Reporting Period{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </div>

                          <div style={{ display: "flex", gap: "12px" }}>
                            {["Monthly", "Quarterly", "Annually"].map((label) => {
                              const isSelected =
                                formData.reportingPeriod === label;

                              return (
                                <button
                                  key={label}
                                  type="button"
                                  onClick={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      reportingPeriod: label as any,
                                    }))
                                  }
                                  style={{
                                    flex: 1,
                                    padding: "12px 16px",
                                    borderRadius: "8px",
                                    border: "1px solid #000000",
                                    background: isSelected ? "#000" : "#fff",
                                    color: isSelected ? "#fff" : "#000",
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    transition: "0.2s",
                                  }}
                                >
                                  {label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Conditional Approach */}
                        <div>
                          <div
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Conditional Approach{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "14px",
                            }}
                          >
                            {[
                              "Operational Control",
                              "Equity Share",
                              "Financial Control",
                            ].map((opt) => (
                              <label
                                key={opt}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  border: "1px solid #000000",
                                  padding: "12px 14px",
                                  borderRadius: "10px",
                                }}
                              >
                                <input
                                  type="radio"
                                  name="conditionalApproach"
                                  checked={formData.conditionalApproach === opt}
                                  onChange={() =>
                                    setFormData((prev) => ({
                                      ...prev,
                                      conditionalApproach: opt as any,
                                    }))
                                  }
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ===================== BOX 4 ===================== */}
                    {idx === 3 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "18px",
                        }}
                      >
                        <div>
                          <label
                            htmlFor="scopeBoundaryNotes"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Scope boundary notes{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <textarea
                            id="scopeBoundaryNotes"
                            name="scopeBoundaryNotes"
                            value={formData.scopeBoundaryNotes}
                            onChange={handleChange}
                            rows={6}
                            placeholder="Write your notes here..."
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                              color: "#000000",
                              fontSize: "15px",
                              outline: "none",
                              resize: "vertical",
                              fontFamily: "inherit",
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </section>
                ))}
              </div>

              {/* NEXT button */}
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPage(2)}
                  style={{
                    width: "auto",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #FFFFFF",
                    backgroundColor: "#494749ff",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )}

          {/* ===================== PAGE 2 ===================== */}
          {page === 2 && (
            <>
              {/* 1x2 Grid Layout */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                  color: "#000000",
                }}
              >
                {/* ================= BOX 1 : ENERGY ACTIVITY ================= */}
                <section
                  style={{
                    border: "1px solid #000000",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minHeight: "250px",
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
                    Energy Activity
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                    }}
                  >
                    {/* 1) Energy activity input */}
                    <div>
                      <div
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Energy activity input{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </div>

                      <div style={{ display: "flex", gap: "12px" }}>
                        {["Monthly", "Yearly"].map((label) => {
                          const isSelected =
                            formData.energyActivityInput === label;

                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  energyActivityInput: label as any,
                                }))
                              }
                              style={{
                                flex: 1,
                                padding: "12px 16px",
                                borderRadius: "8px",
                                border: "1px solid #000000",
                                background: isSelected ? "#000" : "#fff",
                                color: isSelected ? "#fff" : "#000",
                                cursor: "pointer",
                                fontWeight: 600,
                                transition: "0.2s",
                              }}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2) Energy category */}
                    <div>
                      <label
                        htmlFor="energyCategory"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Energy category{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <input
                        type="text"
                        id="energyCategory"
                        name="energyCategory"
                        value={formData.energyCategory}
                        onChange={handleChange}
                        placeholder="Enter energy category"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />
                    </div>

                    {/* 3) Are you tracking */}
                    <div>
                      <div
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Are you tracking{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </div>

                      <div style={{ display: "flex", gap: "12px" }}>
                        {["Unit consumption", "Spend amount", "Both"].map(
                          (label) => {
                            const isSelected = formData.trackingType === label;

                            return (
                              <button
                                key={label}
                                type="button"
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    trackingType: label as any,
                                  }))
                                }
                                style={{
                                  flex: 1,
                                  padding: "12px 16px",
                                  borderRadius: "8px",
                                  border: "1px solid #000000",
                                  background: isSelected ? "#000" : "#fff",
                                  color: isSelected ? "#fff" : "#000",
                                  cursor: "pointer",
                                  fontWeight: 600,
                                  transition: "0.2s",
                                }}
                              >
                                {label}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* 4) Supporting Evidence */}
                    <div>
                      <label
                        htmlFor="energySupportingEvidence"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Supporting evidence{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <input
                        type="file"
                        id="energySupportingEvidence"
                        name="energySupportingEvidence"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            energySupportingEvidenceFile:
                              e.target.files?.[0] || null,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "14px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      />

                      <div
                        style={{ fontSize: "12px", marginTop: "6px", color: "#333" }}
                      >
                        Allowed: PDF, JPG, JPEG, PNG
                      </div>
                    </div>

                    {/* 5) Energy source description */}
                    <div>
                      <label
                        htmlFor="energySourceDescription"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Energy source description{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <textarea
                        id="energySourceDescription"
                        name="energySourceDescription"
                        value={formData.energySourceDescription}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Write description here..."
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>
                </section>

                {/* ================= BOX 2 : RENEWABLE ELECTRICITY ================= */}
                <section
                  style={{
                    border: "1px solid #000000",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    minHeight: "250px",
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
                    Renewable Electricity
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "18px",
                    }}
                  >
                    {/* 1) Do you have renewable electricity? */}
                    <div>
                      <div
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Do you have renewable electricity?{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </div>

                      <div style={{ display: "flex", gap: "20px" }}>
                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name="hasRenewableElectricity"
                            checked={formData.hasRenewableElectricity === "Yes"}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                hasRenewableElectricity: "Yes",
                              }))
                            }
                          />
                          Yes
                        </label>

                        <label
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="radio"
                            name="hasRenewableElectricity"
                            checked={formData.hasRenewableElectricity === "No"}
                            onChange={() =>
                              setFormData((prev) => ({
                                ...prev,
                                hasRenewableElectricity: "No",
                                renewableElectricity: "",
                                renewableEnergyConsumption: "",
                              }))
                            }
                          />
                          No
                        </label>
                      </div>
                    </div>

                    {/* Conditional inputs if Yes */}
                    {formData.hasRenewableElectricity === "Yes" && (
                      <>
                        <div>
                          <label
                            htmlFor="renewableElectricity"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Renewable electricity{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <input
                            type="number"
                            id="renewableElectricity"
                            name="renewableElectricity"
                            value={formData.renewableElectricity}
                            onChange={handleChange}
                            placeholder="Enter renewable electricity"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                              color: "#000000",
                              fontSize: "15px",
                              outline: "none",
                            }}
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="renewableEnergyConsumption"
                            style={{
                              display: "block",
                              color: "#000000",
                              fontSize: "14px",
                              marginBottom: "8px",
                              fontWeight: "500",
                            }}
                          >
                            Energy consumption{" "}
                            <span style={{ color: "#000000" }}>*</span>
                          </label>

                          <input
                            type="number"
                            id="renewableEnergyConsumption"
                            name="renewableEnergyConsumption"
                            value={formData.renewableEnergyConsumption}
                            onChange={handleChange}
                            placeholder="Enter energy consumption"
                            style={{
                              width: "100%",
                              padding: "12px 16px",
                              borderRadius: "8px",
                              border: "1px solid #000000",
                              backgroundColor: "#FFFFFF",
                              color: "#000000",
                              fontSize: "15px",
                              outline: "none",
                            }}
                          />
                        </div>
                      </>
                    )}

                    {/* 2) Supporting evidence */}
                    <div>
                      <label
                        htmlFor="renewableSupportingEvidence"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Supporting evidence{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <input
                        type="file"
                        id="renewableSupportingEvidence"
                        name="renewableSupportingEvidence"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            renewableSupportingEvidenceFile:
                              e.target.files?.[0] || null,
                          }))
                        }
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "14px",
                          outline: "none",
                          cursor: "pointer",
                        }}
                      />

                      <div
                        style={{ fontSize: "12px", marginTop: "6px", color: "#333" }}
                      >
                        Allowed: PDF, JPG, JPEG, PNG
                      </div>
                    </div>

                    {/* 3) Energy source description */}
                    <div>
                      <label
                        htmlFor="renewableEnergySourceDescription"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Energy source description{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <textarea
                        id="renewableEnergySourceDescription"
                        name="renewableEnergySourceDescription"
                        value={formData.renewableEnergySourceDescription}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Write description here..."
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* PREVIOUS + SUBMIT */}
              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  style={{
                    width: "auto",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #000000",
                    backgroundColor: "#dddddd",
                    color: "#000000",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Previous
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: "auto",
                    padding: "10px 18px",
                    borderRadius: "8px",
                    border: "1px solid #000000",
                    backgroundColor: isSubmitting ? "#cccccc" : "#000000",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
      <style jsx global>{`
  .yearPickerInput {
    width: 100%;
    padding: 12px 16px;
    border-radius: 8px;
    border: 1px solid #000000;
    background-color: #ffffff;
    color: #000000;
    font-size: 15px;
    outline: none;
    cursor: pointer;
  }
`}</style>
    </main>
  );
}
