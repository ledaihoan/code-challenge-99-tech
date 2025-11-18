import { userRepo } from '../repositories/user.repository';
import { verifyPassword } from '../lib/crypto';
import { UnauthorizedException } from '../lib/http';
import { signAccessToken } from '../lib/jwt';
import { generateRefreshToken, storeRefreshToken, deleteRefreshToken } from '../lib/refresh-token';

export const authService = {
  async signIn(email: string, password: string) {
    try {
      const user = await userRepo.findByEmail(email);
      await verifyPassword(password, user.passwordHash);

      const accessToken = signAccessToken(user.id);
      const refreshToken = await generateRefreshToken(user.id);

      return { accessToken, refreshToken };
    } catch {
      throw UnauthorizedException('Invalid credentials');
    }
  },

  async refresh(refreshToken: string) {
    const userId = await storeRefreshToken.get(refreshToken);
    if (!userId) {
      throw UnauthorizedException('Invalid refresh token');
    }

    const accessToken = signAccessToken(userId);
    return { accessToken };
  },

  async signOut(refreshToken?: string) {
    if (refreshToken) {
      await deleteRefreshToken(refreshToken);
    }
  },
};
