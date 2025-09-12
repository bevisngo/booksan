export interface Facility {
  id: string;
  name: string;
  slug: string;
  desc?: string;
  phone?: string;
  address: string;
  ward?: string;
  city?: string;
  isPublished: boolean;
  latitude?: number;
  longitude?: number;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  
  // Related data
  courts?: Court[];
  profile?: FacilityProfile;
}

export interface Court {
  id: string;
  name: string;
  sport: string;
  surface?: string;
  indoor: boolean;
  notes?: string;
  slotMinutes: number;
  isActive: boolean;
  facilityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityProfile {
  id: string;
  facilityId: string;
  templateId?: string;
  customHtml?: string;
  customCss?: string;
  metaTitle?: string;
  metaKeywords: string[];
  metaDescription?: string;
  openGraphTitle?: string;
  openGraphDesc?: string;
  openGraphImage?: string;
  isCustomized: boolean;
}

export interface CourtImage {
  id: string;
  url: string;
  altText?: string;
  order: number;
  isMain?: boolean;
}

export interface CreateFacilityData {
  name: string;
  desc?: string;
  phone?: string;
  address: string;
  ward?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isPublished?: boolean;
}

export interface UpdateFacilityData extends Partial<CreateFacilityData> {}

export interface CreateCourtData {
  facilityId: string;
  name: string;
  sport: string;
  surface?: string;
  indoor: boolean;
  notes?: string;
  slotMinutes: number;
}

export interface UpdateCourtData extends Partial<CreateCourtData> {
  isActive?: boolean;
}

export interface FacilityFilters {
  search?: string;
  status?: 'all' | 'published' | 'unpublished';
  city?: string;
  ward?: string;
  page?: number;
  limit?: number;
}

export interface FacilitiesResponse {
  data: Facility[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const SPORT_TYPES = [
  'TENNIS',
  'BADMINTON', 
  'SQUASH',
  'BASKETBALL',
  'FOOTBALL',
  'VOLLEYBALL',
  'TABLE_TENNIS',
  'PICKLEBALL',
  'FUTSAL',
  'OTHER',
] as const;

export type SportType = (typeof SPORT_TYPES)[number];

export const SURFACE_TYPES = [
  'CONCRETE',
  'SYNTHETIC',
  'GRASS',
  'WOOD',
  'CLAY',
  'RUBBER',
  'OTHER',
] as const;

export type SurfaceType = (typeof SURFACE_TYPES)[number];

export const SLOT_MINUTES = [15, 30, 60, 90, 120] as const;
