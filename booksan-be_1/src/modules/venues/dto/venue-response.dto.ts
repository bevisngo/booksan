import { Type } from 'class-transformer';

export class CourtDto {
  id: string;
  name: string;
  sport: string;
  surface?: string;
  indoor: boolean;
  isActive: boolean;
}

export class VenueLocationDto {
  lat: number;
  lon: number;
}

export class VenueResponseDto {
  id: string;
  name: string;
  slug: string;
  address: string;
  ward?: string;
  city?: string;
  description?: string;

  @Type(() => VenueLocationDto)
  location: VenueLocationDto;

  isPublished: boolean;
  ownerId: string;

  @Type(() => CourtDto)
  courts: CourtDto[];

  createdAt: string;
  updatedAt: string;
}

export class VenueSearchResultDto {
  @Type(() => VenueResponseDto)
  venue: VenueResponseDto;

  score: number;
  distance?: number; // in meters
}

export class SearchVenuesResponseDto {
  @Type(() => VenueSearchResultDto)
  data: VenueSearchResultDto[];

  total: number;
  maxScore: number;

  meta: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
