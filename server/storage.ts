import { users, partnerProfiles, businessProfiles, surveys, questions, surveyResponses, answers, rewards, payoutRequests, type User, type InsertUser, type InsertPartnerProfile, type InsertBusinessProfile, type Survey, type InsertSurvey, type Question, type InsertQuestion, type SurveyResponse, type InsertSurveyResponse, type Answer, type InsertAnswer, type Reward, type InsertReward, type PayoutRequest, type InsertPayoutRequest } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, lt, not, or, isNull, count, sum } from "drizzle-orm";
import session from "express-session";
import { format, subDays } from 'date-fns';
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PostgresStore = connectPgSimple(session);

export interface IStorage {
  sessionStore: any; // Using any temporarily to resolve type issues

  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Profile methods
  createPartnerProfile(profile: InsertPartnerProfile): Promise<void>;
  createBusinessProfile(profile: InsertBusinessProfile): Promise<void>;

  // Survey methods
  getSurvey(id: number): Promise<Survey | undefined>;
  getSurveyWithQuestions(id: number): Promise<{ survey: Survey, questions: Question[] } | undefined>;
  getAvailableSurveysForPartner(partnerId: number): Promise<any[]>;
  getCompletedSurveysForPartner(partnerId: number): Promise<any[]>;
  getSurveysForBusiness(businessId: number): Promise<any[]>;
  createSurvey(survey: InsertSurvey): Promise<Survey>;
  incrementSurveyResponseCount(surveyId: number): Promise<void>;
  
  // Question methods
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // Survey response methods
  createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse>;
  getPartnerSurveyResponse(partnerId: number, surveyId: number): Promise<SurveyResponse | undefined>;
  
  // Answer methods
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  
  // Reward methods
  createReward(reward: InsertReward): Promise<Reward>;
  getRewardsForPartner(partnerId: number): Promise<Reward[]>;
  getPartnerWallet(partnerId: number): Promise<{ cashBalance: number, couponsCount: number }>;
  
  // Payout methods
  createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest>;
  
  // Analytics methods
  getSurveyResponseCounts(surveyId: number): Promise<{ dates: string[], counts: number[] }>;
  getSurveyDemographics(surveyId: number): Promise<any>;
  getSurveyResultsForExport(surveyId: number): Promise<{ questions: Question[], responses: any[] }>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Profile methods
  async createPartnerProfile(profile: InsertPartnerProfile): Promise<void> {
    await db.insert(partnerProfiles).values(profile);
  }

  async createBusinessProfile(profile: InsertBusinessProfile): Promise<void> {
    await db.insert(businessProfiles).values(profile);
  }

  // Survey methods
  async getSurvey(id: number): Promise<Survey | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    return survey;
  }

  async getSurveyWithQuestions(id: number): Promise<{ survey: Survey, questions: Question[] } | undefined> {
    const [survey] = await db.select().from(surveys).where(eq(surveys.id, id));
    
    if (!survey) {
      return undefined;
    }

    const questionList = await db.select().from(questions)
      .where(eq(questions.surveyId, id))
      .orderBy(questions.order);

    return {
      survey,
      questions: questionList
    };
  }

  async getAvailableSurveysForPartner(partnerId: number): Promise<any[]> {
    // Get surveys that:
    // 1. Are active
    // 2. Haven't been completed by the partner
    // 3. Haven't reached max responses
    // 4. Haven't expired
    
    try {
      // Get IDs of surveys the partner has already completed
      const completedSurveyResponses = await db.select({ surveyId: surveyResponses.surveyId })
        .from(surveyResponses)
        .where(eq(surveyResponses.partnerId, partnerId));
      
      const completedIds = completedSurveyResponses.map(r => r.surveyId);
      const now = new Date();

      // Query for available surveys
      const availableSurveys = await db.select({
        id: surveys.id,
        title: surveys.title,
        description: surveys.description,
        estimatedTime: surveys.estimatedTime,
        reward: surveys.reward,
        expiresAt: surveys.expiresAt,
        questionCount: sql<number>`(select count(*) from ${questions} where ${questions.surveyId} = ${surveys.id})`
      })
      .from(surveys)
      .where(
        and(
          eq(surveys.status, 'active'),
          completedIds.length > 0 
            ? not(sql`${surveys.id} IN (${completedIds.join(',')})`) 
            : sql`1=1`, // If no completed surveys, don't filter
          or(
            isNull(surveys.maxResponses),
            lt(surveys.responseCount, surveys.maxResponses)
          ),
          or(
            isNull(surveys.expiresAt),
            sql`${surveys.expiresAt} > ${now}`
          )
        )
      );

      return availableSurveys;
    } catch (error) {
      console.error("Error fetching available surveys:", error);
      return [];
    }
  }

  async getCompletedSurveysForPartner(partnerId: number): Promise<any[]> {
    const completedSurveys = await db.select({
      id: surveys.id,
      title: surveys.title,
      description: surveys.description,
      completedAt: surveyResponses.completedAt,
      reward: surveys.reward
    })
    .from(surveyResponses)
    .innerJoin(surveys, eq(surveyResponses.surveyId, surveys.id))
    .where(eq(surveyResponses.partnerId, partnerId))
    .orderBy(desc(surveyResponses.completedAt));

    return completedSurveys;
  }

  async getSurveysForBusiness(businessId: number): Promise<any[]> {
    const businessSurveys = await db.select({
      id: surveys.id,
      title: surveys.title,
      description: surveys.description,
      status: surveys.status,
      responseCount: surveys.responseCount,
      maxResponses: surveys.maxResponses,
      expiresAt: surveys.expiresAt,
      createdAt: surveys.createdAt,
      questionCount: sql<number>`(select count(*) from ${questions} where ${questions.surveyId} = ${surveys.id})`
    })
    .from(surveys)
    .where(eq(surveys.businessId, businessId))
    .orderBy(desc(surveys.createdAt));

    return businessSurveys;
  }

  async createSurvey(survey: InsertSurvey): Promise<Survey> {
    const [newSurvey] = await db.insert(surveys).values(survey).returning();
    return newSurvey;
  }

  async incrementSurveyResponseCount(surveyId: number): Promise<void> {
    await db.update(surveys)
      .set({ responseCount: sql`${surveys.responseCount} + 1` })
      .where(eq(surveys.id, surveyId));
  }

  // Question methods
  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  // Survey response methods
  async createSurveyResponse(response: InsertSurveyResponse): Promise<SurveyResponse> {
    const [newResponse] = await db.insert(surveyResponses).values(response).returning();
    return newResponse;
  }

  async getPartnerSurveyResponse(partnerId: number, surveyId: number): Promise<SurveyResponse | undefined> {
    const [response] = await db.select()
      .from(surveyResponses)
      .where(
        and(
          eq(surveyResponses.partnerId, partnerId),
          eq(surveyResponses.surveyId, surveyId)
        )
      );
    return response;
  }

  // Answer methods
  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const [newAnswer] = await db.insert(answers).values(answer).returning();
    return newAnswer;
  }

  // Reward methods
  async createReward(reward: InsertReward): Promise<Reward> {
    const [newReward] = await db.insert(rewards).values(reward).returning();
    return newReward;
  }

  async getRewardsForPartner(partnerId: number): Promise<Reward[]> {
    const partnerRewards = await db.select({
      id: rewards.id,
      type: rewards.type,
      amount: rewards.amount,
      description: rewards.description,
      surveyId: rewards.surveyId,
      surveyTitle: surveys.title,
      expiresAt: rewards.expiresAt,
      createdAt: rewards.createdAt
    })
    .from(rewards)
    .leftJoin(surveys, eq(rewards.surveyId, surveys.id))
    .where(eq(rewards.partnerId, partnerId))
    .orderBy(desc(rewards.createdAt));

    return partnerRewards;
  }

  async getPartnerWallet(partnerId: number): Promise<{ cashBalance: number, couponsCount: number }> {
    // Calculate cash balance (all cash rewards - all completed payout requests)
    const [cashResult] = await db.select({
      total: sum(rewards.amount)
    })
    .from(rewards)
    .where(
      and(
        eq(rewards.partnerId, partnerId),
        eq(rewards.type, 'cash')
      )
    );

    const [payoutsResult] = await db.select({
      total: sum(payoutRequests.amount)
    })
    .from(payoutRequests)
    .where(
      and(
        eq(payoutRequests.partnerId, partnerId),
        eq(payoutRequests.status, 'completed')
      )
    );

    // Count coupons
    const [couponsResult] = await db.select({
      count: count()
    })
    .from(rewards)
    .where(
      and(
        eq(rewards.partnerId, partnerId),
        eq(rewards.type, 'coupon')
      )
    );

    const cashBalance = (cashResult.total || 0) - (payoutsResult.total || 0);
    const couponsCount = couponsResult.count || 0;

    return {
      cashBalance,
      couponsCount
    };
  }

  // Payout methods
  async createPayoutRequest(request: InsertPayoutRequest): Promise<PayoutRequest> {
    const [newRequest] = await db.insert(payoutRequests).values(request).returning();
    return newRequest;
  }

  // Analytics methods
  async getSurveyResponseCounts(surveyId: number): Promise<{ dates: string[], counts: number[] }> {
    // Get the last 30 days
    const days = 30;
    const dates = [];
    const counts = Array(days).fill(0);
    
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), days - i - 1);
      dates.push(format(date, 'MMM dd'));
    }
    
    // Get response counts for each day
    const results = await db.execute(sql`
      SELECT date_trunc('day', ${surveyResponses.completedAt}) as day, count(*) as count
      FROM ${surveyResponses}
      WHERE ${surveyResponses.surveyId} = ${surveyId}
      AND ${surveyResponses.completedAt} >= date_trunc('day', now()) - interval '${days} days'
      GROUP BY day
      ORDER BY day
    `);
    
    for (const row of results) {
      const dayIndex = Math.floor((new Date(row.day).getTime() - subDays(new Date(), days).getTime()) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < days) {
        counts[dayIndex] = parseInt(row.count);
      }
    }
    
    return { dates, counts };
  }

  async getSurveyDemographics(surveyId: number): Promise<any> {
    // Get age distribution
    const ageDistribution = await db.execute(sql`
      SELECT
        CASE 
          WHEN ${partnerProfiles.age} < 18 THEN 'Under 18'
          WHEN ${partnerProfiles.age} BETWEEN 18 AND 24 THEN '18-24'
          WHEN ${partnerProfiles.age} BETWEEN 25 AND 34 THEN '25-34'
          WHEN ${partnerProfiles.age} BETWEEN 35 AND 44 THEN '35-44'
          WHEN ${partnerProfiles.age} BETWEEN 45 AND 54 THEN '45-54'
          WHEN ${partnerProfiles.age} >= 55 THEN '55+'
          ELSE 'Unknown'
        END as age_group,
        count(*) as count
      FROM ${surveyResponses}
      JOIN ${partnerProfiles} ON ${surveyResponses.partnerId} = ${partnerProfiles.userId}
      WHERE ${surveyResponses.surveyId} = ${surveyId}
      GROUP BY age_group
      ORDER BY age_group
    `);
    
    // Get gender distribution
    const genderDistribution = await db.execute(sql`
      SELECT
        COALESCE(${partnerProfiles.gender}, 'Unknown') as gender,
        count(*) as count
      FROM ${surveyResponses}
      JOIN ${partnerProfiles} ON ${surveyResponses.partnerId} = ${partnerProfiles.userId}
      WHERE ${surveyResponses.surveyId} = ${surveyId}
      GROUP BY gender
      ORDER BY count DESC
    `);
    
    // Get location distribution
    const locationDistribution = await db.execute(sql`
      SELECT
        COALESCE(${partnerProfiles.location}, 'Unknown') as location,
        count(*) as count
      FROM ${surveyResponses}
      JOIN ${partnerProfiles} ON ${surveyResponses.partnerId} = ${partnerProfiles.userId}
      WHERE ${surveyResponses.surveyId} = ${surveyId}
      GROUP BY location
      ORDER BY count DESC
      LIMIT 5
    `);
    
    return {
      age: ageDistribution,
      gender: genderDistribution,
      location: locationDistribution
    };
  }

  async getSurveyResultsForExport(surveyId: number): Promise<{ questions: Question[], responses: any[] }> {
    // Get all questions for the survey
    const surveyQuestions = await db.select()
      .from(questions)
      .where(eq(questions.surveyId, surveyId))
      .orderBy(questions.order);
    
    // Get all responses with their answers
    const responses = await db.select({
      id: surveyResponses.id,
      partnerId: surveyResponses.partnerId,
      completedAt: surveyResponses.completedAt
    })
    .from(surveyResponses)
    .where(eq(surveyResponses.surveyId, surveyId))
    .orderBy(desc(surveyResponses.completedAt));
    
    // For each response, get all answers
    for (const response of responses) {
      response.answers = await db.select()
        .from(answers)
        .where(eq(answers.responseId, response.id));
    }
    
    return {
      questions: surveyQuestions,
      responses
    };
  }
}

export const storage = new DatabaseStorage();
