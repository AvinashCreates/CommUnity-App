export interface Report {
  id: string;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  image?: string;
  status: 'draft' | 'submitted' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  timestamp: string;
  isOffline?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'alert' | 'maintenance' | 'event' | 'update';
  priority: 'low' | 'medium' | 'high';
  authority: string;
  timestamp: string;
  location: string;
  isOffline?: boolean;
  hasAttachment?: boolean;
  attachmentUrl?: string;
  readAt?: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviews: number;
  distance: string;
  phone: string;
  email?: string;
  address: string;
  hours: string;
  verified: boolean;
  description: string;
  services: string[];
  image?: string;
  isFavorite?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar?: string;
}