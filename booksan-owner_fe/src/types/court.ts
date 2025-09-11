// Court types matching the backend API

export enum Sport {
  TENNIS = 'TENNIS',
  BADMINTON = 'BADMINTON',
  SQUASH = 'SQUASH',
  BASKETBALL = 'BASKETBALL',
  FOOTBALL = 'FOOTBALL',
  VOLLEYBALL = 'VOLLEYBALL',
  TABLE_TENNIS = 'TABLE_TENNIS',
  OTHER = 'OTHER',
  PICKLEBALL = 'PICKLEBALL',
  FUTSAL = 'FUTSAL',
}

export enum Surface {
  HARD_COURT = 'HARD_COURT',
  CLAY = 'CLAY',
  GRASS = 'GRASS',
  CARPET = 'CARPET',
  CONCRETE = 'CONCRETE',
  WOODEN = 'WOODEN',
  SYNTHETIC = 'SYNTHETIC',
  OTHER = 'OTHER',
  ACRYLIC = 'ACRYLIC',
  SAND = 'SAND',
}

export interface Court {
  id: string;
  facilityId: string;
  name: string;
  sport: Sport;
  surface?: Surface;
  indoor: boolean;
  notes?: string;
  slotMinutes: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CourtWithFacility extends Court {
  facility: {
    id: string;
    name: string;
    slug: string;
    address: string;
  };
}

export interface CreateCourtData {
  facilityId: string;
  name: string;
  sport: Sport;
  surface?: Surface;
  indoor?: boolean;
  notes?: string;
  slotMinutes: number;
  isActive?: boolean;
}

export interface UpdateCourtData {
  name?: string;
  sport?: Sport;
  surface?: Surface;
  indoor?: boolean;
  notes?: string;
  slotMinutes?: number;
  isActive?: boolean;
}

export interface CourtFilters {
  facilityId?: string;
  sport?: Sport;
  surface?: Surface;
  indoor?: boolean;
  isActive?: boolean;
}

export interface CourtStats {
  total: number;
  active: number;
  inactive: number;
  bySport: Record<string, number>;
  bySurface: Record<string, number>;
  indoor: number;
  outdoor: number;
}

// Sport display names for UI
export const SPORT_DISPLAY_NAMES: Record<Sport, string> = {
  [Sport.TENNIS]: 'Tennis',
  [Sport.BADMINTON]: 'Badminton',
  [Sport.SQUASH]: 'Squash',
  [Sport.BASKETBALL]: 'Basketball',
  [Sport.FOOTBALL]: 'Football',
  [Sport.VOLLEYBALL]: 'Volleyball',
  [Sport.TABLE_TENNIS]: 'Table Tennis',
  [Sport.OTHER]: 'Other',
  [Sport.PICKLEBALL]: 'Pickleball',
  [Sport.FUTSAL]: 'Futsal',
};

// Surface display names for UI
export const SURFACE_DISPLAY_NAMES: Record<Surface, string> = {
  [Surface.HARD_COURT]: 'Hard Court',
  [Surface.CLAY]: 'Clay',
  [Surface.GRASS]: 'Grass',
  [Surface.CARPET]: 'Carpet',
  [Surface.CONCRETE]: 'Concrete',
  [Surface.WOODEN]: 'Wooden',
  [Surface.SYNTHETIC]: 'Synthetic',
  [Surface.OTHER]: 'Other',
  [Surface.ACRYLIC]: 'Acrylic',
  [Surface.SAND]: 'Sand',
};

// Common slot durations
export const SLOT_DURATIONS = [15, 30, 45, 60, 90, 120] as const;
export type SlotDuration = typeof SLOT_DURATIONS[number];
