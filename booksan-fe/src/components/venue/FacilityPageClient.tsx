"use client";

import { useState, useEffect, useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit3, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FacilityPageData {
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

interface FacilityPageClientProps {
  pageData: FacilityPageData;
  slug: string;
}

export function FacilityPageClient({
  pageData,
  slug,
}: FacilityPageClientProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [sanitizedHTML, setSanitizedHTML] = useState("");

  // Sanitize HTML content
  const sanitizedContent = useMemo(() => {
    if (typeof window !== "undefined" && pageData.html) {
      return DOMPurify.sanitize(pageData.html, {
        ALLOWED_TAGS: [
          "div",
          "span",
          "p",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "a",
          "img",
          "br",
          "hr",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "section",
          "article",
          "header",
          "footer",
          "nav",
          "main",
          "table",
          "tr",
          "td",
          "th",
          "tbody",
          "thead",
          "tfoot",
          "iframe",
          "button",
          "form",
          "input",
          "label",
          "select",
          "option",
        ],
        ALLOWED_ATTR: [
          "class",
          "id",
          "style",
          "href",
          "target",
          "alt",
          "src",
          "width",
          "height",
          "allowfullscreen",
          "loading",
          "rel",
          "type",
          "name",
          "value",
          "placeholder",
          "disabled",
          "readonly",
        ],
        ALLOWED_URI_REGEXP:
          /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      });
    }
    return "";
  }, [pageData.html]);

  useEffect(() => {
    setSanitizedHTML(sanitizedContent);
  }, [sanitizedContent]);

  // Add custom CSS to the page
  useEffect(() => {
    if (pageData.css) {
      const styleElement = document.createElement("style");
      styleElement.id = `facility-styles-${slug}`;
      styleElement.textContent = pageData.css;
      document.head.appendChild(styleElement);

      return () => {
        const existingStyle = document.getElementById(
          `facility-styles-${slug}`
        );
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
    return undefined;
  }, [pageData.css, slug]);

  if (!sanitizedHTML) {
    return <DefaultVenuePage pageData={pageData} slug={slug} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin/Owner toolbar (shown when user has permission) */}
      <FacilityToolbar
        facilityName={pageData.facilityName}
        isCustomized={pageData.isCustomized}
        slug={slug}
        onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        isPreviewMode={isPreviewMode}
      />

      {/* Facility page content */}
      <div className="facility-page-container">
        {isPreviewMode ? (
          <FacilityPreviewMode pageData={pageData} />
        ) : (
          <div
            className="facility-page-content"
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        )}
      </div>

      {/* Booking integration overlay */}
      <BookingIntegrationOverlay />
    </div>
  );
}

interface FacilityToolbarProps {
  facilityName: string;
  isCustomized: boolean;
  slug: string;
  onTogglePreview: () => void;
  isPreviewMode: boolean;
}

function FacilityToolbar({
  facilityName,
  isCustomized,
  slug,
  onTogglePreview,
  isPreviewMode,
}: FacilityToolbarProps) {
  return (
    <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Search
            </Button>

            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-lg">{facilityName}</h1>
              <Badge variant={isCustomized ? "default" : "secondary"}>
                {isCustomized ? "Custom" : "Template"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePreview}
              className="flex items-center gap-2"
            >
              {isPreviewMode ? (
                <>
                  <Eye className="h-4 w-4" />
                  View Live
                </>
              ) : (
                <>
                  <Edit3 className="h-4 w-4" />
                  Preview Mode
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <Link href={`/dashboard/venues/${slug}/edit`}>
                <Edit3 className="h-4 w-4" />
                Edit Page
              </Link>
            </Button>

            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <Link href={`/venues/${slug}?preview=true`} target="_blank">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FacilityPreviewMode({ pageData }: { pageData: FacilityPageData }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-6">Page Preview Information</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">SEO Metadata</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <strong>Title:</strong> {pageData.metaTitle || "Not set"}
                </div>
                <div>
                  <strong>Description:</strong>{" "}
                  {pageData.metaDescription || "Not set"}
                </div>
                <div>
                  <strong>Keywords:</strong>{" "}
                  {pageData.metaKeywords.join(", ") || "None"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Open Graph Data</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <strong>OG Title:</strong>{" "}
                  {pageData.openGraphTitle || "Not set"}
                </div>
                <div>
                  <strong>OG Description:</strong>{" "}
                  {pageData.openGraphDesc || "Not set"}
                </div>
                <div>
                  <strong>OG Image:</strong>{" "}
                  {pageData.openGraphImage || "Not set"}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Page Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div>
                  <strong>Facility Name:</strong> {pageData.facilityName}
                </div>
                <div>
                  <strong>Slug:</strong> {pageData.slug}
                </div>
                <div>
                  <strong>Customized:</strong>{" "}
                  {pageData.isCustomized ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Description:</strong>{" "}
                  {pageData.facilityDescription || "Not set"}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function BookingIntegrationOverlay() {
  return (
    <div id="booking-integration-root" className="hidden">
      {/* This is where booking components will be injected */}
    </div>
  );
}

function DefaultVenuePage({ pageData, slug }: { pageData: FacilityPageData; slug: string }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin/Owner toolbar */}
      <FacilityToolbar
        facilityName={pageData.facilityName}
        isCustomized={pageData.isCustomized}
        slug={slug}
        onTogglePreview={() => {}}
        isPreviewMode={false}
      />

      {/* Default venue content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {pageData.facilityName}
            </h1>
            {pageData.facilityDescription && (
              <p className="text-xl text-gray-600 mb-6">
                {pageData.facilityDescription}
              </p>
            )}
            <div className="flex justify-center gap-4">
              <Button size="lg" className="px-8">
                Book Now
              </Button>
              <Button variant="outline" size="lg" className="px-8">
                View Availability
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* About Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">About This Venue</h2>
                <p className="text-gray-600 leading-relaxed">
                  {pageData.facilityDescription || 
                    `Welcome to ${pageData.facilityName}! We provide excellent sports facilities for your recreational and competitive needs. Our venue is equipped with modern amenities and professional-grade equipment to ensure the best experience for all our visitors.`
                  }
                </p>
              </Card>

              {/* Features Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Facilities & Features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Professional-grade courts</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Modern equipment</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Parking available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Changing rooms</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Lighting for evening play</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Online booking system</span>
                  </div>
                </div>
              </Card>

              {/* Booking Section */}
              <Card className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Book Your Session</h2>
                <p className="text-gray-600 mb-6">
                  Ready to play? Book your court or field now and secure your spot at {pageData.facilityName}.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1">
                    Select Date & Time
                  </Button>
                  <Button variant="outline" size="lg" className="flex-1">
                    View Calendar
                  </Button>
                </div>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Info Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge variant="default">Open</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span>Sports Facility</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking:</span>
                    <span>Online Available</span>
                  </div>
                </div>
              </Card>

              {/* Contact Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Contact & Location</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600 block">Address:</span>
                    <span className="text-sm">Check venue details for address</span>
                  </div>
                  <div>
                    <span className="text-gray-600 block">Phone:</span>
                    <span className="text-sm">Contact venue for phone number</span>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Get Directions
                  </Button>
                </div>
              </Card>

              {/* Hours Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span>6:00 AM - 10:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span>7:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span>8:00 AM - 8:00 PM</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  *Hours may vary. Please confirm with venue.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Booking integration overlay */}
      <BookingIntegrationOverlay />
    </div>
  );
}

