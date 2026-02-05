import { signupSchema, loginSchema } from '../../src/validations/caregiverSchema';
import {
  createProtectedMemberSchema,
  updateProtectedMemberSchema,
} from '../../src/validations/protectedMemberSchema';

describe('Validation Schemas', () => {
  describe('signupSchema', () => {
    it('should validate correct signup data', async () => {
      const validData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      };

      const result = await signupSchema.parseAsync(validData);
      expect(result.body.name).toBe('John Doe');
      expect(result.body.email).toBe('john@example.com');
    });

    it('should reject short name', async () => {
      const invalidData = {
        body: {
          name: 'J',
          email: 'john@example.com',
          password: 'password123',
        },
      };

      await expect(signupSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject invalid email', async () => {
      const invalidData = {
        body: {
          name: 'John Doe',
          email: 'not-an-email',
          password: 'password123',
        },
      };

      await expect(signupSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject short password', async () => {
      const invalidData = {
        body: {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'short',
        },
      };

      await expect(signupSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should normalize email to lowercase', async () => {
      const validData = {
        body: {
          name: 'John Doe',
          email: 'JOHN@EXAMPLE.COM',
          password: 'password123',
        },
      };

      const result = await signupSchema.parseAsync(validData);
      expect(result.body.email).toBe('john@example.com');
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', async () => {
      const validData = {
        body: {
          email: 'john@example.com',
          password: 'password123',
        },
      };

      const result = await loginSchema.parseAsync(validData);
      expect(result.body.email).toBe('john@example.com');
    });

    it('should reject missing password', async () => {
      const invalidData = {
        body: {
          email: 'john@example.com',
        },
      };

      await expect(loginSchema.parseAsync(invalidData)).rejects.toThrow();
    });
  });

  describe('createProtectedMemberSchema', () => {
    it('should validate correct member data', async () => {
      const validData = {
        body: {
          firstName: 'Tommy',
          lastName: 'Doe',
          relationship: 'Son',
          birthYear: 2015,
        },
      };

      const result = await createProtectedMemberSchema.parseAsync(validData);
      expect(result.body.firstName).toBe('Tommy');
      expect(result.body.relationship).toBe('Son');
    });

    it('should default status to active', async () => {
      const validData = {
        body: {
          firstName: 'Tommy',
          lastName: 'Doe',
          relationship: 'Son',
          birthYear: 2015,
        },
      };

      const result = await createProtectedMemberSchema.parseAsync(validData);
      expect(result.body.status).toBe('active');
    });

    it('should reject invalid relationship type', async () => {
      const invalidData = {
        body: {
          firstName: 'Tommy',
          lastName: 'Doe',
          relationship: 'InvalidRelationship',
          birthYear: 2015,
        },
      };

      await expect(createProtectedMemberSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject birth year before 1900', async () => {
      const invalidData = {
        body: {
          firstName: 'Tommy',
          lastName: 'Doe',
          relationship: 'Son',
          birthYear: 1899,
        },
      };

      await expect(createProtectedMemberSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should reject future birth year', async () => {
      const invalidData = {
        body: {
          firstName: 'Tommy',
          lastName: 'Doe',
          relationship: 'Son',
          birthYear: new Date().getFullYear() + 1,
        },
      };

      await expect(createProtectedMemberSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should accept all valid relationship types', async () => {
      const relationships = ['Son', 'Daughter', 'Parent', 'Grandparent', 'Spouse', 'Sibling', 'Other'];

      for (const relationship of relationships) {
        const data = {
          body: {
            firstName: 'Test',
            lastName: 'Member',
            relationship,
            birthYear: 2000,
          },
        };

        const result = await createProtectedMemberSchema.parseAsync(data);
        expect(result.body.relationship).toBe(relationship);
      }
    });
  });

  describe('updateProtectedMemberSchema', () => {
    it('should validate partial update data', async () => {
      const validData = {
        params: { id: 'member-123' },
        body: {
          firstName: 'UpdatedName',
        },
      };

      const result = await updateProtectedMemberSchema.parseAsync(validData);
      expect(result.body.firstName).toBe('UpdatedName');
    });

    it('should reject empty update body', async () => {
      const invalidData = {
        params: { id: 'member-123' },
        body: {},
      };

      await expect(updateProtectedMemberSchema.parseAsync(invalidData)).rejects.toThrow();
    });

    it('should validate status change', async () => {
      const validData = {
        params: { id: 'member-123' },
        body: {
          status: 'inactive',
        },
      };

      const result = await updateProtectedMemberSchema.parseAsync(validData);
      expect(result.body.status).toBe('inactive');
    });
  });
});
