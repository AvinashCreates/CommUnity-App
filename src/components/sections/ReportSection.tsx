import { useState, useRef } from "react";
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
  WifiOff, 
  Tag,
  Upload,
  CheckCircle,
  X,
  Eye,
  Trash2,
  Clock,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useReports } from "@/hooks/useReports";

const ReportSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("new");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    reports, 
    loading, 
    createReport, 
    deleteReport, 
    refreshReports 
  } = useReports();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    
    setIsSubmitting(true);
    
    try {
      await createReport({
        title: title.trim(),
        description: description.trim(),
        category: selectedCategory,
        location_address: "123 Main St, Downtown", // This would come from GPS
        location_lat: 40.7128,
        location_lng: -74.0060,
        image_url: uploadedImage || undefined,
        priority: 'medium'
      });

      toast({
        title: "Report Submitted Successfully",
        description: "Your report has been submitted.",
      });
      
      setTitle("");
      setDescription("");
      setSelectedCategory("");
      setUploadedImage(null);
      setActiveTab("submitted");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
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
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Report a Civic Issue</h2>
        <p className="text-muted-foreground">
          Help improve your community by reporting local issues. Works offline - syncs automatically when connected.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new">New Report</TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted {reports.length > 0 && <Badge variant="secondary" className="ml-1">{reports.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2 text-primary" />
                Create New Report
                <Badge variant="outline" className="ml-auto">
                  <WifiOff className="w-3 h-3 mr-1" />
                  Offline Ready
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="mt-1"
                  />
                </div>

                {/* Photo Upload */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Add Photo</Label>
                    <div 
                      className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer mt-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploadedImage ? (
                        <div className="relative">
                          <img src={uploadedImage} alt="Uploaded" className="w-full h-32 object-cover rounded-lg" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1"
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
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">
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
                    <Card className="p-4 bg-muted/50 mt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-success mr-2" />
                          <div>
                            <div className="text-sm font-medium">Current Location</div>
                            <div className="text-xs text-muted-foreground">
                              123 Main St, Downtown
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          GPS Lock
                        </Badge>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <Label className="text-sm font-medium">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Issue Category *
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        type="button"
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        onClick={() => setSelectedCategory(category.id)}
                        className="justify-start p-3 h-auto"
                      >
                        <div className={`w-3 h-3 rounded-full ${category.color} mr-2`} />
                        {category.label}
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
                    className="min-h-[100px] mt-1"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end space-x-4">
                  <Button 
                    type="submit" 
                    disabled={!title.trim() || !selectedCategory || !description.trim() || isSubmitting}
                    className="min-w-[120px]"
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
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