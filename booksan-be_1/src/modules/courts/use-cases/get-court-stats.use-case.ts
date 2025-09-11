import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';

@Injectable()
export class GetCourtStatsUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(facilityId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    bySport: Record<string, number>;
    bySurface: Record<string, number>;
    indoor: number;
    outdoor: number;
  }> {
    return this.courtService.getCourtStats(facilityId);
  }
}
