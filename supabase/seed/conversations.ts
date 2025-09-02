import { faker } from "@faker-js/faker";

export interface ConversationSeedData {
  id: string;
  participant_1: string;
  participant_2: string;
  created_at: string;
  updated_at: string;
}

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

const studyTopics = [
  "Math assignments",
  "Programming concepts",
  "History research",
  "Chemistry lab help",
  "Physics problems",
  "Literature analysis",
  "Business case studies",
  "Statistics homework",
  "Biology diagrams",
  "Economics theories",
  "Engineering projects",
  "Language practice",
  "Art projects",
  "Psychology studies",
];

const messageTemplates = [
  // Study-related messages
  "Hey! Can you help me understand this concept?",
  "Thanks for sharing those notes, they're really helpful!",
  "Do you have any tips for the upcoming exam?",
  "I found a great resource for our assignment",
  "Want to form a study group for this subject?",
  "Your explanation really cleared things up for me",
  "Can we schedule a study session this week?",
  "I'm struggling with this topic, any advice?",
  "The quiz you created was really useful!",
  "Let's work on this project together",

  // Social/friendly messages
  "How's your semester going so far?",
  "Good luck with your presentation tomorrow!",
  "Thanks for being such a great study partner",
  "Hope you did well on the exam!",
  "Happy to help anytime you need it",
  "See you in the library later?",
  "That was a productive study session",
  "Your notes are always so well organized",
  "Looking forward to our next study meeting",
  "Have a great weekend!",

  // Academic discussion
  "I think the answer might be different because...",
  "According to the textbook, this concept relates to...",
  "Have you tried this approach to solving the problem?",
  "The professor mentioned this would be on the test",
  "I found some additional resources that might help",
  "Can you explain how you got that result?",
  "This formula seems to work better for these types of problems",
  "The deadline for this assignment is next week",
  "We should review the previous chapter first",
  "Let me know if you need help with the calculations",
];

export function generateConversationSeedData(
  userIds: string[],
  count: number = 30
): ConversationSeedData[] {
  const conversations: ConversationSeedData[] = [];
  const usedPairs = new Set<string>();

  for (
    let i = 0;
    i < count && i < (userIds.length * (userIds.length - 1)) / 2;
    i++
  ) {
    let participant1: string, participant2: string, pairKey: string;

    // Ensure unique conversation pairs
    do {
      participant1 = faker.helpers.arrayElement(userIds);
      participant2 = faker.helpers.arrayElement(
        userIds.filter((id) => id !== participant1)
      );
      pairKey = [participant1, participant2].sort().join("-");
    } while (usedPairs.has(pairKey));

    usedPairs.add(pairKey);

    const createdAt = faker.date.past({ years: 1 });
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

    conversations.push({
      id: faker.string.uuid(),
      participant_1: participant1,
      participant_2: participant2,
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
    });
  }

  return conversations;
}

export function generateMessageSeedData(
  conversations: ConversationSeedData[],
  messagesPerConversation: number = 15
): MessageSeedData[] {
  const messages: MessageSeedData[] = [];

  conversations.forEach((conversation) => {
    const participants = [
      conversation.participant_1,
      conversation.participant_2,
    ];
    const conversationStart = new Date(conversation.created_at);
    const messageCount = faker.number.int({
      min: 5,
      max: messagesPerConversation,
    });

    for (let i = 0; i < messageCount; i++) {
      const sender = faker.helpers.arrayElement(participants);
      const messageTime = new Date(
        conversationStart.getTime() +
          faker.number.int({
            min: i * 1000 * 60,
            max: (i + 1) * 1000 * 60 * 30,
          })
      ); // Space messages out

      // Choose message content
      let content: string;
      if (i === 0) {
        // First message often starts the conversation
        content = `Hi! I saw your notes on ${faker.helpers.arrayElement(
          studyTopics
        )}. ${faker.helpers.arrayElement(messageTemplates)}`;
      } else {
        content = faker.helpers.arrayElement(messageTemplates);

        // Sometimes add subject-specific context
        if (faker.helpers.maybe(() => true, { probability: 0.3 })) {
          content += ` I'm working on ${faker.helpers.arrayElement(
            studyTopics
          )} and could use some guidance.`;
        }
      }

      const isEdited =
        faker.helpers.maybe(() => true, { probability: 0.1 }) ?? false;

      messages.push({
        id: faker.string.uuid(),
        conversation_id: conversation.id,
        sender_id: sender,
        content,
        message_type: "text",
        metadata: {},
        is_edited: isEdited,
        edited_at: isEdited
          ? faker.date
              .between({ from: messageTime, to: new Date() })
              .toISOString()
          : undefined,
        created_at: messageTime.toISOString(),
      });
    }
  });

  return messages.sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

export function generateConversationInsertSQL(
  conversations: ConversationSeedData[]
): string {
  if (conversations.length === 0) {
    return "-- No conversations to insert\n";
  }

  const values = conversations
    .map((conversation) => {
      return `(
      '${conversation.id}',
      '${conversation.participant_1}',
      '${conversation.participant_2}',
      '${conversation.created_at}',
      '${conversation.updated_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample conversations
INSERT INTO public.conversations (
  id, participant_1, participant_2, created_at, updated_at
) VALUES
    ${values};
`;
}

export function generateMessageInsertSQL(messages: MessageSeedData[]): string {
  if (messages.length === 0) {
    return "-- No messages to insert\n";
  }

  const values = messages
    .map((message) => {
      return `(
      '${message.id}',
      '${message.conversation_id}',
      '${message.sender_id}',
      '${message.content.replace(/'/g, "''")}',
      '${message.message_type}',
      '${JSON.stringify(message.metadata).replace(/'/g, "''")}',
      ${message.is_edited},
      ${message.edited_at ? `'${message.edited_at}'` : "NULL"},
      '${message.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample messages
INSERT INTO public.messages (
  id, conversation_id, sender_id, content, message_type, metadata, 
  is_edited, edited_at, created_at
) VALUES
    ${values};
`;
}
