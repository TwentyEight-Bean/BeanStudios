"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

export interface Features {
  payment: boolean;
  rankSystem: boolean;
  fileApproval: boolean;
  advancedChat: boolean;
  bookingNegotiation: boolean;
  publicMarketplace: boolean;
}

interface FeatureContextType {
  features: Features;
  toggleFeature: (key: keyof Features) => void;
}

const FeatureContext = createContext<FeatureContextType | null>(null);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Features>({
    payment: false,
    rankSystem: false,
    fileApproval: false,
    advancedChat: false,
    bookingNegotiation: false,
    publicMarketplace: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("sb_features");
      if (stored) setFeatures(JSON.parse(stored));
    } catch {}
  }, []);

  const toggleFeature = (key: keyof Features) => {
    setFeatures((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem("sb_features", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  return (
    <FeatureContext.Provider value={{ features, toggleFeature }}>
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const ctx = useContext(FeatureContext);
  if (!ctx) throw new Error("useFeatures must be used within FeatureProvider");
  return ctx;
};
