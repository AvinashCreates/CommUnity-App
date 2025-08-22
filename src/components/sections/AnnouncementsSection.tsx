import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Megaphone, 
  Clock, 
  MapPin, 
  AlertCircle,
  Info,
  CheckCircle,
  Download,
  Search,
  Filter,
  Eye,
  Bell,
  BellOff
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Announcement } from "@/types";

const AnnouncementsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [readAnnouncements, setReadAnnouncements] = useLocalStorage<string[]>("read_announcements", []);
  const { toast } = useToast();

  const announcements: Announcement[] = [
    {
      id: "1",
      title: "Water Supply Maintenance Schedule",
      content: "Planned water supply maintenance in Downtown area from 2 AM to 6 AM on March 15th, 2024. Please store adequate water.",
      type: "maintenance",
      priority: "high",
      authority: "Water Department",
      timestamp: "2 hours ago",
      location: "Downtown Area",
      isOffline: true
    },
    {
      id: "2",
      title: "New Recycling Guidelines",
      content: "Updated recycling guidelines effective April 1st. Please separate plastic containers by type. Download the new guide.",
      type: "update",
      priority: "medium",
      authority: "Waste Management",
      timestamp: "1 day ago",
      location: "City-wide",
      hasAttachment: true
    },
    {
      id: "3",
      title: "Community Health Fair",
      content: "Free health checkups and vaccinations at Central Park Community Center. Open to all residents.",
      type: "event",
      priority: "low",
      authority: "Health Department",
      timestamp: "3 days ago",
      location: "Central Park"
    },
    {
      id: "4",
      title: "Road Closure - Main Street",
      content: "Main Street will be closed between 1st and 3rd Avenue for emergency repairs. Expected completion: March 20th.",
      type: "alert",
      priority: "high",
      authority: "Transportation",
      timestamp: "5 days ago",
      location: "Main Street"
    }
  ];

  const markAsRead = (id: string) => {
    if (!readAnnouncements.includes(id)) {
      setReadAnnouncements(prev => [...prev, id]);
      toast({
        title: "Marked as Read",
        description: "Announcement marked as read.",
      });
    }
  };

  const markAsUnread = (id: string) => {
    setReadAnnouncements(prev => prev.filter(readId => readId !== id));
    toast({
      title: "Marked as Unread",
      description: "Announcement marked as unread.",
    });
  };

  const downloadAttachment = (announcement: Announcement) => {
    toast({
      title: "Download Started",
      description: `Downloading attachment for: ${announcement.title}`,
    });
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.authority.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || announcement.type === selectedType;
    const matchesPriority = selectedPriority === "all" || announcement.priority === selectedPriority;
    
    return matchesSearch && matchesType && matchesPriority;
  });

  const unreadCount = announcements.filter(a => !readAnnouncements.includes(a.id)).length;
  const readCount = readAnnouncements.length;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "medium":
        return <Info className="w-4 h-4 text-warning" />;
      default:
        return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Local Announcements</h2>
        <p className="text-muted-foreground">
          Stay updated with verified announcements from local authorities. Available offline.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="all">All Types</option>
              <option value="alert">Alerts</option>
              <option value="maintenance">Maintenance</option>
              <option value="event">Events</option>
              <option value="update">Updates</option>
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-input rounded-md text-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All {filteredAnnouncements.length > 0 && <Badge variant="secondary" className="ml-1">{filteredAnnouncements.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread {unreadCount > 0 && <Badge variant="destructive" className="ml-1">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="read">
            Read {readCount > 0 && <Badge variant="secondary" className="ml-1">{readCount}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => {
              const isRead = readAnnouncements.includes(announcement.id);
              return (
                <Card key={announcement.id} className={`shadow-card hover:shadow-card-hover transition-shadow ${isRead ? 'opacity-75' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Megaphone className="w-5 h-5 mr-2 text-primary" />
                        {announcement.title}
                        {!isRead && <div className="w-2 h-2 bg-primary rounded-full ml-2" />}
                        {announcement.isOffline && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            Cached
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        {getPriorityIcon(announcement.priority)}
                        <Badge variant={getPriorityVariant(announcement.priority) as any}>
                          {announcement.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {announcement.timestamp}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {announcement.location}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {announcement.authority}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-foreground mb-4">{announcement.content}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {announcement.hasAttachment && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadAttachment(announcement)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download Guide
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => isRead ? markAsUnread(announcement.id) : markAsRead(announcement.id)}
                        >
                          {isRead ? (
                            <>
                              <BellOff className="w-3 h-3 mr-1" />
                              Mark Unread
                            </>
                          ) : (
                            <>
                              <Bell className="w-3 h-3 mr-1" />
                              Mark Read
                            </>
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-3 h-3 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="unread" className="mt-6">
          <div className="space-y-4">
            {filteredAnnouncements.filter(a => !readAnnouncements.includes(a.id)).map((announcement) => (
              <Card key={announcement.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Megaphone className="w-5 h-5 mr-2 text-primary" />
                      {announcement.title}
                      <div className="w-2 h-2 bg-primary rounded-full ml-2" />
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(announcement.priority)}
                      <Badge variant={getPriorityVariant(announcement.priority) as any}>
                        {announcement.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-foreground mb-4">{announcement.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {announcement.timestamp} • {announcement.location}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => markAsRead(announcement.id)}
                    >
                      <Bell className="w-3 h-3 mr-1" />
                      Mark Read
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredAnnouncements.filter(a => !readAnnouncements.includes(a.id)).length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">All Caught Up!</h3>
                  <p>No unread announcements.</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="read" className="mt-6">
          <div className="space-y-4">
            {filteredAnnouncements.filter(a => readAnnouncements.includes(a.id)).map((announcement) => (
              <Card key={announcement.id} className="shadow-card hover:shadow-card-hover transition-shadow opacity-75">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg flex items-center">
                      <Megaphone className="w-5 h-5 mr-2 text-primary" />
                      {announcement.title}
                      <CheckCircle className="w-4 h-4 ml-2 text-success" />
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      {getPriorityIcon(announcement.priority)}
                      <Badge variant={getPriorityVariant(announcement.priority) as any}>
                        {announcement.priority}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-foreground mb-4">{announcement.content}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {announcement.timestamp} • {announcement.location}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markAsUnread(announcement.id)}
                    >
                      <BellOff className="w-3 h-3 mr-1" />
                      Mark Unread
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredAnnouncements.filter(a => readAnnouncements.includes(a.id)).length === 0 && (
              <Card className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Read Announcements</h3>
                  <p>Announcements you've read will appear here.</p>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Load More */}
      <div className="text-center mt-8">
        <Button variant="outline">
          Load More Announcements
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementsSection;