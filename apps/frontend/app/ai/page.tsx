"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { ChatUI } from "@/components/ai/ChatUI";

export default function AIPage() {
  return (
    <AppLayout title="Coach IA 🤖">
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <ChatUI />
      </div>
    </AppLayout>
  );
}
