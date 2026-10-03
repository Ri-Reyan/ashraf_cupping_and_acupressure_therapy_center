import React, { createContext, useContext, useMemo, useState } from "react";

interface DashboardContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DashboardContext = createContext<DashboardContextType | null>(
  null,
);

export const DashboardProvider = ({ children }: React.PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);

  const value = useMemo(() => {
    return { isOpen, setIsOpen };
  }, [isOpen]);

  return <DashboardContext value={value}>{children}</DashboardContext>;
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);

  if (!context) {
    throw new Error("useDashboard must be used within DashboardProvider");
  }

  return context;
};
