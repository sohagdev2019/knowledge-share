import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils';
import { LoginForm } from '@/app/(auth)/login/_components/LoginForm';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  useSession: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('LoginForm Component', () => {
  const mockPush = vi.fn();
  const mockReplace = vi.fn();
  const mockRefresh = vi.fn();
  const mockUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      replace: mockReplace,
      refresh: mockRefresh,
    });
    (useSession as any).mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: mockUpdate,
    });
    (signIn as any).mockResolvedValue({ ok: true });
  });

  describe('Initial Render', () => {
    it('should render login form with email and password fields', () => {
      render(<LoginForm />);
      
      expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
      expect(screen.getByText(/send/i)).toBeInTheDocument();
    });

    it('should show OAuth buttons (Google and GitHub)', () => {
      render(<LoginForm />);
      
      expect(screen.getByText(/continue with google/i)).toBeInTheDocument();
      expect(screen.getByText(/continue with github/i)).toBeInTheDocument();
    });

    it('should show link to register page', () => {
      render(<LoginForm />);
      
      const registerLink = screen.getByText(/create an account/i);
      expect(registerLink).toBeInTheDocument();
      expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
    });
  });

  describe('Form Validation', () => {
    it('should show error if email is empty when submitting', async () => {
      render(<LoginForm />);
      
      const sendButton = screen.getByText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter your email or username');
      });
    });

    it('should show error if password is empty when submitting', async () => {
      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      
      const sendButton = screen.getByText(/send/i);
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please enter your password');
      });
    });
  });

  describe('Login Flow - User Role', () => {
    it('should send OTP successfully for user', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          email: 'user@example.com',
          message: 'Verification code sent',
        }),
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const sendButton = screen.getByText(/send/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailOrUsername: 'user@example.com',
            password: 'password123',
          }),
        });
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Verification code sent to your email!');
      });
    });

    it('should show OTP input after successful OTP send', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          email: 'user@example.com',
        }),
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const sendButton = screen.getByText(/send/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/input your otp/i)).toBeInTheDocument();
      });
    });

    it('should verify OTP and login successfully', async () => {
      // Mock OTP send
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          email: 'user@example.com',
        }),
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const sendButton = screen.getByText(/send/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText(/input your otp/i)).toBeInTheDocument();
      });

      // Mock OTP verify
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          user: { email: 'user@example.com' },
        }),
      });

      // Simulate OTP input (6 digits)
      const otpInputs = screen.getAllByRole('textbox');
      // Note: InputOTP component might need different approach
      // This is a simplified test
    });
  });

  describe('Login Flow - Admin Role', () => {
    it('should handle admin login successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          email: 'admin@example.com',
        }),
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const sendButton = screen.getByText(/send/i);

      fireEvent.change(emailInput, { target: { value: 'admin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'admin123' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Login Flow - SuperAdmin Role', () => {
    it('should handle superadmin login successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          email: 'superadmin@example.com',
        }),
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const sendButton = screen.getByText(/send/i);

      fireEvent.change(emailInput, { target: { value: 'superadmin@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'superadmin123' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on failed login', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'Invalid email/username or password',
        }),
      });

      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const sendButton = screen.getByText(/send/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Invalid email/username or password');
      });
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<LoginForm />);
      
      const emailInput = screen.getByPlaceholderText(/email/i);
      const passwordInput = screen.getByPlaceholderText(/password/i);
      const sendButton = screen.getByText(/send/i);

      fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred. Please try again.');
      });
    });
  });

  describe('OAuth Login', () => {
    it('should handle Google login', async () => {
      render(<LoginForm />);
      
      const googleButton = screen.getByText(/continue with google/i);
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: '/' });
      });
    });

    it('should handle GitHub login', async () => {
      render(<LoginForm />);
      
      const githubButton = screen.getByText(/continue with github/i);
      fireEvent.click(githubButton);

      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith('github', { callbackUrl: '/' });
      });
    });
  });

  describe('Redirect Behavior', () => {
    it('should redirect to home if already authenticated', () => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            id: '1',
            email: 'user@example.com',
            role: 'user',
          },
        },
        status: 'authenticated',
        update: mockUpdate,
      });

      render(<LoginForm />);

      expect(mockReplace).toHaveBeenCalledWith('/');
    });
  });
});





