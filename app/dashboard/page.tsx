"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderOne } from "@/components/ui/loader";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to tasks page
    router.replace("/dashboard/tasks");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoaderOne />
        <p className="mt-4 text-gray-600">Redirecting to tasks...</p>
      </div>
    </div>
  );
}