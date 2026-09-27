import React from "react";
import Navbar from "@/landing_page_components/Navbar";
import Menubar from "@/landing_page_components/Menubar";

const LandingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <Menubar />
      {children}
    </div>
  );
};

export default LandingLayout;
