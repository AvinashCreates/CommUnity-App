import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    id: string;
  };
  content: string;
  type: 'text' | 'image' | 'poll' | 'event';
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  isLiked?: boolean;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  isAttending?: boolean;
  organizer: {
    name: string;
    id: string;
  };
}

export const useCommunity = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [attendingEvents, setAttendingEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPosts();
    fetchEvents();
    if (user) {
      fetchUserInteractions();
    }
  }, [user]);

  const fetchPosts = async () => {
    try {
      // Fetch posts first
      const { data: postsData, error: postsError } = await supabase
        .from('community_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      // Fetch unique user profiles for the authors
      const userIds = [...new Set(postsData.map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, avatar_url')
        .in('user_id', userIds);

      // Create profiles lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      const mappedPosts: CommunityPost[] = postsData.map(post => {
        const profile = profilesMap.get(post.user_id);
        return {
          id: post.id,
          author: {
            name: profile?.name || 'Anonymous',
            avatar: profile?.avatar_url || '',
            id: post.user_id
          },
          content: post.content,
          type: post.type as CommunityPost['type'],
          timestamp: post.created_at,
          likes: post.likes_count,
          comments: post.comments_count,
          tags: post.tags || []
        };
      });

      setPosts(mappedPosts);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch community posts",
        variant: "destructive"
      });
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetch events first
      const { data: eventsData, error: eventsError } = await supabase
        .from('community_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch unique user profiles for the organizers
      const userIds = [...new Set(eventsData.map(event => event.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name')
        .in('user_id', userIds);

      // Create profiles lookup
      const profilesMap = new Map();
      profilesData?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      const mappedEvents: CommunityEvent[] = eventsData.map(event => {
        const profile = profilesMap.get(event.user_id);
        return {
          id: event.id,
          title: event.title,
          description: event.description,
          date: event.event_date,
          time: event.event_time,
          location: event.location,
          attendees: event.attendees_count,
          organizer: {
            name: profile?.name || 'Anonymous',
            id: event.user_id
          }
        };
      });

      setEvents(mappedEvents);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch community events",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInteractions = async () => {
    if (!user) return;

    try {
      // Fetch liked posts
      const { data: likes } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id);

      if (likes) {
        setLikedPosts(likes.map(like => like.post_id));
      }

      // Fetch attending events
      const { data: attending } = await supabase
        .from('event_attendance')
        .select('event_id')
        .eq('user_id', user.id);

      if (attending) {
        setAttendingEvents(attending.map(item => item.event_id));
      }
    } catch (error: any) {
      console.error('Failed to fetch user interactions:', error);
    }
  };

  const createPost = async (content: string, tags: string[] = []) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to create posts",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('community_posts')
        .insert({
          user_id: user.id,
          content,
          tags,
          type: 'text'
        });

      if (error) throw error;

      await fetchPosts();
      
      toast({
        title: "Success",
        description: "Post created successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }

    const isLiked = likedPosts.includes(postId);

    try {
      if (isLiked) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);

        if (error) throw error;

        // Update likes count manually
        await supabase
          .from('community_posts')
          .update({ likes_count: posts.find(p => p.id === postId)?.likes - 1 || 0 })
          .eq('id', postId);

        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) throw error;

        // Update likes count manually
        await supabase
          .from('community_posts')
          .update({ likes_count: (posts.find(p => p.id === postId)?.likes || 0) + 1 })
          .eq('id', postId);

        setLikedPosts(prev => [...prev, postId]);
      }

      await fetchPosts();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive"
      });
    }
  };

  const toggleAttendance = async (eventId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to attend events",
        variant: "destructive"
      });
      return;
    }

    const isAttending = attendingEvents.includes(eventId);

    try {
      if (isAttending) {
        const { error } = await supabase
          .from('event_attendance')
          .delete()
          .eq('user_id', user.id)
          .eq('event_id', eventId);

        if (error) throw error;

        // Update attendees count manually
        await supabase
          .from('community_events')
          .update({ attendees_count: Math.max((events.find(e => e.id === eventId)?.attendees || 0) - 1, 0) })
          .eq('id', eventId);

        setAttendingEvents(prev => prev.filter(id => id !== eventId));
      } else {
        const { error } = await supabase
          .from('event_attendance')
          .insert({
            user_id: user.id,
            event_id: eventId
          });

        if (error) throw error;

        // Update attendees count manually
        await supabase
          .from('community_events')
          .update({ attendees_count: (events.find(e => e.id === eventId)?.attendees || 0) + 1 })
          .eq('id', eventId);

        setAttendingEvents(prev => [...prev, eventId]);
      }

      await fetchEvents();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive"
      });
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete posts",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('delete_community_post', { post_id: postId });

      if (error) throw error;

      await fetchPosts();
      
      toast({
        title: "Success",
        description: "Post deleted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive"
      });
    }
  };

  return {
    posts,
    events,
    likedPosts,
    attendingEvents,
    loading,
    createPost,
    deletePost,
    toggleLike,
    toggleAttendance,
    refreshPosts: fetchPosts,
    refreshEvents: fetchEvents
  };
};