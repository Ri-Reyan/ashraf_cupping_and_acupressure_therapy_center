import HeroSection from "@/landing_page_components/HeroSection";
import Menubar from "@/landing_page_components/Menubar";
import Navbar from "@/landing_page_components/Navbar";
import ProblemStatement from "@/landing_page_components/ProblemStatement";
import SocialProof from "@/landing_page_components/SocialProof";

const LandingPage = () => {
  return (
    <main>
      <Navbar />
      <Menubar />
      <HeroSection />
      <SocialProof />
      <ProblemStatement />
    </main>
  );
};

export default LandingPage;
