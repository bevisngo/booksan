import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service';

@Injectable()
export class ElasticsearchHealthService {
  private readonly logger = new Logger(ElasticsearchHealthService.name);

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async checkHealth(): Promise<{
    status: 'healthy' | 'unhealthy';
    details: {
      connection: boolean;
      indexExists: boolean;
      indexStats?: any;
      error?: string;
    };
  }> {
    const details: {
      connection: boolean;
      indexExists: boolean;
      indexStats?: any;
      error?: string;
    } = {
      connection: false,
      indexExists: false,
    };

    try {
      // Test connection
      await this.elasticsearchService['esService'].ping();
      details.connection = true;

      // Check if venue index exists
      const indexExists = await this.elasticsearchService[
        'esService'
      ].indices.exists({
        index: 'venues',
      });
      details.indexExists = indexExists;

      if (indexExists) {
        // Get index stats
        details.indexStats = await this.elasticsearchService.getIndexStats();
      }

      return {
        status:
          details.connection && details.indexExists ? 'healthy' : 'unhealthy',
        details,
      };
    } catch (error) {
      this.logger.error('Elasticsearch health check failed', error);
      details.error = (error as Error).message;

      return {
        status: 'unhealthy',
        details,
      };
    }
  }
}
