import { Injectable, Logger } from '@nestjs/common';
import { VenueSearchService } from '../services';

@Injectable()
export class ReindexAllVenuesUseCase {
  private readonly logger = new Logger(ReindexAllVenuesUseCase.name);

  constructor(private readonly venueSearchService: VenueSearchService) {}

  async execute(): Promise<{ indexed: number; errors: string[] }> {
    try {
      this.logger.log('Starting bulk reindex of all venues');

      const result = await this.venueSearchService.reindexAllVenues();

      this.logger.log(
        `Bulk reindex completed. Indexed: ${result.indexed}, Errors: ${result.errors.length}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Failed to reindex all venues', error);
      throw error;
    }
  }
}
