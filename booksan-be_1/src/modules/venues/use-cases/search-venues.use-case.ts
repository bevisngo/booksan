import { Injectable, Logger } from '@nestjs/common';
import { VenueSearchService } from '../services';
import { SearchVenuesDto, SearchVenuesResponseDto } from '../dto';

@Injectable()
export class SearchVenuesUseCase {
  private readonly logger = new Logger(SearchVenuesUseCase.name);

  constructor(private readonly venueSearchService: VenueSearchService) {}

  async execute(searchDto: SearchVenuesDto): Promise<SearchVenuesResponseDto> {
    try {
      this.logger.debug(
        `Searching venues with params: ${JSON.stringify(searchDto)}`,
      );

      const result = await this.venueSearchService.searchVenues(searchDto);

      this.logger.debug(`Found ${result.total} venues`);
      return result;
    } catch (error) {
      this.logger.error('Failed to search venues', error);
      throw error;
    }
  }
}
