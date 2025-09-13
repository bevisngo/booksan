import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Court, Sport, Surface } from '@prisma/client';
import { CourtRepository, FacilityRepository } from '@/repositories';
import {
  CreateCourtData,
  UpdateCourtData,
  CourtFilters,
} from '@/repositories/court.repository';
import { PrismaService } from '@/core/prisma/prisma.service';
import {
  CreateCourtDto,
  UpdateCourtDto,
  CourtResponseDto,
  CourtWithFacilityResponseDto,
  CourtFiltersDto,
  CourtPaginationResponseDto,
} from '../dto/court.dto';
import { FilterToPrismaUtil } from '@/common/utils';

@Injectable()
export class CourtService {
  private readonly logger = new Logger(CourtService.name);

  constructor(
    private readonly courtRepository: CourtRepository,
    private readonly facilityRepository: FacilityRepository,
    private readonly prismaService: PrismaService,
  ) {}

  async createCourt(createCourtDto: CreateCourtDto): Promise<CourtResponseDto> {
    this.logger.debug(`Creating court: ${createCourtDto.name}`);

    // Validate facility exists
    const facility = await this.facilityRepository.findById(
      createCourtDto.facilityId,
    );
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    // Check for duplicate court name in the same facility
    const existingCourt = await this.courtRepository.findMany({
      where: {
        facilityId: createCourtDto.facilityId,
        name: createCourtDto.name,
      },
      limit: 1,
    });

    if (existingCourt.data.length > 0) {
      throw new ConflictException(
        'Court with this name already exists in the facility',
      );
    }

    const courtData: CreateCourtData = {
      facilityId: createCourtDto.facilityId,
      name: createCourtDto.name,
      sport: createCourtDto.sport,
      surface: createCourtDto.surface,
      indoor: createCourtDto.indoor ?? false,
      notes: createCourtDto.notes,
      slotMinutes: createCourtDto.slotMinutes,
      isActive: createCourtDto.isActive ?? true,
    };

    const court = await this.courtRepository.create(courtData);
    this.logger.debug(`Created court: ${court.id}`);

    return this.mapCourtToResponseDto(court);
  }

  async updateCourt(
    id: string,
    updateCourtDto: UpdateCourtDto,
  ): Promise<CourtResponseDto> {
    this.logger.debug(`Updating court: ${id}`);

    // Check if court exists
    const existingCourt = await this.courtRepository.findById(id);
    if (!existingCourt) {
      throw new NotFoundException('Court not found');
    }

    // Check for duplicate name if name is being updated
    if (updateCourtDto.name && updateCourtDto.name !== existingCourt.name) {
      const duplicateCourt = await this.courtRepository.findMany({
        where: {
          facilityId: existingCourt.facilityId,
          name: updateCourtDto.name,
          id: { not: id },
        },
        limit: 1,
      });

      if (duplicateCourt.data.length > 0) {
        throw new ConflictException(
          'Court with this name already exists in the facility',
        );
      }
    }

    const updateData: UpdateCourtData = {
      name: updateCourtDto.name,
      sport: updateCourtDto.sport,
      surface: updateCourtDto.surface,
      indoor: updateCourtDto.indoor,
      notes: updateCourtDto.notes,
      slotMinutes: updateCourtDto.slotMinutes,
      isActive: updateCourtDto.isActive,
    };

    const court = await this.courtRepository.update(id, updateData);
    if (!court) {
      throw new NotFoundException('Court not found');
    }

    this.logger.debug(`Updated court: ${court.id}`);
    return this.mapCourtToResponseDto(court);
  }

  async getCourtById(id: string): Promise<CourtWithFacilityResponseDto> {
    const court = await this.courtRepository.findByIdWithFacility(id);
    if (!court) {
      throw new NotFoundException('Court not found');
    }

    return this.mapCourtWithFacilityToResponseDto(court);
  }

  async getCourtsByFacility(facilityId: string): Promise<CourtResponseDto[]> {
    this.logger.debug(`Getting courts for facility: ${facilityId}`);

    // Validate facility exists
    const facility = await this.facilityRepository.findById(facilityId);
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    const courts = await this.courtRepository.findByFacilityId(facilityId);
    return courts.map(court => this.mapCourtToResponseDto(court));
  }

  async getAllCourts(filters?: CourtFiltersDto): Promise<CourtResponseDto[]> {
    this.logger.debug('Getting all courts with filters', filters);

    const courtFilters: CourtFilters = {};

    if (filters?.facilityId) courtFilters.facilityId = filters.facilityId;
    if (filters?.sport) courtFilters.sport = filters.sport;
    if (filters?.surface) courtFilters.surface = filters.surface;
    if (filters?.indoor !== undefined) courtFilters.indoor = filters.indoor;
    if (filters?.isActive !== undefined)
      courtFilters.isActive = filters.isActive;

    const result = await this.courtRepository.findMany({
      where: courtFilters,
      orderBy: { name: 'asc' },
    });

    return result.data.map(court => this.mapCourtToResponseDto(court));
  }

  async getAllCourtsPaginated(
    filters: CourtFiltersDto,
  ): Promise<CourtPaginationResponseDto> {
    this.logger.debug(
      'Getting all courts with pagination and filters',
      filters,
    );

    // Build base where clause from filters
    const whereClause: Record<string, any> = {};

    if (filters.facilityId) whereClause.facilityId = filters.facilityId;
    if (filters.sport) whereClause.sport = filters.sport;
    if (filters.surface) whereClause.surface = filters.surface;
    if (filters.indoor !== undefined) whereClause.indoor = filters.indoor;
    if (filters.isActive !== undefined) whereClause.isActive = filters.isActive;

    // Handle search functionality
    if (filters.search && filters.search.trim()) {
      const searchFields = ['name'];
      const searchClause = FilterToPrismaUtil.buildSearchClause(
        filters.search,
        searchFields,
      );
      if (searchClause.length > 0) {
        // Merge search with existing filters using AND
        whereClause.AND = [
          searchClause.length === 1 ? searchClause[0] : { OR: searchClause },
        ];
      }
    }

    // Convert to repository options
    const repositoryOptions = FilterToPrismaUtil.toRepositoryOptions(
      filters,
      whereClause,
      filters.includeRelations ? { facility: true } : undefined,
    );

    // Set default sort field if not provided
    if (!filters.sortBy) {
      repositoryOptions.orderBy = { name: 'asc' };
    }

    const result = await this.courtRepository.findMany(repositoryOptions);

    return new CourtPaginationResponseDto(
      result.data.map(court => this.mapCourtToResponseDto(court)),
      result.meta,
    );
  }

  async getCourtsBySport(sport: Sport): Promise<CourtResponseDto[]> {
    this.logger.debug(`Getting courts for sport: ${sport}`);

    const courts = await this.courtRepository.findBySport(sport);
    return courts.map(court => this.mapCourtToResponseDto(court));
  }

  async getCourtsBySurface(surface: Surface): Promise<CourtResponseDto[]> {
    this.logger.debug(`Getting courts for surface: ${surface}`);

    const courts = await this.courtRepository.findBySurface(surface);
    return courts.map(court => this.mapCourtToResponseDto(court));
  }

  async getIndoorCourts(): Promise<CourtResponseDto[]> {
    this.logger.debug('Getting indoor courts');

    const courts = await this.courtRepository.findIndoorCourts();
    return courts.map(court => this.mapCourtToResponseDto(court));
  }

  async getOutdoorCourts(): Promise<CourtResponseDto[]> {
    this.logger.debug('Getting outdoor courts');

    const courts = await this.courtRepository.findOutdoorCourts();
    return courts.map(court => this.mapCourtToResponseDto(court));
  }

  async deleteCourt(id: string): Promise<void> {
    this.logger.debug(`Deleting court: ${id}`);

    // Check if court exists
    const court = await this.courtRepository.findById(id);
    if (!court) {
      throw new NotFoundException('Court not found');
    }

    // Check if court has any bookings
    const bookingsCount = await this.prismaService.booking.count({
      where: { courtId: id },
    });

    if (bookingsCount > 0) {
      throw new BadRequestException(
        'Cannot delete court with existing bookings. Deactivate the court instead.',
      );
    }

    await this.courtRepository.delete(id);
    this.logger.debug(`Deleted court: ${id}`);
  }

  async deactivateCourt(id: string): Promise<CourtResponseDto> {
    this.logger.debug(`Deactivating court: ${id}`);

    const court = await this.courtRepository.deactivateCourt(id);
    if (!court) {
      throw new NotFoundException('Court not found');
    }

    this.logger.debug(`Deactivated court: ${id}`);
    return this.mapCourtToResponseDto(court);
  }

  async activateCourt(id: string): Promise<CourtResponseDto> {
    this.logger.debug(`Activating court: ${id}`);

    const court = await this.courtRepository.activateCourt(id);
    if (!court) {
      throw new NotFoundException('Court not found');
    }

    this.logger.debug(`Activated court: ${id}`);
    return this.mapCourtToResponseDto(court);
  }

  async getCourtStats(facilityId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    bySport: Record<string, number>;
    bySurface: Record<string, number>;
    indoor: number;
    outdoor: number;
  }> {
    this.logger.debug(
      `Getting court stats for facility: ${facilityId || 'all'}`,
    );

    return this.courtRepository.getCourtStats(facilityId);
  }

  async getCourtsWithPricing(facilityId?: string): Promise<CourtResponseDto[]> {
    this.logger.debug(
      `Getting courts with pricing for facility: ${facilityId || 'all'}`,
    );

    const courts = await this.courtRepository.findCourtsWithPricing(facilityId);
    return courts.map(court => this.mapCourtToResponseDto(court));
  }

  private mapCourtToResponseDto(court: Court): CourtResponseDto {
    return {
      id: court.id,
      facilityId: court.facilityId,
      name: court.name,
      sport: court.sport,
      surface: court.surface || undefined,
      indoor: court.indoor,
      notes: court.notes || undefined,
      slotMinutes: court.slotMinutes,
      isActive: court.isActive,
      createdAt: court.createdAt,
      updatedAt: court.updatedAt,
    };
  }

  private mapCourtWithFacilityToResponseDto(
    court: any,
  ): CourtWithFacilityResponseDto {
    return {
      id: court.id,
      facilityId: court.facilityId,
      name: court.name,
      sport: court.sport,
      surface: court.surface,
      indoor: court.indoor,
      notes: court.notes,
      slotMinutes: court.slotMinutes,
      isActive: court.isActive,
      createdAt: court.createdAt,
      updatedAt: court.updatedAt,
      facility: {
        id: court.facility.id,
        name: court.facility.name,
        slug: court.facility.slug,
        address: court.facility.address,
      },
    };
  }
}
