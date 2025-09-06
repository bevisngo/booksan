import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/prisma/prisma.service';
import {
  BaseRepositoryInterface,
  PaginationOptions,
  PaginationResult,
  FilterOptions,
} from './base-repository.interface';

// Define the Prisma model delegate interface
interface PrismaModelDelegate<T> {
  findUnique(args: { where: Record<string, unknown> }): Promise<T | null>;
  findFirst(args: { where: Record<string, unknown> }): Promise<T | null>;
  findMany(args?: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown> | Record<string, unknown>[];
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
    skip?: number;
    take?: number;
    cursor?: Record<string, unknown>;
  }): Promise<T[]>;
  create(args: { data: Record<string, unknown> }): Promise<T>;
  update(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<T>;
  delete(args: { where: Record<string, unknown> }): Promise<T>;
  deleteMany(args: {
    where: Record<string, unknown>;
  }): Promise<{ count: number }>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
  createMany(args: {
    data: Record<string, unknown>[];
  }): Promise<{ count: number }>;
  updateMany(args: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
  upsert(args: {
    where: Record<string, unknown>;
    create: Record<string, unknown>;
    update: Record<string, unknown>;
  }): Promise<T>;
}

@Injectable()
export abstract class BaseRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereInput,
  ModelName extends string,
> implements BaseRepositoryInterface<T, CreateInput, UpdateInput, WhereInput>
{
  protected abstract readonly modelName: ModelName;

  constructor(protected readonly prisma: PrismaService) {}

  // Get the Prisma model delegate with proper typing
  protected get model(): PrismaModelDelegate<T> {
    return (this.prisma as unknown as Record<string, PrismaModelDelegate<T>>)[
      this.modelName
    ];
  }

  // Basic CRUD operations
  async findById(id: string): Promise<T | null> {
    const result = await this.model.findUnique({
      where: { id },
    });
    return result;
  }

  async findMany(
    options: FilterOptions & PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
    const {
      page,
      limit = 10,
      cursor,
      where,
      orderBy,
      include,
      select,
    } = options;

    // Build query options
    const queryOptions: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, unknown> | Record<string, unknown>[];
      include?: Record<string, unknown>;
      select?: Record<string, unknown>;
      skip?: number;
      take?: number;
      cursor?: Record<string, unknown>;
    } = {
      where: where as Record<string, unknown>,
      orderBy: orderBy as Record<string, unknown> | Record<string, unknown>[],
      include: include as Record<string, unknown>,
      select: select as Record<string, unknown>,
    };

    // Handle pagination
    if (cursor) {
      // Cursor-based pagination
      queryOptions.cursor = { id: cursor };
      queryOptions.skip = 1; // Skip the cursor itself
      queryOptions.take = limit;
    } else if (page !== undefined) {
      // Offset-based pagination
      queryOptions.skip = (page - 1) * limit;
      queryOptions.take = limit;
    }

    // Execute query
    const [data, total] = await Promise.all([
      this.model.findMany(queryOptions),
      where ? this.count(where as WhereInput) : this.count(),
    ]);

    // Build pagination metadata
    const meta: PaginationResult<T>['meta'] = {};

    if (page !== undefined) {
      const totalPages = Math.ceil(total / limit);
      meta.page = page;
      meta.limit = limit;
      meta.total = total;
      meta.totalPages = totalPages;
      meta.hasNextPage = page < totalPages;
      meta.hasPreviousPage = page > 1;
    } else if (cursor) {
      meta.cursor =
        data.length > 0
          ? ((data[data.length - 1] as Record<string, unknown>).id as string)
          : undefined;
      meta.limit = limit;
    }

    return { data, meta };
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({
      data: data as Record<string, unknown>,
    });
  }

  async update(id: string, data: UpdateInput): Promise<T> {
    return this.model.update({
      where: { id },
      data: data as Record<string, unknown>,
    });
  }

  async delete(id: string): Promise<void> {
    await this.model.delete({
      where: { id },
    });
  }

  async deleteMany(where: WhereInput): Promise<number> {
    const result = await this.model.deleteMany({
      where: where as Record<string, unknown>,
    });
    return result.count;
  }

  // Query operations
  async findFirst(where: WhereInput): Promise<T | null> {
    return this.model.findFirst({
      where: where as Record<string, unknown>,
    });
  }

  async findUnique(where: WhereInput): Promise<T | null> {
    return this.model.findUnique({
      where: where as Record<string, unknown>,
    });
  }

  async count(where?: WhereInput): Promise<number> {
    return this.model.count({
      where: where as Record<string, unknown>,
    });
  }

  async exists(where: WhereInput): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }

  // Batch operations
  async createMany(data: CreateInput[]): Promise<number> {
    const result = await this.model.createMany({
      data: data as Record<string, unknown>[],
    });
    return result.count;
  }

  async updateMany(where: WhereInput, data: UpdateInput): Promise<number> {
    const result = await this.model.updateMany({
      where: where as Record<string, unknown>,
      data: data as Record<string, unknown>,
    });
    return result.count;
  }

  // Advanced operations
  async upsert(
    where: WhereInput,
    create: CreateInput,
    update: UpdateInput,
  ): Promise<T> {
    return this.model.upsert({
      where: where as Record<string, unknown>,
      create: create as Record<string, unknown>,
      update: update as Record<string, unknown>,
    });
  }

  async findAndUpdate(where: WhereInput, data: UpdateInput): Promise<T | null> {
    const existing = await this.findFirst(where);
    if (!existing) {
      return null;
    }

    const existingRecord = existing as Record<string, unknown>;
    return this.update(existingRecord.id as string, data);
  }

  async findAndDelete(where: WhereInput): Promise<T | null> {
    const existing = await this.findFirst(where);
    if (!existing) {
      return null;
    }

    const existingRecord = existing as Record<string, unknown>;
    await this.delete(existingRecord.id as string);
    return existing;
  }

  // Transaction support
  async transaction<R>(
    callback: (tx: PrismaService) => Promise<R>,
  ): Promise<R> {
    return this.prisma.$transaction(callback);
  }

  // Raw query support
  async rawQuery<TReturn = unknown>(
    query: string,
    params?: unknown[],
  ): Promise<TReturn[]> {
    return this.prisma.$queryRawUnsafe(query, ...(params || []));
  }

  // Helper methods for common patterns
  async findByIds(ids: string[]): Promise<T[]> {
    return this.model.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findByIdOrThrow(id: string): Promise<T> {
    const result = await this.findById(id);
    if (!result) {
      throw new Error(`${this.modelName} with id ${id} not found`);
    }
    return result;
  }

  async softDelete(id: string): Promise<T> {
    return this.update(id, { deletedAt: new Date() } as UpdateInput);
  }

  async restore(id: string): Promise<T> {
    return this.update(id, { deletedAt: null } as UpdateInput);
  }

  // Search functionality
  async search(
    searchTerm: string,
    searchFields: string[],
    options: FilterOptions & PaginationOptions = {},
  ): Promise<PaginationResult<T>> {
    const { where = {}, ...otherOptions } = options;

    // Build search conditions
    const searchConditions = searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive' as const,
      },
    }));

    const searchWhere = {
      ...where,
      OR: searchConditions,
    };

    return this.findMany({
      ...otherOptions,
      where: searchWhere,
    });
  }
}
