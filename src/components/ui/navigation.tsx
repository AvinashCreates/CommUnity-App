import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Badge } from "./badge";
import { Bell, Map, MessageSquare, Users, Menu } from "lucide-react";

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Navigation = ({ activeTab, onTabChange }: NavigationProps) => {
  const navItems = [
    { 
      id: "reports", 
      label: "Report Issue", 
      icon: MessageSquare,
      badge: null
    },
    { 
      id: "announcements", 
      label: "Announcements", 
      icon: Bell,
      badge: "3"
    },
    { 
      id: "vendors", 
      label: "Find Services", 
      icon: Map,
      badge: null
    },
    { 
      id: "community", 
      label: "Community", 
      icon: Users,
      badge: null
    }
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-trust-gradient rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">CommUnity</h1>
          </div>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onTabChange(item.id)}
                  className="relative"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>

          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;