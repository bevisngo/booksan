import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  Max,
  IsLatitude,
  IsLongitude,
} from 'class-validator';

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

export enum SortBy {
  RELEVANCE = 'relevance',
  DISTANCE = 'distance',
  CREATED_AT = 'created_at',
  NAME = 'name',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchFacilitiesDto {
  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsLatitude()
  @Type(() => Number)
  lat?: number;

  @IsOptional()
  @IsLongitude()
  @Type(() => Number)
  lon?: number;

  @IsOptional()
  @IsString()
  maxDistance?: string = '50km';

  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPublished?: boolean = true;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.RELEVANCE;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;
}
