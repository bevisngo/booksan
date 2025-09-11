import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { CourtResponseDto, CourtFiltersDto } from '../dto/court.dto';

@Injectable()
export class GetAllCourtsUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(filters?: CourtFiltersDto): Promise<CourtResponseDto[]> {
    return this.courtService.getAllCourts(filters);
  }
}
