import { ConfigService } from '@nestjs/config';
import { ElasticsearchModuleOptions } from '@nestjs/elasticsearch';

export const getElasticsearchConfig = (
  configService: ConfigService,
): ElasticsearchModuleOptions => {
  const username = configService.get<string>('ELASTICSEARCH_USERNAME');
  const password = configService.get<string>('ELASTICSEARCH_PASSWORD');

  const config: ElasticsearchModuleOptions = {
    node: configService.get<string>(
      'ELASTICSEARCH_URL',
      'http://localhost:9200',
    ),
    requestTimeout: 30000,
    pingTimeout: 3000,
    maxRetries: 3,
  };

  // Only add auth if both username and password are provided
  if (username && password) {
    config.auth = {
      username,
      password,
    };
  }

  return config;
};
