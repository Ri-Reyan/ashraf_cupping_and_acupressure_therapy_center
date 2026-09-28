import HeroSection from "@/landing_page_components/HeroSection";
import Menubar from "@/landing_page_components/Menubar";
import Navbar from "@/landing_page_components/Navbar";
import SocialProof from "@/landing_page_components/SocialProof";

const LandingPage = () => {
  return (
    <main>
      <Navbar />
      <Menubar />
      <HeroSection />
      <SocialProof />
    </main>
  );
};

export default LandingPage;
