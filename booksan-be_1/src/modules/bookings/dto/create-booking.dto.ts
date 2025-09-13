import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  IsDateString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingSlotDto {
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @IsNotEmpty()
  @IsDateString()
  endTime: string;
}

export class CreateBookingDto {
  @IsNotEmpty()
  @IsString()
  courtId: string;

  @IsNotEmpty()
  @IsString()
  playerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingSlotDto)
  slots: CreateBookingSlotDto[];

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  unitPrice: number;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  totalPrice: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  slotMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isRecurrence?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
