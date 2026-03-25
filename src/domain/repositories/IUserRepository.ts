import type { User } from '../entities/User';

export interface IUserRepository {
  /**
   * Get user profile
   */
  getProfile(userId: string): Promise<User>;

  /**
   * Update user profile
   */
  updateProfile(userId: string, data: Partial<User>): Promise<User>;

  /**
   * Delete user profile (for account deletion cascade)
   */
  deleteProfile(userId: string): Promise<void>;
}
