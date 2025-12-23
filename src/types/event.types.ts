// Core Event Types
export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt?: string;
  startDateTime: Date;
  endDateTime: Date;
  timezone: string;
  location: PhysicalLocation | VirtualLocation;
  capacity?: number;
  currentAttendees: number;
  status: EventStatus;
  visibility: EventVisibility;
  organizerId: string;
  categoryId?: string;
  price?: EventPrice;
  images: EventImages;
  metadata: Record<string, unknown>;
  nftMetadata?: NFTMetadata;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export type EventStatus =
  | 'draft'
  | 'published'
  | 'cancelled'
  | 'completed'
  | 'archived';
export type EventVisibility = 'public' | 'private' | 'unlisted';

export interface PhysicalLocation {
  type: 'physical';
  address: string;
  city: string;
  country: string;
  coordinates?: { lat: number; lng: number };
}

export interface VirtualLocation {
  type: 'virtual';
  url: string;
  platform?: string;
}

export interface EventPrice {
  amount: number;
  currency: string;
  type: 'free' | 'paid';
}

export interface EventImages {
  thumbnail: string;
  banner: string;
  gallery?: string[];
}

export interface NFTMetadata {
  mintAddress: string;
  collectionAddress?: string;
  metadata: {
    name: string;
    symbol: string;
    image: string;
    attributes?: Array<{ trait_type: string; value: string }>;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  createdAt: Date;
}

// Query Parameters with enhanced filtering options
export interface EventQueryParams {
  page?: number;
  limit?: number;
  status?: EventStatus;
  category?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
  visibility?: EventVisibility;
  // Additional advanced filters
  organizerId?: string;
  minCapacity?: number;
  maxCapacity?: number;
  priceType?: 'free' | 'paid';
  minPrice?: number;
  maxPrice?: number;
  hasNFT?: boolean;
  sortBy?: 'startDate' | 'createdAt' | 'title' | 'capacity';
  sortOrder?: 'asc' | 'desc';
}

// Form Data Types
export interface EventFormData {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  timezone: string;
  location: PhysicalLocation | VirtualLocation;
  capacity?: number;
  visibility: EventVisibility;
  price?: EventPrice;
  images: EventImages;
  categoryId?: string;
  nftMetadata?: Partial<NFTMetadata>;
}
