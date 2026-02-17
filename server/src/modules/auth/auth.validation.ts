import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(6, 'Password must be at least 6 characters')
      .max(128, 'Password must not exceed 128 characters'),
    firstName: z
      .string({ required_error: 'First name is required' })
      .min(1, 'First name is required')
      .max(50, 'First name must not exceed 50 characters')
      .trim(),
    lastName: z
      .string({ required_error: 'Last name is required' })
      .min(1, 'Last name is required')
      .max(50, 'Last name must not exceed 50 characters')
      .trim(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email is required' })
      .email('Invalid email format')
      .trim()
      .toLowerCase(),
    password: z
      .string({ required_error: 'Password is required' })
      .min(1, 'Password is required'),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z
        .string({ required_error: 'Current password is required' })
        .min(1, 'Current password is required'),
      newPassword: z
        .string({ required_error: 'New password is required' })
        .min(6, 'New password must be at least 6 characters')
        .max(128, 'New password must not exceed 128 characters'),
      confirmPassword: z
        .string({ required_error: 'Confirm password is required' })
        .min(1, 'Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      email: z
        .string({ required_error: 'Email is required' })
        .email('Invalid email format')
        .trim()
        .toLowerCase(),
      newPassword: z
        .string({ required_error: 'New password is required' })
        .min(6, 'New password must be at least 6 characters')
        .max(128, 'New password must not exceed 128 characters'),
      confirmPassword: z
        .string({ required_error: 'Confirm password is required' })
        .min(1, 'Confirm password is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
