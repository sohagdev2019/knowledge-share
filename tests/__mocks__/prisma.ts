// Mock Prisma Client for testing
// This is a basic mock - customize based on your needs

export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  course: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Add more models as needed
};

// For Vitest
export const createMockPrisma = () => mockPrisma;
