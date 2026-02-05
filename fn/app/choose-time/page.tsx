"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Modal from "../../components/Modal"; // Adjust path as needed based on file structure

// Reusing Icons from Page 1
const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-indigo-100">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
);

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
);

const CloudIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

// We need Next 1 Day (Tomorrow) and 2nd Date from present.
const getFutureDate = (daysToAdd: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date;
};

const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric' }).format(date); // e.g. January 28, 2026
};

const formatDayOfWeek = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date); // e.g. Wednesday
}

type ShiftType = "Morning" | "Afternoon" | "Evening";

const timeSlotsByShift: Record<ShiftType, string[]> = {
    Morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
    Afternoon: ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM"],
    Evening: ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM"]
};

const shifts: { label: ShiftType; icon: React.ReactNode }[] = [
    { label: "Morning", icon: <SunIcon /> },
    { label: "Afternoon", icon: <CloudIcon /> },
    { label: "Evening", icon: <MoonIcon /> }
];

function ChooseTimeContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(0);
    const [selectedShift, setSelectedShift] = useState<ShiftType | null>(null);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
    const [assessmentId] = useState(() => Math.random().toString(36).substring(2, 10).toUpperCase());


    // Dates: Tomorrow (1 day) and Day After (2 days)
    const date1 = getFutureDate(1);
    const date2 = getFutureDate(2);

    const dates = [
        { label: "Tomorrow", date: date1, id: 0 },
        { label: formatDayOfWeek(date2), date: date2, id: 1 }
    ];

    const handleDateSelect = (index: number) => {
        setSelectedDateIndex(index);
        setSelectedTime(null);
        // We can keep the shift or reset it. Let's keep it for better UX.
    };

    const handleShiftSelect = (shift: ShiftType) => {
        setSelectedShift(shift);
        setSelectedTime(null); // Reset time when shift changes
    }

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
    };

    const handleConfirmBooking = async () => {
        if (selectedDateIndex !== null && selectedTime) {

            const assignmentDate = formatDate(dates[selectedDateIndex].date);
            const assignmentTime = selectedTime;

            // Construct data object locally since we mostly need to pass it to the backend
            // For the email body, we read from searchParams AND the newly selected date/time
            const renewableEnergyStr = searchParams.get("renewableEnergy") || "0";
            const totalEnergyStr = searchParams.get("totalEnergy") || "0";
            const renewableEnergy = parseFloat(renewableEnergyStr.replace(/[^\d.]/g, "")) || 0;
            const totalEnergy = parseFloat(totalEnergyStr.replace(/[^\d.]/g, "")) || 0;
            const renewablePercentage = totalEnergy > 0
                ? parseFloat(((renewableEnergy / totalEnergy) * 100).toFixed(2))
                : 0;

            // Construct Assessment Link
            // Use window.location.origin to get the base URL
            const currentParams = new URLSearchParams(searchParams.toString());
            currentParams.append("assessmentId", assessmentId);
            const assessmentLink = `${window.location.origin}/scope?${currentParams.toString()}`;

            // Calculate Expire Time
            // "based on the slot" - sending the slot time as the expiry/reference time
            const expireTime = `${assignmentDate} at ${assignmentTime}`;

            const dataToSend = {
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
                assignmentDate: assignmentDate,
                assignmentSlot: assignmentTime, // using time as slot for now
                assignmentTime: assignmentTime,
                assessmentId: assessmentId,
                assessmentLink: assessmentLink,
                expireTime: expireTime
            };

            setIsSendingEmail(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
                const response = await fetch(`${apiUrl}/api/send-email`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(dataToSend),
                });

                let result;
                try {
                    result = await response.json();
                } catch (parseError) {
                    console.error("Failed to parse response:", parseError);
                    setNotification({
                        message: "Failed to send email: Invalid response from server.",
                        type: "error"
                    });
                    return;
                }

                if (response.ok && result.success) {
                    setIsSuccess(true);
                } else {
                    const errorMessage = result.error || result.message || `Server error (${response.status})`;
                    setNotification({ message: `Failed to send email: ${errorMessage}`, type: "error" });
                }
            } catch (error) {
                console.error("Error sending email:", error);
                setNotification({
                    message: "Failed to send email. Please check your connection.",
                    type: "error"
                });
            } finally {
                setIsSendingEmail(false);
            }
        }
    };

    if (isSuccess) {
        return (
            <main
                style={{
                    minHeight: "100vh",
                    backgroundColor: "#fff",
                    padding: "40px 20px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    position: "relative"
                }}
            >
                {/* Header with Logo at Top Right */}
                <div style={{
                    position: "absolute",
                    top: "40px",
                    right: "40px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end"
                }}>
                    <div className="flex items-center gap-2 opacity-80">
                        <img
                            src="/sustally-logo.png"
                            alt="sustally"
                            className="h-12 w-auto object-contain"
                        />
                        <div className="hidden md:flex gap-1 h-8 md:h-10">
                            <div className="w-[1px] bg-gray-200 h-full"></div>
                        </div>
                        <span className="font-medium text-gray-800 text-sm max-w-[200px] leading-tight text-left">
                            choose sustally as your sustainability ally
                        </span>
                    </div>
                </div>

                <div
                    style={{
                        width: "100%",
                        maxWidth: "1000px",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "24px",
                        marginTop: "auto",
                        marginBottom: "auto"
                    }}
                >
                    {/* Success Checkmark with Glow */}
                    <div style={{ position: "relative", marginBottom: "10px" }}>
                        <div style={{
                            width: "80px",
                            height: "80px",
                            borderRadius: "50%",
                            backgroundColor: "#E8F5E9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 0 30px rgba(76, 175, 80, 0.2)"
                        }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                    </div>

                    <h2 style={{
                        fontSize: "32px",
                        fontWeight: "700",
                        color: "#1a1a1a",
                        marginBottom: "8px",
                        lineHeight: "1.2"
                    }}>
                        Thank you! Your assessment slot is booked.
                    </h2>

                    <p style={{
                        fontSize: "16px",
                        color: "#666",
                        maxWidth: "400px",
                        margin: "0 auto 30px"
                    }}>
                        Please check your email for the assessment link.
                    </p>

                    {/* Booking Time Card */}
                    <div style={{
                        backgroundColor: "#f8f9fa",
                        border: "1px solid #e9ecef",
                        borderRadius: "12px",
                        padding: "20px 30px",
                        display: "flex",
                        alignItems: "center",
                        gap: "20px",
                        marginBottom: "30px"
                    }}>
                        <div style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "#FFE0B2",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F57C00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: "14px", color: "#666", marginBottom: "4px" }}>
                                {selectedDateIndex !== null ? formatDate(dates[selectedDateIndex].date) : ""}
                            </div>
                            <div style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                                {selectedTime}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        fontSize: "20px",
                        fontWeight: "600",
                        color: "#333",
                        marginBottom: "40px",
                        letterSpacing: "0.5px"
                    }}>
                        Assessment ID: {assessmentId}
                    </div>

                    {/* Email Confirmation Banner */}
                    <div style={{
                        backgroundColor: "#F1F8E9",
                        borderRadius: "8px",
                        padding: "16px 24px",
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        maxWidth: "600px",
                        width: "100%",
                        border: "1px solid #C8E6C9"
                    }}>
                        <div style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: "#2E7D32",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <p style={{ fontSize: "14px", fontWeight: "600", color: "#2E7D32", margin: "0 0 4px 0" }}>
                                A confirmation and assessment link has been sent to your registered contact email.
                            </p>
                            <p style={{ fontSize: "12px", color: "#558B2F", margin: 0 }}>
                                Check your inbox (and spam folder) for the access link.
                            </p>
                        </div>
                    </div>
                </div>
                {/* Back to Home Button */}
                <div className="w-full max-w-[600px] mt-8 flex justify-center">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold transition-all"
                    >
                        Back to Home
                    </button>
                </div>
            </main>
        );
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 font-sans selection:bg-indigo-100 p-2 md:p-4 flex flex-col">
            {/* Notification Popup */}
            {notification && (
                <div
                    style={{
                        position: "fixed",
                        top: "10%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 10000,
                        backgroundColor: notification.type === "success" ? "#1a1a1a" : "#2a1a1a",
                        border: `2px solid ${notification.type === "success" ? "#4CAF50" : "#FF6B35"}`,
                        borderRadius: "16px",
                        padding: "16px 24px",
                        boxShadow: `0 8px 32px rgba(${notification.type === "success" ? "76, 175, 80" : "255, 107, 53"}, 0.4)`,
                        minWidth: "300px",
                        maxWidth: "500px",
                        animation: "slideIn 0.3s ease-out",
                        backdropFilter: "blur(10px)",
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <p style={{ margin: 0, color: "#FFFFFF", fontSize: "14px", fontWeight: "500" }}>{notification.message}</p>
                        <button
                            onClick={() => setNotification(null)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "#B5B5B5",
                                cursor: "pointer",
                                marginLeft: "auto"
                            }}
                        >✕</button>
                    </div>
                </div>
            )}

            <div className="w-full h-full max-w-7xl mx-auto flex flex-col">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-2 flex-shrink-0 gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                Scope 2 Assessment
                            </span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Book your Scope 2 self-assessment
                        </h1>
                        <p className="text-gray-500 mt-1 text-xs">
                            Select a convenient time for your assessment.
                        </p>
                    </div>

                    {/* Centered Progress Step */}
                    <div className="flex flex-col items-center justify-center">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                            Step 2 of 6 - Choose Time
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-1 w-32 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 w-[33%]"></div>
                            </div>
                            <span className="text-sm font-bold text-gray-400">33%</span>
                        </div>
                    </div>

                    <div className="mt-6 md:mt-0 flex flex-col items-end">
                        <div className="flex items-center gap-3 opacity-80">
                            <img
                                src="/sustally-logo.png"
                                alt="sustally"
                                className="h-12 w-auto object-contain"
                            />
                            <div className="flex gap-1 h-12">
                                <div className="w-[1px] bg-gray-300 h-full"></div>

                            </div>
                            <span className="font-medium text-gray-500 text-sm max-w-[200px] leading-tight text-left">
                                choose sustally as your sustainability ally
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

                    {/* Left Column: Date and Time Selection (Span 8) */}
                    <div className="lg:col-span-8 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 relative overflow-y-auto">
                        <div className="absolute top-6 left-6">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center">
                                <CalendarIcon />
                            </div>
                        </div>

                        <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-6 ml-14 pt-6">Select Date & Time</h2>

                        <div className="space-y-6">
                            {/* Date Selection */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Available Dates
                                </label>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {dates.map((d, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleDateSelect(index)}
                                            className={`flex-1 p-3 rounded-xl border text-left transition-all ${selectedDateIndex === index
                                                ? "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500"
                                                : "bg-white border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                                                }`}
                                        >
                                            <span className={`block text-[10px] font-bold uppercase mb-0.5 ${selectedDateIndex === index ? "text-indigo-600" : "text-gray-500"}`}>
                                                {d.label}
                                            </span>
                                            <span className={`block text-sm font-bold ${selectedDateIndex === index ? "text-gray-900" : "text-gray-700"}`}>
                                                {formatDate(d.date)}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Shift Selection */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Select Shift
                                </label>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {shifts.map((shift) => (
                                        <button
                                            key={shift.label}
                                            onClick={() => handleShiftSelect(shift.label)}
                                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-medium transition-all whitespace-nowrap ${selectedShift === shift.label
                                                ? "bg-purple-500 text-white border-gray-900 shadow-md"
                                                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                                }`}
                                        >
                                            <span className={selectedShift === shift.label ? "text-white" : "text-gray-400"}>
                                                {shift.icon}
                                            </span>
                                            {shift.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Time Selection */}
                            <div className="min-h-[150px]">
                                <label className="block text-xs font-medium text-gray-700 mb-2">
                                    Available Times {selectedShift && <span className="text-gray-400 font-normal">- {selectedShift}</span>}
                                </label>

                                {selectedShift ? (
                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                                        {timeSlotsByShift[selectedShift].map((time) => (
                                            <button
                                                key={time}
                                                onClick={() => handleTimeSelect(time)}
                                                className={`py-2 px-1 rounded-lg text-xs font-medium transition-all text-center border ${selectedTime === time
                                                    ? "bg-purple-500 text-white border-purple-600 shadow-md"
                                                    : "bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-purple-200"
                                                    }`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[120px] bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center p-4">
                                        <div className="text-gray-300 mb-1">
                                            <CalendarIcon />
                                        </div>
                                        <p className="text-gray-400 text-xs">Please select a shift to view available times</p>
                                    </div>
                                )}

                                {selectedShift && !selectedTime && (
                                    <p className="text-[10px] text-gray-400 mt-2 italic animate-pulse">
                                        * Select a time slot to proceed.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Terms and Conditions */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-gray-900 checked:bg-purple-500 group-hover:border-gray-400"
                                    />
                                    <svg
                                        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100 text-white w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={3}
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </div>
                                <span className="text-xs text-gray-600 group-hover:text-gray-900 transition-colors select-none">
                                    I agree to the <span
                                        className="underline decoration-dotted font-medium text-gray-800 hover:text-indigo-600 cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowTerms(true);
                                        }}
                                    >
                                        Terms and Conditions
                                    </span>
                                </span>
                            </label>
                        </div>

                        {/* Action Bar */}
                        <div className="flex justify-between items-center mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => router.back()}
                                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                            >
                                &larr; Back
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={!selectedTime || !termsAccepted || isSendingEmail}
                                className={`flex items-center gap-1.5 px-6 py-2 rounded-xl font-bold transition-all transform ${selectedTime && termsAccepted && !isSendingEmail
                                    ? "bg-purple-500 hover:bg-purple-500 text-white hover:scale-105 cursor-pointer shadow-lg text-sm"
                                    : "bg-purple-500 text-white cursor-not-allowed text-sm"
                                    }`}
                            >
                                {isSendingEmail ? "Booking..." : "Confirm Booking"}
                                {!isSendingEmail && <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>}
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Summary / Info (Span 4) */}
                    <div className="lg:col-span-4 flex flex-col gap-4">

                        {/* Selected Time Summary Card */}
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Your Selection</h3>

                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 text-gray-400 scale-90">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Date</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {selectedDateIndex !== null ? formatDate(dates[selectedDateIndex].date) : "Select a date"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2">
                                    <div className="mt-0.5 text-gray-400 scale-90">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Time</p>
                                        <p className="text-sm font-bold text-gray-900">
                                            {selectedTime || "Select a time"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Info Card */}
                        <div className="bg-indigo-50 rounded-3xl p-4 border border-indigo-100">
                            <div className="flex gap-2 mb-1">
                                <div className="p-1.5 bg-white rounded-lg h-fit text-indigo-600 shadow-sm scale-90">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-bold text-indigo-900 text-xs">Why is this important?</h4>
                                </div>
                            </div>
                            <p className="text-[10px] text-indigo-800 leading-relaxed ml-8">
                                Choosing a dedicated time ensures our experts can walk you through the assessment process efficiently.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
            {/* Terms and Conditions Modal */}
            <Modal
                isOpen={showTerms}
                onClose={() => setShowTerms(false)}
                title="Terms and Conditions"
            >
                <div className="text-sm text-gray-600 space-y-4">
                    <p>
                        <strong>1. Introduction</strong><br />
                        Welcome to Sustally. By using our services, you agree to these terms.
                    </p>
                    <p>
                        <strong>2. Booking Policy</strong><br />
                        All bookings are subject to availability. You may reschedule or cancel your appointment up to 24 hours before the scheduled time.
                    </p>
                    <p>
                        <strong>3. Scope of Assessment</strong><br />
                        The Scope 2 assessment is designed to evaluate your indirect energy emissions. Please ensure all data provided is accurate.
                    </p>
                    <p>
                        <strong>4. Privacy</strong><br />
                        Your data is handled according to our Privacy Policy. We do not share your information with third parties without consent.
                    </p>
                    <p>
                        <strong>5. Instructions</strong><br />
                        - Please arrive on time for your scheduled call.<br />
                        - Have your energy bills and usage data ready.<br />
                        - Ensure a stable internet connection.
                    </p>
                </div>
            </Modal>
        </div>
    );
}

export default function ChooseTimePage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ChooseTimeContent />
        </Suspense>
    );
}
