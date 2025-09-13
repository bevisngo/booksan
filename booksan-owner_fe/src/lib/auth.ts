export interface User {
  id: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN' | 'OWNER';
  facilityId?: string;
  facility?: {
    id: string;
    name: string;
    slug: string;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    user: User;
  };
}
