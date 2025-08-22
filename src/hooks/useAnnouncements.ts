import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Announcement } from '@/types';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readAnnouncements, setReadAnnouncements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
    if (user) {
      fetchReadAnnouncements();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedAnnouncements: Announcement[] = data.map(announcement => ({
        ...announcement,
        type: announcement.type as Announcement['type'],
        priority: announcement.priority as Announcement['priority'],
        created_at: announcement.created_at
      }));

      setAnnouncements(mappedAnnouncements);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch announcements",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReadAnnouncements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('announcement_reads')
        .select('announcement_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setReadAnnouncements(data.map(item => item.announcement_id));
    } catch (error: any) {
      console.error('Failed to fetch read announcements:', error);
    }
  };

  const markAsRead = async (announcementId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('announcement_reads')
        .upsert({
          user_id: user.id,
          announcement_id: announcementId
        });

      if (error) throw error;

      setReadAnnouncements(prev => [...prev, announcementId]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark as read",
        variant: "destructive"
      });
    }
  };

  const markAsUnread = async (announcementId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('announcement_reads')
        .delete()
        .eq('user_id', user.id)
        .eq('announcement_id', announcementId);

      if (error) throw error;

      setReadAnnouncements(prev => prev.filter(id => id !== announcementId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to mark as unread",
        variant: "destructive"
      });
    }
  };

  return {
    announcements,
    readAnnouncements,
    loading,
    markAsRead,
    markAsUnread,
    refreshAnnouncements: fetchAnnouncements
  };
};