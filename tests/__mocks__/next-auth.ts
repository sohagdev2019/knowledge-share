// Mock for next-auth in tests
export const mockSession = {
  user: {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

export const useSession = jest.fn(() => ({
  data: mockSession,
  status: 'authenticated',
}));

export const signIn = jest.fn();
export const signOut = jest.fn();

// For Vitest
export const mockNextAuth = {
  useSession,
  signIn,
  signOut,
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
};
