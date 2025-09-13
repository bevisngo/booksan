import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as ESService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

export interface VenueSearchDocument {
  id: string;
  name: string;
  slug: string;
  address: string;
  ward?: string;
  city?: string;
  description?: string;
  location: {
    lat: number;
    lon: number;
  };
  isPublished: boolean;
  ownerId: string;
  courts: Array<{
    id: string;
    name: string;
    sport: string;
    surface?: string;
    indoor: boolean;
    isActive: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SearchVenuesQuery {
  keyword?: string;
  lat?: number;
  lon?: number;
  maxDistance?: string; // e.g., "10km"
  sport?: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchVenuesResponse {
  data: Array<{
    venue: VenueSearchDocument;
    score: number;
    distance?: number; // in meters
  }>;
  total: number;
  maxScore: number;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly venueIndex = 'venues';

  constructor(
    private readonly esService: ESService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Elasticsearch service');
    await this.ensureConnection();
    await this.createIndicesIfNotExists();
  }

  private async ensureConnection(): Promise<void> {
    try {
      await this.esService.ping();
      this.logger.log('Elasticsearch connection established');
    } catch (error) {
      this.logger.error('Failed to connect to Elasticsearch', error);
      throw error;
    }
  }

  private async createIndicesIfNotExists(): Promise<void> {
    try {
      const indexExists = await this.esService.indices.exists({
        index: this.venueIndex,
      });

      if (!indexExists) {
        await this.createVenueIndex();
        this.logger.log(`Index "${this.venueIndex}" created successfully`);
      } else {
        this.logger.log(`Index "${this.venueIndex}" already exists`);
      }
    } catch (error) {
      this.logger.error('Failed to create indices', error);
      throw error;
    }
  }

  private async createVenueIndex(): Promise<void> {
    const indexSettings: any = {
      index: this.venueIndex,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
            venue_name_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'trim'],
            },
            venue_address_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'trim'],
            },
          },
        },
      },
      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: {
            type: 'text',
            analyzer: 'venue_name_analyzer',
            fields: {
              keyword: { type: 'keyword' },
              suggest: {
                type: 'completion',
                analyzer: 'venue_name_analyzer',
              },
            },
          },
          address: {
            type: 'text',
            analyzer: 'venue_address_analyzer',
            fields: {
              keyword: { type: 'keyword' },
            },
          },
          ward: { type: 'keyword' },
          city: { type: 'keyword' },
          description: { type: 'text' },
          location: { type: 'geo_point' },
          isPublished: { type: 'boolean' },
          ownerId: { type: 'keyword' },
          courts: {
            type: 'nested',
            properties: {
              id: { type: 'keyword' },
              name: { type: 'text' },
              sport: { type: 'keyword' },
              surface: { type: 'keyword' },
              indoor: { type: 'boolean' },
              isActive: { type: 'boolean' },
            },
          },
          createdAt: { type: 'date' },
          updatedAt: { type: 'date' },
        },
      },
    };

    await this.esService.indices.create(indexSettings);
  }

  async indexVenue(venue: VenueSearchDocument): Promise<void> {
    try {
      await this.esService.index({
        index: this.venueIndex,
        id: venue.id,
        document: venue,
        refresh: 'wait_for',
      });
      this.logger.debug(`Venue ${venue.id} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index venue ${venue.id}`, error);
      throw error;
    }
  }

  async updateVenue(
    venueId: string,
    updates: Partial<VenueSearchDocument>,
  ): Promise<void> {
    try {
      await this.esService.update({
        index: this.venueIndex,
        id: venueId,
        doc: updates,
        refresh: 'wait_for',
      });
      this.logger.debug(`Venue ${venueId} updated successfully`);
    } catch (error) {
      this.logger.error(`Failed to update venue ${venueId}`, error);
      throw error;
    }
  }

  async deleteVenue(venueId: string): Promise<void> {
    try {
      await this.esService.delete({
        index: this.venueIndex,
        id: venueId,
        refresh: 'wait_for',
      });
      this.logger.debug(`Venue ${venueId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete venue ${venueId}`, error);
      throw error;
    }
  }

  async searchVenues(query: SearchVenuesQuery): Promise<SearchVenuesResponse> {
    try {
      const {
        keyword,
        lat,
        lon,
        maxDistance = '50km',
        sport,
        isPublished = true,
        limit = 20,
        offset = 0,
      } = query;

      const searchBody: Record<string, any> = {
        query: {
          bool: {
            must: [],
            filter: [],
          },
        },
        from: offset,
        size: limit,
        track_total_hits: true,
      };

      // Add keyword search with boosted name field
      if (keyword) {
        searchBody.query.bool.must.push({
          multi_match: {
            query: keyword,
            fields: ['name^3', 'address^1', 'description^0.5'],
            type: 'best_fields',
            fuzziness: 'AUTO',
            operator: 'or',
          },
        });
      } else {
        searchBody.query.bool.must.push({
          match_all: {},
        });
      }

      // Add published filter
      searchBody.query.bool.filter.push({
        term: { isPublished },
      });

      // Add sport filter if specified
      if (sport) {
        searchBody.query.bool.filter.push({
          nested: {
            path: 'courts',
            query: {
              bool: {
                must: [
                  { term: { 'courts.sport': sport } },
                  { term: { 'courts.isActive': true } },
                ],
              },
            },
          },
        });
      }

      // Add distance sorting if coordinates provided
      if (lat !== undefined && lon !== undefined) {
        searchBody.sort = [
          {
            _geo_distance: {
              location: {
                lat,
                lon,
              },
              order: 'asc',
              unit: 'm',
              distance_type: 'arc',
            },
          },
          '_score',
        ];

        // Add distance filter if maxDistance is reasonable
        if (maxDistance !== '50km') {
          searchBody.query.bool.filter.push({
            geo_distance: {
              distance: maxDistance,
              location: {
                lat,
                lon,
              },
            },
          });
        }
      } else {
        searchBody.sort = [{ _score: { order: 'desc' } }];
      }

      const response = await this.esService.search({
        index: this.venueIndex,
        ...searchBody,
      });

      const hits = response.hits.hits;
      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0;
      const maxScore = response.hits.max_score || 0;

      const data = hits.map((hit: any) => ({
        venue: hit._source as VenueSearchDocument,
        score: hit._score as number,
        distance: hit.sort ? (hit.sort[0] as number) : undefined,
      }));

      return {
        data,
        total,
        maxScore,
      };
    } catch (error) {
      this.logger.error('Failed to search venues', error);
      throw error;
    }
  }

  async getVenueById(venueId: string): Promise<VenueSearchDocument | null> {
    try {
      const response = await this.esService.get({
        index: this.venueIndex,
        id: venueId,
      });
      return response._source as VenueSearchDocument;
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      this.logger.error(`Failed to get venue ${venueId}`, error);
      throw error;
    }
  }

  async reindexAllVenues(): Promise<void> {
    try {
      this.logger.log('Starting venue reindexing...');

      // Delete existing index
      const indexExists = await this.esService.indices.exists({
        index: this.venueIndex,
      });

      if (indexExists) {
        await this.esService.indices.delete({
          index: this.venueIndex,
        });
        this.logger.log('Existing index deleted');
      }

      // Create new index
      await this.createVenueIndex();
      this.logger.log('New index created');

      this.logger.log('Venue reindexing completed');
    } catch (error) {
      this.logger.error('Failed to reindex venues', error);
      throw error;
    }
  }

  async bulkIndexVenues(venues: VenueSearchDocument[]): Promise<void> {
    try {
      if (venues.length === 0) {
        return;
      }

      const operations = venues.flatMap(venue => [
        { index: { _index: this.venueIndex, _id: venue.id } },
        venue,
      ]);

      const response = await this.esService.bulk({
        operations,
        refresh: 'wait_for',
      });

      if (response.errors) {
        const errorItems = response.items.filter(
          (item: any) => item.index?.error,
        );
        this.logger.error('Bulk indexing errors:', errorItems);
        throw new Error('Some venues failed to index');
      }

      this.logger.log(`Successfully bulk indexed ${venues.length} venues`);
    } catch (error) {
      this.logger.error('Failed to bulk index venues', error);
      throw error;
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      const response = await this.esService.indices.stats({
        index: this.venueIndex,
      });
      return response;
    } catch (error) {
      this.logger.error('Failed to get index stats', error);
      throw error;
    }
  }
}
