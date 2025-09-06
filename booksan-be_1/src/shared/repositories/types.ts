import { Prisma } from '@prisma/client';

// Utility types for repository operations
export type PrismaModelName = keyof Omit<
  typeof Prisma,
  | 'PrismaClient'
  | 'Prisma'
  | 'PrismaClientOptions'
  | 'PrismaClientRustPanicError'
  | 'PrismaClientInitializationError'
  | 'PrismaClientKnownRequestError'
  | 'PrismaClientUnknownRequestError'
  | 'PrismaClientValidationError'
>;

// Type helpers for creating repository types
export type CreateInput<T> = T extends {
  create: (args: { data: infer U }) => any;
}
  ? U
  : never;

export type UpdateInput<T> = T extends {
  update: (args: { data: infer U }) => any;
}
  ? U
  : never;

export type WhereInput<T> = T extends {
  findFirst: (args: { where: infer U }) => any;
}
  ? U
  : never;

export type ModelType<T> = T extends { findFirst: () => Promise<infer U> }
  ? U
  : never;

// Common filter types
export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export interface StringFilter {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  equals?: string;
  in?: string[];
  notIn?: string[];
}

export interface NumberFilter {
  equals?: number;
  gt?: number;
  gte?: number;
  lt?: number;
  lte?: number;
  in?: number[];
  notIn?: number[];
}

export interface BooleanFilter {
  equals?: boolean;
}

// Sort options
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Advanced filter options
export interface AdvancedFilterOptions {
  where?: Record<string, any>;
  orderBy?: SortOptions | SortOptions[];
  include?: Record<string, any>;
  select?: Record<string, any>;
  distinct?: string | string[];
  skip?: number;
  take?: number;
}

// Search options
export interface SearchOptions {
  term: string;
  fields: string[];
  mode?: 'insensitive' | 'default';
}

// Bulk operation types
export interface BulkCreateOptions {
  skipDuplicates?: boolean;
}

export interface BulkUpdateOptions {
  where: Record<string, any>;
  data: Record<string, any>;
}

// Repository result types
export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, any>;
}

export interface BulkResult {
  success: boolean;
  count: number;
  errors?: string[];
}
