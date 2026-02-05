import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  // Create an in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Disconnect and stop the server
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections after each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Mock Supabase client
jest.mock('../src/config/supabase', () => ({
  initSupabase: jest.fn(),
  getSupabase: jest.fn(() => ({
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      getUser: jest.fn(),
    },
  })),
}));
