"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CostSavingCard from "./CostSavingCard";

function mapApplicationToUser(application: any) {
  return {
    name: application.userName || "",
    facilityName: application.facilityName,
    userCompany: application.userCompany,
    email: application.email || application.userEmail,
    id: application.id,
    certificateId: application.certificateId,
    sector: application.sector,
    natureOfBusiness: application.natureOfBusiness,
    state: application.state,
    siteCount: application.siteCount,
    energyIntensityPerRupee: application.energyIntensityPerRupee,
    reportingYear: application.reportingYear,
    reportingPeriod: application.reportingPeriod,
    scopeBoundaryNotes: application.scopeBoundaryNotes,
    energyConsumption: application.energyConsumption,
    renewableElectricity: application.renewableElectricity,
    renewableEnergyConsumption: application.renewableEnergyConsumption,
    onsiteExportedKwh: application.onsiteExportedKwh,
    gridEmissionFactor: application.gridEmissionFactor,
    locationBasedEmissions: application.locationBasedEmissions,
    marketBasedEmissions: application.marketBasedEmissions,
    energyGrid_kJ: application.energyGrid_kJ,
    energyRenew_kJ: application.energyRenew_kJ,
    energyTotal_kJ: application.energyTotal_kJ,
    monthlyData: application.monthlyData,
    renewableMonthlyData: application.renewableMonthlyData,
    renewableEnergyActivityInput: application.renewableEnergyActivityInput,
    dataSourceType: application.dataSourceType,
    renewableDataSourceType: application.renewableDataSourceType,
    electricityPurchased: application.electricityPurchased,
    spendAmount: application.spendAmount,
    trackingType: application.trackingType,
    energyActivityInput: application.energyActivityInput,
    hasRenewableElectricity: application.hasRenewableElectricity,
  };
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<"LOADING" | "RESTRICTED" | "DASHBOARD">("LOADING");
  const email = (searchParams.get("email") || "").trim().toLowerCase();
  const [error, setError] = useState("");
  const [userData, setUserData] = useState<any>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_SUSTALLY_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:3001";

  useEffect(() => {
    let cancelled = false;

    const openDashboard = async () => {
      // No OTP — open directly from email link or existing session
      const storedUser = sessionStorage.getItem("scope2_user");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (cancelled) return;
          setUserData(parsed);
          if (searchParams.get("view") === "dashboard") {
            setStep("DASHBOARD");
          } else {
            const certificateParams = new URLSearchParams();
            const sessionEmail = (parsed.email || email || "").trim();
            if (sessionEmail) certificateParams.set("email", sessionEmail);
            router.replace(`/scope/certificate${certificateParams.toString() ? `?${certificateParams.toString()}` : ""}`);
          }
          return;
        } catch {
          sessionStorage.removeItem("scope2_user");
        }
      }

      if (!email) {
        if (!cancelled) setStep("RESTRICTED");
        return;
      }

      try {
        const query = new URLSearchParams({
          "where[email][equals]": email,
          limit: "1",
          sort: "-createdAt",
        });
        const res = await fetch(`${API_URL}/api/scope2-applications?${query.toString()}`);
        const data = await res.json();

        if (!res.ok || !data?.docs?.length) {
          if (!cancelled) {
            setError("No assessment found for this email.");
            setStep("RESTRICTED");
          }
          return;
        }

        const user = mapApplicationToUser(data.docs[0]);
        sessionStorage.setItem("scope2_user", JSON.stringify(user));
        if (cancelled) return;

        setUserData(user);
        if (searchParams.get("view") === "dashboard") {
          setStep("DASHBOARD");
        } else {
          const certificateParams = new URLSearchParams();
          if (email) certificateParams.set("email", email);
          router.replace(`/scope/certificate${certificateParams.toString() ? `?${certificateParams.toString()}` : ""}`);
        }
      } catch {
        if (!cancelled) {
          setError("Something went wrong. Please try again.");
          setStep("RESTRICTED");
        }
      }
    };

    openDashboard();
    return () => {
      cancelled = true;
    };
  }, [API_URL, email, router, searchParams]);

  const handleLogout = () => {
    setUserData(null);
    sessionStorage.removeItem("scope2_user");
    router.push("/");
  };

  if (step === "LOADING") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (step === "RESTRICTED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-gray-500 text-sm mb-6">
            Open this page using the dashboard link sent to your email after submitting the assessment.
          </p>
          {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <span className="font-bold text-indigo-600 text-xl">Sustally Dashboard</span>
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {userData?.name || "User"}!
          </h2>
          <CostSavingCard userData={userData} />
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
