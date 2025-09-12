import { Injectable } from '@nestjs/common';
import { AuthRepository } from '@/repositories';
import { PrismaService } from '@/core/prisma/prisma.service';
import { UserRole } from '@prisma/client';

export interface BulkUserUpdate {
  userId: string;
  updates: {
    fullname?: string;
    role?: UserRole;
  };
}

@Injectable()
export class BulkUserOperationsUseCase {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Example 1: Bulk update users with transaction
   */
  async bulkUpdateUsers(updates: BulkUserUpdate[]) {
    return this.authRepository.transaction(async tx => {
      const results: any[] = [];

      for (const update of updates) {
        const user = await tx.user.update({
          where: { id: update.userId },
          data: update.updates,
        });
        results.push(user);
      }

      return results;
    });
  }

  /**
   * Example 2: Create multiple users with transaction
   */
  async bulkCreateUsers(
    usersData: Array<{ fullname: string; email: string; password: string }>,
  ) {
    return this.authRepository.transaction(async tx => {
      // Create users
      const users = await Promise.all(
        usersData.map(userData =>
          tx.user.create({
            data: {
              fullname: userData.fullname,
              email: userData.email,
              password: userData.password, // In real app, hash this
            },
          }),
        ),
      );

      return users;
    });
  }

  /**
   * Example 3: Transfer user data between accounts
   */
  async transferUserData(fromUserId: string, toUserId: string) {
    return this.authRepository.transaction(async tx => {
      // Get source user
      const fromUser = await tx.user.findUnique({
        where: { id: fromUserId },
      });

      if (!fromUser) {
        throw new Error('Source user not found');
      }

      // Get target user
      const toUser = await tx.user.findUnique({
        where: { id: toUserId },
      });

      if (!toUser) {
        throw new Error('Target user not found');
      }

      // Update target user with source user data
      const updatedUser = await tx.user.update({
        where: { id: toUserId },
        data: {
          fullname: fromUser.fullname,
          // Don't transfer email as it should be unique
        },
      });

      // Mark source user as transferred
      await tx.user.update({
        where: { id: fromUserId },
        data: {
          fullname: `${fromUser.fullname} (Transferred)`,
        },
      });

      return {
        fromUser,
        toUser: updatedUser,
        message: 'User data transferred successfully',
      };
    });
  }

  /**
   * Example 4: Conditional user operations
   */
  async updateUserIfExists(
    userId: string,
    updates: { fullname?: string; role?: UserRole },
  ) {
    return this.authRepository.transaction(async tx => {
      // Check if user exists
      const existingUser = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      // Update user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: updates,
      });

      return updatedUser;
    });
  }

  /**
   * Example 5: Rollback on error
   */
  async createUserWithValidation(userData: {
    fullname: string;
    email: string;
    password: string;
  }) {
    return this.authRepository.transaction(async tx => {
      // Create user
      const user = await tx.user.create({
        data: userData,
      });

      // Validate user creation
      if (!user.id) {
        throw new Error('User creation failed');
      }

      // If validation fails, transaction will automatically rollback
      if (user.fullname.length < 2) {
        throw new Error('Fullname too short');
      }

      return user;
    });
  }
}
