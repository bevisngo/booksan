import { Public } from '@/modules/auth/decorators';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Sport, Surface } from '@prisma/client';
import {
  CourtResponseDto,
  CourtWithFacilityResponseDto,
} from '../dto/court.dto';
import { CourtService } from '../services/court.service';
import { GetCourtByIdUseCase, GetCourtsByFacilityUseCase } from '../use-cases';

@ApiTags('Player Courts')
@Controller('player/courts')
@Public() // Players can view courts without authentication
export class PlayerCourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly getCourtByIdUseCase: GetCourtByIdUseCase,
    private readonly getCourtsByFacilityUseCase: GetCourtsByFacilityUseCase,
  ) {}

  @Get('facility/:facilityId')
  @ApiOperation({ summary: 'Get all courts for a facility (Player view)' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiQuery({
    name: 'sport',
    required: false,
    enum: Sport,
    description: 'Filter by sport type',
  })
  @ApiQuery({
    name: 'surface',
    required: false,
    enum: Surface,
    description: 'Filter by surface type',
  })
  @ApiQuery({
    name: 'indoor',
    required: false,
    type: Boolean,
    description: 'Filter by indoor/outdoor',
  })
  @ApiResponse({
    status: 200,
    description: 'Courts retrieved successfully',
    type: [CourtResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
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
  @ApiOperation({ summary: 'Get court by ID (Player view)' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court retrieved successfully',
    type: CourtWithFacilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async getCourtById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourtWithFacilityResponseDto> {
    const court = await this.getCourtByIdUseCase.execute(id);

    // Only show active courts to players
    if (!court.isActive) {
      throw new Error('Court not found or not available');
    }

    return court;
  }

  @Get('facility/:facilityId/sport/:sport')
  @ApiOperation({ summary: 'Get courts by facility and sport (Player view)' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiParam({ name: 'sport', enum: Sport, description: 'Sport type' })
  @ApiResponse({
    status: 200,
    description: 'Courts retrieved successfully',
    type: [CourtResponseDto],
  })
  async getCourtsByFacilityAndSport(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Param('sport') sport: Sport,
  ): Promise<CourtResponseDto[]> {
    const courts = await this.getCourtsByFacilityUseCase.execute(facilityId);

    // Filter by sport and only show active courts
    return courts.filter(court => court.isActive && court.sport === sport);
  }

  @Get('facility/:facilityId/available')
  @ApiOperation({ summary: 'Get available courts for booking (Player view)' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiQuery({
    name: 'date',
    required: true,
    type: String,
    description: 'Date for availability check (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'sport',
    required: false,
    enum: Sport,
    description: 'Filter by sport type',
  })
  @ApiResponse({
    status: 200,
    description: 'Available courts retrieved successfully',
    type: [CourtResponseDto],
  })
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
