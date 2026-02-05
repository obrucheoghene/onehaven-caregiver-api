import { Request } from "express";
import { Document, Types } from "mongoose";

// Relationship types for protected members
export type RelationshipType =
  | "Son"
  | "Daughter"
  | "Parent"
  | "Grandparent"
  | "Spouse"
  | "Sibling"
  | "Other";

// Status types for protected members
export type MemberStatus = "active" | "inactive";

// Caregiver interface
export interface ICaregiver {
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Caregiver Mongoose document
export interface ICaregiverDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  supabaseUserId: string;
  name: string;
  email: string;
  createdAt: Date;
}

// Protected Member interface
export interface IProtectedMember {
  id: string;
  caregiverId: string;
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  birthYear: number;
  status: MemberStatus;
  createdAt: Date;
}

// Protected Member Mongoose document
export interface IProtectedMemberDocument extends Document {
  _id: Types.ObjectId;
  id: string;
  caregiverId: string;
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  birthYear: number;
  status: MemberStatus;
  createdAt: Date;
}

// Authenticated request with caregiver info
export interface AuthRequest extends Request {
  caregiver?: ICaregiver;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

// Event types
export type MemberEventType =
  | "member_added"
  | "member_updated"
  | "member_deleted";

export interface MemberEventPayload {
  caregiverId: string;
  memberId: string;
  timestamp: Date;
}

// Auth types
export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  caregiver: Omit<ICaregiver, "supabaseUserId">;
}

// Protected Member input types
export interface CreateProtectedMemberInput {
  firstName: string;
  lastName: string;
  relationship: RelationshipType;
  birthYear: number;
  status?: MemberStatus;
}

export interface UpdateProtectedMemberInput {
  firstName?: string;
  lastName?: string;
  relationship?: RelationshipType;
  birthYear?: number;
  status?: MemberStatus;
}
