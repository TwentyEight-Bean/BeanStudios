"use client";

import { AuthProvider } from "@/app/context/AuthContext";
import { FeatureProvider } from "@/app/context/FeatureContext";
import { Toaster } from "sonner";
import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <FeatureProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                border: "1px solid rgba(79,70,229,0.15)",
                color: "#1E1B4B",
                fontSize: "13px",
                boxShadow: "0 8px 32px rgba(79,70,229,0.12)",
              },
            }}
          />
        </FeatureProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
