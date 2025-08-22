import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MapPin, 
  Phone, 
  Star, 
  Clock,
  Shield,
  Filter,
  Grid,
  List,
  Heart,
  HeartOff,
  Mail,
  ExternalLink,
  SortAsc,
  SortDesc
} from "lucide-react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";
import { Vendor } from "@/types";

const VendorsSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"rating" | "distance" | "reviews">("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorite_vendors", []);
  const { toast } = useToast();

  const vendors: Vendor[] = [
    {
      id: "1",
      name: "QuickFix Plumbing",
      category: "Plumbing",
      rating: 4.8,
      reviews: 127,
      distance: "0.3 km",
      phone: "+1-555-0123",
      address: "123 Main St, Downtown",
      hours: "24/7 Emergency",
      verified: true,
      description: "Emergency plumbing services with 30+ years of experience.",
      services: ["Emergency Repairs", "Pipe Installation", "Drain Cleaning"]
    },
    {
      id: "2",
      name: "Green Garden Care",
      category: "Landscaping",
      rating: 4.6,
      reviews: 89,
      distance: "0.7 km",
      phone: "+1-555-0456",
      address: "456 Oak Ave, Suburbs",
      hours: "Mon-Sat 8AM-6PM",
      verified: true,
      description: "Eco-friendly landscaping and garden maintenance.",
      services: ["Lawn Care", "Tree Trimming", "Garden Design"]
    },
    {
      id: "3",
      name: "City Electronics Repair",
      category: "Electronics",
      rating: 4.4,
      reviews: 203,
      distance: "1.2 km",
      phone: "+1-555-0789",
      address: "789 Tech Blvd, Tech District",
      hours: "Mon-Fri 9AM-7PM",
      verified: true,
      description: "Professional repair services for all electronic devices.",
      services: ["Phone Repair", "Computer Fix", "TV Service"]
    },
    {
      id: "4",
      name: "Reliable Cleaning Co",
      category: "Cleaning",
      rating: 4.9,
      reviews: 156,
      distance: "0.5 km",
      phone: "+1-555-0321",
      address: "321 Clean St, Downtown",
      hours: "Mon-Sun 7AM-9PM",
      verified: true,
      description: "Professional cleaning services for homes and offices.",
      services: ["House Cleaning", "Office Cleaning", "Deep Clean"]
    }
  ];

  const categories = ["All", "Plumbing", "Electrical", "Cleaning", "Landscaping", "Electronics", "Home Repair"];

  const toggleFavorite = (vendorId: string) => {
    const isFavorite = favorites.includes(vendorId);
    if (isFavorite) {
      setFavorites(prev => prev.filter(id => id !== vendorId));
      toast({
        title: "Removed from Favorites",
        description: "Vendor removed from your favorites.",
      });
    } else {
      setFavorites(prev => [...prev, vendorId]);
      toast({
        title: "Added to Favorites",
        description: "Vendor added to your favorites.",
      });
    }
  };

  const callVendor = (phone: string, name: string) => {
    toast({
      title: "Calling Vendor",
      description: `Initiating call to ${name}`,
    });
    // In a real app, this would trigger a phone call
    window.open(`tel:${phone}`);
  };

  const emailVendor = (email: string, name: string) => {
    toast({
      title: "Opening Email",
      description: `Opening email to ${name}`,
    });
    window.open(`mailto:${email}`);
  };

  const filteredVendors = vendors
    .filter(vendor => {
      const matchesSearch = vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           vendor.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "All" || vendor.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case "rating":
          compareValue = a.rating - b.rating;
          break;
        case "distance":
          compareValue = parseFloat(a.distance) - parseFloat(b.distance);
          break;
        case "reviews":
          compareValue = a.reviews - b.reviews;
          break;
      }
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  const favoriteVendors = vendors.filter(vendor => favorites.includes(vendor.id));

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-4">Trusted Local Services</h2>
        <p className="text-muted-foreground">
          Find verified local vendors and service providers in your community.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">
            All Vendors {filteredVendors.length > 0 && <Badge variant="secondary" className="ml-1">{filteredVendors.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites {favoriteVendors.length > 0 && <Badge variant="secondary" className="ml-1">{favoriteVendors.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="verified">
            Verified {vendors.filter(v => v.verified).length > 0 && <Badge variant="secondary" className="ml-1">{vendors.filter(v => v.verified).length}</Badge>}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors, services, or categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md text-sm"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "rating" | "distance" | "reviews")}
                  className="px-3 py-2 border border-input rounded-md text-sm"
                >
                  <option value="rating">Rating</option>
                  <option value="distance">Distance</option>
                  <option value="reviews">Reviews</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSort}
                >
                  {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>
                
                <div className="flex rounded-md border">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Vendors Grid/List */}
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
            {filteredVendors.map((vendor) => {
              const isFavorite = favorites.includes(vendor.id);
              return (
                <Card key={vendor.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {vendor.name}
                        {vendor.verified && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(vendor.id)}
                        >
                          {isFavorite ? (
                            <Heart className="w-4 h-4 text-destructive fill-current" />
                          ) : (
                            <HeartOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-warning fill-current" />
                        {vendor.rating} ({vendor.reviews})
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {vendor.distance}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{vendor.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="w-3 h-3 mr-2 text-muted-foreground" />
                        {vendor.address}
                      </div>
                      <div className="flex items-center text-sm">
                        <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
                        {vendor.hours}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {vendor.services.map((service, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => callVendor(vendor.phone, vendor.name)}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      {vendor.email && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => emailVendor(vendor.email!, vendor.name)}
                        >
                          <Mail className="w-3 h-3" />
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
            {favoriteVendors.length === 0 ? (
              <Card className="p-8 text-center col-span-full">
                <div className="text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Favorites Yet</h3>
                  <p>Add vendors to your favorites to see them here.</p>
                </div>
              </Card>
            ) : (
              favoriteVendors.map((vendor) => (
                <Card key={vendor.id} className="shadow-card hover:shadow-card-hover transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {vendor.name}
                        <Heart className="w-4 h-4 ml-2 text-destructive fill-current" />
                      </CardTitle>
                      <Badge variant="outline">{vendor.category}</Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-warning fill-current" />
                        {vendor.rating} ({vendor.reviews})
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {vendor.distance}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{vendor.description}</p>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => callVendor(vendor.phone, vendor.name)}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorite(vendor.id)}
                      >
                        <HeartOff className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="verified" className="mt-6">
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
            {vendors.filter(v => v.verified).map((vendor) => {
              const isFavorite = favorites.includes(vendor.id);
              return (
                <Card key={vendor.id} className="shadow-card hover:shadow-card-hover transition-shadow border-success/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg flex items-center">
                        {vendor.name}
                        <Badge variant="secondary" className="ml-2 text-xs bg-success">
                          <Shield className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleFavorite(vendor.id)}
                        >
                          {isFavorite ? (
                            <Heart className="w-4 h-4 text-destructive fill-current" />
                          ) : (
                            <HeartOff className="w-4 h-4" />
                          )}
                        </Button>
                        <Badge variant="outline">{vendor.category}</Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1 text-warning fill-current" />
                        {vendor.rating} ({vendor.reviews})
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {vendor.distance}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{vendor.description}</p>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1"
                        onClick={() => callVendor(vendor.phone, vendor.name)}
                      >
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};

export default VendorsSection;