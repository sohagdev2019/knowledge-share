import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@/tests/utils/test-utils';
import RegistrationForm from '@/app/(public)/register/_components/RegistrationForm';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

// Mock dependencies
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

describe('RegistrationForm Component', () => {
  const mockPush = vi.fn();
  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
      refresh: mockRefresh,
    });
  });

  describe('Initial Render', () => {
    it('should render registration form with all fields', () => {
      render(<RegistrationForm />);
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByText(/account type/i)).toBeInTheDocument();
    });

    it('should show account type switcher (Student/Teacher)', () => {
      render(<RegistrationForm />);
      
      expect(screen.getByText(/student account/i)).toBeInTheDocument();
      expect(screen.getByText(/teacher account/i)).toBeInTheDocument();
    });

    it('should default to student account type', () => {
      render(<RegistrationForm />);
      
      const studentButton = screen.getByText(/student account/i);
      expect(studentButton.closest('button')).toHaveClass(/text-primary-foreground/);
    });

    it('should show link to login page', () => {
      render(<RegistrationForm />);
      
      const loginLink = screen.getByText(/already have an account/i);
      expect(loginLink).toBeInTheDocument();
    });
  });

  describe('Form Validation - Step 1', () => {
    it('should validate firstName minimum length', async () => {
      render(<RegistrationForm />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      fireEvent.change(firstNameInput, { target: { value: 'J' } });
      fireEvent.blur(firstNameInput);

      await waitFor(() => {
        expect(screen.getByText(/first name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate lastName minimum length', async () => {
      render(<RegistrationForm />);
      
      const lastNameInput = screen.getByLabelText(/last name/i);
      fireEvent.change(lastNameInput, { target: { value: 'D' } });
      fireEvent.blur(lastNameInput);

      await waitFor(() => {
        expect(screen.getByText(/last name must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate username format', async () => {
      render(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/username/i);
      fireEvent.change(usernameInput, { target: { value: 'john-doe' } }); // Invalid: contains hyphen
      fireEvent.blur(usernameInput);

      await waitFor(() => {
        expect(screen.getByText(/username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
      });
    });

    it('should allow valid username format', async () => {
      render(<RegistrationForm />);
      
      const usernameInput = screen.getByLabelText(/username/i);
      fireEvent.change(usernameInput, { target: { value: 'johndoe123' } });
      fireEvent.blur(usernameInput);

      await waitFor(() => {
        const error = screen.queryByText(/username can only contain/i);
        expect(error).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation - Step 2', () => {
    it('should validate email format', async () => {
      render(<RegistrationForm />);
      
      // Navigate to step 2
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const continueButton = screen.getByText(/continue/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });

    it('should validate password minimum length', async () => {
      render(<RegistrationForm />);
      
      // Navigate to step 2
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const continueButton = screen.getByText(/continue/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: '12345' } }); // Too short
        fireEvent.blur(passwordInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      render(<RegistrationForm />);
      
      // Navigate to step 2
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const continueButton = screen.getByText(/continue/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const passwordInput = screen.getByLabelText(/password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
        fireEvent.blur(confirmPasswordInput);
      });

      await waitFor(() => {
        expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Role Registration', () => {
    it('should register user account successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Verification code sent',
        }),
      });

      render(<RegistrationForm />);
      
      // Step 1
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const continueButton = screen.getByText(/continue/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const createButton = screen.getByText(/create student account/i);

        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/student-registration/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: 'John',
            lastName: 'Doe',
            username: 'johndoe',
            email: 'user@example.com',
            password: 'password123',
            role: 'user',
          }),
        });
      });
    });
  });

  describe('Teacher Role Registration', () => {
    it('should register teacher account successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Verification code sent',
        }),
      });

      render(<RegistrationForm />);
      
      // Switch to teacher account
      const teacherButton = screen.getByText(/teacher account/i);
      fireEvent.click(teacherButton);

      // Step 1
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const continueButton = screen.getByText(/continue/i);

      fireEvent.change(firstNameInput, { target: { value: 'Teacher' } });
      fireEvent.change(lastNameInput, { target: { value: 'User' } });
      fireEvent.change(usernameInput, { target: { value: 'teacher' } });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const createButton = screen.getByText(/create teacher account/i);

        fireEvent.change(emailInput, { target: { value: 'teacher@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/student-registration/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName: 'Teacher',
            lastName: 'User',
            username: 'teacher',
            email: 'teacher@example.com',
            password: 'password123',
            role: 'teacher',
          }),
        });
      });
    });
  });

  describe('OTP Verification', () => {
    it('should show OTP input after successful registration submission', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Verification code sent',
        }),
      });

      render(<RegistrationForm />);
      
      // Complete steps 1 and 2
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const continueButton = screen.getByText(/continue/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.click(continueButton);

      await waitFor(async () => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
        const createButton = screen.getByText(/create student account/i);

        fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(createButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/verify your email/i)).toBeInTheDocument();
      });
    });

    it('should verify OTP and redirect to login', async () => {
      // Mock OTP send
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Verification code sent',
        }),
      });

      // Mock OTP verify
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          message: 'Account created successfully',
        }),
      });

      render(<RegistrationForm />);
      
      // Complete registration flow
      // ... (similar to above test)
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error on registration failure', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          status: 'error',
          message: 'Email already exists',
        }),
      });

      render(<RegistrationForm />);
      
      // Complete form and submit
      // ... (form filling logic)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Email already exists');
      });
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      render(<RegistrationForm />);
      
      // Complete form and submit
      // ... (form filling logic)
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred. Please try again.');
      });
    });
  });

  describe('Step Navigation', () => {
    it('should allow going back to previous step', async () => {
      render(<RegistrationForm />);
      
      // Navigate to step 2
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const continueButton = screen.getByText(/continue/i);

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(usernameInput, { target: { value: 'johndoe' } });
      fireEvent.click(continueButton);

      await waitFor(() => {
        const backButton = screen.getByText(/back/i);
        fireEvent.click(backButton);
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      });
    });
  });
});





