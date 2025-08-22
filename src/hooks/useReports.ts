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
    if (!user) {
      console.log('No user found, cannot fetch reports');
      setReports([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching reports for user:', user.id);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reports:', error);
        throw error;
      }

      console.log('Fetched reports:', data);
      const mappedReports: Report[] = data.map(report => ({
        ...report,
        status: report.status as Report['status'],
        priority: report.priority as Report['priority'],
        created_at: report.created_at,
        updated_at: report.updated_at
      }));

      setReports(mappedReports);
    } catch (error: any) {
      console.error('Failed to fetch reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports: " + error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createReport = async (reportData: Omit<Report, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
    if (!user) {
      console.log('No user found, cannot create report');
      return { error: new Error('User not authenticated') };
    }

    try {
      console.log('Creating report with data:', reportData);
      console.log('User ID:', user.id);
      
      const insertData = {
        user_id: user.id,
        title: reportData.title,
        description: reportData.description,
        category: reportData.category,
        location_address: reportData.location_address,
        location_lat: reportData.location_lat,
        location_lng: reportData.location_lng,
        image_url: reportData.image_url,
        status: reportData.status,
        priority: reportData.priority
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('reports')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error inserting report:', error);
        throw error;
      }

      console.log('Report created successfully:', data);
      await fetchReports();
      
      toast({
        title: "Success",
        description: "Report submitted successfully"
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Failed to create report:', error);
      toast({
        title: "Error",
        description: "Failed to create report: " + error.message,
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