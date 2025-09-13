import { JwtAuthGuard, PlayerRoleGuard } from '@/modules/auth/guards';
import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Sport, Surface } from '@prisma/client';
import {
  CourtResponseDto,
  CourtWithFacilityResponseDto,
} from '../dto/court.dto';
import { CourtService } from '../services/court.service';
import { GetCourtByIdUseCase, GetCourtsByFacilityUseCase } from '../use-cases';
import { CurrentUser } from '@/modules/auth/decorators';
import { OwnerProfile } from '@/repositories/auth.repository';

@Controller('player/courts')
@UseGuards(JwtAuthGuard, PlayerRoleGuard)
export class PlayerCourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly getCourtByIdUseCase: GetCourtByIdUseCase,
    private readonly getCourtsByFacilityUseCase: GetCourtsByFacilityUseCase,
  ) {}

  @Get('facility/:facilityId')
  async getCourtsByFacility(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Query('sport') sport?: Sport,
    @Query('surface') surface?: Surface,
    @Query('indoor') indoor?: boolean,
  ): Promise<CourtResponseDto[]> {
    // Get only active courts for players
    const courts = await this.getCourtsByFacilityUseCase.execute(facilityId);

    // Filter courts based on query parameters and only show active courts
    return courts.filter(court => {
      const isActive = court.isActive;
      const sportMatch = !sport || court.sport === sport;
      const surfaceMatch = !surface || court.surface === surface;
      const indoorMatch = indoor === undefined || court.indoor === indoor;

      return isActive && sportMatch && surfaceMatch && indoorMatch;
    });
  }

  @Get(':id')
  async getCourtById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: OwnerProfile,
  ): Promise<CourtWithFacilityResponseDto> {
    const facilityId = user.facilityId;
    const court = await this.getCourtByIdUseCase.execute(id, facilityId);

    // Only show active courts to players
    if (!court.isActive) {
      throw new Error('Court not found or not available');
    }

    return court;
  }

  @Get('facility/:facilityId/sport/:sport')
  async getCourtsByFacilityAndSport(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Param('sport') sport: Sport,
  ): Promise<CourtResponseDto[]> {
    const courts = await this.getCourtsByFacilityUseCase.execute(facilityId);

    // Filter by sport and only show active courts
    return courts.filter(court => court.isActive && court.sport === sport);
  }

  @Get('facility/:facilityId/available')
  async getAvailableCourts(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Query('date') date: string,
    @Query('sport') sport?: Sport,
  ): Promise<CourtResponseDto[]> {
    // TODO: Implement availability check logic
    // For now, return active courts with basic filtering
    const courts = await this.getCourtsByFacilityUseCase.execute(facilityId);

    return courts.filter(court => {
      const isActive = court.isActive;
      const sportMatch = !sport || court.sport === sport;

      return isActive && sportMatch;
    });
  }
}
