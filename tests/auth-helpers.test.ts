import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDbUser, getDbUserId, isUserSynced } from '@/lib/auth/helpers';
import * as dbQueries from '@/lib/db/queries';

// Mock the database queries
vi.mock('@/lib/db/queries', () => ({
  getUserByWorkOSId: vi.fn(),
  ensureUserExists: vi.fn(),
}));

// Mock React cache - in test environment, just return the function
vi.mock('react', () => ({
  cache: (fn: any) => fn,
}));

describe('Auth Helpers', () => {
  const mockWorkosUser = {
    id: 'workos_user_123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    object: 'user' as const,
    emailVerified: true,
    profilePictureUrl: null,
    lastSignInAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    organizationMemberships: [],
    impersonator: null,
  };

  const mockDbUser = {
    id: 'db_user_uuid_456',
    email: 'test@example.com',
    workosId: 'workos_user_123',
    password: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDbUser', () => {
    it('should return existing database user when found', async () => {
      vi.mocked(dbQueries.getUserByWorkOSId).mockResolvedValue(mockDbUser);

      const result = await getDbUser(mockWorkosUser);

      expect(result).toBe(mockDbUser);
      expect(dbQueries.getUserByWorkOSId).toHaveBeenCalledWith('workos_user_123');
      expect(dbQueries.ensureUserExists).not.toHaveBeenCalled();
    });

    it('should create and return user when not found in database', async () => {
      vi.mocked(dbQueries.getUserByWorkOSId)
        .mockResolvedValueOnce(null) // First call returns null
        .mockResolvedValueOnce(mockDbUser); // Second call returns created user
      
      vi.mocked(dbQueries.ensureUserExists).mockResolvedValue(mockDbUser);

      const result = await getDbUser(mockWorkosUser);

      expect(result).toBe(mockDbUser);
      expect(dbQueries.getUserByWorkOSId).toHaveBeenCalledTimes(2);
      expect(dbQueries.ensureUserExists).toHaveBeenCalledWith({
        workosId: 'workos_user_123',
        email: 'test@example.com',
      });
    });

    it('should handle database errors gracefully', async () => {
      vi.mocked(dbQueries.getUserByWorkOSId).mockRejectedValue(new Error('Database error'));

      await expect(getDbUser(mockWorkosUser)).rejects.toThrow('Database error');
    });
  });

  describe('getDbUserId', () => {
    it('should return database user ID when user exists', async () => {
      vi.mocked(dbQueries.getUserByWorkOSId).mockResolvedValue(mockDbUser);

      const result = await getDbUserId(mockWorkosUser);

      expect(result).toBe('db_user_uuid_456');
    });

    it('should return null when user does not exist and creation fails', async () => {
      vi.mocked(dbQueries.getUserByWorkOSId).mockResolvedValue(null);
      vi.mocked(dbQueries.ensureUserExists).mockResolvedValue(null);

      const result = await getDbUserId(mockWorkosUser);

      expect(result).toBeNull();
    });
  });

  describe('isUserSynced', () => {
    it('should return true when user exists in database', async () => {
      vi.mocked(dbQueries.getUserByWorkOSId).mockResolvedValue(mockDbUser);

      const result = await isUserSynced(mockWorkosUser);

      expect(result).toBe(true);
    });

    it('should return false when user does not exist in database', async () => {
      vi.mocked(dbQueries.getUserByWorkOSId).mockResolvedValue(null);
      vi.mocked(dbQueries.ensureUserExists).mockResolvedValue(null);

      const result = await isUserSynced(mockWorkosUser);

      expect(result).toBe(false);
    });
  });
});