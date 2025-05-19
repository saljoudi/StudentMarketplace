import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoleEnum = pgEnum("user_role", ["partner", "business"]);
export const questionTypeEnum = pgEnum("question_type", ["multiple_choice", "text", "rating"]);
export const surveyStatusEnum = pgEnum("survey_status", ["draft", "active", "completed"]);
export const payoutStatusEnum = pgEnum("payout_status", ["pending", "approved", "rejected", "completed"]);
export const rewardTypeEnum = pgEnum("reward_type", ["cash", "coupon"]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  role: userRoleEnum("role").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  responses: many(surveyResponses),
  rewards: many(rewards),
  payoutRequests: many(payoutRequests),
  surveys: many(surveys),
}));

// Partner profile with demographic info
export const partnerProfiles = pgTable("partner_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  age: integer("age"),
  gender: text("gender"),
  location: text("location"),
  occupation: text("occupation"),
  education: text("education"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const partnerProfilesRelations = relations(partnerProfiles, ({ one }) => ({
  user: one(users, {
    fields: [partnerProfiles.userId],
    references: [users.id],
  }),
}));

// Business profile
export const businessProfiles = pgTable("business_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  size: text("size"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businessProfilesRelations = relations(businessProfiles, ({ one }) => ({
  user: one(users, {
    fields: [businessProfiles.userId],
    references: [users.id],
  }),
}));

// Surveys
export const surveys = pgTable("surveys", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  status: surveyStatusEnum("status").default("draft").notNull(),
  estimatedTime: integer("estimated_time"),
  reward: integer("reward"),
  maxResponses: integer("max_responses"),
  responseCount: integer("response_count").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const surveysRelations = relations(surveys, ({ one, many }) => ({
  business: one(users, {
    fields: [surveys.businessId],
    references: [users.id],
  }),
  questions: many(questions),
  responses: many(surveyResponses),
}));

// Questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  text: text("text").notNull(),
  type: questionTypeEnum("type").notNull(),
  options: json("options"),
  isRequired: boolean("is_required").default(true),
  order: integer("order").notNull(),
});

export const questionsRelations = relations(questions, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [questions.surveyId],
    references: [surveys.id],
  }),
  answers: many(answers),
}));

// Survey responses
export const surveyResponses = pgTable("survey_responses", {
  id: serial("id").primaryKey(),
  surveyId: integer("survey_id").references(() => surveys.id, { onDelete: 'cascade' }).notNull(),
  partnerId: integer("partner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
});

export const surveyResponsesRelations = relations(surveyResponses, ({ one, many }) => ({
  survey: one(surveys, {
    fields: [surveyResponses.surveyId],
    references: [surveys.id],
  }),
  partner: one(users, {
    fields: [surveyResponses.partnerId],
    references: [users.id],
  }),
  answers: many(answers),
}));

// Answers
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  responseId: integer("response_id").references(() => surveyResponses.id, { onDelete: 'cascade' }).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  value: text("value").notNull(),
});

export const answersRelations = relations(answers, ({ one }) => ({
  response: one(surveyResponses, {
    fields: [answers.responseId],
    references: [surveyResponses.id],
  }),
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
}));

// Rewards
export const rewards = pgTable("rewards", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  type: rewardTypeEnum("type").notNull(),
  amount: integer("amount").notNull(),
  description: text("description"),
  surveyId: integer("survey_id").references(() => surveys.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rewardsRelations = relations(rewards, ({ one }) => ({
  partner: one(users, {
    fields: [rewards.partnerId],
    references: [users.id],
  }),
  survey: one(surveys, {
    fields: [rewards.surveyId],
    references: [surveys.id],
  }),
}));

// Payout requests
export const payoutRequests = pgTable("payout_requests", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: integer("amount").notNull(),
  status: payoutStatusEnum("status").default("pending").notNull(),
  requestedAt: timestamp("requested_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const payoutRequestsRelations = relations(payoutRequests, ({ one }) => ({
  partner: one(users, {
    fields: [payoutRequests.partnerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
  fullName: true,
  role: true,
});

export const insertPartnerProfileSchema = createInsertSchema(partnerProfiles).pick({
  userId: true,
  age: true,
  gender: true,
  location: true,
  occupation: true,
  education: true,
});

export const insertBusinessProfileSchema = createInsertSchema(businessProfiles).pick({
  userId: true,
  companyName: true,
  industry: true,
  size: true,
  website: true,
});

export const insertSurveySchema = createInsertSchema(surveys).pick({
  businessId: true,
  title: true,
  description: true,
  status: true,
  estimatedTime: true,
  reward: true,
  maxResponses: true,
  expiresAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  surveyId: true,
  text: true,
  type: true,
  options: true,
  isRequired: true,
  order: true,
});

export const insertSurveyResponseSchema = createInsertSchema(surveyResponses).pick({
  surveyId: true,
  partnerId: true,
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  responseId: true,
  questionId: true,
  value: true,
});

export const insertRewardSchema = createInsertSchema(rewards).pick({
  partnerId: true,
  type: true,
  amount: true,
  description: true,
  surveyId: true,
  expiresAt: true,
});

export const insertPayoutRequestSchema = createInsertSchema(payoutRequests).pick({
  partnerId: true,
  amount: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type PartnerProfile = typeof partnerProfiles.$inferSelect;
export type InsertPartnerProfile = z.infer<typeof insertPartnerProfileSchema>;

export type BusinessProfile = typeof businessProfiles.$inferSelect;
export type InsertBusinessProfile = z.infer<typeof insertBusinessProfileSchema>;

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = z.infer<typeof insertSurveySchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type SurveyResponse = typeof surveyResponses.$inferSelect;
export type InsertSurveyResponse = z.infer<typeof insertSurveyResponseSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = z.infer<typeof insertPayoutRequestSchema>;
