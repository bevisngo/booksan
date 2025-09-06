import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { FacilityProfile, FacilityPageTemplate } from '@prisma/client';
import {
  FacilityProfileRepository,
  FacilityPageTemplateRepository,
  CreateFacilityProfileData,
  UpdateFacilityProfileData,
  CreateFacilityPageTemplateData,
  UpdateFacilityPageTemplateData,
} from '../repositories/facility-profile.repository';
import { VenueRepository } from '../repositories/venue.repository';
import { FacilityPageResponseDto } from '../dto/facility-profile.dto';

interface TemplateVariables {
  facilityName: string;
  facilityDescription?: string;
  phone?: string;
  email?: string;
  address: string;
  ward?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  openHours?: string;
  courtCount?: number;
  operatingHours?: string;
  courtsGrid?: string;
  courtsList?: string;
  courtsShowcase?: string;
  courtsLayout?: string;
  bookingWidget?: string;
  bookingForm?: string;
  simpleBookingForm?: string;
  advancedBookingWidget?: string;
  locationMap?: string;
  facilityImages?: string;
  sportsGrid?: string;
  operatingHoursTable?: string;
  socialLinks?: string;
  ownerName?: string;
}

@Injectable()
export class FacilityProfileService {
  private readonly logger = new Logger(FacilityProfileService.name);

  constructor(
    private readonly facilityProfileRepository: FacilityProfileRepository,
    private readonly templateRepository: FacilityPageTemplateRepository,
    private readonly venueRepository: VenueRepository,
  ) {}

  async createProfile(
    data: CreateFacilityProfileData,
  ): Promise<FacilityProfile> {
    this.logger.debug(
      `Creating facility profile for facility: ${data.facilityId}`,
    );

    // Check if facility exists
    const facility = await this.venueRepository.findById(data.facilityId);
    if (!facility) {
      throw new NotFoundException('Facility not found');
    }

    // Check if profile already exists
    const existingProfile =
      await this.facilityProfileRepository.findByFacilityId(data.facilityId);
    if (existingProfile) {
      throw new ConflictException('Facility profile already exists');
    }

    // Validate template if provided
    if (data.templateId) {
      const template = await this.templateRepository.findById(data.templateId);
      if (!template) {
        throw new NotFoundException('Template not found');
      }
    }

    const profile = await this.facilityProfileRepository.create(data);
    this.logger.debug(`Created facility profile: ${profile.id}`);
    return profile;
  }

  async updateProfile(
    facilityId: string,
    data: UpdateFacilityProfileData,
  ): Promise<FacilityProfile> {
    this.logger.debug(`Updating facility profile for facility: ${facilityId}`);

    // Validate template if provided
    if (data.templateId) {
      const template = await this.templateRepository.findById(data.templateId);
      if (!template) {
        throw new NotFoundException('Template not found');
      }
    }

    const profile = await this.facilityProfileRepository.updateByFacilityId(
      facilityId,
      data,
    );
    if (!profile) {
      throw new NotFoundException('Facility profile not found');
    }

    this.logger.debug(`Updated facility profile: ${profile.id}`);
    return profile;
  }

  async getProfileByFacilityId(facilityId: string) {
    const profile =
      await this.facilityProfileRepository.findByFacilityId(facilityId);
    if (!profile) {
      throw new NotFoundException('Facility profile not found');
    }
    return profile;
  }

  async getProfileBySlug(slug: string) {
    const profile =
      await this.facilityProfileRepository.findByFacilitySlug(slug);
    if (!profile) {
      throw new NotFoundException('Facility not found');
    }
    return profile;
  }

  async deleteProfile(facilityId: string): Promise<void> {
    this.logger.debug(`Deleting facility profile for facility: ${facilityId}`);

    const deleted =
      await this.facilityProfileRepository.deleteByFacilityId(facilityId);
    if (!deleted) {
      throw new NotFoundException('Facility profile not found');
    }

    this.logger.debug(`Deleted facility profile for facility: ${facilityId}`);
  }

  async generateFacilityPage(slug: string): Promise<FacilityPageResponseDto> {
    this.logger.debug(`Generating facility page for slug: ${slug}`);

    const profile = await this.getProfileBySlug(slug);

    if (!profile.facility) {
      throw new NotFoundException('Facility not found');
    }

    const facility = profile.facility;

    // Use custom content if available, otherwise use template
    let html = profile.customHtml || '';
    let css = profile.customCss || '';

    if (profile.template && !profile.isCustomized) {
      html = profile.template.htmlTemplate;
      css = profile.template.cssTemplate;
    }

    // Generate template variables
    const variables = this.generateTemplateVariables(facility);

    // Replace template variables in HTML and CSS
    const processedHtml = this.replaceTemplateVariables(html, variables);
    const processedCss = this.replaceTemplateVariables(css, variables);

    // Generate SEO metadata
    const metaTitle =
      profile.metaTitle || `${facility.name} - Book Sports Courts Online`;
    const metaDescription =
      profile.metaDescription ||
      `Book courts at ${facility.name}. Located at ${facility.address}. ${facility.desc || 'Professional sports facilities available for booking.'}`;
    const openGraphTitle = profile.openGraphTitle || metaTitle;
    const openGraphDesc = profile.openGraphDesc || metaDescription;

    return {
      html: processedHtml,
      css: processedCss,
      metaTitle,
      metaKeywords: profile.metaKeywords || [],
      metaDescription,
      openGraphTitle,
      openGraphDesc,
      openGraphImage: profile.openGraphImage || undefined,
      slug: facility.slug,
      facilityName: facility.name,
      facilityDescription: facility.desc || undefined,
      isCustomized: profile.isCustomized,
    };
  }

  async generateSlug(name: string, facilityId?: string): Promise<string> {
    // Convert to lowercase and replace spaces with hyphens
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .trim();

    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = 'facility';
    }

    // Check if slug exists and make it unique if necessary
    let finalSlug = baseSlug;
    let counter = 1;

    while (true) {
      const existingFacility = await this.venueRepository.findMany({
        where: {
          slug: finalSlug,
          ...(facilityId && { id: { not: facilityId } }),
        },
        limit: 1,
      });

      if (existingFacility.data.length === 0) {
        break;
      }

      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    return finalSlug;
  }

  private generateTemplateVariables(facility: any): TemplateVariables {
    const courts = facility.courts || [];
    const openHours = facility.openHours || [];
    const owner = facility.owner || {};

    return {
      facilityName: facility.name,
      facilityDescription: facility.desc,
      phone: facility.phone,
      email: owner.email,
      address: facility.address,
      ward: facility.ward,
      city: facility.city,
      latitude: facility.latitude,
      longitude: facility.longitude,
      courtCount: courts.length,
      ownerName: owner.fullname,

      // Generated content
      openHours: this.generateOpenHoursText(openHours),
      operatingHours: this.generateOperatingHoursText(openHours),
      courtsGrid: this.generateCourtsGrid(courts),
      courtsList: this.generateCourtsList(courts),
      courtsShowcase: this.generateCourtsShowcase(courts),
      courtsLayout: this.generateCourtsLayout(courts),
      bookingWidget: this.generateBookingWidget(facility.id),
      bookingForm: this.generateBookingForm(facility.id),
      simpleBookingForm: this.generateSimpleBookingForm(facility.id),
      advancedBookingWidget: this.generateAdvancedBookingWidget(facility.id),
      locationMap: this.generateLocationMap(
        facility.latitude,
        facility.longitude,
      ),
      facilityImages: this.generateFacilityImages(),
      sportsGrid: this.generateSportsGrid(courts),
      operatingHoursTable: this.generateOperatingHoursTable(openHours),
      socialLinks: this.generateSocialLinks(),
    };
  }

  private replaceTemplateVariables(
    template: string,
    variables: TemplateVariables,
  ): string {
    let result = template;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    });

    return result;
  }

  private generateOpenHoursText(openHours: any[]): string {
    if (!openHours.length) return 'Please contact for hours';

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const hoursMap = new Map();

    openHours.forEach(hour => {
      hoursMap.set(hour.weekDay, `${hour.openTime} - ${hour.closeTime}`);
    });

    return days
      .map((day, index) => {
        const hours = hoursMap.get(index) || 'Closed';
        return `${day}: ${hours}`;
      })
      .join('<br>');
  }

  private generateOperatingHoursText(openHours: any[]): string {
    if (!openHours.length) return 'Please contact for hours';

    // Find most common hours
    const hourRanges = openHours.map(h => `${h.openTime}-${h.closeTime}`);
    const mostCommon = hourRanges
      .sort(
        (a, b) =>
          hourRanges.filter(v => v === a).length -
          hourRanges.filter(v => v === b).length,
      )
      .pop();

    return mostCommon || 'Please contact for hours';
  }

  private generateCourtsGrid(courts: any[]): string {
    if (!courts.length) return '<p>No courts available</p>';

    return courts
      .map(
        court => `
      <div class="court-card">
        <h3>${court.name}</h3>
        <p><strong>Sport:</strong> ${court.sport}</p>
        ${court.surface ? `<p><strong>Surface:</strong> ${court.surface}</p>` : ''}
        <p><strong>Type:</strong> ${court.indoor ? 'Indoor' : 'Outdoor'}</p>
        ${court.notes ? `<p>${court.notes}</p>` : ''}
      </div>
    `,
      )
      .join('');
  }

  private generateCourtsList(courts: any[]): string {
    if (!courts.length) return '<p>No courts available</p>';

    return courts
      .map(
        court => `
      <div class="court-item">
        <h4>${court.name}</h4>
        <p>${court.sport} • ${court.indoor ? 'Indoor' : 'Outdoor'}</p>
      </div>
    `,
      )
      .join('');
  }

  private generateCourtsShowcase(courts: any[]): string {
    return this.generateCourtsGrid(courts);
  }

  private generateCourtsLayout(courts: any[]): string {
    return this.generateCourtsGrid(courts);
  }

  private generateBookingWidget(facilityId: string): string {
    return `
      <div class="booking-widget-placeholder">
        <h3>Book Your Court</h3>
        <p>Select your preferred date and time to book a court.</p>
        <button onclick="window.location.href='/book/${facilityId}'" class="book-now-btn">
          Book Now
        </button>
      </div>
    `;
  }

  private generateBookingForm(facilityId: string): string {
    return this.generateBookingWidget(facilityId);
  }

  private generateSimpleBookingForm(facilityId: string): string {
    return this.generateBookingWidget(facilityId);
  }

  private generateAdvancedBookingWidget(facilityId: string): string {
    return this.generateBookingWidget(facilityId);
  }

  private generateLocationMap(latitude?: number, longitude?: number): string {
    if (!latitude || !longitude) {
      return '<div class="map-placeholder">Location map not available</div>';
    }

    return `
      <div class="map-container">
        <iframe 
          src="https://maps.google.com/maps?width=100%25&amp;height=400&amp;hl=en&amp;q=${latitude},${longitude}&amp;t=&amp;z=15&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
          width="100%" 
          height="400" 
          style="border:0;" 
          allowfullscreen="" 
          loading="lazy">
        </iframe>
      </div>
    `;
  }

  private generateFacilityImages(): string {
    return `
      <div class="facility-images">
        <div class="image-placeholder">
          <p>📸 Facility photos coming soon</p>
        </div>
      </div>
    `;
  }

  private generateSportsGrid(courts: any[]): string {
    const sports = [...new Set(courts.map(court => court.sport))];

    if (!sports.length) return '<p>No sports available</p>';

    return sports
      .map(
        sport => `
      <div class="sport-card">
        <h3>${sport}</h3>
        <p>${courts.filter(c => c.sport === sport).length} court(s) available</p>
      </div>
    `,
      )
      .join('');
  }

  private generateOperatingHoursTable(openHours: any[]): string {
    if (!openHours.length) return '<p>Please contact for hours</p>';

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const hoursMap = new Map();

    openHours.forEach(hour => {
      hoursMap.set(hour.weekDay, `${hour.openTime} - ${hour.closeTime}`);
    });

    return `
      <table class="hours-table">
        ${days
          .map((day, index) => {
            const hours = hoursMap.get(index) || 'Closed';
            return `<tr><td>${day}</td><td>${hours}</td></tr>`;
          })
          .join('')}
      </table>
    `;
  }

  private generateSocialLinks(): string {
    return `
      <div class="social-links">
        <a href="#" class="social-link">Facebook</a>
        <a href="#" class="social-link">Instagram</a>
        <a href="#" class="social-link">Twitter</a>
      </div>
    `;
  }

  // Template management methods
  async getTemplates(): Promise<FacilityPageTemplate[]> {
    return this.templateRepository.findActiveTemplates();
  }

  async getTemplatesByCategory(
    category: string,
  ): Promise<FacilityPageTemplate[]> {
    return this.templateRepository.findByCategory(category as any);
  }

  async getFreeTemplates(): Promise<FacilityPageTemplate[]> {
    return this.templateRepository.findFreeTemplates();
  }

  async createTemplate(
    data: CreateFacilityPageTemplateData,
  ): Promise<FacilityPageTemplate> {
    return this.templateRepository.create(data);
  }

  async updateTemplate(
    id: string,
    data: UpdateFacilityPageTemplateData,
  ): Promise<FacilityPageTemplate> {
    const template = await this.templateRepository.update(id, data);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await this.templateRepository.delete(id);
    } catch (error) {
      this.logger.error('Error deleting template', error);
      throw new NotFoundException('Template not found');
    }
  }
}
