"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    company: "",
    sector: "",
    natureOfBusiness: "",
    country: "",
    renewableEnergy: "",
    totalEnergy: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }
      if (!formData.mobile.trim()) {
        newErrors.mobile = "Mobile is required";
      }
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }
    } else if (step === 2) {
      if (!formData.company.trim()) {
        newErrors.company = "Company is required";
      }
      if (!formData.sector.trim()) {
        newErrors.sector = "Sector is required";
      }
      if (!formData.natureOfBusiness.trim()) {
        newErrors.natureOfBusiness = "Nature of Business is required";
      }
    } else if (step === 3) {
      if (!formData.country.trim()) {
        newErrors.country = "Country is required";
      }
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
    // Validate all steps
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    // Build query string from form data
    const params = new URLSearchParams();
    Object.entries(formData).forEach(([key, value]) => {
      params.append(key, value);
    });

    // Navigate to review page with form data as query parameters
    router.push(`/review?${params.toString()}`);
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
        style={{
          width: "100%",
          maxWidth: "600px",
          border: "2px solid #FF6B35",
          borderRadius: "12px",
          padding: "40px",
          backgroundColor: "#1a1a1a",
          boxShadow: "0 8px 32px rgba(255, 107, 53, 0.2)",
        }}
      >
        <h1
          style={{
            color: "#FFFFFF",
            marginBottom: "8px",
            fontSize: "32px",
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          Application Form
        </h1>
        <p
          style={{
            color: "#E5E5E5",
            marginBottom: "24px",
            textAlign: "center",
            fontSize: "15px",
          }}
        >
          Please fill in all the required information below
        </p>

        {/* Step Indicator */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "32px",
            position: "relative",
          }}
        >
          {[1, 2, 3, 4].map((step) => (
            <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor:
                    currentStep === step
                      ? "#FF6B35"
                      : currentStep > step
                      ? "#4CAF50"
                      : "#2f2f2f",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  fontSize: "16px",
                  border: "2px solid",
                  borderColor:
                    currentStep === step
                      ? "#FF6B35"
                      : currentStep > step
                      ? "#4CAF50"
                      : "#2f2f2f",
                  transition: "all 0.3s",
                  zIndex: 2,
                }}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  style={{
                    flex: 1,
                    height: "2px",
                    backgroundColor:
                      currentStep > step ? "#4CAF50" : "#2f2f2f",
                    margin: "0 8px",
                    transition: "all 0.3s",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "32px",
            padding: "0 10px",
          }}
        >
          <span
            style={{
              color: currentStep === 1 ? "#FF6B35" : "#666666",
              fontSize: "12px",
              fontWeight: currentStep === 1 ? "600" : "400",
              textAlign: "center",
              flex: 1,
            }}
          >
            Personal
          </span>
          <span
            style={{
              color: currentStep === 2 ? "#FF6B35" : "#666666",
              fontSize: "12px",
              fontWeight: currentStep === 2 ? "600" : "400",
              textAlign: "center",
              flex: 1,
            }}
          >
            Company
          </span>
          <span
            style={{
              color: currentStep === 3 ? "#FF6B35" : "#666666",
              fontSize: "12px",
              fontWeight: currentStep === 3 ? "600" : "400",
              textAlign: "center",
              flex: 1,
            }}
          >
            Country
          </span>
          <span
            style={{
              color: currentStep === 4 ? "#FF6B35" : "#666666",
              fontSize: "12px",
              fontWeight: currentStep === 4 ? "600" : "400",
              textAlign: "center",
              flex: 1,
            }}
          >
            Energy
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {/* Step 1: Personal Details */}
            {currentStep === 1 && (
              <>
                {/* Name */}
                <div>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Name <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.name
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.name && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
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
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Mobile <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.mobile
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.mobile && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
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
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Email <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.email
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.email && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.email}
                </p>
              )}
            </div>
              </>
            )}

            {/* Step 2: Company Details */}
            {currentStep === 2 && (
              <>
                {/* Company */}
                <div>
              <label
                htmlFor="company"
                style={{
                  display: "block",
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Company <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.company
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.company && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.company}
                </p>
              )}
            </div>

            {/* Sector */}
            <div>
              <label
                htmlFor="sector"
                style={{
                  display: "block",
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Sector <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.sector
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.sector && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.sector}
                </p>
              )}
            </div>

            {/* Nature of Business */}
            <div>
              <label
                htmlFor="natureOfBusiness"
                style={{
                  display: "block",
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Nature of Business <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.natureOfBusiness
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.natureOfBusiness && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.natureOfBusiness}
                </p>
              )}
            </div>
              </>
            )}

            {/* Step 3: Country */}
            {currentStep === 3 && (
              <>
                {/* Country */}
                <div>
              <label
                htmlFor="country"
                style={{
                  display: "block",
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Country <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.country
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.country && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.country}
                </p>
              )}
            </div>
              </>
            )}

            {/* Step 4: Renewable Energy and Total Energy */}
            {currentStep === 4 && (
              <>
                {/* Renewable Energy */}
                <div>
              <label
                htmlFor="renewableEnergy"
                style={{
                  display: "block",
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Renewable Energy (kWh) <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.renewableEnergy
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.renewableEnergy && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.renewableEnergy}
                </p>
              )}
            </div>

            {/* Total Energy */}
            <div>
              <label
                htmlFor="totalEnergy"
                style={{
                  display: "block",
                  color: "#B5B5B5",
                  fontSize: "14px",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Total Energy (kWh) <span style={{ color: "#FF6B35" }}>*</span>
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
                    : "1px solid #2f2f2f",
                  backgroundColor: "#202020",
                  color: "#FFFFFF",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B35";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.totalEnergy
                    ? "#ff4444"
                    : "#2f2f2f";
                }}
              />
              {errors.totalEnergy && (
                <p style={{ color: "#ff4444", fontSize: "12px", marginTop: "4px" }}>
                  {errors.totalEnergy}
                </p>
              )}
            </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "8px",
              }}
            >
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrevious}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    borderRadius: "8px",
                    border: "1px solid #444444",
                    backgroundColor: "transparent",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  Previous
                </button>
              )}
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: "#FF6B35",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    flex: 1,
                    padding: "14px 24px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: isSubmitting ? "#999999" : "#FF6B35",
                    color: "#FFFFFF",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    boxShadow: isSubmitting
                      ? "none"
                      : "0 4px 12px rgba(255, 107, 53, 0.3)",
                    transition: "all 0.2s",
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit & Review"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
