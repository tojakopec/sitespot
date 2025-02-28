import { z } from "zod";

const ROLES = ["admin", "worker", "company", "manager"] as const;

// Phone number regex for international format
const PHONE_REGEX = /^\+?[1-9]\d{1,14}$/;

export const userRoleSchema = z.enum(ROLES);

export const createUserSchema = z.object({
  role: userRoleSchema,
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
      {
        message:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
      }
    ),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z
    .string()
    .regex(PHONE_REGEX, { message: "Invalid phone number format" })
    .optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .regex(PHONE_REGEX, { message: "Invalid phone number format" })
    .optional(),
  avatarUrl: z.string().url().optional(),
  email: z.string().email().optional(),
});

// Types inferred from the schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
