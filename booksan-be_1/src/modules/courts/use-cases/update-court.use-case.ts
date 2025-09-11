import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { UpdateCourtDto, CourtResponseDto } from '../dto/court.dto';

@Injectable()
export class UpdateCourtUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(
    id: string,
    updateCourtDto: UpdateCourtDto,
  ): Promise<CourtResponseDto> {
    return this.courtService.updateCourt(id, updateCourtDto);
  }
}
