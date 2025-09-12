import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository } from '@/repositories';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserManagementUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  /**
   * Example 1: Promote user to admin with transaction
   */
  async promoteUserToAdmin(userId: string, promotedBy: string) {
    return this.authRepository.transaction(async tx => {
      // Get user
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user role
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { role: UserRole.ADMIN },
      });

      // Log the promotion
      console.log(`User ${user.fullname} promoted to admin by ${promotedBy}`);

      return updatedUser;
    });
  }

  /**
   * Example 2: Deactivate user and clean up data
   */
  async deactivateUser(userId: string, reason: string) {
    return this.authRepository.transaction(async tx => {
      // Get user
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user (mark as deactivated by changing fullname)
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          fullname: `${user.fullname} (Deactivated)`,
        },
      });

      // Log deactivation
      console.log(`User ${user.fullname} deactivated. Reason: ${reason}`);

      return {
        user: updatedUser,
        reason,
        deactivatedAt: new Date(),
      };
    });
  }

  /**
   * Example 3: Batch role updates
   */
  async batchUpdateUserRoles(
    updates: Array<{ userId: string; role: UserRole }>,
  ) {
    return this.authRepository.transaction(async tx => {
      const results: any[] = [];

      for (const update of updates) {
        const user = await tx.user.update({
          where: { id: update.userId },
          data: { role: update.role },
        });
        results.push(user);
      }

      return results;
    });
  }

  /**
   * Example 4: User data migration
   */
  async migrateUserData(oldUserId: string, newUserId: string) {
    return this.authRepository.transaction(async tx => {
      // Get both users
      const [oldUser, newUser] = await Promise.all([
        tx.user.findUnique({ where: { id: oldUserId } }),
        tx.user.findUnique({ where: { id: newUserId } }),
      ]);

      if (!oldUser || !newUser) {
        throw new NotFoundException('One or both users not found');
      }

      // Merge user data
      const mergedUser = await tx.user.update({
        where: { id: newUserId },
        data: {
          fullname: oldUser.fullname,
          // Keep new user's email and other unique fields
        },
      });

      // Mark old user as migrated
      await tx.user.update({
        where: { id: oldUserId },
        data: {
          fullname: `${oldUser.fullname} (Migrated)`,
        },
      });

      return {
        oldUser,
        newUser: mergedUser,
        migratedAt: new Date(),
      };
    });
  }

  /**
   * Example 5: Complex user operation with error handling
   */
  async complexUserOperation(userId: string, operationData: any) {
    try {
      return this.authRepository.transaction(async tx => {
        // Step 1: Validate user
        const user = await tx.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        // Step 2: Perform multiple operations
        const [updatedUser] = await Promise.all([
          tx.user.update({
            where: { id: userId },
            data: { fullname: operationData.fullname },
          }),
          // Add more operations here as needed
        ]);

        // Step 3: Validate results
        if (!updatedUser) {
          throw new Error('User update failed');
        }

        return {
          user: updatedUser,
          operation: 'completed',
          timestamp: new Date(),
        };
      });
    } catch (error) {
      // Transaction will automatically rollback
      console.error('Complex user operation failed:', error);
      throw error;
    }
  }
}
