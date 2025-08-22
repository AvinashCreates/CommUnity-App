import { useState } from "react";
import Navigation from "@/components/ui/navigation";
import HeroSection from "@/components/sections/HeroSection";
import ReportSection from "@/components/sections/ReportSection";
import AnnouncementsSection from "@/components/sections/AnnouncementsSection";
import VendorsSection from "@/components/sections/VendorsSection";
import CommunitySection from "@/components/sections/CommunitySection";

const Index = () => {
  const [activeTab, setActiveTab] = useState("hero");

  const handleGetStarted = () => {
    setActiveTab("reports");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "reports":
        return <ReportSection />;
      case "announcements":
        return <AnnouncementsSection />;
      case "vendors":
        return <VendorsSection />;
      case "community":
        return <CommunitySection />;
      default:
        return <HeroSection onGetStarted={handleGetStarted} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {activeTab !== "hero" && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}
      
      <main>
        {renderContent()}
      </main>
      
      {activeTab !== "hero" && (
        <footer className="bg-muted/30 border-t border-border py-8 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-trust-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-lg font-semibold">CommUnity</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering communities through civic engagement and local commerce.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default Index;