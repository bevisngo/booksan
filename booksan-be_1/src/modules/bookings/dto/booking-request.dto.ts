import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
} from 'class-validator';

export enum BookingViewType {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class GetBookingsQueryDto {
  @IsOptional()
  @IsString()
  courtId?: string;

  @IsOptional()
  @IsString()
  facilityId?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(BookingViewType)
  view?: BookingViewType;

  @IsOptional()
  @IsString()
  status?: string;
}

export class CancelBookingDto {
  @IsNotEmpty()
  @IsString()
  reason: string;

  @IsOptional()
  @IsString()
  cancellationType?: 'single' | 'all_future' | 'all';
}
