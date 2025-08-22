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
  TrendingUp,
  Trash2
} from "lucide-react";
import { useCommunity } from "@/hooks/useCommunity";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useToast } from "@/hooks/use-toast";

// Use interfaces from useCommunity hook

const CommunitySection = () => {
  const [activeTab, setActiveTab] = useState("feed");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostTags, setNewPostTags] = useState("");
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { 
    posts, 
    events, 
    likedPosts, 
    attendingEvents, 
    loading, 
    createPost, 
    deletePost,
    toggleLike, 
    toggleAttendance 
  } = useCommunity();
  const { toast } = useToast();

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;

    const tags = newPostTags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    await createPost(newPostContent.trim(), tags);
    setNewPostContent("");
    setNewPostTags("");
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(postId);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <MessageSquare className="w-4 h-4" />;
      case 'image': return <Calendar className="w-4 h-4" />;
      case 'poll': return <TrendingUp className="w-4 h-4" />;
      case 'event': return <User className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const colors = {
      text: "bg-primary",
      image: "bg-success",
      poll: "bg-warning",
      event: "bg-secondary"
    };
    return (
      <Badge variant="outline" className={`text-xs ${colors[type as keyof typeof colors] || colors.text} text-white`}>
        {getPostTypeIcon(type)}
        <span className="ml-1 capitalize">{type}</span>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading community posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Community Hub</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Connect with your neighbors, share updates, and stay informed about local events.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
          <TabsTrigger value="feed" className="text-xs sm:text-sm">
            <span className="hidden sm:inline">Community </span>Feed 
            {posts.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{posts.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="events" className="text-xs sm:text-sm">
            Events {events.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{events.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="create" className="text-xs sm:text-sm">
            <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">Create </span>Post
          </TabsTrigger>
          <TabsTrigger value="trending" className="text-xs sm:text-sm">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="mt-4 sm:mt-6">
          <div className="space-y-4 sm:space-y-6">
            {posts.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">No posts yet. Be the first to share something!</p>
                <Button onClick={() => setActiveTab("create")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
              </Card>
            ) : (
              posts.map((post) => {
                const isLiked = likedPosts.includes(post.id);
                return (
                  <Card key={post.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback className="text-sm">{post.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm sm:text-base truncate">{post.author.name}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{new Date(post.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                          {getPostTypeBadge(post.type)}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePost(post.id)}
                              className="text-destructive hover:text-destructive p-1 h-auto"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-foreground mb-4 text-sm sm:text-base">{post.content}</p>
                      
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(post.id)}
                            className={`text-xs sm:text-sm ${isLiked ? "text-destructive" : ""}`}
                          >
                            <Heart className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 ${isLiked ? "fill-current" : ""}`} />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                            <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            {post.comments}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="events" className="mt-4 sm:mt-6">
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No events scheduled yet.</p>
              </Card>
            ) : (
              events.map((event) => {
                const isAttending = attendingEvents.includes(event.id);
                
                return (
                  <Card key={event.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base sm:text-lg flex items-center">
                          <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary flex-shrink-0" />
                          <span className="truncate">{event.title}</span>
                        </CardTitle>
                        {isAttending && (
                          <Badge variant="secondary" className="bg-success text-xs">
                            Attending
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>{event.date} at {event.time}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                          <span>{event.attendees} attending</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-foreground mb-4 text-sm sm:text-base">{event.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="text-sm text-muted-foreground">
                          Organized by {event.organizer.name}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant={isAttending ? "outline" : "default"}
                            size="sm"
                            onClick={() => toggleAttendance(event.id)}
                            className="text-xs sm:text-sm"
                          >
                            {isAttending ? "Not Attending" : "Attend Event"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="mt-4 sm:mt-6">
          {!user ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">Please sign in to create posts</p>
              <Button onClick={() => window.location.href = '/auth'}>
                Sign In
              </Button>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                  Create New Post
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Content</label>
                    <Textarea
                      placeholder="What's happening in your community?"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags (comma separated)</label>
                    <Input
                      placeholder="community, neighborhood, help..."
                      value={newPostTags}
                      onChange={(e) => setNewPostTags(e.target.value)}
                      className="text-sm sm:text-base"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        setNewPostContent("");
                        setNewPostTags("");
                      }}
                      className="text-sm sm:text-base"
                    >
                      Clear
                    </Button>
                    <Button 
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim()}
                      className="text-sm sm:text-base"
                    >
                      <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Share Post
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="trending" className="mt-4 sm:mt-6">
          <div className="space-y-4 sm:space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
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