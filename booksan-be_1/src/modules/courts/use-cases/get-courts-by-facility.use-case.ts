import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { CourtResponseDto } from '../dto/court.dto';

@Injectable()
export class GetCourtsByFacilityUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(facilityId: string): Promise<CourtResponseDto[]> {
    return this.courtService.getCourtsByFacility(facilityId);
  }
}
