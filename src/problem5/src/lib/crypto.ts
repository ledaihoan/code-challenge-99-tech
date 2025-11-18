// Password hashing and verification helpers.

import bcrypt from 'bcryptjs';

const DEFAULT_ROUNDS = 10;

export const hashPassword = async (raw: string) => {
  return bcrypt.hash(raw, DEFAULT_ROUNDS);
};

export const verifyPassword = async (raw: string, hash: string) => {
  if (!bcrypt.compareSync(raw, hash)) {
    throw new Error('password is incorrect');
  }
  return true;
};
