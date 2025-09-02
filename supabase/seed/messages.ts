import { faker } from "@faker-js/faker";

export interface MessageSeedData {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  metadata: object;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
}

// This file handles message-specific seeding logic
// The actual message generation is handled in conversations.ts
// This file can be used for additional message-related utilities

export function generateAdditionalMessageMetadata(messageType: string): object {
  switch (messageType) {
    case "image":
      return {
        file_url: faker.image.url(),
        file_size: faker.number.int({ min: 100000, max: 5000000 }),
        file_type: "image/jpeg",
      };
    case "file":
      return {
        file_url: faker.internet.url(),
        file_name: faker.system.fileName(),
        file_size: faker.number.int({ min: 10000, max: 10000000 }),
        file_type: faker.helpers.arrayElement([
          "application/pdf",
          "application/docx",
          "text/plain",
        ]),
      };
    default:
      return {};
  }
}

export function generateStudyRelatedMessage(): string {
  const messageTypes = [
    () =>
      `Can you help me with ${faker.helpers.arrayElement([
        "calculus",
        "physics",
        "chemistry",
        "programming",
        "statistics",
      ])}?`,
    () =>
      `Thanks for sharing those ${faker.helpers.arrayElement([
        "notes",
        "resources",
        "practice problems",
      ])}!`,
    () =>
      `I'm preparing for the ${faker.helpers.arrayElement([
        "midterm",
        "final exam",
        "quiz",
        "presentation",
      ])}. Any tips?`,
    () =>
      `Found this helpful ${faker.helpers.arrayElement([
        "video",
        "article",
        "tutorial",
      ])} that might interest you`,
    () =>
      `Want to study together for ${faker.helpers.arrayElement([
        "tomorrow's test",
        "the upcoming assignment",
        "next week's exam",
      ])}?`,
    () =>
      `Your explanation of ${faker.helpers.arrayElement([
        "derivatives",
        "molecular structure",
        "data structures",
        "economic principles",
      ])} was super clear!`,
    () =>
      `Can we go over ${faker.helpers.arrayElement([
        "chapter 5",
        "the last lecture",
        "problem set 3",
        "the assignment requirements",
      ])} together?`,
    () =>
      `I'm still confused about ${faker.helpers.arrayElement([
        "this concept",
        "the formula",
        "the methodology",
        "the theory",
      ])}. Mind explaining again?`,
  ];

  return faker.helpers.arrayElement(messageTypes)();
}

export {
  generateMessageSeedData,
  generateMessageInsertSQL,
} from "./conversations";
