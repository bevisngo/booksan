import { Injectable } from '@nestjs/common';
import {
  Facility,
  Court,
  FacilityOpenHour,
  FacilityProfile,
} from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BaseRepository } from '@/shared/repositories';
import { FacilityFilters, FacilityStatsDto } from '@/modules/facilities/dto';

export interface CreateFacilityData {
  ownerId: string;
  name: string;
  slug: string;
  desc?: string;
  phone?: string;
  address: string;
  ward?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isPublished?: boolean;
}

export interface UpdateFacilityData {
  name?: string;
  slug?: string;
  desc?: string;
  phone?: string;
  address?: string;
  ward?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  isPublished?: boolean;
}

export interface FacilityOwner {
  id: string;
  fullname: string;
  email: string | null;
  phone: string | null;
}

export interface FacilityWithRelations extends Facility {
  owner?: FacilityOwner;
  courts?: Court[];
  openHours?: FacilityOpenHour[];
  profile?: FacilityProfile | null;
}

@Injectable()
export class FacilityRepository extends BaseRepository<
  Facility,
  CreateFacilityData,
  UpdateFacilityData,
  FacilityFilters,
  'facility'
> {
  protected readonly modelName = 'facility' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  /**
   * Find facility by ID with all relations
   */
  async findByIdWithRelations(
    id: string,
  ): Promise<FacilityWithRelations | null> {
    return this.prisma.facility.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
    });
  }

  /**
   * Find facility by slug with all relations
   */
  async findBySlugWithRelations(
    slug: string,
  ): Promise<FacilityWithRelations | null> {
    return this.prisma.facility.findUnique({
      where: { slug },
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
    });
  }

  /**
   * Find facilities by owner ID
   */
  async findByOwnerId(ownerId: string): Promise<FacilityWithRelations[]> {
    return this.prisma.facility.findMany({
      where: { ownerId },
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find published facilities
   */
  async findPublishedFacilities(
    filters?: Partial<FacilityFilters>,
  ): Promise<FacilityWithRelations[]> {
    const where: {
      isPublished: boolean;
      city?: string;
      ward?: string;
      OR?: Array<{
        name?: { contains: string; mode: 'insensitive' };
        desc?: { contains: string; mode: 'insensitive' };
        address?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      isPublished: true,
    };

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.ward) {
      where.ward = filters.ward;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { desc: { contains: filters.search, mode: 'insensitive' } },
        { address: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.facility.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find facilities by city
   */
  async findByCity(city: string): Promise<FacilityWithRelations[]> {
    return this.prisma.facility.findMany({
      where: {
        city,
        isPublished: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find facilities by ward
   */
  async findByWard(ward: string): Promise<FacilityWithRelations[]> {
    return this.prisma.facility.findMany({
      where: {
        ward,
        isPublished: true,
      },
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Search facilities by name, description, or address
   */
  async searchFacilities(
    searchTerm: string,
    filters?: Partial<FacilityFilters>,
  ): Promise<FacilityWithRelations[]> {
    const where: {
      isPublished: boolean;
      city?: string;
      ward?: string;
      OR: Array<{
        name?: { contains: string; mode: 'insensitive' };
        desc?: { contains: string; mode: 'insensitive' };
        address?: { contains: string; mode: 'insensitive' };
      }>;
    } = {
      isPublished: true,
      OR: [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { desc: { contains: searchTerm, mode: 'insensitive' } },
        { address: { contains: searchTerm, mode: 'insensitive' } },
      ],
    };

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.ward) {
      where.ward = filters.ward;
    }

    return this.prisma.facility.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find facilities near a location (within radius)
   */
  async findNearbyFacilities(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    filters?: Partial<FacilityFilters>,
  ): Promise<FacilityWithRelations[]> {
    // Using a simple bounding box approach for now
    // In production, you might want to use PostGIS or similar for more accurate distance calculations
    const latRange = radiusKm / 111; // Rough conversion: 1 degree ≈ 111 km
    const lngRange = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const where: {
      isPublished: boolean;
      city?: string;
      ward?: string;
      latitude: {
        gte: number;
        lte: number;
      };
      longitude: {
        gte: number;
        lte: number;
      };
    } = {
      isPublished: true,
      latitude: {
        gte: latitude - latRange,
        lte: latitude + latRange,
      },
      longitude: {
        gte: longitude - lngRange,
        lte: longitude + lngRange,
      },
    };

    if (filters?.city) {
      where.city = filters.city;
    }

    if (filters?.ward) {
      where.ward = filters.ward;
    }

    return this.prisma.facility.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            fullname: true,
            email: true,
            phone: true,
          },
        },
        courts: {
          where: { isActive: true },
          orderBy: { createdAt: 'asc' },
        },
        openHours: {
          orderBy: { weekDay: 'asc' },
        },
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if slug is unique
   */
  async isSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
    const facility = await this.prisma.facility.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });

    return !facility;
  }

  /**
   * Generate unique slug from name
   */
  async generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (!(await this.isSlugUnique(slug, excludeId))) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  /**
   * Publish facility
   */
  async publishFacility(id: string): Promise<Facility | null> {
    try {
      return await this.prisma.facility.update({
        where: { id },
        data: { isPublished: true },
      });
    } catch {
      return null;
    }
  }

  /**
   * Unpublish facility
   */
  async unpublishFacility(id: string): Promise<Facility | null> {
    try {
      return await this.prisma.facility.update({
        where: { id },
        data: { isPublished: false },
      });
    } catch {
      return null;
    }
  }

  /**
   * Delete facility (hard delete)
   */
  async deleteFacility(id: string): Promise<Facility | null> {
    try {
      return await this.prisma.facility.delete({
        where: { id },
      });
    } catch {
      return null;
    }
  }

  /**
   * Get facility statistics
   */
  async getFacilityStats(): Promise<FacilityStatsDto> {
    const [
      totalFacilities,
      publishedFacilities,
      unpublishedFacilities,
      facilitiesWithProfiles,
      facilitiesWithCourts,
    ] = await Promise.all([
      this.prisma.facility.count(),
      this.prisma.facility.count({
        where: { isPublished: true },
      }),
      this.prisma.facility.count({
        where: { isPublished: false },
      }),
      this.prisma.facility.count({
        where: {
          profile: { isNot: null },
        },
      }),
      this.prisma.facility.count({
        where: {
          courts: { some: { isActive: true } },
        },
      }),
    ]);

    // Calculate average courts per facility
    const courtsCount = await this.prisma.court.count({
      where: { isActive: true },
    });
    const averageCourtsPerFacility =
      totalFacilities > 0 ? courtsCount / totalFacilities : 0;

    return {
      totalFacilities,
      publishedFacilities,
      unpublishedFacilities,
      facilitiesWithProfiles,
      facilitiesWithCourts,
      averageCourtsPerFacility:
        Math.round(averageCourtsPerFacility * 100) / 100,
    };
  }

  /**
   * Get facilities by owner with pagination
   */
  async findFacilitiesByOwnerWithPagination(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: FacilityWithRelations[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;

    const [facilities, total] = await Promise.all([
      this.prisma.facility.findMany({
        where: { ownerId },
        include: {
          owner: {
            select: {
              id: true,
              fullname: true,
              email: true,
              phone: true,
            },
          },
          courts: {
            where: { isActive: true },
            orderBy: { createdAt: 'asc' },
          },
          openHours: {
            orderBy: { weekDay: 'asc' },
          },
          profile: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.facility.count({
        where: { ownerId },
      }),
    ]);

    return {
      data: facilities,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get all cities that have facilities
   */
  async getCitiesWithFacilities(): Promise<string[]> {
    const cities = await this.prisma.facility.findMany({
      where: {
        isPublished: true,
        city: { not: null },
      },
      select: { city: true },
      distinct: ['city'],
    });

    return cities.map(f => f.city!).filter(Boolean);
  }

  /**
   * Get all wards that have facilities in a city
   */
  async getWardsWithFacilities(city: string): Promise<string[]> {
    const wards = await this.prisma.facility.findMany({
      where: {
        isPublished: true,
        city,
        ward: { not: null },
      },
      select: { ward: true },
      distinct: ['ward'],
    });

    return wards.map(f => f.ward!).filter(Boolean);
  }
}
