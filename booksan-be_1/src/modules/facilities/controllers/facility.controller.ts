import { Controller, Get, Query, Param, Logger } from '@nestjs/common';
import { Public } from '@/modules/auth/decorators';
import { ElasticsearchService } from '@/core/elasticsearch/elasticsearch.service';
import { SearchFacilitiesDto } from '../dto/search-facilities.dto';

@Controller('facilities')
export class FacilityController {
  private readonly logger = new Logger(FacilityController.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  @Get('search')
  @Public()
  async searchFacilities(@Query() searchDto: SearchFacilitiesDto) {
    try {
      this.logger.debug(
        `Searching facilities with params: ${JSON.stringify(searchDto)}`,
      );

      const result = await this.elasticsearchService.searchFacilities({
        keyword: searchDto.keyword,
        lat: searchDto.lat,
        lon: searchDto.lon,
        maxDistance: searchDto.maxDistance,
        sport: searchDto.sport,
        isPublished: searchDto.isPublished,
        limit: searchDto.limit,
        offset: searchDto.offset,
      });

      // Transform the response to match the expected frontend format
      return {
        data: result.data.map(item => ({
          facility: item.facility,
          score: item.score,
          distance: item.distance,
        })),
        total: result.total,
        maxScore: result.maxScore,
        meta: {
          limit: searchDto.limit || 10,
          offset: searchDto.offset || 0,
          hasMore:
            (searchDto.offset || 0) + (searchDto.limit || 10) < result.total,
        },
      };
    } catch (error) {
      this.logger.error('Failed to search facilities', error);
      throw error;
    }
  }

  @Get(':id')
  @Public()
  async getFacilityById(@Param('id') id: string) {
    try {
      this.logger.debug(`Getting facility by ID: ${id}`);

      const facility = await this.elasticsearchService.getFacilityById(id);

      if (!facility) {
        throw new Error('Facility not found');
      }

      return facility;
    } catch (error) {
      this.logger.error(`Failed to get facility ${id}`, error);
      throw error;
    }
  }

  @Get(':slug/page')
  @Public()
  async getFacilityPageBySlug(@Param('slug') slug: string) {
    try {
      this.logger.debug(`Getting facility page by slug: ${slug}`);

      // For now, search by slug in the name or slug field
      // In a real implementation, you might want to have a separate slug field
      const result = await this.elasticsearchService.searchFacilities({
        keyword: slug,
        limit: 1,
        offset: 0,
        isPublished: true,
      });

      if (!result.data.length) {
        throw new Error('Facility not found');
      }

      return result.data[0].facility;
    } catch (error) {
      this.logger.error(`Failed to get facility page for slug ${slug}`, error);
      throw error;
    }
  }

  @Get(':slug/seo')
  @Public()
  async getFacilitySEO(@Param('slug') slug: string) {
    try {
      this.logger.debug(`Getting facility SEO data for slug: ${slug}`);

      const result = await this.elasticsearchService.searchFacilities({
        keyword: slug,
        limit: 1,
        offset: 0,
        isPublished: true,
      });

      if (!result.data.length) {
        throw new Error('Facility not found');
      }

      const facility = result.data[0].facility;

      return {
        metaTitle: `${facility.name} - Book Sports Facilities`,
        metaDescription:
          facility.description ||
          `Book courts and sports facilities at ${facility.name}. Located at ${facility.address}.`,
        metaKeywords: [
          facility.name,
          ...facility.courts.map(court => court.sport),
          facility.city || '',
          'sports facility',
          'court booking',
        ].filter(Boolean),
        openGraphTitle: facility.name,
        openGraphDescription:
          facility.description || `Book sports facilities at ${facility.name}`,
        openGraphImage: null, // You can add image URL logic here
        canonicalUrl: `/facilities/${slug}`,
        structuredData: {
          '@context': 'https://schema.org',
          '@type': 'SportsActivityLocation',
          name: facility.name,
          description: facility.description,
          url: `/facilities/${slug}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: facility.address,
            addressLocality: facility.city,
            addressCountry: 'VN',
          },
          geo: {
            '@type': 'GeoCoordinates',
            latitude: facility.location.lat,
            longitude: facility.location.lon,
          },
          sport: facility.courts.map(court => court.sport),
        },
      };
    } catch (error) {
      this.logger.error(
        `Failed to get facility SEO data for slug ${slug}`,
        error,
      );
      throw error;
    }
  }

  @Get('sitemap')
  @Public()
  async getFacilitiesForSitemap() {
    try {
      this.logger.debug('Getting facilities for sitemap');

      const result = await this.elasticsearchService.searchFacilities({
        isPublished: true,
        limit: 1000, // Get a large number for sitemap
        offset: 0,
      });

      return result.data.map(item => ({
        slug: item.facility.slug,
        updatedAt: item.facility.updatedAt,
        isPublished: item.facility.isPublished,
      }));
    } catch (error) {
      this.logger.error('Failed to get facilities for sitemap', error);
      throw error;
    }
  }

  @Get('popular')
  @Public()
  async getPopularFacilities(@Query('limit') limit?: number) {
    try {
      this.logger.debug(`Getting popular facilities with limit: ${limit}`);

      // For now, return facilities sorted by relevance
      // In a real implementation, you might want to sort by booking count or rating
      const result = await this.elasticsearchService.searchFacilities({
        isPublished: true,
        limit: limit || 10,
        offset: 0,
      });

      return result.data.map(item => item.facility);
    } catch (error) {
      this.logger.error('Failed to get popular facilities', error);
      throw error;
    }
  }
}
