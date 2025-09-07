'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/fetcher';
import { Check, Crown, Eye, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FacilityPageTemplate {
  id: string;
  name: string;
  description?: string;
  category: 'BASIC' | 'MODERN' | 'CLASSIC' | 'SPORT_SPECIFIC' | 'PREMIUM';
  isPremium: boolean;
  previewImage?: string;
  isActive: boolean;
}

interface TemplateSelectionGridProps {
  templates: FacilityPageTemplate[];
  currentTemplateId?: string | undefined;
  facilityId: string;
  onTemplateSelected: (templateId: string) => void;
}

const categoryColors = {
  BASIC: 'bg-gray-100 text-gray-800',
  MODERN: 'bg-blue-100 text-blue-800',
  CLASSIC: 'bg-green-100 text-green-800',
  SPORT_SPECIFIC: 'bg-orange-100 text-orange-800',
  PREMIUM: 'bg-purple-100 text-purple-800',
} as const;

const categoryLabels = {
  BASIC: 'Basic',
  MODERN: 'Modern',
  CLASSIC: 'Classic',
  SPORT_SPECIFIC: 'Sport-Specific',
  PREMIUM: 'Premium',
} as const;

export function TemplateSelectionGrid({
  templates,
  currentTemplateId,
  facilityId,
  onTemplateSelected,
}: TemplateSelectionGridProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(currentTemplateId);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  const handleApplyTemplate = async (templateId: string) => {
    if (isApplying) return;

    setIsApplying(templateId);
    
    try {
      // Update or create facility profile with new template
      if (currentTemplateId) {
        // Update existing profile
        await api.put(`/facility-profiles/${facilityId}`, {
          templateId,
          isCustomized: false,
        });
      } else {
        // Create new profile
        await api.post('/facility-profiles', {
          facilityId,
          templateId,
          isCustomized: false,
        });
      }

      setSelectedTemplateId(templateId);
      onTemplateSelected(templateId);
    } catch (error) {
      console.error('Failed to apply template:', error);
      // You might want to show a toast notification here
    } finally {
      setIsApplying(null);
    }
  };

  const handlePreviewTemplate = (templateId: string) => {
    // Open preview in new window/modal
    // This could be implemented as a modal or redirect to preview URL
    window.open(`/templates/${templateId}/preview`, '_blank');
  };

  if (!templates.length) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No templates available at the moment.</p>
      </div>
    );
  }

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category]!.push(template);
    return acc;
  }, {} as Record<string, FacilityPageTemplate[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
        <div key={category}>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <Badge
              variant="secondary"
              className={categoryColors[category as keyof typeof categoryColors]}
            >
              {categoryTemplates.length} template{categoryTemplates.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                isSelected={selectedTemplateId === template.id}
                isApplying={isApplying === template.id}
                onApply={() => handleApplyTemplate(template.id)}
                onPreview={() => handlePreviewTemplate(template.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface TemplateCardProps {
  template: FacilityPageTemplate;
  isSelected: boolean;
  isApplying: boolean;
  onApply: () => void;
  onPreview: () => void;
}

function TemplateCard({
  template,
  isSelected,
  isApplying,
  onApply,
  onPreview,
}: TemplateCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      isSelected && "ring-2 ring-primary",
    )}>
      <CardHeader className="p-0">
        <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
          {template.previewImage ? (
            <Image
              src={template.previewImage}
              alt={`${template.name} preview`}
              fill
              className="object-cover"
              onError={(e) => {
                // Handle image load error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Sparkles className="h-8 w-8" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge
              variant="secondary"
              className={categoryColors[template.category]}
            >
              {categoryLabels[template.category]}
            </Badge>
            {template.isPremium && (
              <Badge variant="default" className="bg-yellow-500 text-white">
                <Crown className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>

          {/* Preview button overlay */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={onPreview}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>

          {/* Selected indicator */}
          {isSelected && (
            <div className="absolute top-2 right-2">
              <div className="bg-primary text-primary-foreground rounded-full p-1">
                <Check className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
        {template.description && (
          <CardDescription className="mb-4 line-clamp-2">
            {template.description}
          </CardDescription>
        )}

        <div className="flex gap-2">
          <Button
            variant={isSelected ? "outline" : "default"}
            size="sm"
            onClick={onApply}
            disabled={isApplying || isSelected}
            className="flex-1"
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Applying...
              </>
            ) : isSelected ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Selected
              </>
            ) : (
              'Select Template'
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="px-3"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TemplateSelectionSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((section) => (
        <div key={section}>
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <CardHeader className="p-0">
                  <Skeleton className="aspect-video w-full rounded-t-lg" />
                </CardHeader>
                <CardContent className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
