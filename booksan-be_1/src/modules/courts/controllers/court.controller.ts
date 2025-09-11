import { Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
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
import { UserRole } from '@prisma/client';
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

@ApiTags('Courts')
@Controller('courts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly createCourtUseCase: CreateCourtUseCase,
    private readonly updateCourtUseCase: UpdateCourtUseCase,
    private readonly getCourtByIdUseCase: GetCourtByIdUseCase,
    private readonly getCourtsByFacilityUseCase: GetCourtsByFacilityUseCase,
    private readonly deleteCourtUseCase: DeleteCourtUseCase,
    private readonly getCourtStatsUseCase: GetCourtStatsUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new court' })
  @ApiResponse({
    status: 201,
    description: 'Court created successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiResponse({
    status: 409,
    description: 'Court name already exists in facility',
  })
  async createCourt(
    @Body() createCourtDto: CreateCourtDto,
  ): Promise<CourtResponseDto> {
    return this.createCourtUseCase.execute(createCourtDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court updated successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Court not found' })
  @ApiResponse({
    status: 409,
    description: 'Court name already exists in facility',
  })
  async updateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourtDto: UpdateCourtDto,
  ): Promise<CourtResponseDto> {
    return this.updateCourtUseCase.execute(id, updateCourtDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get court by ID' })
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
    return this.getCourtByIdUseCase.execute(id);
  }

  @Get('facility/:facilityId')
  @ApiOperation({ summary: 'Get all courts for a facility' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiResponse({
    status: 200,
    description: 'Courts retrieved successfully',
    type: [CourtResponseDto],
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async getCourtsByFacility(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
  ): Promise<CourtResponseDto[]> {
    return this.getCourtsByFacilityUseCase.execute(facilityId);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({ status: 204, description: 'Court deleted successfully' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete court with existing bookings',
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async deleteCourt(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteCourtUseCase.execute(id);
  }

  @Put(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Deactivate a court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court deactivated successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async deactivateCourt(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourtResponseDto> {
    return this.courtService.deactivateCourt(id);
  }

  @Put(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Activate a court' })
  @ApiParam({ name: 'id', description: 'Court ID' })
  @ApiResponse({
    status: 200,
    description: 'Court activated successfully',
    type: CourtResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Court not found' })
  async activateCourt(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourtResponseDto> {
    return this.courtService.activateCourt(id);
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get court statistics' })
  @ApiQuery({
    name: 'facilityId',
    required: false,
    description: 'Filter stats by facility ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Court statistics retrieved successfully',
  })
  async getCourtStats(@Query('facilityId') facilityId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    bySport: Record<string, number>;
    bySurface: Record<string, number>;
    indoor: number;
    outdoor: number;
  }> {
    return this.getCourtStatsUseCase.execute(facilityId);
  }
}
