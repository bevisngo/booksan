import { SignupForm } from "@/components/auth/SignupForm";
import { OAuthLogin } from "@/components/auth/OAuthLogin";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join Booksan and start booking venues
          </p>
        </div>
        
        <div className="space-y-6">
          <SignupForm />
          <OAuthLogin />
        </div>
      </div>
    </div>
  );
}
