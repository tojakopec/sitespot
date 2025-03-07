import {
  pgTable,
  check,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  json,
  varchar,
  decimal,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

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
  isActive: boolean("is_active").default(false),
  avatarUrl: text("avatar_url"),
});

export type User = typeof users.$inferSelect;
export type SafeUser = Omit<User, "passwordHash">;

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

export const reviewTypes = {
  WORKER_TO_MANAGER: "worker_to_manager",
  MANAGER_TO_WORKER: "manager_to_worker",
} as const;

export const reviews = pgTable(
  "reviews",
  {
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
    type: varchar("type", { length: 20 })
      .notNull()
      .$type<(typeof reviewTypes)[keyof typeof reviewTypes]>(),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    check("rating_check", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ]
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .references(() => users.id)
    .notNull(),
  receiverId: integer("receiver_id")
    .references(() => users.id)
    .notNull(),
  conversationId: integer("conversation_id")
    .references(() => conversations.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  readAt: timestamp("read_at"),
});

export const conversations = pgTable(
  "conversations",
  {
    id: serial("id").primaryKey(),
    participantOne: integer("sender_id")
      .references(() => users.id)
      .notNull(),
    participantTwo: integer("receiver_id")
      .references(() => users.id)
      .notNull(),
    lastMessageAt: timestamp("last_message_at").defaultNow(),
    lastMessage: text("last_message"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    check(
      "unique_participants",
      sql`${table.participantOne} < ${table.participantTwo}`
    ),
  ]
);

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
  contracts: many(contracts),
}));

export const jobApplicationsRelations = relations(
  jobApplications,
  ({ one }) => ({
    job: one(jobs, {
      fields: [jobApplications.jobId],
      references: [jobs.id],
    }),
    worker: one(workerProfiles, {
      fields: [jobApplications.workerId],
      references: [workerProfiles.id],
    }),
  })
);

export const contractsRelations = relations(contracts, ({ one }) => ({
  job: one(jobs, {
    fields: [contracts.jobId],
    references: [jobs.id],
  }),
  worker: one(workerProfiles, {
    fields: [contracts.workerId],
    references: [workerProfiles.id],
  }),
  manager: one(managerProfiles, {
    fields: [contracts.managerId],
    references: [managerProfiles.id],
  }),
}));

export const conversationsRelations = relations(conversations, ({ many }) => ({
  messages: many(messages, {
    relationName: "conversationMessages",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  contract: one(contracts, {
    fields: [reviews.contractId],
    references: [contracts.id],
  }),
  reviewer: one(users, {
    fields: [reviews.reviewerId],
    references: [users.id],
  }),
  reviewee: one(users, {
    fields: [reviews.revieweeId],
    references: [users.id],
  }),
}));

export const workerProfilesRelations = relations(
  workerProfiles,
  ({ many }) => ({
    contracts: many(contracts),
    jobApplications: many(jobApplications),
  })
);

export const managerProfilesRelations = relations(
  managerProfiles,
  ({ many }) => ({
    contracts: many(contracts),
  })
);

export const workSitesRelations = relations(workSites, ({ one, many }) => ({
  company: one(companies, {
    fields: [workSites.companyId],
    references: [companies.id],
  }),
  jobs: many(jobs),
  managers: many(managerProfiles),
}));

export const createReviewValidationTrigger = sql`
CREATE OR REPLACE FUNCTION validate_review_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- For worker reviewing manager
  IF NEW.type = 'worker_to_manager' THEN
    -- Check if reviewer is the worker and reviewee is the manager from the contract
    IF NOT EXISTS (
      SELECT 1 FROM contracts c
      JOIN worker_profiles wp ON c.worker_id = wp.id
      JOIN manager_profiles mp ON c.manager_id = mp.id
      WHERE c.id = NEW.contract_id 
      AND wp.user_id = NEW.reviewer_id
      AND mp.user_id = NEW.reviewee_id
    ) THEN
      RAISE EXCEPTION 'Invalid reviewer/reviewee for worker_to_manager review';
    END IF;
  
  -- For manager reviewing worker
  ELSIF NEW.type = 'manager_to_worker' THEN
    -- Check if reviewer is the manager and reviewee is the worker from the contract
    IF NOT EXISTS (
      SELECT 1 FROM contracts c
      JOIN manager_profiles mp ON c.manager_id = mp.id
      JOIN worker_profiles wp ON c.worker_id = wp.id
      WHERE c.id = NEW.contract_id 
      AND mp.user_id = NEW.reviewer_id
      AND wp.user_id = NEW.reviewee_id
    ) THEN
      RAISE EXCEPTION 'Invalid reviewer/reviewee for manager_to_worker review';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_review_participants_trigger
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION validate_review_participants();
`;

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
  conversations,
  conversationsRelations,
  messagesRelations,
  usersRelations,
  jobsRelations,
  contractsRelations,
  jobApplicationsRelations,
  reviewsRelations,
  workerProfilesRelations,
  managerProfilesRelations,
  workSitesRelations,
  createReviewValidationTrigger,
};
