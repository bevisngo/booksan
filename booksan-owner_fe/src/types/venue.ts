export interface Court {
  id: string;
  name: string;
  sportType: string;
  description?: string;
  slotLength: 15 | 30 | 60; // minutes
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Address information
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    province: string;
    country: string;
  };
  
  // Coordinates
  latitude?: number;
  longitude?: number;
  
  // Contact info
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  
  // Media
  gallery: CourtImage[];
}

export interface CourtImage {
  id: string;
  url: string;
  altText?: string;
  order: number;
  isMain?: boolean;
}

export interface CreateCourtData {
  name: string;
  sportType: string;
  description?: string;
  slotLength: 15 | 30 | 60;
  address: {
    street: string;
    ward: string;
    district: string;
    city: string;
    province: string;
    country: string;
  };
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
}

export interface UpdateCourtData extends Partial<CreateCourtData> {
  isActive?: boolean;
  isPublished?: boolean;
}

export interface CourtFilters {
  search?: string;
  status?: 'all' | 'active' | 'inactive';
  published?: 'all' | 'published' | 'unpublished';
  sportType?: string;
  page?: number;
  limit?: number;
}

export interface CourtsResponse {
  courts: Court[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const SPORT_TYPES = [
  'football',
  'basketball',
  'tennis',
  'badminton',
  'volleyball',
  'soccer',
  'table_tennis',
  'squash',
  'swimming',
  'gym',
  'other',
] as const;

export type SportType = (typeof SPORT_TYPES)[number];

export const SLOT_LENGTHS = [15, 30, 60] as const;
