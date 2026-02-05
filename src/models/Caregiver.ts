import mongoose, { Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { ICaregiverDocument } from '../types';

const caregiverSchema = new Schema<ICaregiverDocument>(
  {
    id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    supabaseUserId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
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
        delete ret.supabaseUserId;
        return ret;
      },
    },
  }
);

const Caregiver = mongoose.model<ICaregiverDocument>('Caregiver', caregiverSchema);

export default Caregiver;
