import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/auth/email/send/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getBrevoClient } from '@/lib/brevo';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    verification: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/brevo', () => ({
  getBrevoClient: vi.fn(() => ({
    sendTransacEmail: vi.fn().mockResolvedValue({}),
  })),
  SendSmtpEmail: class {},
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

describe('POST /api/auth/email/send - Login OTP Send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Role Tests', () => {
    it('should send OTP successfully for user with email', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        role: 'user',
        accounts: [
          {
            id: 'acc-1',
            providerId: 'credential',
            password: hashedPassword,
          },
        ],
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (prisma.verification.upsert as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'user@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.email).toBe('user@example.com');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
        include: {
          accounts: {
            where: { providerId: 'credential' },
          },
        },
      });
    });

    it('should send OTP successfully for user with username', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        role: 'user',
        accounts: [
          {
            id: 'acc-1',
            providerId: 'credential',
            password: hashedPassword,
          },
        ],
      };

      (prisma.user.findUnique as any).mockResolvedValueOnce(null).mockResolvedValueOnce(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);
      (prisma.verification.upsert as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'johndoe',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
    });

    it('should reject invalid password for user', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
        accounts: [
          {
            id: 'acc-1',
            providerId: 'credential',
            password: hashedPassword,
          },
        ],
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'user@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Invalid');
    });
  });

  describe('Admin Role Tests', () => {
    it('should send OTP successfully for admin with email', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        role: 'admin',
        accounts: [
          {
            id: 'acc-1',
            providerId: 'credential',
            password: hashedPassword,
          },
        ],
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
      (bcrypt.compare as any).mockResolvedValue(true);
      (prisma.verification.upsert as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'admin@example.com',
          password: 'admin123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.email).toBe('admin@example.com');
    });

    it('should reject invalid password for admin', async () => {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const mockAdmin = {
        id: 'admin-1',
        email: 'admin@example.com',
        role: 'admin',
        accounts: [
          {
            id: 'acc-1',
            providerId: 'credential',
            password: hashedPassword,
          },
        ],
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockAdmin);
      (bcrypt.compare as any).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'admin@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
    });
  });

  describe('SuperAdmin Role Tests', () => {
    it('should send OTP successfully for superadmin with email', async () => {
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      const mockSuperAdmin = {
        id: 'superadmin-1',
        email: 'superadmin@example.com',
        firstName: 'Super',
        lastName: 'Admin',
        username: 'superadmin',
        role: 'superadmin',
        accounts: [
          {
            id: 'acc-1',
            providerId: 'credential',
            password: hashedPassword,
          },
        ],
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockSuperAdmin);
      (bcrypt.compare as any).mockResolvedValue(true);
      (prisma.verification.upsert as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'superadmin@example.com',
          password: 'superadmin123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(data.email).toBe('superadmin@example.com');
    });

    it('should reject invalid password for superadmin', async () => {
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      const mockSuperAdmin = {
        id: 'superadmin-1',
        email: 'superadmin@example.com',
        role: 'superadmin',
        accounts: [
          {
            id: 'acc-1',
            providerId: 'credential',
            password: hashedPassword,
          },
        ],
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockSuperAdmin);
      (bcrypt.compare as any).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'superadmin@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
    });
  });

  describe('Error Cases', () => {
    it('should return 400 if emailOrUsername is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if password is missing', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'user@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 401 if user not found', async () => {
      (prisma.user.findUnique as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
    });

    it('should return 401 if user has no credential account', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
        accounts: [],
      };

      (prisma.user.findUnique as any).mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          emailOrUsername: 'user@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Password-based login');
    });

    it('should handle resend OTP for existing verification', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'user@example.com',
        role: 'user',
      };

      const mockVerification = {
        id: 'ver-1',
        identifier: 'user@example.com',
        value: '123456',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      };

      (prisma.verification.findUnique as any).mockResolvedValue(mockVerification);
      (prisma.user.findUnique as any).mockResolvedValue(mockUser);
      (prisma.verification.update as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/auth/email/send', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@example.com',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
    });
  });
});





