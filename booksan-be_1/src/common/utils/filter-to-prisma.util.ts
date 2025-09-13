import { BaseFilterDto } from '../dto/base-filter.dto';
import {
  PaginationOptions,
  FilterOptions,
} from '@/shared/repositories/base-repository.interface';

export interface PrismaQueryOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, any> | Record<string, any>[];
  include?: Record<string, any>;
  select?: Record<string, any>;
  skip?: number;
  take?: number;
  cursor?: Record<string, any>;
}

export class FilterToPrismaUtil {
  /**
   * Convert BaseFilterDto to Prisma query options
   */
  static toPrismaQuery<T extends BaseFilterDto>(
    filters: T,
    customWhere?: Record<string, any>,
    customInclude?: Record<string, any>,
    defaultSortField?: string,
  ): PrismaQueryOptions {
    const query: PrismaQueryOptions = {};

    // Handle where clause
    if (customWhere || filters.search) {
      query.where = { ...customWhere };

      // Add search functionality if provided
      if (filters.search && filters.search.trim()) {
        // This will be extended per entity based on searchable fields
        query.where.OR = [
          // Default search implementation - should be overridden per entity
          { name: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
    }

    // Handle sorting
    if (filters.sortBy) {
      query.orderBy = {
        [filters.sortBy]: filters.sortDirection || 'asc',
      };
    } else if (defaultSortField) {
      query.orderBy = {
        [defaultSortField]: filters.sortDirection || 'asc',
      };
    } else {
      // Default sort by createdAt
      query.orderBy = {
        createdAt: 'desc',
      };
    }

    // Handle pagination
    if (filters.cursor) {
      // Cursor-based pagination
      query.cursor = { id: filters.cursor };
      query.skip = 1; // Skip the cursor itself
      query.take = filters.limit || 10;
    } else {
      // Offset-based pagination
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      query.skip = (page - 1) * limit;
      query.take = limit;
    }

    // Handle includes
    if (filters.includeRelations && customInclude) {
      query.include = customInclude;
    }

    return query;
  }

  /**
   * Convert to repository filter options
   */
  static toRepositoryOptions<T extends BaseFilterDto>(
    filters: T,
    customWhere?: Record<string, any>,
    customInclude?: Record<string, any>,
  ): FilterOptions & PaginationOptions {
    const options: FilterOptions & PaginationOptions = {
      page: filters.page || 1,
      limit: filters.limit || 10,
      where: customWhere,
      include: filters.includeRelations ? customInclude : undefined,
    };

    // Handle sorting
    if (filters.sortBy) {
      options.orderBy = {
        [filters.sortBy]: filters.sortDirection || 'asc',
      };
    }

    // Handle cursor
    if (filters.cursor) {
      options.cursor = filters.cursor;
      delete options.page; // Don't use page when using cursor
    }

    return options;
  }

  /**
   * Build search OR clause for multiple fields
   */
  static buildSearchClause(
    searchTerm: string,
    searchFields: string[],
  ): Record<string, any>[] {
    if (!searchTerm.trim() || searchFields.length === 0) {
      return [];
    }

    return searchFields.map(field => ({
      [field]: {
        contains: searchTerm,
        mode: 'insensitive',
      },
    }));
  }

  /**
   * Merge multiple where conditions
   */
  static mergeWhereConditions(
    ...conditions: (Record<string, any> | undefined)[]
  ): Record<string, any> {
    const validConditions = conditions.filter(Boolean);

    if (validConditions.length === 0) {
      return {};
    }

    if (validConditions.length === 1) {
      return validConditions[0]!;
    }

    return {
      AND: validConditions,
    };
  }
}
