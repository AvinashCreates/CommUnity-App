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
      const { data, error } = await supabase
        .from('community_posts')
        .select(`
          *,
          profiles!community_posts_user_id_fkey (name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedPosts: CommunityPost[] = data.map(post => ({
        id: post.id,
        author: {
          name: post.profiles?.name || 'Anonymous',
          avatar: post.profiles?.avatar_url || '',
          id: post.user_id
        },
        content: post.content,
        type: post.type as CommunityPost['type'],
        timestamp: post.created_at,
        likes: post.likes_count,
        comments: post.comments_count,
        tags: post.tags || []
      }));

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
      const { data, error } = await supabase
        .from('community_events')
        .select(`
          *,
          profiles!community_events_user_id_fkey (name)
        `)
        .order('event_date', { ascending: true });

      if (error) throw error;

      const mappedEvents: CommunityEvent[] = data.map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        date: event.event_date,
        time: event.event_time,
        location: event.location,
        attendees: event.attendees_count,
        organizer: {
          name: event.profiles?.name || 'Anonymous',
          id: event.user_id
        }
      }));

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

        // Update likes count
        await supabase.rpc('decrement_post_likes', { post_id: postId });

        setLikedPosts(prev => prev.filter(id => id !== postId));
      } else {
        const { error } = await supabase
          .from('post_likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });

        if (error) throw error;

        // Update likes count
        await supabase.rpc('increment_post_likes', { post_id: postId });

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

        // Update attendees count
        await supabase.rpc('decrement_event_attendees', { event_id: eventId });

        setAttendingEvents(prev => prev.filter(id => id !== eventId));
      } else {
        const { error } = await supabase
          .from('event_attendance')
          .insert({
            user_id: user.id,
            event_id: eventId
          });

        if (error) throw error;

        // Update attendees count
        await supabase.rpc('increment_event_attendees', { event_id: eventId });

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

  return {
    posts,
    events,
    likedPosts,
    attendingEvents,
    loading,
    createPost,
    toggleLike,
    toggleAttendance,
    refreshPosts: fetchPosts,
    refreshEvents: fetchEvents
  };
};