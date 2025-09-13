#!/usr/bin/env ts-node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { ElasticsearchService } from '@/core/elasticsearch/elasticsearch.service';
import { PrismaService } from '@/core/prisma/prisma.service';
import { Logger } from '@nestjs/common';

const logger = new Logger('FacilityMigration');

interface MigrationOptions {
  clearIndex?: boolean;
  validateCoords?: boolean;
  testSearch?: boolean;
  limit?: number;
  offset?: number;
}

async function parseProgramArgs(): Promise<MigrationOptions> {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {};

  args.forEach(arg => {
    switch (arg) {
      case '--clear-index':
        options.clearIndex = true;
        break;
      case '--validate-coords':
        options.validateCoords = true;
        break;
      case '--test-search':
        options.testSearch = true;
        break;
      default:
        if (arg.startsWith('--limit=')) {
          options.limit = parseInt(arg.split('=')[1], 10);
        }
        if (arg.startsWith('--offset=')) {
          options.offset = parseInt(arg.split('=')[1], 10);
        }
        break;
    }
  });

  return options;
}

async function migrateFacilitiesToElasticsearch(options: MigrationOptions = {}) {
  logger.log('Starting facility migration to Elasticsearch...');
  
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const elasticsearchService = app.get(ElasticsearchService);
    const prismaService = app.get(PrismaService);

    // Clear index if requested
    if (options.clearIndex) {
      logger.log('Clearing existing facilities index...');
      await elasticsearchService.reindexAllFacilities();
    }

    // Fetch facilities from database
    logger.log('Fetching facilities from database...');
    const facilities = await prismaService.facility.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        courts: {
          where: { deletedAt: null },
          select: {
            id: true,
            name: true,
            sport: true,
            surface: true,
            indoor: true,
            isActive: true,
          },
        },
        profile: {
          select: {
            id: true,
          },
        },
      },
      skip: options.offset || 0,
      take: options.limit || undefined,
    });

    logger.log(`Found ${facilities.length} facilities to index`);

    if (facilities.length === 0) {
      logger.warn('No facilities found to migrate');
      return;
    }

    // Transform facilities to Elasticsearch documents
    const facilityDocuments = facilities
      .filter(facility => {
        // Validate coordinates if requested
        if (options.validateCoords) {
          const hasValidCoords = 
            facility.latitude !== null && 
            facility.longitude !== null &&
            Math.abs(facility.latitude!) <= 90 &&
            Math.abs(facility.longitude!) <= 180;
          
          if (!hasValidCoords) {
            logger.warn(`Skipping facility ${facility.id} - invalid coordinates: lat=${facility.latitude}, lon=${facility.longitude}`);
            return false;
          }
        }
        return true;
      })
      .map(facility => ({
        id: facility.id,
        name: facility.name,
        slug: facility.slug,
        address: facility.address || '',
        ward: facility.ward || undefined,
        city: facility.city || undefined,
        description: facility.desc || undefined,
        location: {
          lat: facility.latitude || 0,
          lon: facility.longitude || 0,
        },
        isPublished: facility.isPublished,
        ownerId: facility.ownerId,
        courts: facility.courts.map(court => ({
          id: court.id,
          name: court.name,
          sport: court.sport,
          surface: court.surface || undefined,
          indoor: court.indoor,
          isActive: court.isActive,
        })),
        createdAt: facility.createdAt.toISOString(),
        updatedAt: facility.updatedAt.toISOString(),
      }));

    logger.log(`Prepared ${facilityDocuments.length} facility documents for indexing`);

    // Bulk index facilities
    if (facilityDocuments.length > 0) {
      logger.log('Starting bulk indexing...');
      await elasticsearchService.bulkIndexFacilities(facilityDocuments);
      logger.log(`Successfully indexed ${facilityDocuments.length} facilities`);
    }

    // Test search if requested
    if (options.testSearch) {
      logger.log('Testing search functionality...');
      
      const testQueries = [
        { keyword: 'tennis' },
        { keyword: 'basketball' },
        { isPublished: true, limit: 5 },
        { lat: 10.762622, lon: 106.660172, maxDistance: '10km' }, // Ho Chi Minh City center
      ];

      for (const query of testQueries) {
        logger.log(`Testing search with query: ${JSON.stringify(query)}`);
        const result = await elasticsearchService.searchFacilities(query);
        logger.log(`Found ${result.total} results (max score: ${result.maxScore})`);
        
        if (result.data.length > 0) {
          const firstResult = result.data[0];
          logger.log(`First result: ${firstResult.facility.name} (score: ${firstResult.score})`);
        }
      }
    }

    // Get index stats
    const stats = await elasticsearchService.getIndexStats();
    logger.log('Current index stats:', JSON.stringify(stats, null, 2));

  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await app.close();
  }

  logger.log('Facility migration completed successfully');
}

// Run the migration
async function main() {
  try {
    const options = await parseProgramArgs();
    logger.log('Migration options:', JSON.stringify(options, null, 2));
    
    await migrateFacilitiesToElasticsearch(options);
    process.exit(0);
  } catch (error) {
    logger.error('Migration script failed:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}

export { migrateFacilitiesToElasticsearch };
