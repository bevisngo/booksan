export interface PaginationOptions {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    cursor?: string;
  };
}

export interface FilterOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export interface BaseRepositoryInterface<
  T,
  CreateInput,
  UpdateInput,
  WhereInput,
> {
  // Basic CRUD operations
  findById(id: string): Promise<T | null>;
  findMany(
    options?: FilterOptions & PaginationOptions,
  ): Promise<PaginationResult<T>>;
  create(data: CreateInput): Promise<T>;
  update(id: string, data: UpdateInput): Promise<T>;
  delete(id: string): Promise<void>;
  deleteMany(where: WhereInput): Promise<number>;

  // Query operations
  findFirst(where: WhereInput): Promise<T | null>;
  findUnique(where: WhereInput): Promise<T | null>;
  count(where?: WhereInput): Promise<number>;
  exists(where: WhereInput): Promise<boolean>;

  // Batch operations
  createMany(data: CreateInput[]): Promise<number>;
  updateMany(where: WhereInput, data: UpdateInput): Promise<number>;

  // Advanced operations
  upsert(
    where: WhereInput,
    create: CreateInput,
    update: UpdateInput,
  ): Promise<T>;
  findAndUpdate(where: WhereInput, data: UpdateInput): Promise<T | null>;
  findAndDelete(where: WhereInput): Promise<T | null>;
}
