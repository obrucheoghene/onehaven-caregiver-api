import ProtectedMember from '../models/ProtectedMember';
import { IProtectedMember, CreateProtectedMemberInput, UpdateProtectedMemberInput } from '../types';
import { ApiError } from '../middleware/errorHandler';
import memberEventEmitter from '../events/eventEmitter';
import logger from '../utils/logger';

export class ProtectedMemberService {
  async create(caregiverId: string, input: CreateProtectedMemberInput): Promise<IProtectedMember> {
    const member = new ProtectedMember({
      caregiverId,
      ...input,
    });

    await member.save();
    logger.info(`Protected member created: ${member.id} for caregiver: ${caregiverId}`);

    // Emit event
    memberEventEmitter.emitMemberEvent('member_added', caregiverId, member.id);

    return {
      id: member.id,
      caregiverId: member.caregiverId,
      firstName: member.firstName,
      lastName: member.lastName,
      relationship: member.relationship,
      birthYear: member.birthYear,
      status: member.status,
      createdAt: member.createdAt,
    };
  }

  async findAllByCaregiverId(caregiverId: string): Promise<IProtectedMember[]> {
    const members = await ProtectedMember.find({ caregiverId }).sort({ createdAt: -1 });

    return members.map((member) => ({
      id: member.id,
      caregiverId: member.caregiverId,
      firstName: member.firstName,
      lastName: member.lastName,
      relationship: member.relationship,
      birthYear: member.birthYear,
      status: member.status,
      createdAt: member.createdAt,
    }));
  }

  async findById(memberId: string, caregiverId: string): Promise<IProtectedMember> {
    const member = await ProtectedMember.findOne({ id: memberId });

    if (!member) {
      throw ApiError.notFound('Protected member not found');
    }

    // RBAC: Ensure the member belongs to the authenticated caregiver
    if (member.caregiverId !== caregiverId) {
      throw ApiError.forbidden('You do not have permission to access this member');
    }

    return {
      id: member.id,
      caregiverId: member.caregiverId,
      firstName: member.firstName,
      lastName: member.lastName,
      relationship: member.relationship,
      birthYear: member.birthYear,
      status: member.status,
      createdAt: member.createdAt,
    };
  }

  async update(
    memberId: string,
    caregiverId: string,
    input: UpdateProtectedMemberInput
  ): Promise<IProtectedMember> {
    const member = await ProtectedMember.findOne({ id: memberId });

    if (!member) {
      throw ApiError.notFound('Protected member not found');
    }

    // RBAC: Ensure the member belongs to the authenticated caregiver
    if (member.caregiverId !== caregiverId) {
      throw ApiError.forbidden('You do not have permission to update this member');
    }

    // Update fields
    if (input.firstName !== undefined) member.firstName = input.firstName;
    if (input.lastName !== undefined) member.lastName = input.lastName;
    if (input.relationship !== undefined) member.relationship = input.relationship;
    if (input.birthYear !== undefined) member.birthYear = input.birthYear;
    if (input.status !== undefined) member.status = input.status;

    await member.save();
    logger.info(`Protected member updated: ${member.id}`);

    // Emit event
    memberEventEmitter.emitMemberEvent('member_updated', caregiverId, member.id);

    return {
      id: member.id,
      caregiverId: member.caregiverId,
      firstName: member.firstName,
      lastName: member.lastName,
      relationship: member.relationship,
      birthYear: member.birthYear,
      status: member.status,
      createdAt: member.createdAt,
    };
  }

  async delete(memberId: string, caregiverId: string): Promise<void> {
    const member = await ProtectedMember.findOne({ id: memberId });

    if (!member) {
      throw ApiError.notFound('Protected member not found');
    }

    // RBAC: Ensure the member belongs to the authenticated caregiver
    if (member.caregiverId !== caregiverId) {
      throw ApiError.forbidden('You do not have permission to delete this member');
    }

    await ProtectedMember.deleteOne({ id: memberId });
    logger.info(`Protected member deleted: ${memberId}`);

    // Emit event
    memberEventEmitter.emitMemberEvent('member_deleted', caregiverId, memberId);
  }
}

export default new ProtectedMemberService();
