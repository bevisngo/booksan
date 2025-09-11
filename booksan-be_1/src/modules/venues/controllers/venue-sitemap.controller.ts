import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { VenueRepository } from '../repositories';

interface VenueSitemapDto {
  slug: string;
  updatedAt: string;
  isPublished: boolean;
}

@ApiTags('Venue Sitemap')
@Controller('venues')
export class VenueSitemapController {
  constructor(private readonly venueRepository: VenueRepository) {}

  @Get('sitemap')
  @ApiOperation({ summary: 'Get venues data for sitemap generation' })
  @ApiResponse({
    status: 200,
    description: 'Venues sitemap data retrieved successfully',
    type: [Object],
  })
  async getVenuesSitemapData(): Promise<VenueSitemapDto[]> {
    const venues = await this.venueRepository.findMany({
      select: {
        slug: true,
        updatedAt: true,
        isPublished: true,
      },
      where: {
        slug: { not: null },
      },
    });

    return venues.data.map(venue => ({
      slug: venue.slug,
      updatedAt: venue.updatedAt.toISOString(),
      isPublished: venue.isPublished,
    }));
  }
}
