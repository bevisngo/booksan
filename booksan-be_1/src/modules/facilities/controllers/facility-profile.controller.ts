import { Public, Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard, OwnerRoleGuard } from '@/modules/auth/guards';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import {
  CreateFacilityPageTemplateDto,
  CreateFacilityProfileDto,
  FacilityPageResponseDto,
  GenerateSlugDto,
  UpdateFacilityProfileDto,
} from '../dto/facility-profile.dto';
import { FacilityProfileService } from '../services/facility-profile.service';

@Controller('facility-profiles')
@UseGuards(JwtAuthGuard, OwnerRoleGuard)
export class FacilityProfileController {
  constructor(
    private readonly facilityProfileService: FacilityProfileService,
  ) {}

  @Post()
  async createProfile(@Body() createProfileDto: CreateFacilityProfileDto) {
    return this.facilityProfileService.createProfile(createProfileDto);
  }

  @Put(':facilityId')
  async updateProfile(
    @Param('facilityId', ParseUUIDPipe) facilityId: string,
    @Body() updateProfileDto: UpdateFacilityProfileDto,
  ) {
    return this.facilityProfileService.updateProfile(
      facilityId,
      updateProfileDto,
    );
  }

  @Get(':facilityId')
  async getProfile(@Param('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.facilityProfileService.getProfileByFacilityId(facilityId);
  }

  @Delete(':facilityId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Param('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.facilityProfileService.deleteProfile(facilityId);
  }

  @Post('generate-slug')
  async generateSlug(@Body() generateSlugDto: GenerateSlugDto) {
    const slug = await this.facilityProfileService.generateSlug(
      generateSlugDto.name,
      generateSlugDto.facilityId,
    );
    return { slug };
  }
}

@Controller('venues')
export class FacilityPageController {
  constructor(
    private readonly facilityProfileService: FacilityProfileService,
  ) {}

  @Get(':slug/page')
  @Public()
  async getFacilityPage(
    @Param('slug') slug: string,
  ): Promise<FacilityPageResponseDto> {
    return this.facilityProfileService.generateFacilityPage(slug);
  }

  @Get(':slug/seo')
  @Public()
  async getFacilitySEO(@Param('slug') slug: string) {
    const pageData =
      await this.facilityProfileService.generateFacilityPage(slug);

    return {
      metaTitle: pageData.metaTitle,
      metaDescription: pageData.metaDescription,
      metaKeywords: pageData.metaKeywords,
      openGraphTitle: pageData.openGraphTitle,
      openGraphDescription: pageData.openGraphDesc,
      openGraphImage: pageData.openGraphImage,
      canonicalUrl: `/venues/${slug}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'SportsActivityLocation',
        name: pageData.facilityName,
        description: pageData.facilityDescription,
        url: `/venues/${slug}`,
      },
    };
  }
}

@Controller('facility-templates')
@UseGuards(JwtAuthGuard, OwnerRoleGuard)
export class FacilityTemplateController {
  constructor(
    private readonly facilityProfileService: FacilityProfileService,
  ) {}

  @Get()
  async getTemplates(
    @Query('category') category?: string,
    @Query('free') free?: boolean,
  ) {
    if (free === true) {
      return this.facilityProfileService.getFreeTemplates();
    }

    if (category) {
      return this.facilityProfileService.getTemplatesByCategory(category);
    }

    return this.facilityProfileService.getTemplates();
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createTemplate(
    @Body() createTemplateDto: CreateFacilityPageTemplateDto,
  ) {
    return this.facilityProfileService.createTemplate(createTemplateDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async updateTemplate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTemplateDto: CreateFacilityPageTemplateDto,
  ) {
    return this.facilityProfileService.updateTemplate(id, updateTemplateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.facilityProfileService.deleteTemplate(id);
  }
}
