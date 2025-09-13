import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { CreateCourtDto, CourtResponseDto } from '../dto/court.dto';

@Injectable()
export class CreateCourtUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(
    createCourtDto: CreateCourtDto,
    facilityId: string,
  ): Promise<CourtResponseDto> {
    return this.courtService.createCourt(createCourtDto, facilityId);
  }
}
