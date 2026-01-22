"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormDataType = {
  name: string;
  mobile: string;
  email: string;
  company: string;
  sector: string;
  natureOfBusiness: string;
  country: string;
  renewableEnergy: string;
  totalEnergy: string;

  // Added for Page 2
  assignmentDate: string;
  assignmentSlot: string;
  assignmentTime: string;
};

export default function HomePage() {
  const router = useRouter();

  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    mobile: "",
    email: "",
    company: "",
    sector: "",
    natureOfBusiness: "",
    country: "",
    renewableEnergy: "",
    totalEnergy: "",

    assignmentDate: "",
    assignmentSlot: "",
    assignmentTime: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.mobile.trim()) newErrors.mobile = "Mobile is required";

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (step === 2) {
      if (!formData.company.trim()) newErrors.company = "Company is required";
      if (!formData.sector.trim()) newErrors.sector = "Sector is required";
      if (!formData.natureOfBusiness.trim())
        newErrors.natureOfBusiness = "Nature of Business is required";
    } else if (step === 3) {
      if (!formData.country.trim()) newErrors.country = "Country is required";
    } else if (step === 4) {
      if (!formData.renewableEnergy.trim()) {
        newErrors.renewableEnergy = "Renewable Energy is required";
      } else if (isNaN(parseFloat(formData.renewableEnergy))) {
        newErrors.renewableEnergy = "Please enter a valid number";
      }

      if (!formData.totalEnergy.trim()) {
        newErrors.totalEnergy = "Total Energy is required";
      } else if (isNaN(parseFloat(formData.totalEnergy))) {
        newErrors.totalEnergy = "Please enter a valid number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validate = () => {
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) return false;
    }

    // Validate Page 2 selection
    if (!formData.assignmentDate) {
      setErrors((prev) => ({
        ...prev,
        assignmentDate: "Please select assignment date",
      }));
      return false;
    }
    if (!formData.assignmentSlot) {
      setErrors((prev) => ({
        ...prev,
        assignmentSlot: "Please select assignment slot",
      }));
      return false;
    }
    if (!formData.assignmentTime) {
      setErrors((prev) => ({
        ...prev,
        assignmentTime: "Please select assignment time",
      }));
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    const params = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      params.append(key, value);
    });

    router.push(`/review?${params.toString()}`);
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
        <h1
          style={{
            color: "#080707ff",
            marginBottom: "8px",
            fontSize: "32px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {page === 1 ? "Application Form" : "Scope 2 Assignment"}
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
            : "Choose your preferred date and time"}
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
                {/* ================= STEP 1 ================= */}
                <section
                  style={{
                    border: "1px solid #000000",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
                    1. Personal Details
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="name"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Name <span style={{ color: "#000000" }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.name
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                          transition: "border-color 0.2s",
                        }}
                      />
                      {errors.name && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div>
                      <label
                        htmlFor="mobile"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Mobile <span style={{ color: "#000000" }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.mobile
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />
                      {errors.mobile && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Email <span style={{ color: "#000000" }}>*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.email
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />
                      {errors.email && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* ================= STEP 2 ================= */}
                <section
                  style={{
                    border: "1px solid #000000",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
                    2. Company Details
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <label
                        htmlFor="company"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Company <span style={{ color: "#000000" }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.company
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />
                      {errors.company && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.company}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="sector"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Sector <span style={{ color: "#000000" }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="sector"
                        name="sector"
                        value={formData.sector}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.sector
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />
                      {errors.sector && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.sector}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="natureOfBusiness"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Nature of Business{" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>
                      <textarea
                        id="natureOfBusiness"
                        name="natureOfBusiness"
                        value={formData.natureOfBusiness}
                        onChange={handleChange}
                        rows={3}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.natureOfBusiness
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                          resize: "vertical",
                          fontFamily: "inherit",
                        }}
                      />
                      {errors.natureOfBusiness && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.natureOfBusiness}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* ================= STEP 3 ================= */}
                <section
                  style={{
                    border: "1px solid #000000",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
                    3. Country
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <label
                        htmlFor="country"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Country <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <input
                        type="text"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.country
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />

                      {errors.country && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.country}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* ================= STEP 4 ================= */}
                <section
                  style={{
                    border: "1px solid #000000",
                    borderRadius: "12px",
                    padding: "20px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
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
                    4. Energy
                  </h2>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "20px",
                    }}
                  >
                    <div>
                      <label
                        htmlFor="renewableEnergy"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Renewable Energy (kWh){" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <input
                        type="text"
                        id="renewableEnergy"
                        name="renewableEnergy"
                        value={formData.renewableEnergy}
                        onChange={handleChange}
                        placeholder="e.g., 1000"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.renewableEnergy
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />

                      {errors.renewableEnergy && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.renewableEnergy}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="totalEnergy"
                        style={{
                          display: "block",
                          color: "#000000",
                          fontSize: "14px",
                          marginBottom: "8px",
                          fontWeight: "500",
                        }}
                      >
                        Total Energy (kWh){" "}
                        <span style={{ color: "#000000" }}>*</span>
                      </label>

                      <input
                        type="text"
                        id="totalEnergy"
                        name="totalEnergy"
                        value={formData.totalEnergy}
                        onChange={handleChange}
                        placeholder="e.g., 5000"
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: errors.totalEnergy
                            ? "2px solid #ff4444"
                            : "1px solid #000000",
                          backgroundColor: "#FFFFFF",
                          color: "#000000",
                          fontSize: "15px",
                          outline: "none",
                        }}
                      />

                      {errors.totalEnergy && (
                        <p
                          style={{
                            color: "#ff4444",
                            fontSize: "12px",
                            marginTop: "4px",
                          }}
                        >
                          {errors.totalEnergy}
                        </p>
                      )}
                    </div>
                  </div>
                </section>
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
                  onClick={() => {
                    // Validate steps before moving to page 2
                    const ok =
                      validateStep(1) &&
                      validateStep(2) &&
                      validateStep(3) &&
                      validateStep(4);

                    if (ok) setPage(2);
                  }}
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
                    opacity: isSubmitting ? 0.7 : 1,
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
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {/* DATE BOXES */}
                <div style={{ display: "flex", gap: "12px" }}>
                  {Array.from({ length: 2 }).map((_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() + i);

                    const value = date.toLocaleDateString("en-CA"); // YYYY-MM-DD
                    const label = date.toDateString();

                    const isSelected = formData.assignmentDate === value;

                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            assignmentDate: value,
                            assignmentSlot: "",
                            assignmentTime: "",
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
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* TIME OF DAY BOXES */}
                <div style={{ display: "flex", gap: "12px" }}>
                  {[
                    { label: "Morning", start: "09:00", end: "12:00" },
                    { label: "Afternoon", start: "12:00", end: "17:00" },
                    { label: "Evening", start: "17:00", end: "20:00" },
                  ].map((slot) => {
                    const isSelected = formData.assignmentSlot === slot.label;

                    return (
                      <button
                        key={slot.label}
                        type="button"
                        disabled={!formData.assignmentDate}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            assignmentSlot: slot.label,
                            assignmentTime: "",
                          }))
                        }
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          borderRadius: "8px",
                          border: "1px solid #000000",
                          background: isSelected ? "#000" : "#fff",
                          color: isSelected ? "#fff" : "#000",
                          cursor: formData.assignmentDate ? "pointer" : "not-allowed",
                          opacity: formData.assignmentDate ? 1 : 0.5,
                          fontWeight: 600,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <span>{slot.label}</span>
                        <span style={{ fontSize: "13px", fontWeight: 500 }}>
                          {slot.start} - {slot.end}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* EXACT TIME BOXES */}
                {formData.assignmentSlot && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontWeight: 700 }}>Select Time</div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "10px",
                      }}
                    >
                      {(() => {
                        const generateTimes = (start: string, end: string) => {
                          const times: string[] = [];

                          const [sh, sm] = start.split(":").map(Number);
                          const [eh, em] = end.split(":").map(Number);

                          const current = new Date();
                          current.setHours(sh, sm, 0, 0);

                          const last = new Date();
                          last.setHours(eh, em, 0, 0);

                          while (current <= last) {
                            const h = String(current.getHours()).padStart(2, "0");
                            const m = String(current.getMinutes()).padStart(2, "0");
                            times.push(`${h}:${m}`);
                            current.setMinutes(current.getMinutes() + 30);
                          }

                          return times;
                        };

                        let start = "09:00";
                        let end = "12:00";

                        if (formData.assignmentSlot === "Afternoon") {
                          start = "12:00";
                          end = "17:00";
                        } else if (formData.assignmentSlot === "Evening") {
                          start = "17:00";
                          end = "20:00";
                        }

                        const times = generateTimes(start, end);

                        return times.map((t) => {
                          const isSelected = formData.assignmentTime === t;

                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  assignmentTime: t,
                                }))
                              }
                              style={{
                                padding: "10px",
                                borderRadius: "8px",
                                border: "1px solid #000000",
                                background: isSelected ? "#000" : "#fff",
                                color: isSelected ? "#fff" : "#000",
                                cursor: "pointer",
                                fontWeight: 600,
                              }}
                            >
                              {t}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
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
                    backgroundColor: isSubmitting ? "#ccccccff" : "#000000",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: "all 0.2s",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}
