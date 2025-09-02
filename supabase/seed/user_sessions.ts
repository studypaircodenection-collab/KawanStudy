import { faker } from "@faker-js/faker";

export interface UserSessionSeedData {
  id: string;
  user_id: string;
  session_token: string;
  expires_at: string;
  user_agent?: string;
  ip_address?: string;
  is_active: boolean;
  last_activity: string;
  created_at: string;
}

export function generateUserSessionSeedData(
  userIds: string[],
  sessionsPerUser: number = 3
): UserSessionSeedData[] {
  const sessions: UserSessionSeedData[] = [];

  userIds.forEach((userId) => {
    const sessionCount = faker.number.int({ min: 1, max: sessionsPerUser });

    for (let i = 0; i < sessionCount; i++) {
      const createdAt = faker.date.past({ years: 1 });
      const lastActivity = faker.date.between({
        from: createdAt,
        to: new Date(),
      });
      const isActive =
        faker.helpers.maybe(() => true, { probability: 0.3 }) ?? false;

      // Generate session expiry (30 days from creation)
      const expiresAt = new Date(
        createdAt.getTime() + 30 * 24 * 60 * 60 * 1000
      );

      const session: UserSessionSeedData = {
        id: faker.string.uuid(),
        user_id: userId,
        session_token: faker.string.alphanumeric(64),
        expires_at: expiresAt.toISOString(),
        user_agent: faker.helpers.maybe(() => generateUserAgent(), {
          probability: 0.9,
        }),
        ip_address: faker.helpers.maybe(() => faker.internet.ip(), {
          probability: 0.8,
        }),
        is_active: isActive,
        last_activity: lastActivity.toISOString(),
        created_at: createdAt.toISOString(),
      };

      sessions.push(session);
    }
  });

  return sessions.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

function generateUserAgent(): string {
  const browsers = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Android 14; Mobile; rv:120.0) Gecko/120.0 Firefox/120.0",
  ];

  return faker.helpers.arrayElement(browsers);
}

export function generateUserSessionInsertSQL(
  sessions: UserSessionSeedData[]
): string {
  if (sessions.length === 0) {
    return "-- No user sessions to insert\n";
  }

  const values = sessions
    .map((session) => {
      return `(
      '${session.id}',
      '${session.user_id}',
      '${session.session_token}',
      '${session.expires_at}',
      ${
        session.user_agent
          ? `'${session.user_agent.replace(/'/g, "''")}'`
          : "NULL"
      },
      ${session.ip_address ? `'${session.ip_address}'` : "NULL"},
      ${session.is_active},
      '${session.last_activity}',
      '${session.created_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample user sessions
INSERT INTO public.user_sessions (
  id, user_id, session_token, expires_at, user_agent, ip_address, 
  is_active, last_activity, created_at
) VALUES
    ${values};
`;
}
