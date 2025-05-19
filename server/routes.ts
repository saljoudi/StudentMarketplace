import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { eq, desc, and, sql } from "drizzle-orm";
import { 
  answers,
  questions,
  rewards,
  surveys,
  surveyResponses,
  payoutRequests
} from "@shared/schema";
import { createObjectCsvStringifier } from "csv-writer";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication and get middleware
  const { isAuthenticated, isPartner, isBusiness } = setupAuth(app);

  // Partner routes
  // Get available surveys for a partner
  app.get("/api/partner/surveys", isPartner, async (req, res) => {
    try {
      const availableSurveys = await storage.getAvailableSurveysForPartner(req.user.id);
      res.json(availableSurveys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch available surveys", error: error.message });
    }
  });

  // Get completed surveys for a partner
  app.get("/api/partner/surveys/completed", isPartner, async (req, res) => {
    try {
      const completedSurveys = await storage.getCompletedSurveysForPartner(req.user.id);
      res.json(completedSurveys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed surveys", error: error.message });
    }
  });

  // Get survey details with questions
  app.get("/api/surveys/:id", isAuthenticated, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const survey = await storage.getSurveyWithQuestions(surveyId);
      
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      res.json(survey);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch survey", error: error.message });
    }
  });

  // Submit survey response
  app.post("/api/partner/surveys/:id/responses", isPartner, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      const partnerId = req.user.id;
      const answers = req.body.answers;
      
      // Check if survey exists
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      // Check if partner already completed this survey
      const existing = await storage.getPartnerSurveyResponse(partnerId, surveyId);
      if (existing) {
        return res.status(400).json({ message: "You have already completed this survey" });
      }
      
      // Create survey response
      const response = await storage.createSurveyResponse({
        surveyId,
        partnerId
      });
      
      // Save answers
      for (const answer of answers) {
        await storage.createAnswer({
          responseId: response.id,
          questionId: answer.questionId,
          value: answer.value
        });
      }
      
      // Update survey response count
      await storage.incrementSurveyResponseCount(surveyId);
      
      // Create reward if survey has one
      if (survey.reward && survey.reward > 0) {
        await storage.createReward({
          partnerId,
          type: 'cash',
          amount: survey.reward,
          description: `Reward for completing "${survey.title}"`,
          surveyId
        });
      }
      
      res.status(201).json({ message: "Survey completed successfully", responseId: response.id });
    } catch (error) {
      res.status(500).json({ message: "Failed to submit survey response", error: error.message });
    }
  });

  // Get partner rewards
  app.get("/api/partner/rewards", isPartner, async (req, res) => {
    try {
      const rewards = await storage.getRewardsForPartner(req.user.id);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards", error: error.message });
    }
  });

  // Get partner wallet summary
  app.get("/api/partner/wallet", isPartner, async (req, res) => {
    try {
      const wallet = await storage.getPartnerWallet(req.user.id);
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wallet", error: error.message });
    }
  });

  // Create payout request
  app.post("/api/partner/payouts", isPartner, async (req, res) => {
    try {
      const partnerId = req.user.id;
      const { amount } = req.body;
      
      // Check if amount is valid
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      // Check if partner has enough balance
      const wallet = await storage.getPartnerWallet(partnerId);
      if (wallet.cashBalance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Create payout request
      const payoutRequest = await storage.createPayoutRequest({
        partnerId,
        amount
      });
      
      res.status(201).json(payoutRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to create payout request", error: error.message });
    }
  });

  // Business routes
  // Get business surveys
  app.get("/api/business/surveys", isBusiness, async (req, res) => {
    try {
      const surveys = await storage.getSurveysForBusiness(req.user.id);
      res.json(surveys);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch surveys", error: error.message });
    }
  });

  // Create a new survey
  app.post("/api/business/surveys", isBusiness, async (req, res) => {
    try {
      const businessId = req.user.id;
      const { title, description, estimatedTime, reward, maxResponses, expiresAt, questions } = req.body;
      
      // Create survey
      const survey = await storage.createSurvey({
        businessId,
        title,
        description,
        status: 'active',
        estimatedTime,
        reward,
        maxResponses,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });
      
      // Create questions
      if (questions && Array.isArray(questions)) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          await storage.createQuestion({
            surveyId: survey.id,
            text: q.text,
            type: q.type,
            options: q.options,
            isRequired: q.isRequired !== false,
            order: i + 1
          });
        }
      }
      
      res.status(201).json(survey);
    } catch (error) {
      res.status(500).json({ message: "Failed to create survey", error: error.message });
    }
  });

  // Get survey response counts
  app.get("/api/business/surveys/:id/results/counts", isBusiness, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      
      // Check if survey exists and belongs to the business
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      if (survey.businessId !== req.user.id) {
        return res.status(403).json({ message: "You don't have access to this survey" });
      }
      
      const responseCounts = await storage.getSurveyResponseCounts(surveyId);
      res.json(responseCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch response counts", error: error.message });
    }
  });

  // Get survey demographics
  app.get("/api/business/surveys/:id/results/demographics", isBusiness, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      
      // Check if survey exists and belongs to the business
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      if (survey.businessId !== req.user.id) {
        return res.status(403).json({ message: "You don't have access to this survey" });
      }
      
      const demographics = await storage.getSurveyDemographics(surveyId);
      res.json(demographics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch demographics", error: error.message });
    }
  });

  // Export survey results as CSV
  app.get("/api/business/surveys/:id/results/export", isBusiness, async (req, res) => {
    try {
      const surveyId = parseInt(req.params.id);
      
      // Check if survey exists and belongs to the business
      const survey = await storage.getSurvey(surveyId);
      if (!survey) {
        return res.status(404).json({ message: "Survey not found" });
      }
      
      if (survey.businessId !== req.user.id) {
        return res.status(403).json({ message: "You don't have access to this survey" });
      }
      
      const results = await storage.getSurveyResultsForExport(surveyId);
      
      // Prepare CSV data
      const header = ['Response ID', 'Completed At'];
      const questionMap = new Map();
      const csvData = [];
      
      // Prepare headers based on questions
      results.questions.forEach(q => {
        header.push(q.text);
        questionMap.set(q.id, q.text);
      });
      
      // Prepare rows
      results.responses.forEach(response => {
        const row = {
          'Response ID': response.id,
          'Completed At': response.completedAt
        };
        
        // Add answer values for each question
        response.answers.forEach(answer => {
          const questionText = questionMap.get(answer.questionId);
          if (questionText) {
            row[questionText] = answer.value;
          }
        });
        
        csvData.push(row);
      });
      
      // Create CSV
      const csvStringifier = createObjectCsvStringifier({
        header: header.map(title => ({ id: title, title }))
      });
      
      const csvString = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(csvData);
      
      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="survey_${surveyId}_results.csv"`);
      
      res.send(csvString);
    } catch (error) {
      res.status(500).json({ message: "Failed to export survey results", error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
