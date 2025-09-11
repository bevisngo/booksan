import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';

@Injectable()
export class DeleteCourtUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(id: string): Promise<void> {
    return this.courtService.deleteCourt(id);
  }
}
