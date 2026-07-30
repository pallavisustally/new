"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Slot booking was removed. Keep this route so old bookmarks / stale clients
 * still land on the assessment instead of a 404.
 */
function RedirectToScope() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.get("assessmentId")) {
      params.set(
        "assessmentId",
        Math.random().toString(36).substring(2, 10).toUpperCase()
      );
    }
    router.replace(`/scope?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
}

export default function ChooseTimeRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      }
    >
      <RedirectToScope />
    </Suspense>
  );
}
