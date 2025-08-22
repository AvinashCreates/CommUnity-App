import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/components/ui/use-toast';
import { Vendor } from '@/types';

export const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [favoriteVendors, setFavoriteVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchVendors();
    if (user) {
      fetchFavoriteVendors();
    }
  }, [user]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;

      const mappedVendors: Vendor[] = data.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        category: vendor.category,
        rating: vendor.rating,
        reviews: vendor.reviews_count,
        distance: '1.2 km', // This could be calculated based on user location
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        hours: vendor.hours || 'Mon-Fri: 9AM-6PM',
        verified: vendor.verified,
        description: vendor.description,
        services: vendor.services || [],
        image: vendor.image_url
      }));

      setVendors(mappedVendors);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch vendors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavoriteVendors = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('vendor_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setFavoriteVendors(data.map(item => item.vendor_id));
    } catch (error: any) {
      console.error('Failed to fetch favorite vendors:', error);
    }
  };

  const toggleFavorite = async (vendorId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add favorites",
        variant: "destructive"
      });
      return;
    }

    const isFavorite = favoriteVendors.includes(vendorId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('vendor_id', vendorId);

        if (error) throw error;

        setFavoriteVendors(prev => prev.filter(id => id !== vendorId));
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({
            user_id: user.id,
            vendor_id: vendorId
          });

        if (error) throw error;

        setFavoriteVendors(prev => [...prev, vendorId]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  };

  return {
    vendors,
    favoriteVendors,
    loading,
    toggleFavorite,
    refreshVendors: fetchVendors
  };
};