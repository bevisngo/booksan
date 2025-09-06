import { Injectable, Logger } from '@nestjs/common';
import { VenueSearchService } from '../services';

@Injectable()
export class ReindexVenueUseCase {
  private readonly logger = new Logger(ReindexVenueUseCase.name);

  constructor(private readonly venueSearchService: VenueSearchService) {}

  async execute(venueId: string): Promise<{ message: string }> {
    try {
      this.logger.debug(`Reindexing venue: ${venueId}`);

      await this.venueSearchService.indexVenue(venueId);

      this.logger.debug(`Successfully reindexed venue: ${venueId}`);
      return {
        message: `Venue ${venueId} reindexed successfully`,
      };
    } catch (error) {
      this.logger.error(`Failed to reindex venue ${venueId}`, error);
      throw error;
    }
  }
}
