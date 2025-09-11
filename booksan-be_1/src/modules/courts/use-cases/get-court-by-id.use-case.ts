import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { CourtWithFacilityResponseDto } from '../dto/court.dto';

@Injectable()
export class GetCourtByIdUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(id: string): Promise<CourtWithFacilityResponseDto> {
    return this.courtService.getCourtById(id);
  }
}
