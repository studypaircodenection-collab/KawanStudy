import { faker } from "@faker-js/faker";

// Malaysian Universities for realistic data
const malaysianUniversities = [
  "Universiti Malaya (UM)",
  "Universiti Kebangsaan Malaysia (UKM)",
  "Universiti Putra Malaysia (UPM)",
  "Universiti Sains Malaysia (USM)",
  "Universiti Teknologi Malaysia (UTM)",
  "Universiti Teknologi MARA (UiTM)",
  "International Islamic University Malaysia (IIUM)",
  "Universiti Utara Malaysia (UUM)",
  "Multimedia University (MMU)",
  "Taylor's University",
  "Sunway University",
  "Monash University Malaysia",
  "University of Nottingham Malaysia",
];

const majors = [
  "Computer Science",
  "Software Engineering",
  "Information Technology",
  "Data Science",
  "Cybersecurity",
  "Artificial Intelligence",
  "Business Administration",
  "Accounting",
  "Finance",
  "Marketing",
  "Economics",
  "Psychology",
  "Engineering",
  "Medicine",
  "Law",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Literature",
  "Mass Communication",
  "Architecture",
  "Graphic Design",
];

const yearOfStudy = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Graduate",
  "PhD",
];

const malaysianStates = [
  "Kuala Lumpur",
  "Selangor",
  "Penang",
  "Johor",
  "Perak",
  "Kedah",
  "Kelantan",
  "Terengganu",
  "Pahang",
  "Negeri Sembilan",
  "Malacca",
  "Perlis",
  "Sabah",
  "Sarawak",
  "Putrajaya",
  "Labuan",
];

export interface ProfileSeedData {
  id: string;
  full_name: string;
  username: string;
  email: string;
  phone?: string;
  bio?: string;
  location: string;
  university: string;
  year_of_study: string;
  major: string;
  avatar_url?: string;
  header_image_url?: string;
  linkedin_url?: string;
  github_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  website_url?: string;
  total_points: number;
  level: number;
  experience_points: number;
  created_at: string;
  updated_at: string;
}

export function generateProfileSeedData(
  count: number = 50,
  userIds: string[]
): ProfileSeedData[] {
  const profiles: ProfileSeedData[] = [];

  for (let i = 0; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const fullName = `${firstName} ${lastName}`;
    const username = faker.internet
      .username({ firstName, lastName })
      .toLowerCase();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    // Generate realistic points and levels
    const totalPoints = faker.number.int({ min: 0, max: 10000 });
    const level = Math.max(1, Math.floor(totalPoints / 500) + 1);
    const experiencePoints = totalPoints % 500;

    const profile: ProfileSeedData = {
      id: userIds[i] || faker.string.uuid(),
      full_name: fullName,
      username: `${username}_${faker.number.int({ min: 100, max: 999 })}`,
      email,
      phone: faker.helpers.maybe(
        () => `+60${faker.number.int({ min: 100000000, max: 199999999 })}`,
        { probability: 0.7 }
      ),
      bio: faker.helpers.maybe(() => faker.lorem.sentences(2), {
        probability: 0.8,
      }),
      location: faker.helpers.arrayElement(malaysianStates),
      university: faker.helpers.arrayElement(malaysianUniversities),
      year_of_study: faker.helpers.arrayElement(yearOfStudy),
      major: faker.helpers.arrayElement(majors),
      avatar_url: faker.helpers.maybe(() => faker.image.avatar(), {
        probability: 0.6,
      }),
      header_image_url: faker.helpers.maybe(
        () =>
          faker.image.urlLoremFlickr({
            width: 1200,
            height: 300,
            category: "nature,city,abstract",
          }),
        { probability: 0.4 }
      ),
      // Social media links (optional, with realistic probability)
      linkedin_url: faker.helpers.maybe(
        () => `https://linkedin.com/in/${username.toLowerCase()}`,
        { probability: 0.4 }
      ),
      github_url: faker.helpers.maybe(
        () => `https://github.com/${username.toLowerCase()}`,
        { probability: 0.3 }
      ),
      instagram_url: faker.helpers.maybe(
        () => `https://instagram.com/${username.toLowerCase()}`,
        { probability: 0.5 }
      ),
      tiktok_url: faker.helpers.maybe(
        () => `https://tiktok.com/@${username.toLowerCase()}`,
        { probability: 0.2 }
      ),
      website_url: faker.helpers.maybe(
        () => `https://${username.toLowerCase()}.dev`,
        { probability: 0.15 }
      ),
      total_points: totalPoints,
      level,
      experience_points: experiencePoints,
      created_at: faker.date.past({ years: 2 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };

    profiles.push(profile);
  }

  return profiles;
}

export function generateProfileInsertSQL(profiles: ProfileSeedData[]): string {
  const values = profiles
    .map((profile) => {
      return `(
      '${profile.id}',
      ${
        profile.full_name
          ? `'${profile.full_name.replace(/'/g, "''")}'`
          : "NULL"
      },
      '${profile.username}',
      '${profile.email}',
      ${profile.phone ? `'${profile.phone}'` : "NULL"},
      ${profile.bio ? `'${profile.bio.replace(/'/g, "''")}'` : "NULL"},
      '${profile.location}',
      '${profile.university.replace(/'/g, "''")}',
      '${profile.year_of_study}',
      '${profile.major}',
      ${profile.avatar_url ? `'${profile.avatar_url}'` : "NULL"},
      ${profile.header_image_url ? `'${profile.header_image_url}'` : "NULL"},
      ${profile.linkedin_url ? `'${profile.linkedin_url}'` : "NULL"},
      ${profile.github_url ? `'${profile.github_url}'` : "NULL"},
      ${profile.instagram_url ? `'${profile.instagram_url}'` : "NULL"},
      ${profile.tiktok_url ? `'${profile.tiktok_url}'` : "NULL"},
      ${profile.website_url ? `'${profile.website_url}'` : "NULL"},
      ${profile.total_points},
      ${profile.level},
      ${profile.experience_points},
      '${profile.created_at}',
      '${profile.updated_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample profiles
INSERT INTO public.profiles (
  id, full_name, username, email, phone, bio, location, university, 
  year_of_study, major, avatar_url, header_image_url, linkedin_url, github_url, instagram_url,
  tiktok_url, website_url, total_points, level, experience_points,
  created_at, updated_at
) VALUES
    ${values};
`;
}
