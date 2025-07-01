"use client";
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamic import with loading component for better performance
const HomePage = dynamic(() => import("@/components/page/home"), {
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading Telme...</p>
      </div>
    </div>
  ),
  ssr: false // Disable SSR for client-side heavy components
});

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <HomePage />
    </Suspense>
  );
}
