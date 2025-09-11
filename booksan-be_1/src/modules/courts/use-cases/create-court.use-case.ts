import { Injectable } from '@nestjs/common';
import { CourtService } from '../services/court.service';
import { CreateCourtDto, CourtResponseDto } from '../dto/court.dto';

@Injectable()
export class CreateCourtUseCase {
  constructor(private readonly courtService: CourtService) {}

  async execute(createCourtDto: CreateCourtDto): Promise<CourtResponseDto> {
    // get facility by user id
    // const facility = await this.facilityRepository.findByUserId(
    //   createCourtDto.userId,
    // );
    return this.courtService.createCourt(createCourtDto);
  }
}
