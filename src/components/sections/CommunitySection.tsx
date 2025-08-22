import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  MessageSquare, 
  Heart, 
  Share2, 
  Plus,
  Calendar,
  MapPin,
  Clock,
  User,
  Send,
  ThumbsUp,
  Eye,
  TrendingUp
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
  };
  content: string;
  type: 'discussion' | 'event' | 'announcement' | 'question';
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  tags: string[];
  location?: string;
  isLiked?: boolean;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  attendees: number;
  maxAttendees?: number;
  isAttending?: boolean;
}

const CommunitySection = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostType, setNewPostType] = useState<CommunityPost['type']>("discussion");
  const [posts, setPosts] = useLocalStorage<CommunityPost[]>("community_posts", []);
  const [events, setEvents] = useLocalStorage<CommunityEvent[]>("community_events", []);
  const [likedPosts, setLikedPosts] = useLocalStorage<string[]>("liked_posts", []);
  const [attendingEvents, setAttendingEvents] = useLocalStorage<string[]>("attending_events", []);
  const { toast } = useToast();

  // Mock data
  const initialPosts: CommunityPost[] = [
    {
      id: "1",
      author: { name: "Sarah Chen", verified: true },
      content: "Has anyone noticed the new street lights on Oak Avenue? They're much brighter and safer for evening walks. Great job to whoever organized this!",
      type: "discussion",
      timestamp: "2 hours ago",
      likes: 24,
      comments: 8,
      shares: 3,
      tags: ["infrastructure", "safety"],
      location: "Oak Avenue"
    },
    {
      id: "2",
      author: { name: "Mike Rodriguez", verified: false },
      content: "Looking for recommendations for a reliable plumber in the downtown area. Our kitchen sink has been acting up. Any suggestions?",
      type: "question",
      timestamp: "4 hours ago",
      likes: 12,
      comments: 15,
      shares: 2,
      tags: ["recommendations", "plumbing"],
      location: "Downtown"
    },
    {
      id: "3",
      author: { name: "Community Center", verified: true },
      content: "🎉 Exciting news! We're hosting a neighborhood cleanup day this Saturday at 9 AM. Let's work together to keep our community beautiful. Free breakfast for all volunteers!",
      type: "event",
      timestamp: "1 day ago",
      likes: 89,
      comments: 32,
      shares: 45,
      tags: ["volunteer", "cleanup", "community"]
    }
  ];

  const initialEvents: CommunityEvent[] = [
    {
      id: "1",
      title: "Neighborhood Cleanup Day",
      description: "Join us for a community-wide cleanup initiative. We'll provide all supplies and free breakfast!",
      date: "2024-03-23",
      time: "9:00 AM",
      location: "Central Park",
      organizer: "Community Center",
      attendees: 45,
      maxAttendees: 100
    },
    {
      id: "2",
      title: "Local Business Fair",
      description: "Discover local businesses and services in our community. Great deals and networking opportunities!",
      date: "2024-03-30",
      time: "10:00 AM",
      location: "Main Street Plaza",
      organizer: "Chamber of Commerce",
      attendees: 78,
      maxAttendees: 200
    }
  ];

  // Initialize with mock data if empty
  if (posts.length === 0) {
    setPosts(initialPosts);
  }
  if (events.length === 0) {
    setEvents(initialEvents);
  }

  const createPost = () => {
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: { name: "You", verified: false },
      content: newPostContent.trim(),
      type: newPostType,
      timestamp: "now",
      likes: 0,
      comments: 0,
      shares: 0,
      tags: [],
      location: "Your Area"
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    toast({
      title: "Post Created",
      description: "Your post has been shared with the community.",
    });
  };

  const toggleLike = (postId: string) => {
    const isLiked = likedPosts.includes(postId);
    if (isLiked) {
      setLikedPosts(prev => prev.filter(id => id !== postId));
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes - 1 } : post
      ));
    } else {
      setLikedPosts(prev => [...prev, postId]);
      setPosts(prev => prev.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    }
  };

  const toggleAttendance = (eventId: string) => {
    const isAttending = attendingEvents.includes(eventId);
    if (isAttending) {
      setAttendingEvents(prev => prev.filter(id => id !== eventId));
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, attendees: event.attendees - 1 } : event
      ));
      toast({
        title: "No longer attending",
        description: "You've been removed from the event attendees.",
      });
    } else {
      setAttendingEvents(prev => [...prev, eventId]);
      setEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, attendees: event.attendees + 1 } : event
      ));
      toast({
        title: "Attending event",
        description: "You've been added to the event attendees.",
      });
    }
  };

  const getPostTypeIcon = (type: CommunityPost['type']) => {
    switch (type) {
      case 'discussion': return <MessageSquare className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'announcement': return <TrendingUp className="w-4 h-4" />;
      case 'question': return <User className="w-4 h-4" />;
    }
  };

  const getPostTypeBadge = (type: CommunityPost['type']) => {
    const colors = {
      discussion: "bg-primary",
      event: "bg-success",
      announcement: "bg-warning",
      question: "bg-secondary"
    };
    return (
      <Badge variant="outline" className={`text-xs ${colors[type]} text-white`}>
        {getPostTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Community Hub</h2>
        <p className="text-muted-foreground">
          Connect with your neighbors, share updates, and stay informed about local events.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feed">
            Community Feed {posts.length > 0 && <Badge variant="secondary" className="ml-1">{posts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="events">
            Events {events.length > 0 && <Badge variant="secondary" className="ml-1">{events.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="create">
            <Plus className="w-4 h-4 mr-1" />
            Create Post
          </TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="w-4 h-4 mr-1" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-6">
          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked = likedPosts.includes(post.id);
              return (
                <Card key={post.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{post.author.name}</span>
                            {post.author.verified && (
                              <Badge variant="secondary" className="text-xs">Verified</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{post.timestamp}</span>
                            {post.location && (
                              <>
                                <MapPin className="w-3 h-3" />
                                <span>{post.location}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {getPostTypeBadge(post.type)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-foreground mb-4">{post.content}</p>
                    
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {post.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(post.id)}
                          className={isLiked ? "text-destructive" : ""}
                        >
                          <Heart className={`w-4 h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-4 h-4 mr-1" />
                          {post.shares}
                        </Button>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-6">
          <div className="space-y-4">
            {events.map((event) => {
              const isAttending = attendingEvents.includes(event.id);
              const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendees : null;
              
              return (
                <Card key={event.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-primary" />
                        {event.title}
                      </CardTitle>
                      {isAttending && (
                        <Badge variant="secondary" className="bg-success">
                          Attending
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {event.date} at {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {event.attendees} attending
                        {spotsLeft !== null && spotsLeft > 0 && (
                          <span className="ml-1">({spotsLeft} spots left)</span>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-foreground mb-4">{event.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Organized by {event.organizer}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={isAttending ? "outline" : "default"}
                          size="sm"
                          onClick={() => toggleAttendance(event.id)}
                          disabled={!isAttending && spotsLeft === 0}
                        >
                          {isAttending ? "Not Attending" : "Attend Event"}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary" />
                Create New Post
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Post Type</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['discussion', 'question', 'announcement', 'event'] as const).map((type) => (
                      <Button
                        key={type}
                        type="button"
                        variant={newPostType === type ? "default" : "outline"}
                        onClick={() => setNewPostType(type)}
                        className="justify-start p-3 h-auto"
                      >
                        {getPostTypeIcon(type)}
                        <span className="ml-2 capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <Textarea
                    placeholder="What's happening in your community?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setNewPostContent("");
                      setNewPostType("discussion");
                    }}
                  >
                    Clear
                  </Button>
                  <Button 
                    onClick={createPost}
                    disabled={!newPostContent.trim()}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Share Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["#infrastructure", "#safety", "#community-events", "#local-business", "#volunteer"].map((tag, idx) => (
                    <div key={tag} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                      <div className="flex items-center">
                        <span className="text-lg font-bold text-muted-foreground mr-3">#{idx + 1}</span>
                        <Badge variant="outline">{tag}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {Math.floor(Math.random() * 50) + 10} posts
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Users className="w-5 h-5 mr-2 text-primary" />
                  Active Community Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Sarah Chen", "Mike Rodriguez", "Community Center", "Local Business", "Jane Smith"].map((name, idx) => (
                    <div key={name} className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.floor(Math.random() * 20) + 5} posts this week
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunitySection;