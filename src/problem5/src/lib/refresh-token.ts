// src/lib/refresh-token.ts
import crypto from 'crypto';

// In-memory store (replace with Redis in production)
const refreshTokenStore = new Map<string, { userId: string; expiresAt: number }>();

export const generateRefreshToken = async (userId: string): Promise<string> => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

  refreshTokenStore.set(token, { userId, expiresAt });
  return token;
};

export const storeRefreshToken = {
  get: async (token: string): Promise<string | null> => {
    const data = refreshTokenStore.get(token);
    if (!data || data.expiresAt < Date.now()) {
      refreshTokenStore.delete(token);
      return null;
    }
    return data.userId;
  },
};

export const deleteRefreshToken = async (token: string): Promise<void> => {
  refreshTokenStore.delete(token);
};
