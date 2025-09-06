import { Injectable } from '@nestjs/common';
import { Facility } from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BaseRepository } from '@/shared/repositories';

export interface CreateVenueData {
  name: string;
  description?: string;
  address: string;
  latitude: number;
  longitude: number;
  ownerId: string;
  isActive?: boolean;
}

export interface UpdateVenueData {
  name?: string;
  description?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
}

export interface VenueFilters {
  id?: string | { in?: string[] };
  name?: string;
  address?: string;
  ownerId?: string;
  isActive?: boolean;
  latitude?: { gte?: number; lte?: number };
  longitude?: { gte?: number; lte?: number };
  createdAt?: { gte?: Date; lte?: Date };
}

@Injectable()
export class VenueRepository extends BaseRepository<
  Facility,
  CreateVenueData,
  UpdateVenueData,
  VenueFilters,
  'facility'
> {
  protected readonly modelName = 'facility' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Venue-specific methods
  async findVenuesByOwner(ownerId: string): Promise<Facility[]> {
    return this.findMany({ where: { ownerId } }).then(result => result.data);
  }

  async findActiveVenues(): Promise<Facility[]> {
    return this.findMany({ where: { isActive: true } }).then(
      result => result.data,
    );
  }

  async findVenuesNearLocation(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
  ): Promise<Facility[]> {
    // This would require a more complex query with distance calculation
    // For now, we'll use a simple bounding box approach
    const latDelta = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
    const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    return this.findMany({
      where: {
        latitude: {
          gte: latitude - latDelta,
          lte: latitude + latDelta,
        },
        longitude: {
          gte: longitude - lngDelta,
          lte: longitude + lngDelta,
        },
      },
    }).then(result => result.data);
  }

  async searchVenues(searchTerm: string): Promise<Facility[]> {
    return this.search(searchTerm, ['name', 'description', 'address'], {}).then(
      result => result.data,
    );
  }

  async findVenuesWithPagination(
    page: number = 1,
    limit: number = 10,
    filters?: VenueFilters,
  ) {
    return this.findMany({
      page,
      limit,
      where: filters,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVenueStats() {
    const [total, active, inactive] = await Promise.all([
      this.count(),
      this.count({ isActive: true }),
      this.count({ isActive: false }),
    ]);

    return {
      total,
      active,
      inactive,
    };
  }

  async findVenuesByDateRange(from: Date, to: Date): Promise<Facility[]> {
    return this.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    }).then(result => result.data);
  }

  async bulkUpdateVenueStatus(
    venueIds: string[],
    isActive: boolean,
  ): Promise<number> {
    return this.updateMany({ id: { in: venueIds } }, { isActive });
  }

  async findVenuesWithBookings(): Promise<Facility[]> {
    return this.findMany({
      where: {
        playerBookings: {
          some: {},
        },
      },
      include: {
        playerBookings: true,
      },
    }).then(result => result.data);
  }
}
