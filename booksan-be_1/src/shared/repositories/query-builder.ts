import { AdvancedFilterOptions, SearchOptions, SortOptions } from './types';

// Define proper types for Prisma where clauses
type PrismaWhereClause = Record<string, unknown>;
type PrismaOrderByClause =
  | Record<string, 'asc' | 'desc'>
  | Array<Record<string, 'asc' | 'desc'>>;
type PrismaQueryClause = {
  where?: PrismaWhereClause;
  orderBy?: PrismaOrderByClause;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
  distinct?: string | string[];
  skip?: number;
  take?: number;
  cursor?: Record<string, unknown>;
};

export class QueryBuilder {
  /**
   * Build Prisma where clause from filter options
   */
  static buildWhereClause(filters: Record<string, unknown>): PrismaWhereClause {
    const where: PrismaWhereClause = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === undefined || value === null) continue;

      // Handle nested filters
      if (
        typeof value === 'object' &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        where[key] = this.buildWhereClause(value as Record<string, unknown>);
        continue;
      }

      // Handle array filters
      if (Array.isArray(value)) {
        where[key] = { in: value };
        continue;
      }

      // Handle date range filters
      if (key.endsWith('_from') || key.endsWith('_to')) {
        const baseKey = key.replace(/_from$|_to$/, '');
        if (!where[baseKey]) {
          where[baseKey] = {};
        }

        const baseKeyObj = where[baseKey] as Record<string, unknown>;
        if (key.endsWith('_from')) {
          baseKeyObj.gte = value;
        } else {
          baseKeyObj.lte = value;
        }
        continue;
      }

      // Handle string filters
      if (typeof value === 'string') {
        if (value.includes('*')) {
          // Wildcard search
          where[key] = {
            contains: value.replace(/\*/g, ''),
            mode: 'insensitive',
          };
        } else {
          where[key] = value;
        }
        continue;
      }

      // Default case
      where[key] = value;
    }

    return where;
  }

  /**
   * Build Prisma orderBy clause from sort options
   */
  static buildOrderByClause(
    sortOptions: SortOptions | SortOptions[],
  ): PrismaOrderByClause {
    if (!Array.isArray(sortOptions)) {
      return { [sortOptions.field]: sortOptions.direction };
    }

    return sortOptions.map(option => ({
      [option.field]: option.direction,
    }));
  }

  /**
   * Build search conditions for multiple fields
   */
  static buildSearchConditions(
    searchOptions: SearchOptions,
    additionalWhere?: Record<string, unknown>,
  ): PrismaWhereClause {
    const { term, fields, mode = 'insensitive' } = searchOptions;

    const searchConditions = fields.map(field => ({
      [field]: {
        contains: term,
        mode,
      },
    }));

    return {
      ...additionalWhere,
      OR: searchConditions,
    };
  }

  /**
   * Build complete Prisma query from advanced filter options
   */
  static buildQuery(options: AdvancedFilterOptions): PrismaQueryClause {
    const query: PrismaQueryClause = {};

    if (options.where) {
      query.where = this.buildWhereClause(options.where);
    }

    if (options.orderBy) {
      query.orderBy = this.buildOrderByClause(options.orderBy);
    }

    if (options.include) {
      query.include = options.include;
    }

    if (options.select) {
      query.select = options.select;
    }

    if (options.distinct) {
      query.distinct = options.distinct;
    }

    if (options.skip !== undefined) {
      query.skip = options.skip;
    }

    if (options.take !== undefined) {
      query.take = options.take;
    }

    return query;
  }

  /**
   * Build pagination query
   */
  static buildPaginationQuery(
    page: number,
    limit: number,
    baseQuery: PrismaQueryClause = {},
  ): PrismaQueryClause {
    return {
      ...baseQuery,
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * Build cursor-based pagination query
   */
  static buildCursorQuery(
    cursor: string,
    limit: number,
    baseQuery: PrismaQueryClause = {},
  ): PrismaQueryClause {
    return {
      ...baseQuery,
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
      take: limit,
    };
  }

  /**
   * Build date range filter
   */
  static buildDateRangeFilter(
    field: string,
    from?: Date,
    to?: Date,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {};

    if (from) {
      filter.gte = from;
    }

    if (to) {
      filter.lte = to;
    }

    return filter;
  }

  /**
   * Build text search filter with multiple fields
   */
  static buildTextSearchFilter(
    searchTerm: string,
    fields: string[],
    mode: 'insensitive' | 'default' = 'insensitive',
  ): PrismaWhereClause {
    return {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode,
        },
      })),
    };
  }

  /**
   * Build relation filter
   */
  static buildRelationFilter(
    relation: string,
    filters: Record<string, unknown>,
  ): PrismaWhereClause {
    return {
      [relation]: {
        some: this.buildWhereClause(filters),
      },
    };
  }

  /**
   * Build aggregation query
   */
  static buildAggregationQuery(
    groupBy: string[],
    aggregations: Record<string, unknown>,
    where?: Record<string, unknown>,
  ): Record<string, unknown> {
    return {
      _count: true,
      _avg: aggregations._avg,
      _sum: aggregations._sum,
      _min: aggregations._min,
      _max: aggregations._max,
      groupBy,
      where: where ? this.buildWhereClause(where) : undefined,
    };
  }
}
