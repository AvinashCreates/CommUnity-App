import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Report } from '@/types';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReports();
    } else {
      setReports([]);
      setLoading(false);
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReports: Report[] = data.map(report => ({
        ...report,
        status: report.status as Report['status'],
        priority: report.priority as Report['priority'],
        created_at: report.created_at,
        updated_at: report.updated_at
      }));

      setReports(mappedReports);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { data, error } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          ...reportData
        })
        .select()
        .single();

      if (error) throw error;

      await fetchReports();
      
      toast({
        title: "Success",
        description: "Report submitted successfully"
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateReport = async (id: string, updates: Partial<Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('reports')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchReports();
      
      toast({
        title: "Success",
        description: "Report updated successfully"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
      return { error };
    }
  };

  const deleteReport = async (id: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchReports();
      
      toast({
        title: "Success",
        description: "Report deleted successfully"
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive"
      });
      return { error };
    }
  };

  return {
    reports,
    loading,
    createReport,
    updateReport,
    deleteReport,
    refreshReports: fetchReports
  };
};