import { z } from 'zod';

const relationshipTypes = ['Son', 'Daughter', 'Parent', 'Grandparent', 'Spouse', 'Sibling', 'Other'] as const;
const statusTypes = ['active', 'inactive'] as const;

export const createProtectedMemberSchema = z.object({
  body: z.object({
    firstName: z
      .string({
        required_error: 'First name is required',
      })
      .min(1, 'First name cannot be empty')
      .max(50, 'First name must be less than 50 characters')
      .trim(),
    lastName: z
      .string({
        required_error: 'Last name is required',
      })
      .min(1, 'Last name cannot be empty')
      .max(50, 'Last name must be less than 50 characters')
      .trim(),
    relationship: z.enum(relationshipTypes, {
      required_error: 'Relationship is required',
      invalid_type_error: `Relationship must be one of: ${relationshipTypes.join(', ')}`,
    }),
    birthYear: z
      .number({
        required_error: 'Birth year is required',
        invalid_type_error: 'Birth year must be a number',
      })
      .int('Birth year must be an integer')
      .min(1900, 'Birth year must be 1900 or later')
      .max(new Date().getFullYear(), 'Birth year cannot be in the future'),
    status: z.enum(statusTypes).optional().default('active'),
  }),
});

export const updateProtectedMemberSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Member ID is required',
    }),
  }),
  body: z
    .object({
      firstName: z
        .string()
        .min(1, 'First name cannot be empty')
        .max(50, 'First name must be less than 50 characters')
        .trim()
        .optional(),
      lastName: z
        .string()
        .min(1, 'Last name cannot be empty')
        .max(50, 'Last name must be less than 50 characters')
        .trim()
        .optional(),
      relationship: z.enum(relationshipTypes).optional(),
      birthYear: z
        .number()
        .int('Birth year must be an integer')
        .min(1900, 'Birth year must be 1900 or later')
        .max(new Date().getFullYear(), 'Birth year cannot be in the future')
        .optional(),
      status: z.enum(statusTypes).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

export const memberIdParamSchema = z.object({
  params: z.object({
    id: z.string({
      required_error: 'Member ID is required',
    }),
  }),
});

export type CreateProtectedMemberSchemaType = z.infer<typeof createProtectedMemberSchema>;
export type UpdateProtectedMemberSchemaType = z.infer<typeof updateProtectedMemberSchema>;
