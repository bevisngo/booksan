import {
  Controller,
  Get,
  Query,
  Param,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import {
  SearchVenuesDto,
  SearchVenuesResponseDto,
  VenueResponseDto,
} from '../dto';
import { Public } from '@/modules/auth/decorators';
import {
  SearchVenuesUseCase,
  GetVenueByIdUseCase,
} from '../use-cases';

@ApiTags('Player Venues')
@Controller('player/venues')
@Public() // Players can search venues without authentication
export class PlayerVenueController {
  private readonly logger = new Logger(PlayerVenueController.name);
  
  constructor(
    private readonly searchVenuesUseCase: SearchVenuesUseCase,
    private readonly getVenueByIdUseCase: GetVenueByIdUseCase,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Search venues for players' })
  @ApiQuery({ name: 'q', required: false, description: 'Search query' })
  @ApiQuery({ name: 'sport', required: false, description: 'Filter by sport' })
  @ApiQuery({ name: 'city', required: false, description: 'Filter by city' })
  @ApiQuery({ name: 'ward', required: false, description: 'Filter by ward' })
  @ApiQuery({ name: 'latitude', required: false, description: 'User latitude for distance calculation' })
  @ApiQuery({ name: 'longitude', required: false, description: 'User longitude for distance calculation' })
  @ApiQuery({ name: 'radius', required: false, description: 'Search radius in km' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiResponse({
    status: 200,
    description: 'Venues retrieved successfully',
    type: SearchVenuesResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Search failed' })
  async searchVenues(
    @Query() searchDto: SearchVenuesDto,
  ): Promise<SearchVenuesResponseDto> {
    try {
      this.logger.debug(
        `Player searching venues with params: ${JSON.stringify(searchDto)}`,
      );
      
      // Only return published venues for players
      const result = await this.searchVenuesUseCase.execute({
        ...searchDto,
        isPublished: true, // Force only published venues
      });
      
      return result;
    } catch (error) {
      throw new HttpException(
        {
          error: 'SEARCH_FAILED',
          message: 'Failed to search venues',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get venue details for players' })
  @ApiParam({ name: 'id', description: 'Venue ID or slug' })
  @ApiResponse({
    status: 200,
    description: 'Venue retrieved successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  @ApiResponse({ status: 500, description: 'Failed to get venue' })
  async getVenueById(@Param('id') venueId: string): Promise<{
    data: VenueResponseDto;
  }> {
    try {
      const venue = await this.getVenueByIdUseCase.execute(venueId);

      // Only allow access to published venues for players
      if (!venue.isPublished) {
        throw new HttpException(
          {
            error: 'VENUE_NOT_FOUND',
            message: 'Venue not found or not available',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        data: venue,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: 'GET_VENUE_FAILED',
          message: 'Failed to get venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Get venue availability for booking' })
  @ApiParam({ name: 'id', description: 'Venue ID or slug' })
  @ApiQuery({ name: 'date', required: true, description: 'Date to check availability (YYYY-MM-DD)' })
  @ApiQuery({ name: 'sport', required: false, description: 'Filter by sport' })
  @ApiResponse({
    status: 200,
    description: 'Venue availability retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async getVenueAvailability(
    @Param('id') venueId: string,
    @Query('date') date: string,
    @Query('sport') sport?: string,
  ): Promise<{
    data: {
      date: string;
      venue: VenueResponseDto;
      availableSlots: Array<{
        courtId: string;
        courtName: string;
        sport: string;
        timeSlots: Array<{
          startTime: string;
          endTime: string;
          available: boolean;
          price: number;
        }>;
      }>;
    };
  }> {
    try {
      // TODO: Implement availability check logic
      const venue = await this.getVenueByIdUseCase.execute(venueId);

      if (!venue.isPublished) {
        throw new HttpException(
          {
            error: 'VENUE_NOT_FOUND',
            message: 'Venue not found or not available',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      // Placeholder response - implement actual availability logic
      return {
        data: {
          date,
          venue,
          availableSlots: [], // TODO: Implement actual availability check
        },
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: 'GET_AVAILABILITY_FAILED',
          message: 'Failed to get venue availability',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured venues for players' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of featured venues to return' })
  @ApiResponse({
    status: 200,
    description: 'Featured venues retrieved successfully',
  })
  async getFeaturedVenues(
    @Query('limit') limit?: string,
  ): Promise<{ data: VenueResponseDto[] }> {
    try {
      // TODO: Implement featured venues logic
      const searchResult = await this.searchVenuesUseCase.execute({
        isPublished: true,
        page: 1,
        limit: limit ? parseInt(limit) : 10,
        // Add featured venue criteria
      });

      return {
        data: searchResult.data,
      };
    } catch (error) {
      throw new HttpException(
        {
          error: 'GET_FEATURED_FAILED',
          message: 'Failed to get featured venues',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
