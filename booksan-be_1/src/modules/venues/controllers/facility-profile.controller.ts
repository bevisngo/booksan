import { Public, Roles } from '@/modules/auth/decorators';
import { JwtAuthGuard, RolesGuard } from '@/modules/auth/guards';
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  CreateFacilityPageTemplateDto,
  CreateFacilityProfileDto,
  FacilityPageResponseDto,
  GenerateSlugDto,
  UpdateFacilityProfileDto,
} from '../dto/facility-profile.dto';
import { FacilityProfileService } from '../services/facility-profile.service';

@ApiTags('Facility Profiles')
@Controller('facility-profiles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityProfileController {
  constructor(
    private readonly facilityProfileService: FacilityProfileService,
  ) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a facility profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully' })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  @ApiResponse({ status: 409, description: 'Profile already exists' })
  async createProfile(@Body() createProfileDto: CreateFacilityProfileDto) {
    return this.facilityProfileService.createProfile(createProfileDto);
  }

  @Put(':facilityId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a facility profile' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
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
  @ApiOperation({ summary: 'Get facility profile by facility ID' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async getProfile(@Param('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.facilityProfileService.getProfileByFacilityId(facilityId);
  }

  @Delete(':facilityId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a facility profile' })
  @ApiParam({ name: 'facilityId', description: 'Facility ID' })
  @ApiResponse({ status: 204, description: 'Profile deleted successfully' })
  @ApiResponse({ status: 404, description: 'Profile not found' })
  async deleteProfile(@Param('facilityId', ParseUUIDPipe) facilityId: string) {
    return this.facilityProfileService.deleteProfile(facilityId);
  }

  @Post('generate-slug')
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Generate a unique slug for a facility' })
  @ApiResponse({ status: 200, description: 'Slug generated successfully' })
  async generateSlug(@Body() generateSlugDto: GenerateSlugDto) {
    const slug = await this.facilityProfileService.generateSlug(
      generateSlugDto.name,
      generateSlugDto.facilityId,
    );
    return { slug };
  }
}

@ApiTags('Facility Pages')
@Controller('venues')
export class FacilityPageController {
  constructor(
    private readonly facilityProfileService: FacilityProfileService,
  ) {}

  @Get(':slug/page')
  @Public()
  @ApiOperation({ summary: 'Get rendered facility page by slug' })
  @ApiParam({ name: 'slug', description: 'Facility slug' })
  @ApiResponse({
    status: 200,
    description: 'Facility page rendered successfully',
    type: FacilityPageResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
  async getFacilityPage(
    @Param('slug') slug: string,
  ): Promise<FacilityPageResponseDto> {
    return this.facilityProfileService.generateFacilityPage(slug);
  }

  @Get(':slug/seo')
  @Public()
  @ApiOperation({ summary: 'Get SEO metadata for facility page' })
  @ApiParam({ name: 'slug', description: 'Facility slug' })
  @ApiResponse({
    status: 200,
    description: 'SEO metadata retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Facility not found' })
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

@ApiTags('Facility Templates')
@Controller('facility-templates')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityTemplateController {
  constructor(
    private readonly facilityProfileService: FacilityProfileService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all active facility page templates' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'free',
    required: false,
    type: Boolean,
    description: 'Get only free templates',
  })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
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
  @ApiOperation({ summary: 'Create a new facility page template' })
  @ApiResponse({ status: 201, description: 'Template created successfully' })
  async createTemplate(
    @Body() createTemplateDto: CreateFacilityPageTemplateDto,
  ) {
    return this.facilityProfileService.createTemplate(createTemplateDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a facility page template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 200, description: 'Template updated successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
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
  @ApiOperation({ summary: 'Delete a facility page template' })
  @ApiParam({ name: 'id', description: 'Template ID' })
  @ApiResponse({ status: 204, description: 'Template deleted successfully' })
  @ApiResponse({ status: 404, description: 'Template not found' })
  async deleteTemplate(@Param('id', ParseUUIDPipe) id: string) {
    return this.facilityProfileService.deleteTemplate(id);
  }
}
