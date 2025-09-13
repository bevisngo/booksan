import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { TemplateCategory } from '@prisma/client';

export class CreateFacilityProfileDto {
  @IsUUID()
  facilityId: string;

  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsString()
  customHtml?: string;

  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  openGraphTitle?: string;

  @IsOptional()
  @IsString()
  openGraphDesc?: string;

  @IsOptional()
  @IsString()
  openGraphImage?: string;

  @IsOptional()
  @IsBoolean()
  isCustomized?: boolean;
}

export class UpdateFacilityProfileDto {
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @IsOptional()
  @IsString()
  customHtml?: string;

  @IsOptional()
  @IsString()
  customCss?: string;

  @IsOptional()
  @IsString()
  metaTitle?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @IsOptional()
  @IsString()
  metaDescription?: string;

  @IsOptional()
  @IsString()
  openGraphTitle?: string;

  @IsOptional()
  @IsString()
  openGraphDesc?: string;

  @IsOptional()
  @IsString()
  openGraphImage?: string;

  @IsOptional()
  @IsBoolean()
  isCustomized?: boolean;
}

export class CreateFacilityPageTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  htmlTemplate: string;

  @IsString()
  cssTemplate: string;

  @IsOptional()
  @IsString()
  jsTemplate?: string;

  @IsOptional()
  @IsString()
  previewImage?: string;

  @IsOptional()
  category?: TemplateCategory;

  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FacilityPageResponseDto {
  html: string;
  css: string;
  metaTitle?: string;
  metaKeywords: string[];
  metaDescription?: string;
  openGraphTitle?: string;
  openGraphDesc?: string;
  openGraphImage?: string;
  slug: string;
  facilityName: string;
  facilityDescription?: string;
  isCustomized: boolean;
}

export class GenerateSlugDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsUUID()
  facilityId?: string;
}
