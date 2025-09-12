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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateFacilityDto {
  @ApiProperty({ description: 'Facility name' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Facility description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  desc?: string;

  @ApiPropertyOptional({ description: 'Facility phone number' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @ApiProperty({ description: 'Facility address' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  address: string;

  @ApiPropertyOptional({ description: 'Ward/neighborhood' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Facility latitude' })
  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Facility longitude' })
  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Whether facility is published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateFacilityDto {
  @ApiPropertyOptional({ description: 'Facility name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Facility description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  desc?: string;

  @ApiPropertyOptional({ description: 'Facility phone number' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Facility address' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  address?: string;

  @ApiPropertyOptional({ description: 'Ward/neighborhood' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ward?: string;

  @ApiPropertyOptional({ description: 'City' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Facility latitude' })
  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  latitude?: number;

  @ApiPropertyOptional({ description: 'Facility longitude' })
  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  longitude?: number;

  @ApiPropertyOptional({ description: 'Whether facility is published' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class FacilityFilters {
  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiPropertyOptional({ description: 'Filter by owner ID' })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiPropertyOptional({ description: 'Filter by facility slug' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({ description: 'Filter by city' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Filter by ward' })
  @IsOptional()
  @IsString()
  ward?: string;

  @ApiPropertyOptional({ description: 'Filter by published status' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'Search by name or description' })
  @IsOptional()
  @IsString()
  search?: string;
}

export class FacilityWithRelationsDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  desc?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiProperty()
  address: string;

  @ApiPropertyOptional()
  ward?: string;

  @ApiPropertyOptional()
  city?: string;

  @ApiProperty()
  isPublished: boolean;

  @ApiPropertyOptional()
  latitude?: number;

  @ApiPropertyOptional()
  longitude?: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt?: Date;

  @ApiPropertyOptional()
  owner?: {
    id: string;
    fullname: string;
    email: string | null;
    phone: string | null;
  };

  @ApiPropertyOptional()
  courts?: Array<{
    id: string;
    name: string;
    sport: string;
    surface?: string;
    indoor: boolean;
    isActive: boolean;
  }>;

  @ApiPropertyOptional()
  openHours?: Array<{
    id: string;
    weekDay: number;
    openTime: string;
    closeTime: string;
  }>;

  @ApiPropertyOptional()
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
  @ApiProperty()
  totalFacilities: number;

  @ApiProperty()
  publishedFacilities: number;

  @ApiProperty()
  unpublishedFacilities: number;

  @ApiProperty()
  facilitiesWithProfiles: number;

  @ApiProperty()
  facilitiesWithCourts: number;

  @ApiProperty()
  averageCourtsPerFacility: number;
}
