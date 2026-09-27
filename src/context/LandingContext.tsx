"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

interface LandingContextType {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const LandingContext = createContext<LandingContextType | null>(null);

export const LandingProvider = ({ children }: React.PropsWithChildren) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const value = useMemo(() => {
    return { isMenuOpen, setIsMenuOpen };
  }, [isMenuOpen]);

  return (
    <LandingContext.Provider value={value}>{children}</LandingContext.Provider>
  );
};

export const useLanding = () => {
  const context = useContext(LandingContext);

  if (!context) {
    throw new Error("useLanding must be used within a LandingProvider");
  }

  return context;
};
