import { Injectable, ConflictException } from '@nestjs/common';
import { AuthRepository, CreateUserData } from '@/repositories';
import { HashService } from '@/modules/auth/services';
import { PrismaService } from '@/core/prisma/prisma.service';

export interface RegisterWithProfileData extends CreateUserData {
  avatar?: string;
  bio?: string;
  preferences?: {
    notifications: boolean;
    theme: string;
  };
}

@Injectable()
export class RegisterWithProfileUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly hashService: HashService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(data: RegisterWithProfileData) {
    // Check if user already exists
    if (data.email) {
      const emailExists = await this.authRepository.emailExists(data.email);
      if (emailExists) {
        throw new ConflictException('Email already registered');
      }
    }

    if (data.phone) {
      const phoneExists = await this.authRepository.phoneExists(data.phone);
      if (phoneExists) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Hash password
    const hashedPassword = await this.hashService.hashPassword(data.password);

    // Use transaction to create user atomically
    return this.authRepository.transaction(async tx => {
      // Create user
      const user = await tx.user.create({
        data: {
          fullname: data.fullname,
          email: data.email || `user_${Date.now()}@example.com`,
          phone: data.phone,
          password: hashedPassword,
        },
      });

      // Log the registration (using console for demo)
      console.log(
        `User ${user.fullname} registered with ${data.email ? 'email' : 'phone'}`,
      );

      return {
        user: {
          id: user.id,
          fullname: user.fullname,
          email: user.email,
          phone: user.phone,
          role: user.role,
        },
        message: 'User registered successfully',
      };
    });
  }

  private generateRandomToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}
