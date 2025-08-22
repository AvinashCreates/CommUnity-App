export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location_address: string;
  location_lat: number | null;
  location_lng: number | null;
  image_url?: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  priority: string;
  authority: string;
  created_at: string;
  location: string;
  attachment_url?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating?: number;
  reviews?: number;
  reviews_count?: number;
  distance?: string;
  phone: string;
  email?: string;
  address: string;
  hours?: string;
  verified?: boolean;
  description?: string;
  services?: string[];
  image?: string;
  image_url?: string;
  isFavorite?: boolean;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}