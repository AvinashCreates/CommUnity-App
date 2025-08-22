import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Camera, 
  MapPin, 
  Send, 
  Tag,
  Upload,
  CheckCircle,
  X,
  Eye,
  Trash2,
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from '@/hooks/useReports';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import AuthRequiredMessage from './AuthRequiredMessage';

const ReportSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { 
    reports, 
    loading, 
    createReport, 
    deleteReport, 
    refreshReports 
  } = useReports();
  const { location, loading: locationLoading, getCurrentLocation, clearLocation } = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Show authentication required message if user is not logged in
  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">Report a Civic Issue</h2>
          <p className="text-muted-foreground">
            Help improve your community by reporting local issues.
          </p>
        </div>
        <AuthRequiredMessage />
      </div>
    );
  }

  const categories = [
    { id: "pothole", label: "Road Issues", color: "bg-destructive" },
    { id: "streetlight", label: "Street Lighting", color: "bg-warning" },
    { id: "garbage", label: "Waste Management", color: "bg-success" },
    { id: "water", label: "Water Issues", color: "bg-primary" },
    { id: "electricity", label: "Power Issues", color: "bg-accent" },
    { id: "other", label: "Other", color: "bg-muted" }
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        // Simulate AI detection
        setTimeout(() => {
          const aiCategories = ["pothole", "streetlight", "garbage", "water"];
          const detected = aiCategories[Math.floor(Math.random() * aiCategories.length)];
          setSelectedCategory(detected);
          toast({
            title: "AI Detection Complete",
            description: `Detected: ${categories.find(c => c.id === detected)?.label}`,
          });
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedCategory) return;
    
    // Check if location is available
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please get your current location first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await createReport({
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        location_address: location.address || `${location.latitude}, ${location.longitude}`,
        location_lat: location.latitude,
        location_lng: location.longitude,
        image_url: uploadedImage || undefined,
        status: 'submitted',
        priority: 'medium'
      });

      if (result.error) {
        throw result.error;
      }

      // Reset form on success
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setUploadedImage(null);
      setActiveTab("submitted");

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully.",
      });
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="outline">Draft</Badge>;
      case 'submitted': return <Badge variant="secondary">Submitted</Badge>;
      case 'in_progress': return <Badge variant="default">In Progress</Badge>;
      case 'resolved': return <Badge variant="secondary" className="bg-success">Resolved</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'medium': return <Clock className="w-4 h-4 text-warning" />;
      default: return <CheckCircle className="w-4 h-4 text-success" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Report a Civic Issue</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Help improve your community by reporting local issues.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full min-w-fit grid-cols-2">
            <TabsTrigger value="new" className="text-xs sm:text-sm">New Report</TabsTrigger>
            <TabsTrigger value="submitted" className="text-xs sm:text-sm">
              Submitted {reports.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{reports.length}</Badge>}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="new" className="mt-4 sm:mt-6">
          <Card className="shadow-card">
            <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                  Create New Report
                </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Title */}
                <div>
                  <Label htmlFor="title" className="text-sm font-medium">
                    Report Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Brief title for the issue..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 text-sm sm:text-base"
                  />
                </div>

                {/* Photo Upload */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="text-sm font-medium">Add Photo</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-4 sm:p-6 text-center hover:border-primary/50 transition-colors cursor-pointer mt-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <div className="relative">
                          <img src={uploadedImage} alt="Uploaded" className="w-full h-24 sm:h-32 object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadedImage(null);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            AI will auto-detect the issue type
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    {location ? (
                      <Card className="p-4 bg-muted/50 mt-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-success mr-2" />
                            <div>
                              <div className="text-sm font-medium">Current Location</div>
                              <div className="text-xs text-muted-foreground">
                                {location.address}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              GPS Lock
                            </Badge>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={clearLocation}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <div className="mt-1">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={getCurrentLocation}
                          disabled={locationLoading}
                          className="w-full"
                        >
                          {locationLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <MapPin className="h-4 w-4 mr-2" />
                          )}
                          Get My Current Location
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          Location is required to submit a report
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <Label className="text-sm font-medium">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Issue Category *
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        type="button"
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.id)}
                        className="justify-start p-2 sm:p-3 h-auto text-xs sm:text-sm"
                      >
                        <div className={`w-3 h-3 rounded-full ${category.color} mr-2 flex-shrink-0`} />
                        <span className="truncate">{category.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px] sm:min-h-[100px] mt-1 text-sm sm:text-base"
                  />
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button 
                    type="submit" 
                    disabled={!title.trim() || !selectedCategory || !description.trim() || !location || isSubmitting}
                    className="min-w-[120px] text-sm sm:text-base"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          <div className="space-y-4">
            {loading ? (
              <Card className="p-8 text-center">
                <p>Loading reports...</p>
              </Card>
            ) : reports.length === 0 ? (
              <Card className="p-8 text-center">
                <div className="text-muted-foreground">
                  <Send className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Reports Submitted</h3>
                  <p>Your submitted reports will appear here.</p>
                </div>
              </Card>
            ) : (
              reports.map((report) => (
                <Card key={report.id} className="shadow-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{report.title}</h3>
                          {getStatusBadge(report.status)}
                          {getPriorityIcon(report.priority)}
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === report.category)?.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(report.created_at).toLocaleString()}</span>
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {report.location_address}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        {report.image_url && (
                          <div className="w-16 h-16 rounded-lg overflow-hidden">
                            <img src={report.image_url} alt="Report" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteReport(report.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportSection;