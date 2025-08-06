"use client";

import { cn } from "@/lib/utils";

export function LoaderOne({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-4 border-gray-200"></div>
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin absolute top-0 left-0"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="/zenn.png" 
            alt="Zenchron" 
            className="h-6 w-6 opacity-80 rounded-md"
          />
        </div>
      </div>
    </div>
  );
}