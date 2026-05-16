export interface UserUpdateData {
  full_name?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
}

export interface AuthUser {
  id: string;
  email: string;
}

export type { User, UserRole } from '@/domain/types/database';