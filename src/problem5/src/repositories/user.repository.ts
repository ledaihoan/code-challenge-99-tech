import { prisma } from '../lib/prisma';

const createUserRepo = () => {
  const base = prisma.user;

  return {
    ...base,

    findByEmail: (email: string) => base.findUniqueOrThrow({ where: { email } }),

    findById: (id: string) => base.findUniqueOrThrow({ where: { id } }),
  };
};

export const userRepo = createUserRepo();
