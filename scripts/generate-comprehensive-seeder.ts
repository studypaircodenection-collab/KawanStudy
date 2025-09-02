#!/usr/bin/env node

/**
 * KawanStudy Comprehensive Database Seeder
 *
 * This script generates and seeds the database with realistic sample data
 * using Faker.js for all tables based on migration analysis.
 *
 * Usage:
 *   npm run seed:full        # Full comprehensive seeding
 *   npm run seed:minimal     # Minimal essential data only
 *   npm run seed:reset       # Reset and seed fresh
 */

import { createClient } from "@supabase/supabase-js";
import { faker } from "@faker-js/faker";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

// Import all seeder modules
import {
  generateProfileSeedData,
  generateProfileInsertSQL,
  type ProfileSeedData,
} from "../supabase/seed/profile";
import {
  generateAchievementSeedData,
  generateAchievementInsertSQL,
} from "../supabase/seed/achievements";
import {
  generateDailyChallengeSeedData,
  generateDailyChallengeInsertSQL,
} from "../supabase/seed/daily_challenges";
import {
  generatePointTransactionSeedData,
  generatePointTransactionInsertSQL,
} from "../supabase/seed/point_transactions";
import {
  generateUserAchievementSeedData,
  generateUserAchievementInsertSQL,
} from "../supabase/seed/user_achievements";
import {
  generateConversationSeedData,
  generateMessageSeedData,
  generateConversationInsertSQL,
  generateMessageInsertSQL,
} from "../supabase/seed/conversations";
import {
  generateNoteSeedData,
  generateNoteInsertSQL,
} from "../supabase/seed/notes";
import {
  generateQuizSeedData,
  generateQuizQuestionSeedData,
  generateQuizAttemptSeedData,
  generateQuizInsertSQL,
  generateQuizQuestionInsertSQL,
  generateQuizAttemptInsertSQL,
} from "../supabase/seed/quizzes";
import {
  generateNotificationSeedData,
  generateNotificationSettingsSeedData,
  generateNotificationInsertSQL,
  generateNotificationSettingsInsertSQL,
} from "../supabase/seed/notifications";

interface SeederConfig {
  userCount: number;
  noteCount: number;
  quizCount: number;
  conversationCount: number;
  notificationCount: number;
  pointTransactionCount: number;
  messagesPerConversation: number;
  attemptsPerQuiz: number;
}

const configs = {
  minimal: {
    userCount: 10,
    noteCount: 20,
    quizCount: 10,
    conversationCount: 5,
    notificationCount: 30,
    pointTransactionCount: 50,
    messagesPerConversation: 5,
    attemptsPerQuiz: 3,
  },
  full: {
    userCount: 100,
    noteCount: 200,
    quizCount: 75,
    conversationCount: 50,
    notificationCount: 500,
    pointTransactionCount: 800,
    messagesPerConversation: 15,
    attemptsPerQuiz: 10,
  },
};

async function generateComprehensiveSeeder(mode: "minimal" | "full" = "full") {
  console.log(`🌱 Generating ${mode} KawanStudy database seeder...`);

  const config = configs[mode];

  // Set deterministic seed for consistent results
  faker.seed(12345);

  // Generate user IDs first (these would normally come from auth.users)
  const userIds = Array.from({ length: config.userCount }, () =>
    faker.string.uuid()
  );

  console.log("📊 Generating seed data...");

  // 1. Generate core user data
  console.log("  👥 Generating profiles...");
  const profiles = generateProfileSeedData(config.userCount, userIds);

  // 2. Generate gamification data
  console.log("  🏆 Generating achievements...");
  const achievements = generateAchievementSeedData();

  console.log("  📅 Generating daily challenges...");
  const dailyChallenges = generateDailyChallengeSeedData();

  console.log("  💰 Generating point transactions...");
  const pointTransactions = generatePointTransactionSeedData(
    userIds,
    config.pointTransactionCount
  );

  console.log("  🎖️ Generating user achievements...");
  const userAchievements = generateUserAchievementSeedData(
    userIds,
    achievements.map((a) => a.id),
    achievements.map((a) => ({ id: a.id, points_required: a.points_required }))
  );

  // 3. Generate content data
  console.log("  📚 Generating notes...");
  const notes = generateNoteSeedData(userIds, config.noteCount);

  console.log("  🧠 Generating quizzes...");
  const quizzes = generateQuizSeedData(userIds, config.quizCount);

  console.log("  ❓ Generating quiz questions...");
  const quizQuestions = generateQuizQuestionSeedData(quizzes);

  console.log("  📝 Generating quiz attempts...");
  const quizAttempts = generateQuizAttemptSeedData(
    quizzes,
    quizQuestions,
    userIds,
    config.attemptsPerQuiz
  );

  // 4. Generate social data
  console.log("  💬 Generating conversations...");
  const conversations = generateConversationSeedData(
    userIds,
    config.conversationCount
  );

  console.log("  📨 Generating messages...");
  const messages = generateMessageSeedData(
    conversations,
    config.messagesPerConversation
  );

  // 5. Generate notification data
  console.log("  🔔 Generating notifications...");
  const notifications = generateNotificationSeedData(
    userIds,
    config.notificationCount
  );

  console.log("  ⚙️ Generating notification settings...");
  const notificationSettings = generateNotificationSettingsSeedData(userIds);

  // 6. Generate additional interaction data
  console.log("  📊 Generating additional interactions...");
  const noteLikes = generateNoteLikes(
    userIds,
    notes.map((n) => n.id)
  );
  const noteComments = generateNoteComments(
    userIds,
    notes.map((n) => n.id)
  );
  const noteViews = generateNoteViews(
    userIds,
    notes.map((n) => n.id)
  );
  const noteDownloads = generateNoteDownloads(
    userIds,
    notes.map((n) => n.id)
  );

  // Generate SQL
  console.log("🔧 Generating SQL statements...");

  const sqlParts = [
    "-- KawanStudy Comprehensive Database Seeder",
    "-- Generated with Faker.js for realistic development data",
    "-- Mode: " + mode.toUpperCase(),
    `-- Generated on: ${new Date().toISOString()}`,
    "",
    "-- Disable triggers during seeding for performance",
    "SET session_replication_role = replica;",
    "",

    // Core data
    generateProfileInsertSQL(profiles),
    generateAchievementInsertSQL(achievements),
    generateDailyChallengeInsertSQL(dailyChallenges),
    generatePointTransactionInsertSQL(pointTransactions),
    generateUserAchievementInsertSQL(userAchievements),

    // Content data
    generateNoteInsertSQL(notes),
    generateQuizInsertSQL(quizzes),
    generateQuizQuestionInsertSQL(quizQuestions),
    generateQuizAttemptInsertSQL(quizAttempts),

    // Social data
    generateConversationInsertSQL(conversations),
    generateMessageInsertSQL(messages),

    // Notification data
    generateNotificationInsertSQL(notifications),
    generateNotificationSettingsInsertSQL(notificationSettings),

    // Interaction data
    ...generateInteractionSQL(
      noteLikes,
      noteComments,
      noteViews,
      noteDownloads
    ),

    "",
    "-- Re-enable triggers",
    "SET session_replication_role = DEFAULT;",
    "",
    "-- Update sequences and refresh materialized views if any",
    "SELECT setval(pg_get_serial_sequence('public.profiles', 'level'), COALESCE(MAX(level), 1)) FROM public.profiles;",
    "",
    "-- Seeding completed successfully!",
    `-- Total records: ${getRecordCounts(
      profiles,
      achievements,
      dailyChallenges,
      pointTransactions,
      userAchievements,
      notes,
      quizzes,
      quizQuestions,
      quizAttempts,
      conversations,
      messages,
      notifications,
      notificationSettings
    ).join(", ")}`,
  ];

  const sqlContent = sqlParts.join("\n");

  // Write SQL file
  const fileName = `comprehensive_seeder_${mode}_${Date.now()}.sql`;
  const filePath = join(process.cwd(), "supabase", fileName);
  writeFileSync(filePath, sqlContent);

  console.log(`✅ Generated ${mode} seeder: ${fileName}`);
  console.log(`📄 File saved to: ${filePath}`);
  console.log("");
  console.log("📊 Summary:");
  console.log(`  👥 Profiles: ${profiles.length}`);
  console.log(`  🏆 Achievements: ${achievements.length}`);
  console.log(`  📅 Daily Challenges: ${dailyChallenges.length}`);
  console.log(`  💰 Point Transactions: ${pointTransactions.length}`);
  console.log(`  🎖️ User Achievements: ${userAchievements.length}`);
  console.log(`  📚 Notes: ${notes.length}`);
  console.log(`  🧠 Quizzes: ${quizzes.length}`);
  console.log(`  ❓ Quiz Questions: ${quizQuestions.length}`);
  console.log(`  📝 Quiz Attempts: ${quizAttempts.length}`);
  console.log(`  💬 Conversations: ${conversations.length}`);
  console.log(`  📨 Messages: ${messages.length}`);
  console.log(`  🔔 Notifications: ${notifications.length}`);
  console.log("");
  console.log("🚀 To apply this seeder:");
  console.log(`   npm run db:reset && npm run db:seed -- ${fileName}`);

  return filePath;
}

// Helper functions for additional interactions
function generateNoteLikes(userIds: string[], noteIds: string[]): any[] {
  const likes: any[] = [];
  noteIds.forEach((noteId) => {
    const likeCount = faker.number.int({
      min: 0,
      max: Math.min(20, userIds.length),
    });
    const likers = faker.helpers.arrayElements(userIds, likeCount);

    likers.forEach((userId) => {
      likes.push({
        id: faker.string.uuid(),
        note_id: noteId,
        user_id: userId,
        created_at: faker.date.past({ years: 1 }).toISOString(),
      });
    });
  });

  return likes;
}

function generateNoteComments(userIds: string[], noteIds: string[]): any[] {
  const comments: any[] = [];
  noteIds.forEach((noteId) => {
    const commentCount = faker.number.int({ min: 0, max: 5 });

    for (let i = 0; i < commentCount; i++) {
      comments.push({
        id: faker.string.uuid(),
        note_id: noteId,
        user_id: faker.helpers.arrayElement(userIds),
        content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        created_at: faker.date.past({ years: 1 }).toISOString(),
      });
    }
  });

  return comments;
}

function generateNoteViews(userIds: string[], noteIds: string[]): any[] {
  const views: any[] = [];
  noteIds.forEach((noteId) => {
    const viewCount = faker.number.int({
      min: 1,
      max: Math.min(50, userIds.length * 2),
    });

    for (let i = 0; i < viewCount; i++) {
      views.push({
        id: faker.string.uuid(),
        note_id: noteId,
        user_id: faker.helpers.arrayElement(userIds),
        ip_address: faker.internet.ip(),
        user_agent: faker.internet.userAgent(),
        created_at: faker.date.past({ years: 1 }).toISOString(),
      });
    }
  });

  return views;
}

function generateNoteDownloads(userIds: string[], noteIds: string[]): any[] {
  const downloads: any[] = [];
  noteIds.forEach((noteId) => {
    const downloadCount = faker.number.int({
      min: 0,
      max: Math.min(15, userIds.length),
    });
    const downloaders = faker.helpers.arrayElements(userIds, downloadCount);

    downloaders.forEach((userId) => {
      downloads.push({
        id: faker.string.uuid(),
        note_id: noteId,
        user_id: userId,
        ip_address: faker.internet.ip(),
        user_agent: faker.internet.userAgent(),
        created_at: faker.date.past({ years: 1 }).toISOString(),
      });
    });
  });

  return downloads;
}

function generateInteractionSQL(
  likes: any[],
  comments: any[],
  views: any[],
  downloads: any[]
) {
  const sqlParts = [];

  if (likes.length > 0) {
    const likeValues = likes
      .map(
        (like) =>
          `('${like.id}', '${like.note_id}', '${like.user_id}', '${like.created_at}')`
      )
      .join(",\n    ");

    sqlParts.push(`
-- Insert note likes
INSERT INTO public.note_likes (id, note_id, user_id, created_at) VALUES
    ${likeValues};`);
  }

  if (comments.length > 0) {
    const commentValues = comments
      .map(
        (comment) =>
          `('${comment.id}', '${comment.note_id}', '${
            comment.user_id
          }', '${comment.content.replace(/'/g, "''")}', '${
            comment.created_at
          }')`
      )
      .join(",\n    ");

    sqlParts.push(`
-- Insert note comments
INSERT INTO public.note_comments (id, note_id, user_id, content, created_at) VALUES
    ${commentValues};`);
  }

  if (views.length > 0) {
    const viewValues = views
      .map(
        (view) =>
          `('${view.id}', '${view.note_id}', '${view.user_id}', '${view.ip_address}', '${view.user_agent}', '${view.created_at}')`
      )
      .join(",\n    ");

    sqlParts.push(`
-- Insert note views
INSERT INTO public.note_views (id, note_id, user_id, ip_address, user_agent, created_at) VALUES
    ${viewValues};`);
  }

  if (downloads.length > 0) {
    const downloadValues = downloads
      .map(
        (download) =>
          `('${download.id}', '${download.note_id}', '${download.user_id}', '${download.ip_address}', '${download.user_agent}', '${download.created_at}')`
      )
      .join(",\n    ");

    sqlParts.push(`
-- Insert note downloads
INSERT INTO public.note_downloads (id, note_id, user_id, ip_address, user_agent, created_at) VALUES
    ${downloadValues};`);
  }

  return sqlParts;
}

function getRecordCounts(...arrays: any[][]): string[] {
  const names = [
    "profiles",
    "achievements",
    "daily_challenges",
    "point_transactions",
    "user_achievements",
    "notes",
    "quizzes",
    "quiz_questions",
    "quiz_attempts",
    "conversations",
    "messages",
    "notifications",
    "notification_settings",
  ];

  return arrays.map((arr, index) => `${names[index]}: ${arr.length}`);
}

// CLI execution
if (require.main === module) {
  const mode = (process.argv[2] as "minimal" | "full") || "full";

  generateComprehensiveSeeder(mode)
    .then((filePath) => {
      console.log(`🎉 Seeder generation completed!`);
      console.log(`📁 Generated file: ${filePath}`);
    })
    .catch((error) => {
      console.error("❌ Error generating seeder:", error);
      process.exit(1);
    });
}

export { generateComprehensiveSeeder };
