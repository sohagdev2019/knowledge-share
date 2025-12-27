import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/auth/email/verify/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    verification: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('POST /api/auth/email/verify - Login OTP Verify', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Role Tests', () => {
    it('should verify OTP successfully for user', async () => {
      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        emailVerified: false,
      };

      (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.user.update as any).mockResolvedValue({ ...mockUser, emailVerified: true });
      (prisma.verification.delete as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
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
      expect(data.user.email).toBe('user@example.com');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { emailVerified: true },
      });
    });
  });

  describe('Admin Role Tests', () => {
    it('should verify OTP successfully for admin', async () => {
      const mockVerification = {
        id: 'ver-1',
        identifier: 'admin@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        emailVerified: false,
      };

      (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
      (prisma.user.update as any).mockResolvedValue({ ...mockAdmin, emailVerified: true });
      (prisma.verification.delete as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.user.email).toBe('admin@example.com');
    });
  });

  describe('SuperAdmin Role Tests', () => {
    it('should verify OTP successfully for superadmin', async () => {
      const mockVerification = {
        id: 'ver-1',
        identifier: 'superadmin@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const mockSuperAdmin = {
        id: 'superadmin-1',
        email: 'superadmin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
        emailVerified: false,
      };

      (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(mockSuperAdmin);
      (prisma.user.update as any).mockResolvedValue({ ...mockSuperAdmin, emailVerified: true });
      (prisma.verification.delete as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'superadmin@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.user.email).toBe('superadmin@example.com');
    });
  });

  describe('Error Cases', () => {
    it('should return 400 if email is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
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
      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
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

    it('should return 400 if verification not found', async () => {
      (prisma.verification.findUnique as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
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
      expect(data.message).toContain('No verification code found');
    });

    it('should return 400 if OTP is expired', async () => {
      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() - 1000), // Expired
      };

      (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);
      (prisma.verification.delete as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
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
      expect(data.message).toContain('expired');
    });

    it('should return 400 if OTP is invalid', async () => {
      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);

      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
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
      expect(data.message).toContain('Invalid');
    });

    it('should create new user if user does not exist', async () => {
      const mockVerification = {
        id: 'ver-1',
        identifier: 'newuser@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      const mockNewUser = {
        id: 'user-new',
        email: 'newuser@example.com',
        firstName: 'newuser',
        emailVerified: true,
      };

      (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue(mockNewUser);
      (prisma.verification.delete as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/verify', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@example.com',
          otp: '123456',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(prisma.user.create).toHaveBeenCalled();
    });
  });
});





