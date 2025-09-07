'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/fetcher';
import { Save, Eye, Code, Search, Share2 } from 'lucide-react';

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
  };
}

interface FacilityProfileEditorProps {
  profile: FacilityProfile;
  onSave: () => void;
}

const profileFormSchema = z.object({
  metaTitle: z.string().min(1, 'Meta title is required').max(60, 'Meta title should be under 60 characters'),
  metaDescription: z.string().min(1, 'Meta description is required').max(160, 'Meta description should be under 160 characters'),
  metaKeywords: z.string(),
  openGraphTitle: z.string().optional(),
  openGraphDesc: z.string().optional(),
  openGraphImage: z.string().url().optional().or(z.literal('')),
  customHtml: z.string().optional(),
  customCss: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function FacilityProfileEditor({ profile, onSave }: FacilityProfileEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('seo');
  
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      metaTitle: profile.metaTitle || `${profile.facility.name} - Book Sports Courts Online`,
      metaDescription: profile.metaDescription || `Book courts at ${profile.facility.name}. Professional sports facilities available for booking.`,
      metaKeywords: profile.metaKeywords.join(', '),
      openGraphTitle: profile.openGraphTitle || profile.metaTitle || profile.facility.name,
      openGraphDesc: profile.openGraphDesc || profile.metaDescription,
      openGraphImage: profile.openGraphImage || '',
      customHtml: profile.customHtml || '',
      customCss: profile.customCss || '',
    },
  });

  const handleSave = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      const updateData = {
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        metaKeywords: data.metaKeywords.split(',').map(k => k.trim()).filter(Boolean),
        openGraphTitle: data.openGraphTitle,
        openGraphDesc: data.openGraphDesc,
        openGraphImage: data.openGraphImage || undefined,
        ...(profile.isCustomized && {
          customHtml: data.customHtml,
          customCss: data.customCss,
        }),
      };

      await api.put(`/facility-profiles/${profile.facilityId}`, updateData);
      onSave();
    } catch (error) {
      console.error('Failed to save profile:', error);
      // You might want to show a toast notification here
    } finally {
      setIsLoading(false);
    }
  };

  const generateSEOSuggestions = () => {
    const facility = profile.facility;
    return {
      metaTitle: `${facility.name} - Book Sports Courts Online | Booksan`,
      metaDescription: `Book courts at ${facility.name}. Professional sports facilities with easy online booking. ${facility.description || 'Great location and amenities.'} Reserve your court today!`,
      keywords: [
        facility.name.toLowerCase(),
        'sports court booking',
        'sports facility',
        'court rental',
        'vietnam sports',
        'ho chi minh sports',
        'online booking',
      ].join(', '),
    };
  };

  const applySEOSuggestions = () => {
    const suggestions = generateSEOSuggestions();
    form.setValue('metaTitle', suggestions.metaTitle);
    form.setValue('metaDescription', suggestions.metaDescription);
    form.setValue('metaKeywords', suggestions.keywords);
    form.setValue('openGraphTitle', suggestions.metaTitle);
    form.setValue('openGraphDesc', suggestions.metaDescription);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO Settings
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Social Media
          </TabsTrigger>
          {profile.isCustomized && (
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              Custom Code
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Engine Optimization</CardTitle>
                  <CardDescription>
                    Optimize your venue page for search engines to attract more customers
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applySEOSuggestions}
                >
                  Apply Suggestions
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...form.register('metaTitle')}
                  placeholder="Enter page title for search engines"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {form.watch('metaTitle')?.length || 0}/60 characters
                </p>
                {form.formState.errors.metaTitle && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.metaTitle.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...form.register('metaDescription')}
                  placeholder="Write a compelling description for search results"
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {form.watch('metaDescription')?.length || 0}/160 characters
                </p>
                {form.formState.errors.metaDescription && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.metaDescription.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="metaKeywords">Keywords</Label>
                <Input
                  id="metaKeywords"
                  {...form.register('metaKeywords')}
                  placeholder="sports, tennis, booking, venue (comma-separated)"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Separate keywords with commas
                </p>
              </div>

              {/* SEO Preview */}
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Search Engine Preview</h4>
                <div className="space-y-1">
                  <div className="text-blue-600 text-lg">
                    {form.watch('metaTitle') || 'Your Page Title'}
                  </div>
                  <div className="text-green-700 text-sm">
                    booksan.com/venues/{profile.facility.slug}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {form.watch('metaDescription') || 'Your page description will appear here...'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Sharing</CardTitle>
              <CardDescription>
                Customize how your venue page appears when shared on social media
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openGraphTitle">Social Media Title</Label>
                <Input
                  id="openGraphTitle"
                  {...form.register('openGraphTitle')}
                  placeholder="Title for social media sharing"
                />
              </div>

              <div>
                <Label htmlFor="openGraphDesc">Social Media Description</Label>
                <Textarea
                  id="openGraphDesc"
                  {...form.register('openGraphDesc')}
                  placeholder="Description for social media sharing"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="openGraphImage">Social Media Image URL</Label>
                <Input
                  id="openGraphImage"
                  {...form.register('openGraphImage')}
                  placeholder="https://example.com/image.jpg"
                  type="url"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Recommended size: 1200x630 pixels
                </p>
                {form.formState.errors.openGraphImage && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.openGraphImage.message}
                  </p>
                )}
              </div>

              {/* Social Preview */}
              <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium mb-2">Social Media Preview</h4>
                <div className="border rounded-lg bg-white p-3 max-w-md">
                  {form.watch('openGraphImage') && (
                    <div className="aspect-video bg-gray-200 rounded mb-2 flex items-center justify-center text-sm text-gray-500">
                      Image Preview
                    </div>
                  )}
                  <div className="font-medium">
                    {form.watch('openGraphTitle') || form.watch('metaTitle') || 'Your Title'}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {form.watch('openGraphDesc') || form.watch('metaDescription') || 'Your description...'}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    booksan.com
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {profile.isCustomized && (
          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom HTML & CSS</CardTitle>
                <CardDescription>
                  Advanced customization for your venue page. Use with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customHtml">Custom HTML</Label>
                  <Textarea
                    id="customHtml"
                    {...form.register('customHtml')}
                    placeholder="Enter custom HTML content"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div>
                  <Label htmlFor="customCss">Custom CSS</Label>
                  <Textarea
                    id="customCss"
                    {...form.register('customCss')}
                    placeholder="Enter custom CSS styles"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">⚠️ Advanced Feature</h4>
                  <p className="text-sm text-yellow-700">
                    Custom code changes require technical knowledge. Invalid code may break your page.
                    Always preview your changes before saving.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-2">
          <Badge variant={profile.facility.isPublished ? "default" : "secondary"}>
            {profile.facility.isPublished ? "Live" : "Draft"}
          </Badge>
          {profile.template && (
            <Badge variant="outline">
              Using {profile.template.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            asChild
          >
            <a
              href={`/venues/${profile.facility.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </a>
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
