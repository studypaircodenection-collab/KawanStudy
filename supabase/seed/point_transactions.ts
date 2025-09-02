import { faker } from "@faker-js/faker";

export interface PointTransactionSeedData {
  id: string;
  user_id: string;
  points: number;
  transaction_type: string;
  source: string;
  source_id?: string;
  description: string;
  created_at: string;
}

const transactionSources = [
  "tutor_session",
  "class_join",
  "daily_challenge",
  "achievement",
  "note_upload",
  "quiz_creation",
  "quiz_completion",
  "profile_completion",
  "social_interaction",
  "note_download",
  "comment_helpful",
  "study_streak",
  "peer_connection",
  "content_rating",
  "bonus_reward",
];

const transactionDescriptions = {
  tutor_session: [
    "Completed tutoring session",
    "Attended study group session",
    "Led a peer tutoring session",
  ],
  daily_challenge: [
    "Completed daily login challenge",
    "Finished daily quiz challenge",
    "Completed profile update challenge",
    "Achieved daily study goal",
  ],
  achievement: [
    "Unlocked new achievement",
    "Milestone achievement earned",
    "Special badge unlocked",
  ],
  note_upload: [
    "Shared study notes with community",
    "Uploaded high-quality notes",
    "Contributed lecture notes",
  ],
  quiz_creation: [
    "Created helpful quiz for peers",
    "Published quiz with high engagement",
    "Contributed practice questions",
  ],
  quiz_completion: [
    "Scored 100% on quiz",
    "Completed challenging quiz",
    "Finished practice test",
  ],
  profile_completion: [
    "Completed profile setup",
    "Updated profile information",
    "Added profile picture",
  ],
  social_interaction: [
    "Helped peer with study question",
    "Received positive feedback",
    "Made new study connection",
  ],
  bonus_reward: [
    "Weekly activity bonus",
    "Top contributor reward",
    "Community appreciation bonus",
  ],
};

export function generatePointTransactionSeedData(
  userIds: string[],
  count: number = 200
): PointTransactionSeedData[] {
  const transactions: PointTransactionSeedData[] = [];

  for (let i = 0; i < count; i++) {
    const transactionType = faker.helpers.arrayElement([
      "earned",
      "spent",
      "bonus",
    ]);
    const source = faker.helpers.arrayElement(transactionSources);
    const descriptions =
      transactionDescriptions[source as keyof typeof transactionDescriptions];
    const description = descriptions
      ? faker.helpers.arrayElement(descriptions)
      : `${source} activity`;

    // Generate realistic point values based on transaction type and source
    let points: number;
    if (transactionType === "earned") {
      switch (source) {
        case "achievement":
          points = faker.number.int({ min: 50, max: 500 });
          break;
        case "daily_challenge":
          points = faker.number.int({ min: 10, max: 100 });
          break;
        case "note_upload":
          points = faker.number.int({ min: 25, max: 150 });
          break;
        case "quiz_creation":
          points = faker.number.int({ min: 50, max: 200 });
          break;
        case "quiz_completion":
          points = faker.number.int({ min: 15, max: 75 });
          break;
        case "bonus_reward":
          points = faker.number.int({ min: 100, max: 1000 });
          break;
        default:
          points = faker.number.int({ min: 5, max: 100 });
      }
    } else if (transactionType === "spent") {
      points = -faker.number.int({ min: 10, max: 200 });
    } else {
      // bonus
      points = faker.number.int({ min: 20, max: 300 });
    }

    const transaction: PointTransactionSeedData = {
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(userIds),
      points,
      transaction_type: transactionType,
      source,
      source_id: faker.helpers.maybe(() => faker.string.uuid(), {
        probability: 0.6,
      }),
      description,
      created_at: faker.date.past({ years: 1 }).toISOString(),
    };

    transactions.push(transaction);
  }

  return transactions.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export function generatePointTransactionInsertSQL(
  transactions: PointTransactionSeedData[]
): string {
  const values = transactions
    .map((transaction) => {
      return `(
      '${transaction.id}',
      '${transaction.user_id}',
      ${transaction.points},
      '${transaction.transaction_type}',
      '${transaction.source}',
      ${transaction.source_id ? `'${transaction.source_id}'` : "NULL"},
      '${transaction.description.replace(/'/g, "''")}',
      '${transaction.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample point transactions
INSERT INTO public.point_transactions (
  id, user_id, points, transaction_type, source, source_id, description, created_at
) VALUES
    ${values};
`;
}
