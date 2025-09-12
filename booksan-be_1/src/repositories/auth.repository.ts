import { Injectable } from '@nestjs/common';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '@/core/prisma/prisma.service';
import { BaseRepository } from '@/shared/repositories';

export interface CreateUserData {
  fullname: string;
  email?: string;
  phone?: string;
  password: string;
  role?: UserRole;
}

export interface UserProfile {
  id: string;
  fullname: string;
  email: string | null;
  phone?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface OwnerProfile extends UserProfile {
  facilityId: string;
  facility: {
    id: string;
    name: string;
    slug: string;
  };
}

@Injectable()
export class AuthRepository extends BaseRepository<
  User,
  CreateUserData,
  Partial<CreateUserData>,
  any,
  'user'
> {
  protected readonly modelName = 'user' as const;

  constructor(prisma: PrismaService) {
    super(prisma);
  }

  // Auth-specific methods
  async findUserByEmail(email: string): Promise<User | null> {
    return this.findUnique({ email });
  }

  async findUserByPhone(phone: string): Promise<User | null> {
    return this.findFirst({ phone });
  }

  async findUserByEmailAndRole(
    email: string,
    role: UserRole,
  ): Promise<User | null> {
    return this.findFirst({ email, role });
  }

  async findUserByPhoneAndRole(
    phone: string,
    role: UserRole,
  ): Promise<User | null> {
    return this.findFirst({ phone, role });
  }

  async findUserById(id: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findUserByEmailOrPhone(emailOrPhone: string): Promise<User | null> {
    return this.findFirst({
      OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
    });
  }

  async createUser(data: CreateUserData): Promise<UserProfile> {
    const user = await this.prisma.user.create({
      data: {
        fullname: data.fullname,
        email: data.email, // Allow null email for phone-only users
        phone: data.phone,
        password: data.password,
        role: data.role || UserRole.PLAYER,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async updateUserPassword(id: string, hashedPassword: string): Promise<void> {
    await this.update(id, { password: hashedPassword });
  }

  async emailExists(email: string): Promise<boolean> {
    if (!email) return false;
    return this.exists({ email });
  }

  async phoneExists(phone: string): Promise<boolean> {
    return this.exists({ phone });
  }

  // Additional auth-specific methods using base repository
  async findUsersByRole(role: UserRole): Promise<User[]> {
    return this.findMany({ where: { role } }).then(result => result.data);
  }

  async findUsersByDateRange(from: Date, to: Date): Promise<User[]> {
    return this.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    }).then(result => result.data);
  }

  async searchUsers(searchTerm: string): Promise<User[]> {
    return this.search(searchTerm, ['fullname', 'email'], {}).then(
      result => result.data,
    );
  }

  async findOwnerWithFacility(id: string): Promise<OwnerProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id, role: UserRole.OWNER },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedFacilities: {
          take: 1, // Assuming one facility per owner for now
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user || user.ownedFacilities.length === 0) {
      return null;
    }

    return {
      ...user,
      facilityId: user.ownedFacilities[0].id,
      facility: user.ownedFacilities[0],
    };
  }

  async findOwnerByEmailWithFacility(
    email: string,
  ): Promise<OwnerProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { email, role: UserRole.OWNER },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedFacilities: {
          take: 1,
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user || user.ownedFacilities.length === 0) {
      return null;
    }

    return {
      ...user,
      facilityId: user.ownedFacilities[0].id,
      facility: user.ownedFacilities[0],
    };
  }

  async findOwnerByPhoneWithFacility(
    phone: string,
  ): Promise<OwnerProfile | null> {
    const user = await this.prisma.user.findFirst({
      where: { phone, role: UserRole.OWNER },
      select: {
        id: true,
        fullname: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        ownedFacilities: {
          take: 1,
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!user || user.ownedFacilities.length === 0) {
      return null;
    }

    return {
      ...user,
      facilityId: user.ownedFacilities[0].id,
      facility: user.ownedFacilities[0],
    };
  }
}
