import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  NotFoundException,
  InternalServerException,
  ServerUnavailableException,
  ConflictException,
} from '../lib/http';

export const PRISMA_KNOWN_ERROR_CODES = {
  NOT_FOUND: 'P2015',
  CONNECTION_TIMEOUT: 'P2024',
  CONFLICT: 'P2002',
};

export const buildPrismaError = (err: PrismaClientKnownRequestError) => {
  const { code } = err;
  switch (code) {
    case PRISMA_KNOWN_ERROR_CODES.NOT_FOUND:
      return NotFoundException(err.message);
    case PRISMA_KNOWN_ERROR_CODES.CONNECTION_TIMEOUT:
      return ServerUnavailableException(err.message);
    case PRISMA_KNOWN_ERROR_CODES.CONFLICT:
      return ConflictException(err.message);
  }
  return InternalServerException(err.message);
};
