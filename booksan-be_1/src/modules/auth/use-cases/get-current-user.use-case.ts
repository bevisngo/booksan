import { Injectable, NotFoundException } from '@nestjs/common';
import { AuthRepository, UserProfile } from '@/modules/auth/repositories';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(private readonly authRepository: AuthRepository) {}

  async execute(userId: string): Promise<UserProfile> {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
