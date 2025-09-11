import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
import { UserProfile } from '@/modules/auth/repositories';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Sport, Surface, UserRole } from '@prisma/client';
import {
  CourtResponseDto,
  CourtWithFacilityResponseDto,
  CreateCourtDto,
  UpdateCourtDto,
} from '../dto/court.dto';
import { CourtService } from '../services/court.service';
import {
  CreateCourtUseCase,
  DeleteCourtUseCase,
  GetCourtByIdUseCase,
  GetCourtsByFacilityUseCase,
  GetCourtStatsUseCase,
  UpdateCourtUseCase,
} from '../use-cases';

@ApiTags('Owner Courts')
@Controller('owner/courts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@ApiBearerAuth()
export class OwnerCourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly createCourtUseCase: CreateCourtUseCase,
    private readonly updateCourtUseCase: UpdateCourtUseCase,
    private readonly getCourtByIdUseCase: GetCourtByIdUseCase,
    private readonly getCourtsByFacilityUseCase: GetCourtsByFacilityUseCase,
    private readonly deleteCourtUseCase: DeleteCourtUseCase,
    private readonly getCourtStatsUseCase: GetCourtStatsUseCase,
  ) {}

  @Get('facility/:facilityId')
  @ApiOperation({ summary: 'Get all courts for owned facility' })
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
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active status',
  })
  @ApiResponse({
    status: 200,
    description: 'Courts retrieved successfully',
    type: [CourtResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to access this facility',
  })
  async getCourtsByFacility(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @CurrentUser() user: UserProfile,
    @Query('sport') sport?: Sport,
    @Query('surface') surface?: Surface,
    @Query('indoor') indoor?: boolean,
    @Query('isActive') isActive?: boolean,
  ): Promise<CourtResponseDto[]> {
    // TODO: Add facility ownership validation
    // For now, we'll implement basic validation in the use case

    const courts = await this.getCourtsByFacilityUseCase.execute(facilityId);

    // Filter courts based on query parameters
    return courts.filter(court => {
      const sportMatch = !sport || court.sport === sport;
      const surfaceMatch = !surface || court.surface === surface;
      const indoorMatch = indoor === undefined || court.indoor === indoor;
      const activeMatch = isActive === undefined || court.isActive === isActive;

      return sportMatch && surfaceMatch && indoorMatch && activeMatch;
    });
  }

  @Post('facility/:facilityId')
  @ApiOperation({ summary: 'Create a new court in owned facility' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiResponse({
    status: 201,
    description: 'Court created successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to create courts in this facility',
  })
  @ApiResponse({
    status: 409,
    description: 'Court name already exists in facility',
  })
  async createCourt(
    @Body() createCourtDto: CreateCourtDto,
    @CurrentUser() user: UserProfile,
  ): Promise<CourtResponseDto> {
    // Ensure the court is created for the specified facility

    // TODO: Add facility ownership validation
    return this.createCourtUseCase.execute(createCourtDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get court by ID (Owner view)' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court retrieved successfully',
    type: CourtWithFacilityResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to access this court',
  })
  async getCourtById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<CourtWithFacilityResponseDto> {
    const court = await this.getCourtByIdUseCase.execute(id);

    // TODO: Add ownership validation
    // Ensure the court belongs to a facility owned by the user

    return court;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update owned court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court updated successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this court',
  })
  @ApiResponse({
    status: 409,
    description: 'Court name already exists in facility',
  })
  async updateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourtDto: UpdateCourtDto,
    @CurrentUser() user: UserProfile,
  ): Promise<CourtResponseDto> {
    // TODO: Add ownership validation
    return this.updateCourtUseCase.execute(id, updateCourtDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete owned court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 204, description: 'Court deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete court with existing bookings',
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to delete this court',
  })
  async deleteCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<void> {
    // TODO: Add ownership validation
    return this.deleteCourtUseCase.execute(id);
  }

  @Put(':id/activate')
  @ApiOperation({ summary: 'Activate owned court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court activated successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to activate this court',
  })
  async activateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<CourtResponseDto> {
    // TODO: Add ownership validation
    return this.courtService.activateCourt(id);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate owned court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court deactivated successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to deactivate this court',
  })
  async deactivateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserProfile,
  ): Promise<CourtResponseDto> {
    // TODO: Add ownership validation
    return this.courtService.deactivateCourt(id);
  }

  @Get('facility/:facilityId/stats')
  @ApiOperation({ summary: 'Get court statistics for owned facility' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiResponse({
    status: 200,
    description: 'Court statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to access this facility',
  })
  async getCourtStats(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @CurrentUser() user: UserProfile,
  ): Promise<{
    total: number;
    active: number;
    inactive: number;
    bySport: Record<string, number>;
    bySurface: Record<string, number>;
    indoor: number;
    outdoor: number;
  }> {
    // TODO: Add facility ownership validation
    return this.getCourtStatsUseCase.execute(facilityId);
  }
}
