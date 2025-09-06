import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { VenueSearchService } from '../services';
import { VenueResponseDto } from '../dto';

@Injectable()
export class GetVenueByIdUseCase {
  private readonly logger = new Logger(GetVenueByIdUseCase.name);

  constructor(private readonly venueSearchService: VenueSearchService) {}

  async execute(venueId: string): Promise<VenueResponseDto> {
    try {
      this.logger.debug(`Getting venue by ID: ${venueId}`);

      const venue = await this.venueSearchService.getVenueById(venueId);

      if (!venue) {
        this.logger.warn(`Venue not found: ${venueId}`);
        throw new NotFoundException('Venue not found');
      }

      this.logger.debug(`Successfully retrieved venue: ${venueId}`);
      return venue;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      this.logger.error(`Failed to get venue ${venueId}`, error);
      throw error;
    }
  }
}
