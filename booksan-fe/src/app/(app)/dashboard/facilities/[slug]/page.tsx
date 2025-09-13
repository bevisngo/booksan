import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/fetcher';
import { TemplateSelectionGrid } from '@/components/facility/TemplateSelectionGrid';
import { FacilityProfileEditor } from '@/components/facility/FacilityProfileEditor';
import { ExternalLink, Eye, Settings } from 'lucide-react';
import Link from 'next/link';

interface FacilityManagePageProps {
  params: Promise<{
    slug: string;
  }>;
}

interface FacilityProfile {
  id: string;
  facilityId: string;
  templateId?: string;
  customHtml?: string;
  customCss?: string;
  metaTitle?: string;
  metaKeywords: string[];
  metaDescription?: string;
  openGraphTitle?: string;
  openGraphDesc?: string;
  openGraphImage?: string;
  isCustomized: boolean;
  facility: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isPublished: boolean;
  };
  template?: {
    id: string;
    name: string;
    description?: string;
    category: string;
    isPremium: boolean;
    previewImage?: string;
  };
}

interface FacilityPageTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'BASIC' | 'MODERN' | 'CLASSIC' | 'SPORT_SPECIFIC' | 'PREMIUM';
  isPremium: boolean;
  previewImage?: string;
  isActive: boolean;
}

async function getFacilityProfile(slug: string): Promise<FacilityProfile | null> {
  try {
    // First get facility by slug
    const facility = await api.get<{ id: string; name: string; slug: string }>(`/facilities/${slug}`);
    if (!facility) return null;

    // Then get its profile
    const profile = await api.get<FacilityProfile>(`/facility-profiles/${facility.id}`, {
      revalidate: 0, // Don't cache for dashboard
    });
    
    return profile;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return null;
    }
    throw error;
  }
}

async function getAvailableTemplates(): Promise<FacilityPageTemplate[]> {
  try {
    return await api.get<FacilityPageTemplate[]>('/facility-templates', {
      revalidate: 300, // Cache for 5 minutes
    });
  } catch {
    // Silently fail and return empty array
    return [];
  }
}

export async function generateMetadata({
  params,
}: FacilityManagePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const profile = await getFacilityProfile(resolvedParams.slug);
  
  if (!profile) {
    return {
      title: 'Facility Not Found - Booksan Dashboard',
    };
  }

  return {
    title: `Manage ${profile.facility.name} - Booksan Dashboard`,
    description: `Manage the facility page for ${profile.facility.name}. Customize templates, edit content, and optimize SEO.`,
    robots: 'noindex,nofollow', // Dashboard pages shouldn't be indexed
  };
}

export default async function FacilityManagePage({ params }: FacilityManagePageProps) {
  const resolvedParams = await params;
  const [profile, templates] = await Promise.all([
    getFacilityProfile(resolvedParams.slug),
    getAvailableTemplates(),
  ]);

  if (!profile) {
    notFound();
  }

  const facility = profile.facility;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{facility.name}</h1>
            <p className="text-muted-foreground mt-1">
              Manage your facility page and customize how customers see your facility
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={facility.isPublished ? "default" : "secondary"}>
              {facility.isPublished ? "Published" : "Draft"}
            </Badge>
            
            <Button variant="outline" asChild>
              <Link
                href={`/facilities/${facility.slug}`}
                target="_blank"
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link
                href={`/facilities/${facility.slug}`}
                target="_blank"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Live
              </Link>
            </Button>
          </div>
        </div>

        {/* Current Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Current Page Status
            </CardTitle>
            <CardDescription>
              Overview of your facility page configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Template</h4>
                <p className="text-sm text-muted-foreground">
                  {profile.template 
                    ? `${profile.template.name} ${profile.template.isPremium ? '(Premium)' : '(Free)'}`
                    : 'No template selected'
                  }
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Customization</h4>
                <p className="text-sm text-muted-foreground">
                  {profile.isCustomized ? 'Custom content' : 'Using template'}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">SEO Status</h4>
                <p className="text-sm text-muted-foreground">
                  {profile.metaTitle && profile.metaDescription 
                    ? 'Optimized' 
                    : 'Needs optimization'
                  }
                </p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center gap-4">
                <Button asChild>
                  <Link href={`/dashboard/facilities/${facility.slug}/edit`}>
                    Edit Page Content
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/facilities/${facility.slug}/seo`}>
                    Optimize SEO
                  </Link>
                </Button>
                
                <Button variant="outline" asChild>
                  <Link href={`/dashboard/facilities/${facility.slug}/analytics`}>
                    View Analytics
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template Selection */}
        {!profile.isCustomized && (
          <Card>
            <CardHeader>
              <CardTitle>Choose a Template</CardTitle>
              <CardDescription>
                Select a professional template for your facility page. You can customize it later or create your own design.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelectionGrid
                templates={templates}
                currentTemplateId={profile.templateId}
                facilityId={facility.id}
                onTemplateSelected={() => {
                  // Refresh the page to show updated template
                  window.location.reload();
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Quick Edit Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Edit</CardTitle>
            <CardDescription>
              Make quick changes to your facility page content and SEO settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FacilityProfileEditor
              profile={profile}
              onSave={() => {
                // Refresh or show success message
                window.location.reload();
              }}
            />
          </CardContent>
        </Card>

        {/* Page Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Page Performance</CardTitle>
            <CardDescription>
              Tips to improve your facility page visibility and booking conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">SEO Score</h4>
                  <div className="text-2xl font-bold text-green-600">
                    {profile.metaTitle && profile.metaDescription ? '85%' : '45%'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {profile.metaTitle && profile.metaDescription 
                      ? 'Good SEO optimization'
                      : 'Add meta title and description'
                    }
                  </p>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Page Completeness</h4>
                  <div className="text-2xl font-bold text-blue-600">
                    {facility.description && profile.template ? '90%' : '60%'}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {facility.description && profile.template
                      ? 'Page is well-configured'
                      : 'Add description and select template'
                    }
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {!profile.metaTitle && (
                    <li>• Add a meta title for better search engine visibility</li>
                  )}
                  {!profile.metaDescription && (
                    <li>• Write a compelling meta description to improve click-through rates</li>
                  )}
                  {!profile.openGraphImage && (
                    <li>• Upload an image for better social media sharing</li>
                  )}
                  {!facility.description && (
                    <li>• Add a detailed facility description</li>
                  )}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
