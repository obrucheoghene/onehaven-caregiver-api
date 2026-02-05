import request from 'supertest';
import express, { Express } from 'express';
import Caregiver from '../../src/models/Caregiver';
import protectedMemberRoutes from '../../src/routes/protectedMemberRoutes';
import { errorHandler } from '../../src/middleware/errorHandler';
import { AuthRequest } from '../../src/types';

// Mock auth middleware to inject test caregiver
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req: AuthRequest, _res: express.Response, next: express.NextFunction) => {
    req.caregiver = {
      id: 'test-caregiver-id',
      supabaseUserId: 'supabase-123',
      name: 'Test Caregiver',
      email: 'test@example.com',
      createdAt: new Date(),
    };
    next();
  },
}));

// Mock event emitter
jest.mock('../../src/events/eventEmitter', () => ({
  emitMemberEvent: jest.fn(),
}));

describe('Protected Members API', () => {
  let app: Express;

  beforeAll(async () => {
    // Create test caregiver in database
    await Caregiver.create({
      id: 'test-caregiver-id',
      supabaseUserId: 'supabase-123',
      name: 'Test Caregiver',
      email: 'test@example.com',
    });

    // Create test app
    app = express();
    app.use(express.json());
    app.use('/api/protected-members', protectedMemberRoutes);
    app.use(errorHandler);
  });

  describe('POST /api/protected-members', () => {
    it('should create a protected member', async () => {
      const response = await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'Tommy',
          lastName: 'Test',
          relationship: 'Son',
          birthYear: 2015,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Tommy');
      expect(response.body.data.lastName).toBe('Test');
      expect(response.body.data.relationship).toBe('Son');
      expect(response.body.data.birthYear).toBe(2015);
      expect(response.body.data.status).toBe('active');
      expect(response.body.data.id).toBeDefined();
    });

    it('should return validation error for missing fields', async () => {
      const response = await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'Tommy',
          // Missing lastName, relationship, birthYear
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return validation error for invalid relationship', async () => {
      const response = await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'Tommy',
          lastName: 'Test',
          relationship: 'InvalidType',
          birthYear: 2015,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/protected-members', () => {
    it('should return empty array when no members exist', async () => {
      const response = await request(app).get('/api/protected-members');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should return all members for the caregiver', async () => {
      // Create some members first
      await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'Child1',
          lastName: 'Test',
          relationship: 'Son',
          birthYear: 2015,
        });
      await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'Child2',
          lastName: 'Test',
          relationship: 'Daughter',
          birthYear: 2018,
        });

      const response = await request(app).get('/api/protected-members');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });
  });

  describe('PATCH /api/protected-members/:id', () => {
    it('should update a protected member', async () => {
      // Create a member first
      const createResponse = await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'Original',
          lastName: 'Name',
          relationship: 'Son',
          birthYear: 2015,
        });

      const memberId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/protected-members/${memberId}`)
        .send({
          firstName: 'Updated',
          status: 'inactive',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Updated');
      expect(response.body.data.lastName).toBe('Name'); // Unchanged
      expect(response.body.data.status).toBe('inactive');
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app)
        .patch('/api/protected-members/nonexistent-id')
        .send({
          firstName: 'Updated',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    it('should return validation error for empty update body', async () => {
      const createResponse = await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'Test',
          lastName: 'Member',
          relationship: 'Son',
          birthYear: 2015,
        });

      const memberId = createResponse.body.data.id;

      const response = await request(app)
        .patch(`/api/protected-members/${memberId}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/protected-members/:id', () => {
    it('should delete a protected member', async () => {
      // Create a member first
      const createResponse = await request(app)
        .post('/api/protected-members')
        .send({
          firstName: 'ToDelete',
          lastName: 'Member',
          relationship: 'Son',
          birthYear: 2015,
        });

      const memberId = createResponse.body.data.id;

      const response = await request(app).delete(`/api/protected-members/${memberId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify deletion
      const getResponse = await request(app).get('/api/protected-members');
      const memberExists = getResponse.body.data.some(
        (m: { id: string }) => m.id === memberId
      );
      expect(memberExists).toBe(false);
    });

    it('should return 404 for non-existent member', async () => {
      const response = await request(app).delete('/api/protected-members/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
