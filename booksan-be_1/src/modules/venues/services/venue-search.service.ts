/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, Logger } from '@nestjs/common';
import {
  ElasticsearchService,
  VenueSearchDocument,
} from '@/core/elasticsearch';
import { VenueRepository } from '../repositories';
import {
  SearchVenuesDto,
  SearchVenuesResponseDto,
  VenueSearchResultDto,
  VenueResponseDto,
  SortBy,
} from '../dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class VenueSearchService {
  private readonly logger = new Logger(VenueSearchService.name);

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly venueRepository: VenueRepository,
  ) {}

  async searchVenues(
    searchDto: SearchVenuesDto,
  ): Promise<SearchVenuesResponseDto> {
    try {
      const { sortBy, sortOrder, ...esQuery } = searchDto;

      // For distance sorting, we need coordinates
      if (sortBy === SortBy.DISTANCE && (!searchDto.lat || !searchDto.lon)) {
        throw new Error(
          'Latitude and longitude are required for distance sorting',
        );
      }

      const searchResult =
        await this.elasticsearchService.searchVenues(esQuery);

      const results: VenueSearchResultDto[] = searchResult.data.map(item =>
        plainToClass(VenueSearchResultDto, {
          venue: this.mapVenueDocumentToDto(item.venue),
          score: item.score,
          distance: item.distance,
        }),
      );

      // Apply additional sorting if needed
      if (sortBy && sortBy !== SortBy.RELEVANCE) {
        results.sort((a, b) => this.applySorting(a, b, sortBy, sortOrder));
      }

      return plainToClass(SearchVenuesResponseDto, {
        data: results,
        total: searchResult.total,
        maxScore: searchResult.maxScore,
        meta: {
          limit: searchDto.limit || 20,
          offset: searchDto.offset || 0,
          hasMore:
            (searchDto.offset || 0) + results.length < searchResult.total,
        },
      });
    } catch (error) {
      this.logger.error('Failed to search venues', error);
      throw error;
    }
  }

  async getVenueById(venueId: string): Promise<VenueResponseDto | null> {
    try {
      const venueDoc = await this.elasticsearchService.getVenueById(venueId);

      if (!venueDoc) {
        return null;
      }

      return this.mapVenueDocumentToDto(venueDoc);
    } catch (error) {
      this.logger.error(`Failed to get venue ${venueId}`, error);
      throw error;
    }
  }

  async indexVenue(venueId: string): Promise<void> {
    try {
      // Fetch venue data from PostgreSQL with all related data
      const venueResults = await this.venueRepository.findMany({
        where: { id: venueId },
        include: {
          courts: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              sport: true,
              surface: true,
              indoor: true,
              isActive: true,
            },
          },
        },
      });

      const venueData = venueResults.data[0];

      if (!venueData) {
        this.logger.warn(`Venue ${venueId} not found in database`);
        return;
      }

      // Map to Elasticsearch document
      const venueDoc: VenueSearchDocument = {
        id: venueData.id,
        name: venueData.name,
        slug: venueData.slug,
        address: venueData.address,
        ward: venueData.ward || undefined,
        city: venueData.city || undefined,
        description: venueData.desc || undefined,
        location: {
          lat: venueData.latitude || 0,
          lon: venueData.longitude || 0,
        },
        isPublished: venueData.isPublished,
        ownerId: venueData.ownerId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        courts:
          (venueData as any).courts?.map((court: any) => ({
            id: court.id as string,
            name: court.name as string,
            sport: court.sport as string,
            surface: (court.surface as string) || undefined,
            indoor: court.indoor as boolean,
            isActive: court.isActive as boolean,
          })) || [],
        createdAt: venueData.createdAt.toISOString(),
        updatedAt: venueData.updatedAt.toISOString(),
      };

      await this.elasticsearchService.indexVenue(venueDoc);
      this.logger.debug(`Successfully indexed venue ${venueId}`);
    } catch (error) {
      this.logger.error(`Failed to index venue ${venueId}`, error);
      throw error;
    }
  }

  async updateVenueIndex(
    venueId: string,
    updates: Partial<VenueSearchDocument>,
  ): Promise<void> {
    try {
      await this.elasticsearchService.updateVenue(venueId, updates);
      this.logger.debug(`Successfully updated venue ${venueId} in index`);
    } catch (error) {
      this.logger.error(`Failed to update venue ${venueId} in index`, error);
      throw error;
    }
  }

  async removeVenueFromIndex(venueId: string): Promise<void> {
    try {
      await this.elasticsearchService.deleteVenue(venueId);
      this.logger.debug(`Successfully removed venue ${venueId} from index`);
    } catch (error) {
      this.logger.error(`Failed to remove venue ${venueId} from index`, error);
      throw error;
    }
  }

  async reindexAllVenues(): Promise<{ indexed: number; errors: string[] }> {
    try {
      this.logger.log('Starting venue reindexing process...');

      // Clear existing index
      await this.elasticsearchService.reindexAllVenues();

      // Fetch all published venues from database
      const venues = await this.venueRepository.findMany({
        where: { isPublished: true },
        include: {
          courts: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              sport: true,
              surface: true,
              indoor: true,
              isActive: true,
            },
          },
        },
      });

      const venueDocuments: VenueSearchDocument[] = venues.data.map(venue => ({
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        address: venue.address,
        ward: venue.ward || undefined,
        city: venue.city || undefined,
        description: venue.desc || undefined,
        location: {
          lat: venue.latitude || 0,
          lon: venue.longitude || 0,
        },
        isPublished: venue.isPublished,
        ownerId: venue.ownerId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        courts:
          (venue as any).courts?.map((court: any) => ({
            id: court.id as string,
            name: court.name as string,
            sport: court.sport as string,
            surface: (court.surface as string) || undefined,
            indoor: court.indoor as boolean,
            isActive: court.isActive as boolean,
          })) || [],
        createdAt: venue.createdAt.toISOString(),
        updatedAt: venue.updatedAt.toISOString(),
      }));

      // Bulk index all venues
      if (venueDocuments.length > 0) {
        await this.elasticsearchService.bulkIndexVenues(venueDocuments);
      }

      this.logger.log(`Successfully reindexed ${venueDocuments.length} venues`);

      return {
        indexed: venueDocuments.length,
        errors: [] as string[],
      };
    } catch (error) {
      this.logger.error('Failed to reindex venues', error);
      return {
        indexed: 0,
        errors: [(error as Error).message],
      };
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      return await this.elasticsearchService.getIndexStats();
    } catch (error) {
      this.logger.error('Failed to get index stats', error);
      throw error;
    }
  }

  private mapVenueDocumentToDto(venue: VenueSearchDocument): VenueResponseDto {
    return plainToClass(VenueResponseDto, {
      id: venue.id,
      name: venue.name,
      slug: venue.slug,
      address: venue.address,
      ward: venue.ward,
      city: venue.city,
      description: venue.description,
      location: venue.location,
      isPublished: venue.isPublished,
      ownerId: venue.ownerId,
      courts: venue.courts,
      createdAt: venue.createdAt,
      updatedAt: venue.updatedAt,
    });
  }

  private applySorting(
    a: VenueSearchResultDto,
    b: VenueSearchResultDto,
    sortBy: SortBy,
    sortOrder?: string,
  ): number {
    const order = sortOrder === 'asc' ? 1 : -1;

    switch (sortBy) {
      case SortBy.DISTANCE: {
        const distanceA = a.distance || Infinity;
        const distanceB = b.distance || Infinity;
        return (distanceA - distanceB) * order;
      }

      case SortBy.NAME:
        return a.venue.name.localeCompare(b.venue.name) * order;

      case SortBy.CREATED_AT: {
        const dateA = new Date(a.venue.createdAt).getTime();
        const dateB = new Date(b.venue.createdAt).getTime();
        return (dateA - dateB) * order;
      }

      default:
        return (b.score - a.score) * order;
    }
  }
}
