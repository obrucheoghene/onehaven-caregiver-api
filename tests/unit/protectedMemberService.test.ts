import ProtectedMember from '../../src/models/ProtectedMember';
import protectedMemberService from '../../src/services/protectedMemberService';
import { CreateProtectedMemberInput, UpdateProtectedMemberInput } from '../../src/types';

// Mock the event emitter to avoid side effects
jest.mock('../../src/events/eventEmitter', () => ({
  emitMemberEvent: jest.fn(),
}));

describe('ProtectedMemberService', () => {
  const mockCaregiverId = 'caregiver-123';

  describe('create', () => {
    it('should create a protected member successfully', async () => {
      const input: CreateProtectedMemberInput = {
        firstName: 'John',
        lastName: 'Doe',
        relationship: 'Son',
        birthYear: 2015,
        status: 'active',
      };

      const result = await protectedMemberService.create(mockCaregiverId, input);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.caregiverId).toBe(mockCaregiverId);
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.relationship).toBe('Son');
      expect(result.birthYear).toBe(2015);
      expect(result.status).toBe('active');
    });

    it('should default status to active if not provided', async () => {
      const input: CreateProtectedMemberInput = {
        firstName: 'Jane',
        lastName: 'Doe',
        relationship: 'Daughter',
        birthYear: 2018,
      };

      const result = await protectedMemberService.create(mockCaregiverId, input);

      expect(result.status).toBe('active');
    });
  });

  describe('findAllByCaregiverId', () => {
    it('should return empty array when no members exist', async () => {
      const result = await protectedMemberService.findAllByCaregiverId(mockCaregiverId);

      expect(result).toEqual([]);
    });

    it('should return all members for a caregiver', async () => {
      // Create test members
      await protectedMemberService.create(mockCaregiverId, {
        firstName: 'Child1',
        lastName: 'Test',
        relationship: 'Son',
        birthYear: 2015,
      });
      await protectedMemberService.create(mockCaregiverId, {
        firstName: 'Child2',
        lastName: 'Test',
        relationship: 'Daughter',
        birthYear: 2018,
      });

      const result = await protectedMemberService.findAllByCaregiverId(mockCaregiverId);

      expect(result).toHaveLength(2);
    });

    it('should not return members from other caregivers', async () => {
      await protectedMemberService.create(mockCaregiverId, {
        firstName: 'MyChild',
        lastName: 'Test',
        relationship: 'Son',
        birthYear: 2015,
      });
      await protectedMemberService.create('other-caregiver', {
        firstName: 'OtherChild',
        lastName: 'Test',
        relationship: 'Son',
        birthYear: 2016,
      });

      const result = await protectedMemberService.findAllByCaregiverId(mockCaregiverId);

      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('MyChild');
    });
  });

  describe('findById', () => {
    it('should return a member by ID', async () => {
      const created = await protectedMemberService.create(mockCaregiverId, {
        firstName: 'Test',
        lastName: 'Member',
        relationship: 'Son',
        birthYear: 2015,
      });

      const result = await protectedMemberService.findById(created.id, mockCaregiverId);

      expect(result.id).toBe(created.id);
      expect(result.firstName).toBe('Test');
    });

    it('should throw error when member not found', async () => {
      await expect(
        protectedMemberService.findById('nonexistent-id', mockCaregiverId)
      ).rejects.toThrow('Protected member not found');
    });

    it('should throw forbidden error when accessing another caregiver\'s member', async () => {
      const created = await protectedMemberService.create(mockCaregiverId, {
        firstName: 'Test',
        lastName: 'Member',
        relationship: 'Son',
        birthYear: 2015,
      });

      await expect(
        protectedMemberService.findById(created.id, 'other-caregiver')
      ).rejects.toThrow('You do not have permission to access this member');
    });
  });

  describe('update', () => {
    it('should update a member successfully', async () => {
      const created = await protectedMemberService.create(mockCaregiverId, {
        firstName: 'Original',
        lastName: 'Name',
        relationship: 'Son',
        birthYear: 2015,
      });

      const updateInput: UpdateProtectedMemberInput = {
        firstName: 'Updated',
        status: 'inactive',
      };

      const result = await protectedMemberService.update(
        created.id,
        mockCaregiverId,
        updateInput
      );

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name'); // Unchanged
      expect(result.status).toBe('inactive');
    });

    it('should throw error when updating non-existent member', async () => {
      await expect(
        protectedMemberService.update('nonexistent-id', mockCaregiverId, { firstName: 'Test' })
      ).rejects.toThrow('Protected member not found');
    });

    it('should throw forbidden error when updating another caregiver\'s member', async () => {
      const created = await protectedMemberService.create(mockCaregiverId, {
        firstName: 'Test',
        lastName: 'Member',
        relationship: 'Son',
        birthYear: 2015,
      });

      await expect(
        protectedMemberService.update(created.id, 'other-caregiver', { firstName: 'Hacked' })
      ).rejects.toThrow('You do not have permission to update this member');
    });
  });

  describe('delete', () => {
    it('should delete a member successfully', async () => {
      const created = await protectedMemberService.create(mockCaregiverId, {
        firstName: 'ToDelete',
        lastName: 'Member',
        relationship: 'Son',
        birthYear: 2015,
      });

      await protectedMemberService.delete(created.id, mockCaregiverId);

      // Verify deletion
      const members = await ProtectedMember.find({ id: created.id });
      expect(members).toHaveLength(0);
    });

    it('should throw error when deleting non-existent member', async () => {
      await expect(
        protectedMemberService.delete('nonexistent-id', mockCaregiverId)
      ).rejects.toThrow('Protected member not found');
    });

    it('should throw forbidden error when deleting another caregiver\'s member', async () => {
      const created = await protectedMemberService.create(mockCaregiverId, {
        firstName: 'Test',
        lastName: 'Member',
        relationship: 'Son',
        birthYear: 2015,
      });

      await expect(
        protectedMemberService.delete(created.id, 'other-caregiver')
      ).rejects.toThrow('You do not have permission to delete this member');
    });
  });
});
