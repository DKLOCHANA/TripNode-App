import type { User } from '@/domain/entities/User';
import type { UserDto } from '../dto/UserDto';

/**
 * Map User DTO to domain entity
 */
export function mapUserToDomain(dto: UserDto): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.displayName,
    photoUrl: dto.photoUrl,
    createdAt: dto.createdAt,
  };
}

/**
 * Map domain User to DTO for API requests
 */
export function mapUserToDto(user: User): UserDto {
  return {
    id: user.id,
    email: user.email,
    displayName: user.name,
    photoUrl: user.photoUrl,
    createdAt: user.createdAt,
  };
}
