import Footer from "@/landing_page_components/Footer";
import HeroSection from "@/landing_page_components/HeroSection";
import HowItWorks from "@/landing_page_components/HowItWorks";
import Menubar from "@/landing_page_components/Menubar";
import Navbar from "@/landing_page_components/Navbar";
import ProblemStatement from "@/landing_page_components/ProblemStatement";
import SocialProof from "@/landing_page_components/SocialProof";
import SolutionSection from "@/landing_page_components/SolutionSection";

const LandingPage = () => {
  return (
    <main>
      <Navbar />
      <Menubar />
      <HeroSection />
      <SocialProof />
      <ProblemStatement />
      <SolutionSection />
      <HowItWorks />
      <Footer />
    </main>
  );
};

export default LandingPage;
