import bcrypt from 'bcrypt';
import { userDb } from './db';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createUser(email: string, password: string) {
  // Check if user already exists
  const existing = userDb.findByEmail(email);
  if (existing) {
    throw new Error('User already exists');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(password);
  const userId = userDb.create(email, passwordHash);

  return {
    id: userId as number,
    email,
  };
}

export async function authenticateUser(email: string, password: string) {
  // Find user
  const user = userDb.findByEmail(email);
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) {
    throw new Error('Invalid credentials');
  }

  return {
    id: user.id,
    email: user.email,
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 12) {
    return { valid: false, message: 'Password must be at least 12 characters' };
  }
  return { valid: true };
}

