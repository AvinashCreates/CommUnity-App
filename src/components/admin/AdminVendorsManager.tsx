import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Vendor } from '@/types';
import { Store, Phone, Mail, MapPin, Plus, Edit, Star } from 'lucide-react';

const AdminVendorsManager = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    phone: '',
    email: '',
    address: '',
    services: [] as string[],
    hours: '',
    image_url: ''
  });

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      phone: '',
      email: '',
      address: '',
      services: [],
      hours: '',
      image_url: ''
    });
    setSelectedVendor(null);
    setIsEditing(false);
  };

  const handleEditVendor = (vendor: Vendor) => {
    setFormData({
      name: vendor.name,
      description: vendor.description || '',
      category: vendor.category,
      phone: vendor.phone,
      email: vendor.email || '',
      address: vendor.address,
      services: vendor.services || [],
      hours: vendor.hours || '',
      image_url: vendor.image_url || ''
    });
    setSelectedVendor(vendor);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleAddVendor = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedVendor) {
        const { error } = await supabase
          .from('vendors')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            services: formData.services,
            hours: formData.hours,
            image_url: formData.image_url
          })
          .eq('id', selectedVendor.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Vendor updated successfully"
        });
      } else {
        const { error } = await supabase
          .from('vendors')
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            services: formData.services,
            hours: formData.hours,
            image_url: formData.image_url,
            verified: true
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "Vendor added successfully"
        });
      }

      fetchVendors();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast({
        title: "Error",
        description: "Failed to save vendor",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleServicesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const services = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      services
    }));
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
          <h2 className="text-2xl font-bold">Vendors Management</h2>
          <p className="text-muted-foreground">Add and manage service providers</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {vendors.length} Total Vendors
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddVendor}>
                <Plus className="h-4 w-4 mr-2" />
                Add Vendor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? 'Edit Vendor' : 'Add New Vendor'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Business Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="services">Services (comma-separated)</Label>
                  <Input
                    id="services"
                    name="services"
                    value={formData.services.join(', ')}
                    onChange={handleServicesChange}
                    placeholder="Service 1, Service 2, Service 3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hours">Business Hours</Label>
                    <Input
                      id="hours"
                      name="hours"
                      value={formData.hours}
                      onChange={handleInputChange}
                      placeholder="Mon-Fri 9AM-5PM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      name="image_url"
                      type="url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {isEditing ? 'Update Vendor' : 'Add Vendor'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((vendor) => (
          <Card key={vendor.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="space-y-4">
                {vendor.image_url && (
                  <img 
                    src={vendor.image_url} 
                    alt={vendor.name}
                    className="w-full h-32 object-cover rounded-md"
                  />
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{vendor.name}</h3>
                    {vendor.verified && (
                      <Badge variant="default" className="text-xs">
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <Badge variant="secondary">{vendor.category}</Badge>
                  
                  {vendor.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {vendor.description}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{vendor.phone}</span>
                  </div>
                  
                  {vendor.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{vendor.email}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{vendor.address}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {vendor.rating || 0} ({vendor.reviews_count || 0} reviews)
                    </span>
                  </div>
                </div>

                {vendor.services && vendor.services.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">Services:</p>
                    <div className="flex flex-wrap gap-1">
                      {vendor.services.slice(0, 3).map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                      {vendor.services.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{vendor.services.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleEditVendor(vendor)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Vendor
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {vendors.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="p-12 text-center">
              <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No vendors yet</h3>
              <p className="text-muted-foreground mb-4">Add service providers to get started</p>
              <Button onClick={handleAddVendor}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Vendor
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminVendorsManager;