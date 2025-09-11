import {
  IsOptional,
  IsString,
  IsArray,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateCategory } from '@prisma/client';

export class CreateFacilityProfileDto {
  @ApiProperty({ description: 'The facility ID this profile belongs to' })
  @IsUUID()
  facilityId: string;

  @ApiPropertyOptional({ description: 'Template ID to use for this profile' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Custom HTML content' })
  @IsOptional()
  @IsString()
  customHtml?: string;

  @ApiPropertyOptional({ description: 'Custom CSS styles' })
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional({ description: 'Meta title for SEO' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta keywords for SEO' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ description: 'Meta description for SEO' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph title' })
  @IsOptional()
  @IsString()
  openGraphTitle?: string;

  @ApiPropertyOptional({ description: 'Open Graph description' })
  @IsOptional()
  @IsString()
  openGraphDesc?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  @IsOptional()
  @IsString()
  openGraphImage?: string;

  @ApiPropertyOptional({
    description: 'Whether this profile uses custom content',
  })
  @IsOptional()
  @IsBoolean()
  isCustomized?: boolean;
}

export class UpdateFacilityProfileDto {
  @ApiPropertyOptional({ description: 'Template ID to use for this profile' })
  @IsOptional()
  @IsUUID()
  templateId?: string;

  @ApiPropertyOptional({ description: 'Custom HTML content' })
  @IsOptional()
  @IsString()
  customHtml?: string;

  @ApiPropertyOptional({ description: 'Custom CSS styles' })
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional({ description: 'Meta title for SEO' })
  @IsOptional()
  @IsString()
  metaTitle?: string;

  @ApiPropertyOptional({ description: 'Meta keywords for SEO' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metaKeywords?: string[];

  @ApiPropertyOptional({ description: 'Meta description for SEO' })
  @IsOptional()
  @IsString()
  metaDescription?: string;

  @ApiPropertyOptional({ description: 'Open Graph title' })
  @IsOptional()
  @IsString()
  openGraphTitle?: string;

  @ApiPropertyOptional({ description: 'Open Graph description' })
  @IsOptional()
  @IsString()
  openGraphDesc?: string;

  @ApiPropertyOptional({ description: 'Open Graph image URL' })
  @IsOptional()
  @IsString()
  openGraphImage?: string;

  @ApiPropertyOptional({
    description: 'Whether this profile uses custom content',
  })
  @IsOptional()
  @IsBoolean()
  isCustomized?: boolean;
}

export class CreateFacilityPageTemplateDto {
  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Template description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'HTML template content' })
  @IsString()
  htmlTemplate: string;

  @ApiProperty({ description: 'CSS template content' })
  @IsString()
  cssTemplate: string;

  @ApiPropertyOptional({ description: 'JavaScript template content' })
  @IsOptional()
  @IsString()
  jsTemplate?: string;

  @ApiPropertyOptional({ description: 'Preview image URL' })
  @IsOptional()
  @IsString()
  previewImage?: string;

  @ApiPropertyOptional({
    description: 'Template category',
    enum: TemplateCategory,
  })
  @IsOptional()
  category?: TemplateCategory;

  @ApiPropertyOptional({ description: 'Whether this is a premium template' })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Whether this template is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class FacilityPageResponseDto {
  @ApiProperty()
  html: string;

  @ApiProperty()
  css: string;

  @ApiPropertyOptional()
  metaTitle?: string;

  @ApiProperty()
  metaKeywords: string[];

  @ApiPropertyOptional()
  metaDescription?: string;

  @ApiPropertyOptional()
  openGraphTitle?: string;

  @ApiPropertyOptional()
  openGraphDesc?: string;

  @ApiPropertyOptional()
  openGraphImage?: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  facilityName: string;

  @ApiProperty()
  facilityDescription?: string;

  @ApiProperty()
  isCustomized: boolean;
}

export class GenerateSlugDto {
  @ApiProperty({ description: 'Facility name to generate slug from' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Existing facility ID to ensure uniqueness',
  })
  @IsOptional()
  @IsUUID()
  facilityId?: string;
}
