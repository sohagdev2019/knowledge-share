import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/student-registration/verify/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    verification: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    account: {
      create: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback({
      user: { create: vi.fn() },
      account: { create: vi.fn() },
      verification: { delete: vi.fn() },
    })),
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(),
  },
}));

describe('POST /api/student-registration/verify - Register OTP Verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Role Registration', () => {
    it('should verify OTP and create user account successfully', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'user@example.com',
        password: 'password123',
        otp: '123456',
        role: 'user',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.verification.findFirst as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      (prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue({ id: 'user-1' }) },
          account: { create: vi.fn().mockResolvedValue({}) },
          verification: { delete: vi.fn().mockResolvedValue({}) },
        };
        return await callback(tx);
      });

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.message).toContain('Student account created');
    });
  });

  describe('Teacher Role Registration', () => {
    it('should verify OTP and create teacher account successfully', async () => {
      const registrationData = {
        firstName: 'Teacher',
        lastName: 'User',
        username: 'teacher',
        email: 'teacher@example.com',
        password: 'password123',
        otp: '123456',
        role: 'teacher',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'teacher@example.com',
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.verification.findFirst as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      (prisma.$transaction as any).mockImplementation(async (callback) => {
        const tx = {
          user: { create: vi.fn().mockResolvedValue({ id: 'teacher-1' }) },
          account: { create: vi.fn().mockResolvedValue({}) },
          verification: { delete: vi.fn().mockResolvedValue({}) },
        };
        return await callback(tx);
      });

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'teacher@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.message).toContain('Teacher account created');
    });
  });

  describe('Validation Tests', () => {
    it('should return 400 if email is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if OTP is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if OTP is not 6 digits', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '12345', // Only 5 digits
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });
  });

  describe('Error Cases', () => {
    it('should return 400 if verification not found', async () => {
      (prisma.verification.findFirst as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Invalid or expired');
    });

    it('should return 400 if verification is expired', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'user@example.com',
        password: 'password123',
        otp: '123456',
        role: 'user',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
      };

      (prisma.verification.findFirst as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if OTP is invalid', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'user@example.com',
        password: 'password123',
        otp: '123456',
        role: 'user',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.verification.findFirst as any).mockResolvedValue(mockVerification);

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '000000', // Wrong OTP
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Invalid verification code');
    });

    it('should return 400 if email mismatch', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'user@example.com',
        password: 'password123',
        otp: '123456',
        role: 'user',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.verification.findFirst as any).mockResolvedValue(mockVerification);

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'different@example.com', // Different email
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Email mismatch');
    });

    it('should return 400 if user already exists (race condition)', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'user@example.com',
        password: 'password123',
        otp: '123456',
        role: 'user',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      const existingUser = {
        id: 'user-1',
        email: 'user@example.com',
      };

      (prisma.verification.findFirst as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(existingUser);
      (prisma.verification.delete as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Account already exists');
    });

    it('should return 400 if verification data is invalid JSON', async () => {
      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: 'invalid-json',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.verification.findFirst as any).mockResolvedValue(mockVerification);

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Invalid verification data');
    });

    it('should handle unique constraint violations', async () => {
      const registrationData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'user@example.com',
        password: 'password123',
        otp: '123456',
        role: 'user',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: JSON.stringify(registrationData),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        createdAt: new Date(),
      };

      (prisma.verification.findFirst as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (bcrypt.hash as any).mockResolvedValue('hashed_password');
      (prisma.$transaction as any).mockRejectedValue(
        new Error('Unique constraint failed on the fields: (`username`)')
      );

      const request = new NextRequest('http://localhost:3000/api/student-registration/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('already exists');
    });
  });
});





