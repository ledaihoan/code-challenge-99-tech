import { userRepo } from '../repositories/user.repository';

export const userService = {
  async getProfile(userId: string) {
    return userRepo.findById(userId);
  },

  async updateProfile(userId: string, data: { firstName?: string; lastName?: string }) {
    return userRepo.update({
      where: { id: userId },
      data,
    });
  },
};
