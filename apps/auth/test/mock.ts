const mockPrismaService = {
    session: {
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  };
  
  const mockJwtService = {
    sign: jest.fn(() => 'mockAccessToken'),
    verify: jest.fn(),
  };
  