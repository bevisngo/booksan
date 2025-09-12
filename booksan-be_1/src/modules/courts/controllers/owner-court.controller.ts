import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
import { OwnerProfile } from '@/repositories/auth.repository';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  CourtResponseDto,
  CourtWithFacilityResponseDto,
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

@Controller('owner/courts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
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

  // get all courts for a facility
  @Get()
  async getCourtsByFacility(
    @CurrentUser() user: OwnerProfile,
  ): Promise<CourtResponseDto[]> {
    const facilityId = user.facilityId;
    return this.getCourtsByFacilityUseCase.execute(facilityId);
  }

  @Get(':id')
  async getCourtById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: OwnerProfile,
  ): Promise<CourtWithFacilityResponseDto> {
    const court = await this.getCourtByIdUseCase.execute(id);

    // Validate court ownership by checking if court belongs to owner's facility
    if (court.facility?.id !== user.facilityId) {
      throw new Error(
        'Access denied: You can only view courts for your own facility',
      );
    }

    return court;
  }

  @Put(':id')
  async updateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCourtDto: UpdateCourtDto,
    @CurrentUser() user: OwnerProfile,
  ): Promise<CourtResponseDto> {
    // TODO: Add ownership validation before updating
    return this.updateCourtUseCase.execute(id, updateCourtDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: OwnerProfile,
  ): Promise<void> {
    // TODO: Add ownership validation
    return this.deleteCourtUseCase.execute(id);
  }

  @Put(':id/activate')
  async activateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: OwnerProfile,
  ): Promise<CourtResponseDto> {
    // TODO: Add ownership validation
    return this.courtService.activateCourt(id);
  }

  @Put(':id/deactivate')
  async deactivateCourt(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: OwnerProfile,
  ): Promise<CourtResponseDto> {
    // TODO: Add ownership validation
    return this.courtService.deactivateCourt(id);
  }

  @Get('facility/:facilityId/stats')
  async getCourtStats(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @CurrentUser() user: OwnerProfile,
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
