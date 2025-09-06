import { Injectable, Logger } from '@nestjs/common';
import { VenueSearchService } from '../services';

@Injectable()
export class GetIndexStatsUseCase {
  private readonly logger = new Logger(GetIndexStatsUseCase.name);

  constructor(private readonly venueSearchService: VenueSearchService) {}

  async execute(): Promise<any> {
    try {
      this.logger.debug('Getting Elasticsearch index statistics');

      const stats = await this.venueSearchService.getIndexStats();

      this.logger.debug('Successfully retrieved index statistics');
      return stats;
    } catch (error) {
      this.logger.error('Failed to get index statistics', error);
      throw error;
    }
  }
}
