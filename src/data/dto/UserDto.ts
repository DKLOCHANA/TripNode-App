/**
 * User DTO - API response shape for user data
 */
export interface UserDto {
  id: string;
  email: string | null;
  displayName: string | null;
  photoUrl: string | null;
  createdAt: string;
  updatedAt?: string;
}

/**
 * User profile update request DTO
 */
export interface UpdateUserDto {
  displayName?: string;
  photoUrl?: string;
}
