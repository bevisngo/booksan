export interface User {
  id: string;
  fullname: string;
  email: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN' | 'OWNER';
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  data: {
    accessToken: string;
    user: User;
  };
}
