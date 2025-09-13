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
  UsePipes,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  CourtResponseDto,
  CourtWithFacilityResponseDto,
  CreateCourtDto,
  CourtFiltersDto,
  UpdateCourtDto,
  CourtPaginationResponseDto,
} from '../dto/court.dto';
import { PaginationPipe } from '@/common/pipes';
import { CourtService } from '../services/court.service';
import {
  CreateCourtUseCase,
  DeleteCourtUseCase,
  GetCourtByIdUseCase,
  GetCourtsByFacilityUseCase,
  GetCourtStatsUseCase,
  UpdateCourtUseCase,
  GetAllCourtsUseCase,
} from '../use-cases';
import { CurrentUser } from '@/modules/auth/decorators';
import { OwnerProfile } from '@/repositories/auth.repository';

/**
 * CourtController handles all public and owner/admin court routes.
 * All endpoints require authentication.
 * Pagination, filtering, and sorting are handled via CourtFiltersDto and PaginationPipe.
 *
 * Edge cases and constraints:
 * - Only OWNER/ADMIN can create, update, delete, activate, or deactivate courts.
 * - All input DTOs are validated.
 * - All responses are typed via DTOs.
 */
@Controller('courts')
@UseGuards(JwtAuthGuard)
export class CourtController {
  constructor(
    private readonly courtService: CourtService,
    private readonly createCourtUseCase: CreateCourtUseCase,
    private readonly updateCourtUseCase: UpdateCourtUseCase,
    private readonly getCourtByIdUseCase: GetCourtByIdUseCase,
    private readonly getCourtsByFacilityUseCase: GetCourtsByFacilityUseCase,
    private readonly deleteCourtUseCase: DeleteCourtUseCase,
    private readonly getCourtStatsUseCase: GetCourtStatsUseCase,
    private readonly getAllCourtsUseCase: GetAllCourtsUseCase,
  ) {}

  /**
   * Get a paginated list of courts.
   * Supports filtering, sorting, and search via query params.
   */
  @Get()
  @UsePipes(new PaginationPipe(CourtFiltersDto))
  async getCourts(
    @CurrentUser() user: OwnerProfile,
    @Query() filters: CourtFiltersDto,
  ): Promise<CourtPaginationResponseDto> {
    return this.getAllCourtsUseCase.execute(filters);
  }

  /**
   * Create a new court (OWNER/ADMIN only).
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async createCourt(
    @Body() createCourtDto: CreateCourtDto,
  ): Promise<CourtResponseDto> {
    return this.createCourtUseCase.execute(createCourtDto);
  }

  /**
   * Update a court by ID (OWNER/ADMIN only).
   */
  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async updateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourtDto: UpdateCourtDto,
  ): Promise<CourtResponseDto> {
    return this.updateCourtUseCase.execute(id, updateCourtDto);
  }

  /**
   * Get a court by ID.
   */
  @Get(':id')
  async getCourtById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourtWithFacilityResponseDto> {
    return this.getCourtByIdUseCase.execute(id);
  }

  /**
   * Get all courts for a specific facility.
   */
  @Get('facility/:facilityId')
  async getCourtsByFacility(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
  ): Promise<CourtResponseDto[]> {
    return this.getCourtsByFacilityUseCase.execute(facilityId);
  }

  /**
   * Delete a court by ID (OWNER/ADMIN only).
   */
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourt(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteCourtUseCase.execute(id);
  }

  /**
   * Deactivate a court by ID (OWNER/ADMIN only).
   */
  @Put(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async deactivateCourt(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourtResponseDto> {
    return this.courtService.deactivateCourt(id);
  }

  /**
   * Activate a court by ID (OWNER/ADMIN only).
   */
  @Put(':id/activate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  async activateCourt(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<CourtResponseDto> {
    return this.courtService.activateCourt(id);
  }

  /**
   * Get court statistics overview.
   * Returns total, active, inactive, bySport, bySurface, indoor, and outdoor counts.
   */
  @Get('stats/overview')
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
