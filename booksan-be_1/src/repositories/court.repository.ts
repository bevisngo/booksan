import { Injectable } from '@nestjs/common';
import { Court, Sport, Surface } from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BaseRepository } from '@/shared/repositories';

export interface CreateCourtData {
  facilityId: string;
  name: string;
  sport: Sport;
  surface?: Surface;
  indoor?: boolean;
  notes?: string;
  slotMinutes: number;
  isActive?: boolean;
}

export interface UpdateCourtData {
  name?: string;
  sport?: Sport;
  surface?: Surface;
  indoor?: boolean;
  notes?: string;
  slotMinutes?: number;
  isActive?: boolean;
}

export interface CourtFilters {
  id?: string;
  facilityId?: string;
  sport?: Sport;
  surface?: Surface;
  indoor?: boolean;
  isActive?: boolean;
}

type CourtWithFacility = Court & {
  facility: {
    id: string;
    name: string;
    slug: string;
    address: string;
  };
};

@Injectable()
export class CourtRepository extends BaseRepository<
  Court,
  CreateCourtData,
  UpdateCourtData,
  CourtFilters,
  'court'
> {
  protected readonly modelName = 'court' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  async findByFacilityId(facilityId: string): Promise<Court[]> {
    return await this.findMany({
      where: { facilityId },
      orderBy: { name: 'asc' },
    }).then(result => result.data);
  }

  async findByFacilityIdWithFacility(
    facilityId: string,
  ): Promise<CourtWithFacility[]> {
    return this.prisma.court.findMany({
      where: { facilityId, isActive: true },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findByIdWithFacility(
    id: string,
    facilityId: string,
  ): Promise<CourtWithFacility | null> {
    return this.prisma.court.findUnique({
      where: { id, facilityId },
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            slug: true,
            address: true,
          },
        },
      },
    });
  }

  async findBySport(sport: Sport): Promise<Court[]> {
    return this.findMany({
      where: { sport, isActive: true },
      orderBy: { name: 'asc' },
    }).then(result => result.data);
  }

  async findBySurface(surface: Surface): Promise<Court[]> {
    return this.findMany({
      where: { surface, isActive: true },
      orderBy: { name: 'asc' },
    }).then(result => result.data);
  }

  async findIndoorCourts(): Promise<Court[]> {
    return this.findMany({
      where: { indoor: true, isActive: true },
      orderBy: { name: 'asc' },
    }).then(result => result.data);
  }

  async findOutdoorCourts(): Promise<Court[]> {
    return this.findMany({
      where: { indoor: false, isActive: true },
      orderBy: { name: 'asc' },
    }).then(result => result.data);
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
    const where = facilityId ? { facilityId } : {};

    const [total, active, inactive, courts] = await Promise.all([
      this.prisma.court.count({ where }),
      this.prisma.court.count({ where: { ...where, isActive: true } }),
      this.prisma.court.count({ where: { ...where, isActive: false } }),
      this.prisma.court.findMany({
        where: { ...where, isActive: true },
        select: {
          sport: true,
          surface: true,
          indoor: true,
        },
      }),
    ]);

    const bySport = courts.reduce(
      (acc, court) => {
        acc[court.sport] = (acc[court.sport] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const bySurface = courts.reduce(
      (acc, court) => {
        if (court.surface) {
          acc[court.surface] = (acc[court.surface] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    const indoor = courts.filter(court => court.indoor).length;
    const outdoor = courts.filter(court => !court.indoor).length;

    return {
      total,
      active,
      inactive,
      bySport,
      bySurface,
      indoor,
      outdoor,
    };
  }

  async findCourtsWithPricing(facilityId?: string): Promise<Court[]> {
    return this.prisma.court.findMany({
      where: {
        ...(facilityId && { facilityId }),
        isActive: true,
      },
      include: {
        pricingRules: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async deactivateCourt(id: string): Promise<Court | null> {
    try {
      return await this.prisma.court.update({
        where: { id },
        data: { isActive: false },
      });
    } catch {
      return null;
    }
  }

  async activateCourt(id: string): Promise<Court | null> {
    try {
      return await this.prisma.court.update({
        where: { id },
        data: { isActive: true },
      });
    } catch {
      return null;
    }
  }
}
