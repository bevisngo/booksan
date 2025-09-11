import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpException,
  Logger,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  VenueResponseDto,
} from '../dto';
import { CurrentUser, Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
import { OwnerProfile } from '@/modules/auth/repositories';
import { UserRole } from '@prisma/client';
import {
  GetVenueByIdUseCase,
  ReindexVenueUseCase,
} from '../use-cases';

// TODO: Create these DTOs for venue management
interface CreateVenueDto {
  name: string;
  desc?: string;
  address: string;
  ward?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
}

interface UpdateVenueDto {
  name?: string;
  desc?: string;
  address?: string;
  ward?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  isPublished?: boolean;
}

@ApiTags('Owner Venues')
@Controller('owner/venues')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER, UserRole.ADMIN)
@ApiBearerAuth()
export class OwnerVenueController {
  private readonly logger = new Logger(OwnerVenueController.name);
  
  constructor(
    private readonly getVenueByIdUseCase: GetVenueByIdUseCase,
    private readonly reindexVenueUseCase: ReindexVenueUseCase,
  ) {}

  @Get('my-venue')
  @ApiOperation({ summary: 'Get owner\'s venue details' })
  @ApiResponse({
    status: 200,
    description: 'Venue retrieved successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async getMyVenue(
    @CurrentUser() user: OwnerProfile,
  ): Promise<{ data: VenueResponseDto }> {
    try {
      // Use facilityId from JWT payload for direct access
      const venue = await this.getVenueByIdUseCase.execute(user.facilityId);

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
          message: 'Failed to get your venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('my-venue')
  @ApiOperation({ summary: 'Update owner\'s venue details' })
  @ApiResponse({
    status: 200,
    description: 'Venue updated successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async updateMyVenue(
    @CurrentUser() user: OwnerProfile,
    @Body() updateVenueDto: UpdateVenueDto,
  ): Promise<{ data: VenueResponseDto }> {
    try {
      // TODO: Implement update venue use case
      // For now, return current venue
      const venue = await this.getVenueByIdUseCase.execute(user.facilityId);

      this.logger.log(`Owner ${user.id} updated venue ${user.facilityId}`);

      return {
        data: venue,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: 'UPDATE_VENUE_FAILED',
          message: 'Failed to update your venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('my-venue/publish')
  @ApiOperation({ summary: 'Publish owner\'s venue' })
  @ApiResponse({
    status: 200,
    description: 'Venue published successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async publishMyVenue(
    @CurrentUser() user: OwnerProfile,
  ): Promise<{ data: VenueResponseDto }> {
    try {
      // TODO: Implement publish venue use case
      const venue = await this.getVenueByIdUseCase.execute(user.facilityId);

      this.logger.log(`Owner ${user.id} published venue ${user.facilityId}`);

      return {
        data: venue,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: 'PUBLISH_VENUE_FAILED',
          message: 'Failed to publish your venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('my-venue/unpublish')
  @ApiOperation({ summary: 'Unpublish owner\'s venue' })
  @ApiResponse({
    status: 200,
    description: 'Venue unpublished successfully',
    type: VenueResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async unpublishMyVenue(
    @CurrentUser() user: OwnerProfile,
  ): Promise<{ data: VenueResponseDto }> {
    try {
      // TODO: Implement unpublish venue use case
      const venue = await this.getVenueByIdUseCase.execute(user.facilityId);

      this.logger.log(`Owner ${user.id} unpublished venue ${user.facilityId}`);

      return {
        data: venue,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: 'UNPUBLISH_VENUE_FAILED',
          message: 'Failed to unpublish your venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('my-venue')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete owner\'s venue' })
  @ApiResponse({ status: 204, description: 'Venue deleted successfully' })
  @ApiResponse({ status: 400, description: 'Cannot delete venue with active bookings' })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async deleteMyVenue(
    @CurrentUser() user: OwnerProfile,
  ): Promise<void> {
    try {
      // TODO: Implement soft delete venue use case
      // Check for active bookings
      // Perform soft delete

      this.logger.log(`Owner ${user.id} soft deleted venue ${user.facilityId}`);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: 'DELETE_VENUE_FAILED',
          message: 'Failed to delete your venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('my-venue/reindex')
  @ApiOperation({ summary: 'Reindex owner\'s venue in search' })
  @ApiResponse({
    status: 200,
    description: 'Venue reindexed successfully',
  })
  @ApiResponse({ status: 404, description: 'Venue not found' })
  async reindexMyVenue(
    @CurrentUser() user: OwnerProfile,
  ): Promise<{ data: { message: string } }> {
    try {
      const result = await this.reindexVenueUseCase.execute(user.facilityId);
      
      this.logger.log(`Owner ${user.id} reindexed venue ${user.facilityId}`);
      
      return {
        data: result,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: 'REINDEX_FAILED',
          message: 'Failed to reindex your venue',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('my-venue/stats')
  @ApiOperation({ summary: 'Get owner\'s venue statistics' })
  @ApiQuery({ name: 'from', required: false, description: 'Start date for stats (YYYY-MM-DD)' })
  @ApiQuery({ name: 'to', required: false, description: 'End date for stats (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Venue statistics retrieved successfully',
  })
  async getMyVenueStats(
    @CurrentUser() user: OwnerProfile,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ): Promise<{
    data: {
      totalBookings: number;
      totalRevenue: number;
      courtUtilization: Record<string, number>;
      popularTimeSlots: Array<{ time: string; bookings: number }>;
      period: { from: string; to: string };
    };
  }> {
    try {
      // TODO: Implement venue statistics use case
      // Calculate bookings, revenue, utilization, etc.

      const stats = {
        totalBookings: 0,
        totalRevenue: 0,
        courtUtilization: {},
        popularTimeSlots: [],
        period: {
          from: from || new Date().toISOString().split('T')[0],
          to: to || new Date().toISOString().split('T')[0],
        },
      };

      return {
        data: stats,
      };
    } catch (error) {
      throw new HttpException(
        {
          error: 'GET_STATS_FAILED',
          message: 'Failed to get venue statistics',
          details: (error as Error).message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
