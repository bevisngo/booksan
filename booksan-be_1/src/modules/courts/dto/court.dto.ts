import {
  IsOptional,
  IsString,
  IsBoolean,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Sport, Surface } from '@prisma/client';
import { BaseFilterDto, BasePaginationResponseDto } from '@/common/dto';
import { Exclude } from 'class-transformer';

export class CreateCourtDto {
  @IsString()
  name: string;

  @IsEnum(Sport)
  sport: Sport;

  @IsOptional()
  @IsEnum(Surface)
  surface?: Surface;

  @IsOptional()
  @IsBoolean()
  indoor?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsInt()
  @Min(15)
  @Max(480)
  slotMinutes: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCourtDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @IsOptional()
  @IsEnum(Surface)
  surface?: Surface;

  @IsOptional()
  @IsBoolean()
  indoor?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  slotMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CourtResponseDto {
  id: string;
  facilityId: string;
  name: string;
  sport: Sport;
  surface?: Surface;
  indoor: boolean;
  notes?: string;
  slotMinutes: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class CourtWithFacilityResponseDto extends CourtResponseDto {
  facility: {
    id: string;
    name: string;
    slug: string;
    address: string;
  };
}

export class CourtFiltersDto extends BaseFilterDto {
  @IsUUID()
  facilityId: string;

  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @IsOptional()
  @IsEnum(Surface)
  surface?: Surface;

  @IsOptional()
  @IsBoolean()
  indoor?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CourtPaginationResponseDto extends BasePaginationResponseDto<CourtResponseDto> {
  declare data: CourtResponseDto[];
}
