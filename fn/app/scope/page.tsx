"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type YesNo = "Yes" | "No" | "";

type FormDataType = {
  // User Identity (Passed from previous steps)
  userName: string;
  userEmail: string;
  userMobile: string;
  userCompany: string;

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
  unitConsumption: string;
  spendAmount: string;
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
  const searchParams = useSearchParams();
  const [page, setPage] = useState<1 | 2>(1);

  const [formData, setFormData] = useState<FormDataType>({
    // Identity - Initialize from Search Params
    userName: searchParams.get("name") || "",
    userEmail: searchParams.get("email") || "",
    userMobile: searchParams.get("mobile") || "",
    userCompany: searchParams.get("company") || "",

    // Page 1
    state: "",
    siteCount: (() => {
      const count = searchParams.get("siteCount");
      const number = searchParams.get("siteCountNumber");
      if (count === "Multiple sites" && number) {
        return number;
      }
      return "1"; // Default for Single Site
    })(),
    facilityName: "",

    renewableProcurement: "",
    onsiteExportedKwh: "",
    netMeteringApplicable: "",

    reportingYear: new Date(),
    reportingPeriod: "Annually", // Updated to match type
    conditionalApproach: "Operational Control",

    scopeBoundaryNotes: "",

    // Page 2 - Box 1
    energyActivityInput: "Monthly",
    energyCategory: "",
    unitConsumption: "",
    spendAmount: "",
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
    if (page === 1) {
      if (!formData.state?.trim()) newErrors.state = "State is required";
      if (!formData.siteCount?.trim()) newErrors.siteCount = "Site Count is required";
      // Facility Name optional per image? "Based on your earlier input" placeholder
      if (!formData.facilityName?.trim()) newErrors.facilityName = "Facility Name is required";
      if (!formData.renewableProcurement) newErrors.renewableProcurement = "Please select an option";
      // Onsite generation might be optional or 0 allowed
      // if (!formData.onsiteExportedKwh?.trim()) newErrors.onsiteExportedKwh = "Required";
      if (!formData.netMeteringApplicable) newErrors.netMeteringApplicable = "Please select an option";
      if (!formData.reportingYear) newErrors.reportingYear = "Reporting Year is required";
      if (!formData.reportingPeriod) newErrors.reportingPeriod = "Reporting Period is required";
      if (!formData.conditionalApproach) newErrors.conditionalApproach = "Conditional Approach is required";
      // Notes usually optional
    }

    if (page === 2) {
      // Page 2 validations
      if (!formData.energyActivityInput) newErrors.energyActivityInput = "Required";
      // Category might be pre-filled
      if (!formData.energyCategory?.trim()) newErrors.energyCategory = "Required";
      if (!formData.trackingType) newErrors.trackingType = "Required";

      if (formData.trackingType === "Unit consumption" || formData.trackingType === "Both") {
        if (!formData.unitConsumption?.trim()) newErrors.unitConsumption = "Required";
      }
      if (formData.trackingType === "Spend amount" || formData.trackingType === "Both") {
        if (!formData.spendAmount?.trim()) newErrors.spendAmount = "Required";
      }

      if (!formData.hasRenewableElectricity) newErrors.hasRenewableElectricity = "Required";

      // Conditional validations for renewable electricity
      if (formData.hasRenewableElectricity === "Yes") {
        if (!formData.renewableElectricity?.trim()) newErrors.renewableElectricity = "Required";
        if (!formData.renewableEnergyConsumption?.trim()) newErrors.renewableEnergyConsumption = "Required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      setPage(2);
      window.scrollTo(0, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // Prepare data for API (convert File objects to filenames)
      // Prepare data for API (FormData)
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value);
        } else if (value !== null && value !== undefined) {
          // Handle Date objects explicitly if needed, but String() usually works for ISO if not careful.
          // Here reportingYear is a Date. String(date) gives full text. toISOString is better for machines.
          if (value instanceof Date) {
            formDataToSend.append(key, value.toISOString());
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      // Save to Payload CMS (Directly to Sustally)
      const apiUrl = process.env.NEXT_PUBLIC_SUSTALLY_API_URL || "http://localhost:3001";
      // NOTE: Do NOT set Content-Type header when sending FormData, the browser sets it with boundary
      const saveResponse = await fetch(`${apiUrl}/api/save-scope2`, {
        method: "POST",
        body: formDataToSend,
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

  const renderYesNo = (name: keyof FormDataType, value: YesNo) => (
    <div className="flex bg-gray-50 p-1 rounded-lg w-full border border-gray-200">
      <button
        type="button"
        onClick={() => handleRadioChange(name, "Yes")}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${value === "Yes"
          ? "bg-[#a802d1] text-white shadow-sm"
          : "text-gray-500 hover:text-gray-900"
          }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => handleRadioChange(name, "No")}
        className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${value === "No"
          ? "bg-[#a802d1] text-white shadow-sm"
          : "text-gray-500 hover:text-gray-900"
          }`}
      >
        No
      </button>
    </div>
  );

  return (
    <div className="h-screen overflow-hidden bg-white text-gray-900 font-sans selection:bg-indigo-100 flex flex-col">
      <div className="w-full max-w-[1400px] mx-auto p-4 flex flex-col flex-grow h-full">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-1 gap-2 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-indigo-100">
                • Scope 2 Assessment
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Scope 2 self-assessment
            </h1>
            <p className="text-gray-500 mt-1 text-xs">
              Share a few basic details. Takes about 2 minutes.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-indigo-900 tracking-widest uppercase">
                {page === 1 ? "2 OF 6 - BOUNDARIES" : "3 OF 6 - ENERGY INPUTS"}
              </span>
              <span className="text-sm font-bold text-gray-400">
                {page === 1 ? "34%" : "51%"}
              </span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 transition-all duration-500 ease-out rounded-full"
                style={{ width: page === 1 ? "34%" : "51%" }}
              ></div>
            </div>
          </div>

          <div className="flex items-center gap-4 opacity-90">
            <img
              src="/sustally-logo.png"
              alt="sustally"
              className="h-8 md:h-10 w-auto object-contain"
            />
            <div className="hidden md:flex gap-1 h-8 md:h-10">
              <div className="w-[1px] bg-gray-200 h-full"></div>
            </div>
            <span className="hidden md:block font-medium text-gray-400 text-xs max-w-[120px] leading-tight text-left">
              Choose Sustally as your sustainability ally
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow flex flex-col">

          {/* ===================== PAGE 1 ===================== */}
          {page === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-1 flex-grow overflow-hidden min-h-0">

              {/* Box 1: Define Reporting Boundary */}
              <section className="bg-white rounded-xl p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-4 mb-2">
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 border-b-2 border-transparent hover:border-indigo-100 transition-colors cursor-default">
                    Define your reporting boundary
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* State */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      State / Grid Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-gray-600"
                    >
                      <option value="">Select grid region...</option>
                      <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                      <option value="Andhra Pradesh">Andhra Pradesh</option>
                      <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                      <option value="Assam">Assam</option>
                      <option value="Bihar">Bihar</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Chhattisgarh">Chhattisgarh</option>
                      <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Goa">Goa</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Haryana">Haryana</option>
                      <option value="Himachal Pradesh">Himachal Pradesh</option>
                      <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                      <option value="Jharkhand">Jharkhand</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Kerala">Kerala</option>
                      <option value="Ladakh">Ladakh</option>
                      <option value="Lakshadweep">Lakshadweep</option>
                      <option value="Madhya Pradesh">Madhya Pradesh</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Manipur">Manipur</option>
                      <option value="Meghalaya">Meghalaya</option>
                      <option value="Mizoram">Mizoram</option>
                      <option value="Nagaland">Nagaland</option>
                      <option value="Odisha">Odisha</option>
                      <option value="Puducherry">Puducherry</option>
                      <option value="Punjab">Punjab</option>
                      <option value="Rajasthan">Rajasthan</option>
                      <option value="Sikkim">Sikkim</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Tripura">Tripura</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="Uttarakhand">Uttarakhand</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Select the grid region where this site operates
                    </p>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                  </div>

                  {/* Site Count */}
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Site count
                    </label>
                    <input
                      type="text"
                      name="siteCount"
                      value={formData.siteCount || ""}
                      onChange={handleChange}
                      placeholder="Site 1"
                      className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Based on your earlier input
                    </p>
                    {errors.siteCount && <p className="text-red-500 text-xs mt-1">{errors.siteCount}</p>}
                  </div>

                  {/* Facility Name */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Facility / Site name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="facilityName"
                      value={formData.facilityName || ""}
                      onChange={handleChange}
                      placeholder="e.g., Pune Manufacturing Plant"
                      className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Based on your earlier input
                    </p>
                  </div>
                </div>
              </section>

              {/* Box 2: Electricity Characteristics */}
              <section className="bg-white rounded-xl p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-yellow-50 rounded-lg text-yellow-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Electricity characteristics
                  </h2>
                </div>
                <p className="text-[9px] text-gray-400 -mt-2 mb-3 ml-9">
                  Basic yes/no context — detailed data will be captured later
                </p>

                <div className="space-y-2">
                  {/* Renewable procurement */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Do you have renewable electricity procurement?
                    </label>
                    {renderYesNo("renewableProcurement", formData.renewableProcurement)}
                    {errors.renewableProcurement && <p className="text-red-500 text-xs mt-1">{errors.renewableProcurement}</p>}
                  </div>

                  {/* On-site generation */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      On-site generation exported (kWh)
                    </label>
                    <input
                      type="text"
                      name="onsiteExportedKwh"
                      value={formData.onsiteExportedKwh || ""}
                      onChange={handleChange}
                      placeholder="Enter kWh value"
                      className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                    <p className="text-[10px] text-gray-400 mt-1.5">
                      Based on your earlier input
                    </p>
                  </div>

                  {/* Net metering */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Net metering applicable?
                    </label>
                    {renderYesNo("netMeteringApplicable", formData.netMeteringApplicable)}
                    {errors.netMeteringApplicable && <p className="text-red-500 text-xs mt-1">{errors.netMeteringApplicable}</p>}
                  </div>
                </div>
              </section>

              {/* Box 3: Reporting Period */}
              <section className="bg-white rounded-xl p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Reporting period
                  </h2>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Year */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Reporting year <span className="text-red-500">*</span>
                      </label>
                      <DatePicker
                        selected={formData.reportingYear}
                        onChange={(date: Date | null) =>
                          setFormData((prev) => ({ ...prev, reportingYear: date }))
                        }
                        showYearPicker
                        dateFormat="yyyy"
                        wrapperClassName="w-full"
                        customInput={
                          <button
                            type="button"
                            className="w-full flex justify-between items-center px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                          >
                            {formData.reportingYear?.getFullYear() || "Select Year"}
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        }
                      />
                    </div>
                    {/* Period */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Reporting period <span className="text-red-500">*</span>
                      </label>
                      <div className="flex text-[10px] font-medium bg-gray-50 border border-gray-200 rounded-lg p-1">
                        {["Monthly", "Quarterly", "Annually"].map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, reportingPeriod: p as any }))}
                            className={`flex-1 py-2 rounded text-center transition-all ${formData.reportingPeriod === p
                              ? "bg-[#a802d1] text-white shadow-sm"
                              : "text-gray-500 hover:text-gray-900"
                              }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Consolidation Approach */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-3">
                      Consolidation approach
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {[
                        { id: "Operational Control", label: "Operational control", sub: "Default approach for most organizations", default: true },
                        { id: "Equity Share", label: "Equity share", sub: "Based on ownership percentage" },
                        { id: "Financial Control", label: "Financial control", sub: "Based on financial authority" }
                      ].map((opt) => (
                        <div
                          key={opt.id}
                          className={`relative border rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-300 ${formData.conditionalApproach === opt.id
                            ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                            : "bg-white border-gray-200"
                            }`}
                          onClick={() => setFormData(prev => ({ ...prev, conditionalApproach: opt.id as any }))}
                        >
                          <div className="flex items-start gap-2">
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${formData.conditionalApproach === opt.id ? "border-indigo-600" : "border-gray-300"
                              }`}>
                              {formData.conditionalApproach === opt.id && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                            </div>
                            <div>
                              <p className={`text-xs font-bold ${formData.conditionalApproach === opt.id ? "text-indigo-900" : "text-gray-700"}`}>
                                {opt.label}  {opt.default && <span className="text-indigo-500 text-[10px] font-normal">(default)</span>}
                              </p>
                              <p className="text-[10px] text-gray-500 leading-tight mt-1">
                                {opt.sub}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-blue-400 mt-3 font-medium cursor-help">
                      This defines how emissions are attributed
                    </p>
                  </div>
                </div>
              </section>

              {/* Box 4: Boundary Notes */}
              <section className="bg-white rounded-xl p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg text-purple-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Boundary notes <span className="text-gray-400 font-normal ml-1">Optional</span>
                  </h2>
                </div>

                <div className="flex-grow flex flex-col">
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Scope boundary notes
                  </label>
                  <textarea
                    name="scopeBoundaryNotes"
                    value={formData.scopeBoundaryNotes}
                    onChange={handleChange}
                    placeholder="Any special considerations or exclusions?"
                    className="w-full flex-grow px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[40px]"
                  />
                </div>
              </section>

            </div>
          )}

          {/* ===================== PAGE 2 ===================== */}
          {page === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-1 flex-grow overflow-hidden min-h-0">


              {/* Box 1: Energy Activity */}
              <section className="bg-white rounded-xl p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Energy activity
                  </h2>
                </div>

                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Activity Input */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Energy activity input <span className="text-red-500">*</span>
                      </label>
                      <div className="flex bg-gray-50 p-1 rounded-lg border border-gray-200 w-fit">
                        {["Monthly", "Yearly"].map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, energyActivityInput: m as any }))}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${formData.energyActivityInput === m
                              ? "bg-white text-indigo-900 shadow-sm ring-1 ring-gray-100"
                              : "text-gray-400 hover:text-gray-600"
                              }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1.5">
                        Based on your earlier input
                      </p>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">
                        Energy category <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="energyCategory"
                        value={formData.energyCategory}
                        onChange={handleChange}
                        className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none text-gray-600"
                      >
                        <option value="">Select category...</option>
                        <option value="Grid Energy">Grid Energy</option>
                        <option value="Steam">Steam</option>
                        <option value="Heating">Heating</option>
                        <option value="Cooling">Cooling</option>
                      </select>
                      {errors.energyCategory && <p className="text-red-500 text-xs mt-1">{errors.energyCategory}</p>}
                    </div>
                  </div>

                  {/* Tracking Type */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Are you tracking <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      {[
                        { id: "Unit consumption", label: "UNIT CONSUMPTION" },
                        { id: "Spend amount", label: "SPEND AMOUNT" },
                        { id: "Both", label: "BOTH" }
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, trackingType: t.id as any }))}
                          className={`px-4 py-2 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all border ${formData.trackingType === t.id
                            ? "bg-[#a802d1] text-white border-[#a802d1]"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Inputs based on Tracking Type */}
                  <div className="grid grid-cols-2 gap-4">
                    {(formData.trackingType === "Unit consumption" || formData.trackingType === "Both") && (
                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Unit Consumption (kWh) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="unitConsumption"
                          value={formData.unitConsumption || ""}
                          onChange={handleChange}
                          placeholder="Enter kWh"
                          className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {errors.unitConsumption && <p className="text-red-500 text-xs mt-1">{errors.unitConsumption}</p>}
                      </div>
                    )}

                    {(formData.trackingType === "Spend amount" || formData.trackingType === "Both") && (
                      <div className="col-span-1">
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Spend Amount <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="spendAmount"
                          value={formData.spendAmount || ""}
                          onChange={handleChange}
                          placeholder="Enter amount"
                          className="w-full px-2 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {errors.spendAmount && <p className="text-red-500 text-xs mt-1">{errors.spendAmount}</p>}
                      </div>
                    )}
                  </div>

                  {/* Supporting Evidence Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Supporting evidence
                    </label>
                    <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group relative">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setFormData(prev => ({ ...prev, energySupportingEvidenceFile: e.target.files?.[0] || null }))}
                      />
                      <div className="bg-indigo-100 p-2.5 rounded-full mb-3 group-hover:scale-110 transition-transform">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-400 mt-1">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2">
                      Uploading bills improves data confidence.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Energy source description
                    </label>
                    <textarea
                      placeholder="Describe the energy source or any relevant details..."
                      className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[40px]"
                    />
                  </div>
                </div>
              </section>

              {/* Box 2: Renewable Electricity */}
              <section className="bg-white rounded-xl p-2 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col h-full overflow-y-auto">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Renewable electricity
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Do you have renewable? */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-xs font-bold text-gray-700">
                        Do you have renewable electricity?
                      </label>
                    </div>
                    {renderYesNo("hasRenewableElectricity", formData.hasRenewableElectricity)}
                  </div>

                  {formData.hasRenewableElectricity === "Yes" && (
                    <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Renewable electricity
                        </label>
                        <input
                          type="text"
                          name="renewableElectricity"
                          value={formData.renewableElectricity || ""}
                          onChange={handleChange}
                          placeholder="Enter value"
                          className="w-full px-2 py-1 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <div className="flex justify-end -mt-6 mr-2 pointer-events-none">
                          <span className="text-[10px] text-gray-400">kWh</span>
                        </div>
                        {errors.renewableElectricity && <p className="text-red-500 text-xs mt-1">{errors.renewableElectricity}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2">
                          Energy Consumption <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="renewableEnergyConsumption"
                          value={formData.renewableEnergyConsumption || ""}
                          onChange={handleChange}
                          placeholder="Enter value"
                          className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        {errors.renewableEnergyConsumption && <p className="text-red-500 text-xs mt-1">{errors.renewableEnergyConsumption}</p>}
                      </div>
                    </div>
                  )}

                  {/* Supporting Evidence Upload */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Supporting evidence
                    </label>
                    <div className="border border-dashed border-gray-200 rounded-xl bg-gray-50/50 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group relative h-28">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setFormData(prev => ({ ...prev, renewableSupportingEvidenceFile: e.target.files?.[0] || null }))}
                      />
                      <div className="bg-green-100 p-2 rounded-full mb-2 group-hover:scale-110 transition-transform">
                        <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        PDF, JPG, PNG up to 10MB
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">
                      Energy source description
                    </label>
                    <textarea
                      name="renewableEnergySourceDescription"
                      value={formData.renewableEnergySourceDescription || ""}
                      onChange={handleChange}
                      placeholder="Describe renewable energy source..."
                      className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none min-h-[60px]"
                    />
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Footer Actions */}
          {/* Footer Actions */}
          <div className="pt-1 pb-1 mt-auto flex justify-between items-center border-t border-gray-100 flex-shrink-0 bg-white">
            <div className="flex-1">
              {page === 1 ? (
                <p className="text-[10px] text-gray-400">
                  You can edit these details later
                </p>
              ) : (
                <p className="text-[10px] text-gray-400 hover:underline cursor-pointer">
                  You can edit this later.
                </p>
              )}
            </div>

            <div className="flex gap-4">
              {page === 2 && (
                <button
                  type="button"
                  onClick={() => { setPage(1); window.scrollTo(0, 0); }}
                  className="px-6 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm"
                >
                  Back
                </button>
              )}

              <button
                type="button"
                onClick={page === 1 ? handleNext : (e) => handleSubmit(e as any)}
                disabled={isSubmitting}
                className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {page === 1 ? (
                  <>
                    Next: Electricity data
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </>
                ) : (
                  isSubmitting ? "Submitting..." : "Next: Review & submit"
                )}
              </button>
            </div>
          </div>

        </form>
      </div >
    </div >
  );
}
