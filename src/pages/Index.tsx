import { useState } from "react";
import { Navigate } from "react-router-dom";
import Navigation from "@/components/ui/navigation";
import HeroSection from "@/components/sections/HeroSection";
import ReportSection from "@/components/sections/ReportSection";
import AnnouncementsSection from "@/components/sections/AnnouncementsSection";
import VendorsSection from "@/components/sections/VendorsSection";
import CommunitySection from "@/components/sections/CommunitySection";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [activeTab, setActiveTab] = useState("reports");
  const { user, loading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();

  // Show loading while checking authentication
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Set initial tab based on user role
  const initialTab = isAdmin ? "admin" : "reports";

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
      case "admin":
        return isAdmin ? <AdminDashboard /> : <ReportSection />;
      default:
        return isAdmin ? <AdminDashboard /> : <ReportSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main>
        {renderContent()}
      </main>
      
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
    </div>
  );
};

export default Index;