import { Suspense } from "react";
import { ChatPage } from "@/app/pages/ChatPage";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ChatPage />
    </Suspense>
  );
}
