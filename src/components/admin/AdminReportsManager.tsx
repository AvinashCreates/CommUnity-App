import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Report } from '@/types';
import { MapPin, Calendar, User, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';

const AdminReportsManager = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          profiles(name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data?.map(report => ({
        ...report,
        priority: report.priority as 'low' | 'medium' | 'high'
      })) || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: newStatus }
          : report
      ));

      toast({
        title: "Success",
        description: `Report status updated to ${newStatus}`,
      });

      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      submitted: 'default',
      in_progress: 'secondary',
      resolved: 'default',
      rejected: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'default',
      high: 'destructive'
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'secondary'}>
        {priority}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports Management</h2>
          <p className="text-muted-foreground">Review and manage community reports</p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {reports.length} Total Reports
        </Badge>
      </div>

      <div className="grid gap-4">
        {reports.map((report) => (
          <Card key={report.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    {getStatusBadge(report.status)}
                    {getPriorityBadge(report.priority)}
                  </div>
                  
                  <p className="text-muted-foreground line-clamp-2">
                    {report.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate max-w-xs">{report.location_address}</span>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{(report as any).profiles?.name || 'Anonymous'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  {getStatusIcon(report.status)}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        Manage
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Report Details & Management</DialogTitle>
                      </DialogHeader>
                      
                      {selectedReport && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Status</Label>
                              <div className="mt-1">
                                {getStatusBadge(selectedReport.status)}
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-medium">Priority</Label>
                              <div className="mt-1">
                                {getPriorityBadge(selectedReport.priority)}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Title</Label>
                            <p className="mt-1 text-sm">{selectedReport.title}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Description</Label>
                            <p className="mt-1 text-sm">{selectedReport.description}</p>
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium">Location</Label>
                            <p className="mt-1 text-sm">{selectedReport.location_address}</p>
                          </div>
                          
                          {selectedReport.image_url && (
                            <div>
                              <Label className="text-sm font-medium">Attached Image</Label>
                              <img 
                                src={selectedReport.image_url} 
                                alt="Report attachment"
                                className="mt-2 max-w-full h-48 object-cover rounded-md border"
                              />
                            </div>
                          )}
                          
                          <div className="border-t pt-4">
                            <Label className="text-sm font-medium">Update Status</Label>
                            <div className="flex space-x-2 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateReportStatus(selectedReport.id, 'in_progress')}
                                disabled={updating}
                              >
                                Mark In Progress
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => updateReportStatus(selectedReport.id, 'resolved')}
                                disabled={updating}
                              >
                                Mark Resolved
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => updateReportStatus(selectedReport.id, 'rejected')}
                                disabled={updating}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {reports.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reports yet</h3>
              <p className="text-muted-foreground">Reports from the community will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminReportsManager;