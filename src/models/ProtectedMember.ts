import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { IProtectedMemberDocument, RelationshipType, MemberStatus } from '../types';

const relationshipTypes: RelationshipType[] = ['Son', 'Daughter', 'Parent', 'Grandparent', 'Spouse', 'Sibling', 'Other'];
const statusTypes: MemberStatus[] = ['active', 'inactive'];

const protectedMemberSchema = new Schema<IProtectedMemberDocument>(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    caregiverId: {
      type: String,
      required: [true, 'Caregiver ID is required'],
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [1, 'First name cannot be empty'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      minlength: [1, 'Last name cannot be empty'],
    },
    relationship: {
      type: String,
      required: [true, 'Relationship is required'],
      enum: {
        values: relationshipTypes,
        message: 'Relationship must be one of: ' + relationshipTypes.join(', '),
      },
    },
    birthYear: {
      type: Number,
      required: [true, 'Birth year is required'],
      min: [1900, 'Birth year must be 1900 or later'],
      max: [new Date().getFullYear(), 'Birth year cannot be in the future'],
    },
    status: {
      type: String,
      enum: {
        values: statusTypes,
        message: 'Status must be either active or inactive',
      },
      default: 'active',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for efficient querying by caregiver
protectedMemberSchema.index({ caregiverId: 1, createdAt: -1 });

const ProtectedMember = mongoose.model<IProtectedMemberDocument>('ProtectedMember', protectedMemberSchema);

export default ProtectedMember;
