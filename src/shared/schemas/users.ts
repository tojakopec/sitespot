import { z } from "zod";

const ROLES = ["admin", "worker", "company", "manager"] as const;
const AVAILABILITY = ["full-time", "part-time", "contract"] as const;

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
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
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

export const updateManagerSchema = z.object({
  position: z.string().min(1).max(100),
  companyId: z.number().min(1),
  workSiteId: z.number().min(1).optional(),
  permissions: z.array(z.string()).optional(),
});

export const updateWorkerSchema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  certifications: z.array(z.string()).optional(),
  experience: z.number().min(0).max(70).optional(),
  availability: z
    .array(z.enum(AVAILABILITY))
    .min(1, "At least one availability is required")
    .transform((values) => values.map((v) => v.toLowerCase())),
  ratePerHour: z.number().min(0).max(1000).optional(),
  preferredLocation: z.string().max(100).optional(),
  bio: z.string().max(200).optional(),
});

export const updateCompanySchema = z.object({
  companyName: z.string().min(1).max(100),
  registrationNumber: z.string().min(1).max(100),
  description: z.string().min(1).max(200),
  websiteUrl: z.string().url(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  rememberMe: z.boolean().optional(),
});

// Types inferred from the schemas
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export type UpdateManagerInput = z.infer<typeof updateManagerSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
