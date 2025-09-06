/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  Get,
  Query,
  Param,
  Post,
  HttpStatus,
  HttpException,
  UseGuards,
  Logger,
} from '@nestjs/common';
import {
  SearchVenuesDto,
  SearchVenuesResponseDto,
  VenueResponseDto,
} from '../dto';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { Public } from '@/modules/auth/decorators';
import {
  SearchVenuesUseCase,
  GetVenueByIdUseCase,
  ReindexVenueUseCase,
  ReindexAllVenuesUseCase,
  GetIndexStatsUseCase,
} from '../use-cases';

@Controller('venues')
export class VenueSearchController {
  private readonly logger = new Logger(VenueSearchController.name);
  constructor(
    private readonly searchVenuesUseCase: SearchVenuesUseCase,
    private readonly getVenueByIdUseCase: GetVenueByIdUseCase,
    private readonly reindexVenueUseCase: ReindexVenueUseCase,
    private readonly reindexAllVenuesUseCase: ReindexAllVenuesUseCase,
    private readonly getIndexStatsUseCase: GetIndexStatsUseCase,
  ) {}

  @Public()
  @Get('search')
  async searchVenues(
    @Query() searchDto: SearchVenuesDto,
  ): Promise<SearchVenuesResponseDto> {
    try {
      this.logger.debug(
        `Searching venues with params: ${JSON.stringify(searchDto)}`,
      );
      const result = await this.searchVenuesUseCase.execute(searchDto);
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

  @Public()
  @Get(':id')
  async getVenueById(@Param('id') venueId: string): Promise<{
    data: VenueResponseDto;
  }> {
    try {
      const venue = await this.getVenueByIdUseCase.execute(venueId);

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

  @UseGuards(JwtAuthGuard)
  @Post(':id/reindex')
  async reindexVenue(@Param('id') venueId: string): Promise<{
    data: { message: string };
  }> {
    try {
      const result = await this.reindexVenueUseCase.execute(venueId);
      return {
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          error: 'REINDEX_FAILED',
          message: 'Failed to reindex venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('reindex-all')
  async reindexAllVenues(): Promise<{
    data: { indexed: number; errors: string[] };
  }> {
    try {
      const result = await this.reindexAllVenuesUseCase.execute();
      return {
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          error: 'BULK_REINDEX_FAILED',
          message: 'Failed to reindex all venues',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/stats')
  async getIndexStats(): Promise<{
    data: any;
  }> {
    try {
      const stats = await this.getIndexStatsUseCase.execute();
      return {
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          error: 'GET_STATS_FAILED',
          message: 'Failed to get index statistics',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
