import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, MapPin, Wifi, WifiOff } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

interface HeroSectionProps {
  onGetStarted: () => void;
}

const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <div className="relative overflow-hidden bg-hero-gradient min-h-[80vh] flex items-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            
            <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Empowering 
              <span className="block text-secondary">Communities</span>
              Together
            </h1>
            
            <p className="text-xl text-white/90 mb-8 max-w-2xl">
              Report civic issues, discover trusted local services, and stay connected with your community - even when you're offline.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={onGetStarted}
                className="text-lg px-8 py-3 h-12"
              >
                <Camera className="w-5 h-5 mr-2" />
                Report an Issue
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-3 h-12 border-white/30 text-white hover:bg-white/10"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Find Services
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1,247</div>
                <div className="text-sm text-white/80">Issues Resolved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">89</div>
                <div className="text-sm text-white/80">Trusted Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">3,421</div>
                <div className="text-sm text-white/80">Active Citizens</div>
              </div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="relative z-10">
              <img 
                src={heroImage} 
                alt="Citizens reporting civic issues in their community"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
            
            {/* Floating Cards */}
            <Card className="absolute -top-4 -left-4 p-4 bg-white shadow-lg w-48 hidden lg:block">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                  <Wifi className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Auto-Sync Ready</div>
                  <div className="text-xs text-muted-foreground">3 reports pending</div>
                </div>
              </div>
            </Card>
            
            <Card className="absolute -bottom-4 -right-4 p-4 bg-white shadow-lg w-48 hidden lg:block">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-warning rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Location Tagged</div>
                  <div className="text-xs text-muted-foreground">GPS coordinates saved</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;