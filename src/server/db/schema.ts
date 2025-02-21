import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  json,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'admin', 'worker', 'company', 'manager'
  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").default(true),
  avatarUrl: text("avatar_url"),
});

export const workerProfiles = pgTable("worker_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  skills: json("skills"),
  experience: integer("experience_years"),
  availability: varchar("availability", { length: 20 }), // 'full-time', 'part-time', 'contract'
  preferredLocation: json("preferred_location"),
  ratePerHour: decimal("rate_per_hour", { precision: 10, scale: 2 }),
  bio: text("bio"),
  certifications: json("certifications"),
  isPublic: boolean("is_public").default(true),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  registrationNumber: varchar("registration_number", { length: 100 }),
  description: text("description"),
  websiteUrl: text("website_url"),
  verifiedAt: timestamp("verified_at"),
});

export const workSites = pgTable("work_sites", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .references(() => companies.id)
    .notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  address: json("address").notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'active', 'completed', 'planned'
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  description: text("description"),
});

export const managerProfiles = pgTable("manager_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  companyId: integer("company_id")
    .references(() => companies.id)
    .notNull(),
  workSiteId: integer("work_site_id").references(() => workSites.id),
  position: varchar("position", { length: 100 }),
  permissions: json("permissions"),
});

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  companyId: integer("company_id")
    .references(() => companies.id)
    .notNull(),
  workSiteId: integer("work_site_id").references(() => workSites.id),
  managerId: integer("manager_id")
    .references(() => managerProfiles.id)
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: json("requirements"),
  salary: json("salary"), // { min, max, type: 'hourly'|'daily'|'monthly' }
  status: varchar("status", { length: 20 }).notNull(), //  'active', 'filled', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
});

export const jobApplications = pgTable("job_applications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id)
    .notNull(),
  workerId: integer("worker_id")
    .references(() => workerProfiles.id)
    .notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'pending', 'accepted', 'rejected', 'withdrawn'
  proposedRate: decimal("proposed_rate", { precision: 10, scale: 2 }),
  coverLetter: text("cover_letter"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id")
    .references(() => jobs.id)
    .notNull(),
  workerId: integer("worker_id")
    .references(() => workerProfiles.id)
    .notNull(),
  managerId: integer("manager_id")
    .references(() => managerProfiles.id)
    .notNull(),
  status: varchar("status", { length: 20 }).notNull(), // 'draft', 'active', 'completed', 'terminated'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  terms: json("terms"),
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id")
    .references(() => contracts.id)
    .notNull(),
  reviewerId: integer("reviewer_id")
    .references(() => users.id)
    .notNull(),
  revieweeId: integer("reviewee_id")
    .references(() => users.id)
    .notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .references(() => users.id)
    .notNull(),
  receiverId: integer("receiver_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  workerProfile: one(workerProfiles, {
    fields: [users.id],
    references: [workerProfiles.userId],
  }),
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
  managerProfile: one(managerProfiles, {
    fields: [users.id],
    references: [managerProfiles.userId],
  }),
  sentMessages: many(messages, { relationName: "userSentMessages" }),
  receivedMessages: many(messages, { relationName: "userReceivedMessages" }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  workSite: one(workSites, {
    fields: [jobs.workSiteId],
    references: [workSites.id],
  }),
  manager: one(managerProfiles, {
    fields: [jobs.managerId],
    references: [managerProfiles.id],
  }),
  applications: many(jobApplications),
  contract: one(contracts),
}));

export const schema = {
  users,
  workerProfiles,
  companies,
  workSites,
  managerProfiles,
  jobs,
  jobApplications,
  contracts,
  reviews,
  messages,
  usersRelations,
  jobsRelations,
};
