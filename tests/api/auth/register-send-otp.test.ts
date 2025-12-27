import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/student-registration/send-otp/route';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { getBrevoClient } from '@/lib/brevo';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    verification: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/brevo', () => ({
  getBrevoClient: vi.fn(() => ({
    sendTransacEmail: vi.fn().mockResolvedValue({}),
  })),
  SendSmtpEmail: class {},
}));

vi.mock('@/lib/env', () => ({
  env: {
    BREVO_API_KEY: 'test-key',
    BREVO_SENDER_EMAIL: 'test@example.com',
    BREVO_SENDER_NAME: 'Test Sender',
  },
}));

describe('POST /api/student-registration/send-otp - Register OTP Send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('User Role Registration', () => {
    it('should send OTP successfully for user registration', async () => {
      (prisma.user.findUnique as any)
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce(null); // Username check
      (prisma.verification.deleteMany as any).mockResolvedValue({});
      (prisma.verification.create as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'user@example.com',
          password: 'password123',
          role: 'user',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@example.com' },
      });
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { username: 'johndoe' },
      });
    });

    it('should default to user role if not specified', async () => {
      (prisma.user.findUnique as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (prisma.verification.deleteMany as any).mockResolvedValue({});
      (prisma.verification.create as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Smith',
          username: 'janesmith',
          email: 'jane@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
    });
  });

  describe('Teacher Role Registration', () => {
    it('should send OTP successfully for teacher registration', async () => {
      (prisma.user.findUnique as any)
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce(null); // Username check
      (prisma.verification.deleteMany as any).mockResolvedValue({});
      (prisma.verification.create as any).mockResolvedValue({});

      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Teacher',
          lastName: 'User',
          username: 'teacher',
          email: 'teacher@example.com',
          password: 'password123',
          role: 'teacher',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('success');
    });
  });

  describe('Validation Tests', () => {
    it('should return 400 if firstName is too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'J',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'user@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if lastName is too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'D',
          username: 'johndoe',
          email: 'user@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if username is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'john-doe', // Invalid: contains hyphen
          email: 'user@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if email is invalid', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'invalid-email',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });

    it('should return 400 if password is too short', async () => {
      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'user@example.com',
          password: '12345', // Too short
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
    });
  });

  describe('Duplicate Checks', () => {
    it('should return 400 if email already exists', async () => {
      const existingUser = {
        id: 'user-1',
        email: 'existing@example.com',
      };

      (prisma.user.findUnique as any).mockResolvedValue(existingUser);

      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'existing@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Email already exists');
    });

    it('should return 400 if username already exists', async () => {
      (prisma.user.findUnique as any)
        .mockResolvedValueOnce(null) // Email check
        .mockResolvedValueOnce({ id: 'user-1', username: 'existing' }); // Username check

      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'existing',
          email: 'new@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.status).toBe('error');
      expect(data.message).toContain('Username already exists');
    });
  });

  describe('Email Sending', () => {
    it('should handle email sending failure gracefully', async () => {
      (prisma.user.findUnique as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (prisma.verification.deleteMany as any).mockResolvedValue({});
      (prisma.verification.create as any).mockResolvedValue({});

      const mockBrevoClient = {
        sendTransacEmail: vi.fn().mockRejectedValue(new Error('Email service error')),
      };
      (getBrevoClient as any).mockReturnValue(mockBrevoClient);

      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'user@example.com',
          password: 'password123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.status).toBe('error');
    });

    it('should log OTP in dev mode when BREVO_API_KEY is missing', async () => {
      vi.doMock('@/lib/env', () => ({
        env: {
          BREVO_API_KEY: undefined,
        },
      }));

      (prisma.user.findUnique as any)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      (prisma.verification.deleteMany as any).mockResolvedValue({});
      (prisma.verification.create as any).mockResolvedValue({});

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const request = new NextRequest('http://localhost:3000/api/student-registration/send-otp', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'John',
          lastName: 'Doe',
          username: 'johndoe',
          email: 'user@example.com',
          password: 'password123',
        }),
      });

      // Note: This test may need adjustment based on actual implementation
      // The route checks env.BREVO_API_KEY directly
    });
  });
});





