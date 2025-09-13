import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { BadRequestException } from '@nestjs/common';
import { BaseFilterDto } from '../dto/base-filter.dto';

@Injectable()
export class PaginationPipe<T extends BaseFilterDto> implements PipeTransform {
  constructor(private readonly targetType: new () => T) {}

  async transform(value: any, metadata: ArgumentMetadata): Promise<T> {
    if (metadata.type !== 'query') {
      return value;
    }

    // Transform query parameters to the target DTO
    const object = plainToClass(this.targetType, value);

    // Set default values if not provided
    if (
      object.page === undefined ||
      object.page === null ||
      isNaN(object.page)
    ) {
      object.page = 1;
    }

    if (
      object.limit === undefined ||
      object.limit === null ||
      isNaN(object.limit)
    ) {
      object.limit = 10;
    }

    // Ensure page is at least 1
    if (object.page < 1) {
      object.page = 1;
    }

    // Ensure limit is within bounds
    if (object.limit < 1) {
      object.limit = 1;
    }
    if (object.limit > 100) {
      object.limit = 100;
    }

    // Validate the transformed object
    const errors = await validate(object);
    if (errors.length > 0) {
      const errorMessages = errors
        .map(error => Object.values(error.constraints || {}).join(', '))
        .join('; ');
      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }

    return object;
  }
}
