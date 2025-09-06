import { randomBytes } from 'crypto';

export function generateRandomPassword(length: number = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateIdempotencyKey(): string {
  return randomBytes(16).toString('hex');
}
