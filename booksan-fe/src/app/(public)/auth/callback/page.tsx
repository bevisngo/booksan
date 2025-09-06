"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/features/auth/context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleGoogleCallback, handleFacebookCallback } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code");
      const provider = searchParams.get("provider") || "google";
      const error = searchParams.get("error");

      if (error) {
        setStatus("error");
        setError("Authentication was cancelled or failed");
        return;
      }

      if (!code) {
        setStatus("error");
        setError("No authorization code received");
        return;
      }

      try {
        setStatus("loading");
        
        if (provider === "google") {
          await handleGoogleCallback(code);
        } else if (provider === "facebook") {
          await handleFacebookCallback(code);
        } else {
          throw new Error("Unsupported provider");
        }

        setStatus("success");
        // Redirect to dashboard after successful authentication
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    };

    handleCallback();
  }, [searchParams, handleGoogleCallback, handleFacebookCallback, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Completing authentication...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Authentication Failed</CardTitle>
            <CardDescription className="text-center">
              {error || "Something went wrong during authentication"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => router.push("/auth/login")} 
              className="w-full"
            >
              Try Again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push("/")} 
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-muted-foreground mb-4">
              You have been successfully authenticated. Redirecting to dashboard...
            </p>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
