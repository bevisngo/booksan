import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsNumber,
  IsLatitude,
  IsLongitude,
  MinLength,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateFacilityDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  desc?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(5)
  @MaxLength(200)
  address: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateFacilityDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  desc?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class FacilityFilters {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  search?: string;
}

export class FacilityWithRelationsDto {
  id: string;
  ownerId: string;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  owner?: {
    id: string;
    fullname: string;
    email: string | null;
    phone: string | null;
  };
  courts?: Array<{
    id: string;
    name: string;
    sport: string;
    surface?: string;
    indoor: boolean;
    isActive: boolean;
  }>;
  openHours?: Array<{
    id: string;
    weekDay: number;
    openTime: string;
    closeTime: string;
  }>;
  profile?: {
    id: string;
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
  };
}

export class FacilityStatsDto {
  totalFacilities: number;
  publishedFacilities: number;
  unpublishedFacilities: number;
  facilitiesWithProfiles: number;
  facilitiesWithCourts: number;
  averageCourtsPerFacility: number;
}
