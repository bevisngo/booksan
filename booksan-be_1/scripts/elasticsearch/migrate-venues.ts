#!/usr/bin/env ts-node

import 'tsconfig-paths/register';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { VenueSearchService } from '@/modules/venues/services';
import { ElasticsearchService } from '@/core/elasticsearch';
import { PrismaService } from '@/core/prisma/prisma.service';

interface MigrationOptions {
  batchSize: number;
  onlyPublished: boolean;
  dryRun: boolean;
  clearIndex: boolean;
}

class VenueMigrationScript {
  private readonly logger = new Logger(VenueMigrationScript.name);

  constructor(
    private readonly venueSearchService: VenueSearchService,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly prismaService: PrismaService,
  ) {}

  async migrate(options: MigrationOptions): Promise<void> {
    const { batchSize, onlyPublished, dryRun, clearIndex } = options;

    try {
      this.logger.log('Starting venue migration to Elasticsearch...');
      this.logger.log(`Options: ${JSON.stringify(options, null, 2)}`);

      // Clear index if requested
      if (clearIndex && !dryRun) {
        this.logger.log('Clearing existing Elasticsearch index...');
        await this.elasticsearchService.reindexAllVenues();
      }

      // Get total count
      const totalCount = await this.prismaService.facility.count({
        where: onlyPublished ? { isPublished: true } : undefined,
      });

      this.logger.log(`Total venues to migrate: ${totalCount}`);

      if (totalCount === 0) {
        this.logger.log('No venues found to migrate');
        return;
      }

      let processedCount = 0;
      let errorCount = 0;
      const errors: string[] = [];

      // Process in batches
      for (let offset = 0; offset < totalCount; offset += batchSize) {
        this.logger.log(
          `Processing batch: ${offset + 1}-${Math.min(offset + batchSize, totalCount)} of ${totalCount}`,
        );

        try {
          const venues = await this.prismaService.facility.findMany({
            where: onlyPublished ? { isPublished: true } : undefined,
            include: {
              courts: {
                where: { isActive: true },
                select: {
                  id: true,
                  name: true,
                  sport: true,
                  surface: true,
                  indoor: true,
                  isActive: true,
                },
              },
            },
            skip: offset,
            take: batchSize,
            orderBy: { createdAt: 'desc' },
          });

          if (venues.length === 0) {
            break;
          }

          // Prepare venue documents for Elasticsearch
          const venueDocuments = venues.map(venue => ({
            id: venue.id,
            name: venue.name,
            slug: venue.slug,
            address: venue.address,
            ward: venue.ward || undefined,
            city: venue.city || undefined,
            description: venue.desc || undefined,
            location: {
              lat: venue.latitude || 0,
              lon: venue.longitude || 0,
            },
            isPublished: venue.isPublished,
            ownerId: venue.ownerId,
            courts: venue.courts.map(court => ({
              id: court.id,
              name: court.name,
              sport: court.sport,
              surface: court.surface || undefined,
              indoor: court.indoor,
              isActive: court.isActive,
            })),
            createdAt: venue.createdAt.toISOString(),
            updatedAt: venue.updatedAt.toISOString(),
          }));

          // Index batch
          if (!dryRun) {
            await this.elasticsearchService.bulkIndexVenues(venueDocuments);
          }

          processedCount += venues.length;
          this.logger.log(
            `Processed ${processedCount}/${totalCount} venues (${Math.round((processedCount / totalCount) * 100)}%)`,
          );

          // Log sample data for first batch
          if (offset === 0 && venues.length > 0) {
            this.logger.log('Sample venue data:');
            this.logger.log(
              JSON.stringify(
                {
                  id: venues[0].id,
                  name: venues[0].name,
                  slug: venues[0].slug,
                  address: venues[0].address,
                  courtsCount: venues[0].courts.length,
                  location: {
                    lat: venues[0].latitude,
                    lon: venues[0].longitude,
                  },
                },
                null,
                2,
              ),
            );
          }
        } catch (batchError) {
          errorCount++;
          const errorMsg = `Batch ${offset}-${offset + batchSize} failed: ${batchError.message}`;
          errors.push(errorMsg);
          this.logger.error(errorMsg);
        }

        // Small delay between batches to avoid overwhelming ES
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Summary
      this.logger.log('Migration completed!');
      this.logger.log(
        `Successfully processed: ${processedCount}/${totalCount} venues`,
      );
      this.logger.log(`Errors: ${errorCount}`);

      if (errors.length > 0) {
        this.logger.error('Errors encountered:');
        errors.forEach(error => this.logger.error(error));
      }

      // Verify index
      if (!dryRun && processedCount > 0) {
        this.logger.log('Verifying index...');
        const stats = await this.elasticsearchService.getIndexStats();
        const indexedCount = stats.indices?.venues?.total?.docs?.count || 0;
        this.logger.log(
          `Elasticsearch index contains ${indexedCount} documents`,
        );

        if (indexedCount !== processedCount) {
          this.logger.warn(
            `Index count (${indexedCount}) doesn't match processed count (${processedCount})`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Migration failed:', error);
      throw error;
    }
  }

  async validateCoordinates(): Promise<void> {
    this.logger.log('Validating venue coordinates...');

    const venuesWithoutCoords = await this.prismaService.facility.findMany({
      where: {
        OR: [
          { latitude: null },
          { longitude: null },
          { latitude: 0 },
          { longitude: 0 },
        ],
        isPublished: true,
      },
      select: {
        id: true,
        name: true,
        address: true,
        latitude: true,
        longitude: true,
      },
    });

    if (venuesWithoutCoords.length > 0) {
      this.logger.warn(
        `Found ${venuesWithoutCoords.length} venues with missing or invalid coordinates:`,
      );
      venuesWithoutCoords.forEach(venue => {
        this.logger.warn(
          `- ${venue.name} (${venue.id}): lat=${venue.latitude}, lon=${venue.longitude}`,
        );
      });
    } else {
      this.logger.log('All published venues have valid coordinates');
    }
  }

  async testSearch(): Promise<void> {
    this.logger.log('Testing search functionality...');

    try {
      // Test basic search
      const searchResult1 = await this.venueSearchService.searchVenues({
        keyword: 'tennis',
        limit: 5,
      });
      this.logger.log(`Search for "tennis": ${searchResult1.total} results`);

      // Test location-based search (Ho Chi Minh City center coordinates)
      const searchResult2 = await this.venueSearchService.searchVenues({
        lat: 10.7769,
        lon: 106.7009,
        maxDistance: '10km',
        limit: 5,
      });
      this.logger.log(
        `Search near HCMC center (10km): ${searchResult2.total} results`,
      );

      // Test combined search
      const searchResult3 = await this.venueSearchService.searchVenues({
        keyword: 'badminton',
        lat: 10.7769,
        lon: 106.7009,
        maxDistance: '5km',
        limit: 5,
      });
      this.logger.log(
        `Search for "badminton" near HCMC center (5km): ${searchResult3.total} results`,
      );

      this.logger.log('Search tests completed successfully');
    } catch (error) {
      this.logger.error('Search test failed:', error);
      throw error;
    }
  }
}

async function main() {
  const logger = new Logger('VenueMigration');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    batchSize: 100,
    onlyPublished: true,
    dryRun: false,
    clearIndex: false,
  };

  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--batch-size':
        options.batchSize = parseInt(args[++i]) || 100;
        break;
      case '--all':
        options.onlyPublished = false;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--clear-index':
        options.clearIndex = true;
        break;
      case '--validate-coords':
        break;
      case '--test-search':
        break;
      case '--help':
        console.log(`
Venue Migration Script

Usage:
  pnpm run migrate:venues [options]

Options:
  --batch-size N     Process venues in batches of N (default: 100)
  --all             Migrate all venues, not just published ones
  --dry-run         Validate data without indexing
  --clear-index     Clear existing index before migration
  --validate-coords Only validate venue coordinates
  --test-search     Only test search functionality
  --help            Show this help message

Examples:
  pnpm run migrate:venues
  pnpm run migrate:venues --batch-size 50 --clear-index
  pnpm run migrate:venues --dry-run
  pnpm run migrate:venues --validate-coords
  pnpm run migrate:venues --test-search
        `);
        process.exit(0);
    }
  }

  try {
    logger.log('Initializing NestJS application...');
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn', 'log'],
    });

    const venueSearchService = app.get(VenueSearchService);
    const elasticsearchService = app.get(ElasticsearchService);
    const prismaService = app.get(PrismaService);

    const migrationScript = new VenueMigrationScript(
      venueSearchService,
      elasticsearchService,
      prismaService,
    );

    // Handle specific commands
    if (args.includes('--validate-coords')) {
      await migrationScript.validateCoordinates();
    } else if (args.includes('--test-search')) {
      await migrationScript.testSearch();
    } else {
      await migrationScript.migrate(options);
    }

    await app.close();
    logger.log('Migration script completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration script failed:', error);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}
