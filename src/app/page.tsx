import HeroSection from "@/landing_page_components/HeroSection";
import Menubar from "@/landing_page_components/Menubar";
import Navbar from "@/landing_page_components/Navbar";

const LandingPage = () => {
  return (
    <main>
      <Navbar />
      <Menubar />
      <HeroSection />
    </main>
  );
};

export default LandingPage;
