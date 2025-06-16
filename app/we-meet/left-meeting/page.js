"use client"
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function LefMeetingPage() {
    const router = useRouter();
  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <h1 className="text-3xl font-bold">End call</h1>
      <Button onClick={() => router.push('/')}>Back to home</Button>
    </div>
  );
}
