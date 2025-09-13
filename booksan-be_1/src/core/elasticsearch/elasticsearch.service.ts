import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService as ESService } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

export interface FacilitySearchDocument {
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

export interface SearchFacilitiesQuery {
  keyword?: string;
  lat?: number;
  lon?: number;
  maxDistance?: string; // e.g., "10km"
  sport?: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
}

export interface SearchFacilitiesResponse {
  data: Array<{
    facility: FacilitySearchDocument;
    score: number;
    distance?: number; // in meters
  }>;
  total: number;
  maxScore: number;
}

@Injectable()
export class ElasticsearchService implements OnModuleInit {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly facilityIndex = 'facilities';

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
        index: this.facilityIndex,
      });

      if (!indexExists) {
        await this.createFacilityIndex();
        this.logger.log(`Index "${this.facilityIndex}" created successfully`);
      } else {
        this.logger.log(`Index "${this.facilityIndex}" already exists`);
      }
    } catch (error) {
      this.logger.error('Failed to create indices', error);
      throw error;
    }
  }

  private async createFacilityIndex(): Promise<void> {
    const indexSettings: any = {
      index: this.facilityIndex,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
        analysis: {
          analyzer: {
            facility_name_analyzer: {
              type: 'custom',
              tokenizer: 'standard',
              filter: ['lowercase', 'asciifolding', 'trim'],
            },
            facility_address_analyzer: {
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
            analyzer: 'facility_name_analyzer',
            fields: {
              keyword: { type: 'keyword' },
              suggest: {
                type: 'completion',
                analyzer: 'facility_name_analyzer',
              },
            },
          },
          address: {
            type: 'text',
            analyzer: 'facility_address_analyzer',
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

  async indexFacility(facility: FacilitySearchDocument): Promise<void> {
    try {
      await this.esService.index({
        index: this.facilityIndex,
        id: facility.id,
        document: facility,
        refresh: 'wait_for',
      });
      this.logger.debug(`Facility ${facility.id} indexed successfully`);
    } catch (error) {
      this.logger.error(`Failed to index facility ${facility.id}`, error);
      throw error;
    }
  }

  async updateFacility(
    facilityId: string,
    updates: Partial<FacilitySearchDocument>,
  ): Promise<void> {
    try {
      await this.esService.update({
        index: this.facilityIndex,
        id: facilityId,
        doc: updates,
        refresh: 'wait_for',
      });
      this.logger.debug(`Facility ${facilityId} updated successfully`);
    } catch (error) {
      this.logger.error(`Failed to update facility ${facilityId}`, error);
      throw error;
    }
  }

  async deleteFacility(facilityId: string): Promise<void> {
    try {
      await this.esService.delete({
        index: this.facilityIndex,
        id: facilityId,
        refresh: 'wait_for',
      });
      this.logger.debug(`Facility ${facilityId} deleted successfully`);
    } catch (error) {
      this.logger.error(`Failed to delete facility ${facilityId}`, error);
      throw error;
    }
  }

  async searchFacilities(
    query: SearchFacilitiesQuery,
  ): Promise<SearchFacilitiesResponse> {
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
        index: this.facilityIndex,
        ...searchBody,
      });

      const hits = response.hits.hits;
      const total =
        typeof response.hits.total === 'number'
          ? response.hits.total
          : response.hits.total?.value || 0;
      const maxScore = response.hits.max_score || 0;

      const data = hits.map((hit: any) => ({
        facility: hit._source as FacilitySearchDocument,
        score: hit._score as number,
        distance: hit.sort ? (hit.sort[0] as number) : undefined,
      }));

      return {
        data,
        total,
        maxScore,
      };
    } catch (error) {
      this.logger.error('Failed to search facilities', error);
      throw error;
    }
  }

  async getFacilityById(
    facilityId: string,
  ): Promise<FacilitySearchDocument | null> {
    try {
      const response = await this.esService.get({
        index: this.facilityIndex,
        id: facilityId,
      });
      return response._source as FacilitySearchDocument;
    } catch (error) {
      if (error.meta?.statusCode === 404) {
        return null;
      }
      this.logger.error(`Failed to get facility ${facilityId}`, error);
      throw error;
    }
  }

  async reindexAllFacilities(): Promise<void> {
    try {
      this.logger.log('Starting facility reindexing...');

      // Delete existing index
      const indexExists = await this.esService.indices.exists({
        index: this.facilityIndex,
      });

      if (indexExists) {
        await this.esService.indices.delete({
          index: this.facilityIndex,
        });
        this.logger.log('Existing index deleted');
      }

      // Create new index
      await this.createFacilityIndex();
      this.logger.log('New index created');

      this.logger.log('Facility reindexing completed');
    } catch (error) {
      this.logger.error('Failed to reindex facilities', error);
      throw error;
    }
  }

  async bulkIndexFacilities(
    facilities: FacilitySearchDocument[],
  ): Promise<void> {
    try {
      if (facilities.length === 0) {
        return;
      }

      const operations = facilities.flatMap(facility => [
        { index: { _index: this.facilityIndex, _id: facility.id } },
        facility,
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
        throw new Error('Some facilities failed to index');
      }

      this.logger.log(
        `Successfully bulk indexed ${facilities.length} facilities`,
      );
    } catch (error) {
      this.logger.error('Failed to bulk index facilities', error);
      throw error;
    }
  }

  async getIndexStats(): Promise<any> {
    try {
      const response = await this.esService.indices.stats({
        index: this.facilityIndex,
      });
      return response;
    } catch (error) {
      this.logger.error('Failed to get index stats', error);
      throw error;
    }
  }
}
