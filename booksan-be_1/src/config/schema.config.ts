import * as Joi from 'joi';
export const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'staging', 'production')
    .required(),
  PORT: Joi.number().default(3000),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().optional(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  CORS_ORIGINS: Joi.string().default(''),

  // OAuth providers
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  FACEBOOK_APP_ID: Joi.string().optional(),
  FACEBOOK_APP_SECRET: Joi.string().optional(),
  ZALO_APP_ID: Joi.string().optional(),
  ZALO_APP_SECRET: Joi.string().optional(),

  // Elasticsearch
  ELASTICSEARCH_URL: Joi.string().uri().default('http://localhost:9200'),
  ELASTICSEARCH_USERNAME: Joi.string().optional(),
  ELASTICSEARCH_PASSWORD: Joi.string().optional(),
});
