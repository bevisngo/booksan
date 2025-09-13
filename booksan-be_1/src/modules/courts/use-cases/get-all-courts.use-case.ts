import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { CourtFiltersDto, CourtPaginationResponseDto } from '../dto/court.dto';

@Injectable()
export class GetAllCourtsUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(filters: CourtFiltersDto): Promise<CourtPaginationResponseDto> {
    return this.courtService.getAllCourtsPaginated(filters);
  }
}
