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
  Eye,
  Bell,
  BellOff
} from "lucide-react";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useToast } from "@/hooks/use-toast";

const AnnouncementsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const { 
    announcements, 
    readAnnouncements, 
    loading, 
    markAsRead, 
    markAsUnread,
    refreshAnnouncements 
  } = useAnnouncements();
  const { toast } = useToast();

  const downloadAttachment = (announcement: any) => {
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p>Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Local Announcements</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Stay updated with verified announcements from local authorities. Available offline.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 sm:mb-6 space-y-4">
        <div className="flex flex-col gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm sm:text-base"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
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
              className="flex-1 px-3 py-2 border border-input rounded-md text-sm"
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
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-fit grid-cols-3">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All {filteredAnnouncements.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{filteredAnnouncements.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="unread" className="text-xs sm:text-sm">
              Unread {unreadCount > 0 && <Badge variant="destructive" className="ml-1 text-xs">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="read" className="text-xs sm:text-sm">
              Read {readCount > 0 && <Badge variant="secondary" className="ml-1 text-xs">{readCount}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

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
                        {!navigator.onLine && (
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
                        {new Date(announcement.created_at).toLocaleDateString()}
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
                        {announcement.attachment_url && (
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
                      {new Date(announcement.created_at).toLocaleDateString()} • {announcement.location}
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
                      {new Date(announcement.created_at).toLocaleDateString()} • {announcement.location}
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
        <Button variant="outline" onClick={refreshAnnouncements}>
          Load More Announcements
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementsSection;