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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Sport, Surface } from '@prisma/client';

export class CreateCourtDto {
  @ApiProperty({ description: 'The facility ID this court belongs to' })
  @IsUUID()
  facilityId: string;

  @ApiProperty({ description: 'Court name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Sport type', enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiPropertyOptional({ description: 'Court surface type', enum: Surface })
  @IsOptional()
  @IsEnum(Surface)
  surface?: Surface;

  @ApiPropertyOptional({
    description: 'Whether the court is indoor',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  indoor?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes about the court' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ description: 'Duration of each booking slot in minutes' })
  @IsInt()
  @Min(15)
  @Max(480)
  slotMinutes: number;

  @ApiPropertyOptional({
    description: 'Whether the court is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCourtDto {
  @ApiPropertyOptional({ description: 'Court name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Sport type', enum: Sport })
  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @ApiPropertyOptional({ description: 'Court surface type', enum: Surface })
  @IsOptional()
  @IsEnum(Surface)
  surface?: Surface;

  @ApiPropertyOptional({ description: 'Whether the court is indoor' })
  @IsOptional()
  @IsBoolean()
  indoor?: boolean;

  @ApiPropertyOptional({ description: 'Additional notes about the court' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Duration of each booking slot in minutes',
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(480)
  slotMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether the court is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CourtResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  facilityId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  sport: Sport;

  @ApiPropertyOptional()
  surface?: Surface;

  @ApiProperty()
  indoor: boolean;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  slotMinutes: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CourtWithFacilityResponseDto extends CourtResponseDto {
  @ApiProperty()
  facility: {
    id: string;
    name: string;
    slug: string;
    address: string;
  };
}

export class CourtFiltersDto {
  @ApiPropertyOptional({ description: 'Filter by facility ID' })
  @IsOptional()
  @IsUUID()
  facilityId?: string;

  @ApiPropertyOptional({ description: 'Filter by sport type', enum: Sport })
  @IsOptional()
  @IsEnum(Sport)
  sport?: Sport;

  @ApiPropertyOptional({ description: 'Filter by surface type', enum: Surface })
  @IsOptional()
  @IsEnum(Surface)
  surface?: Surface;

  @ApiPropertyOptional({ description: 'Filter by indoor/outdoor' })
  @IsOptional()
  @IsBoolean()
  indoor?: boolean;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
