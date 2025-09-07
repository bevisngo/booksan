import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000/v1';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const backendUrl = `${BACKEND_URL}/${path}`;

    // Get cookies for authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;

    // Prepare headers
    const headers: HeadersInit = {};

    // Add authorization header if we have an access token
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Get the form data from the request
    const formData = await request.formData();

    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();

    // Handle 401 responses - clear cookies and return unauthorized
    if (response.status === 401) {
      cookieStore.delete('accessToken');
      cookieStore.delete('refreshToken');
    }

    return NextResponse.json(result, { status: response.status });
  } catch (error) {
    console.error('Upload API proxy error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
