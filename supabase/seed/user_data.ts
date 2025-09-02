import { faker } from "@faker-js/faker";

export interface UserDataSeedData {
  id: string;
  user_id: string;
  preferences: object;
  study_goals: string[];
  availability: object;
  learning_style: string;
  timezone: string;
  language_preference: string;
  subjects_of_interest: string[];
  academic_year: string;
  gpa?: number;
  study_hours_per_week: number;
  preferred_study_times: string[];
  study_environment: string;
  motivation_level: string;
  collaboration_preference: string;
  created_at: string;
  updated_at: string;
}

const learningStyles = ["visual", "auditory", "kinesthetic", "reading-writing"];
const timezones = [
  "Asia/Kuala_Lumpur",
  "Asia/Singapore",
  "Asia/Bangkok",
  "Asia/Jakarta",
];
const languagePreferences = ["english", "bahasa-malaysia", "chinese", "tamil"];
const academicYears = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Graduate",
  "PhD",
];
const studyEnvironments = [
  "quiet-library",
  "background-music",
  "group-setting",
  "cafe-ambient",
  "complete-silence",
];
const motivationLevels = ["low", "moderate", "high", "very-high"];
const collaborationPreferences = [
  "solo-study",
  "small-groups",
  "large-groups",
  "peer-tutoring",
  "mixed",
];

const subjects = [
  "Mathematics",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Economics",
  "Psychology",
  "History",
  "Literature",
  "Business",
  "Engineering",
  "Statistics",
  "Philosophy",
  "Sociology",
];

const studyGoals = [
  "Improve GPA",
  "Master specific subjects",
  "Prepare for exams",
  "Develop study habits",
  "Connect with peers",
  "Learn new skills",
  "Complete assignments on time",
  "Understand complex concepts",
  "Build confidence",
  "Enhance critical thinking",
];

const studyTimes = [
  "early-morning",
  "morning",
  "afternoon",
  "evening",
  "night",
  "late-night",
];

export function generateUserDataSeedData(
  userIds: string[]
): UserDataSeedData[] {
  return userIds.map((userId) => {
    const studyHoursPerWeek = faker.number.int({ min: 5, max: 50 });
    const selectedGoals = faker.helpers.arrayElements(studyGoals, {
      min: 2,
      max: 5,
    });
    const selectedSubjects = faker.helpers.arrayElements(subjects, {
      min: 2,
      max: 6,
    });
    const selectedStudyTimes = faker.helpers.arrayElements(studyTimes, {
      min: 1,
      max: 3,
    });

    // Generate availability schedule
    const availability = {
      monday: faker.helpers.arrayElements(["morning", "afternoon", "evening"], {
        min: 0,
        max: 3,
      }),
      tuesday: faker.helpers.arrayElements(
        ["morning", "afternoon", "evening"],
        { min: 0, max: 3 }
      ),
      wednesday: faker.helpers.arrayElements(
        ["morning", "afternoon", "evening"],
        { min: 0, max: 3 }
      ),
      thursday: faker.helpers.arrayElements(
        ["morning", "afternoon", "evening"],
        { min: 0, max: 3 }
      ),
      friday: faker.helpers.arrayElements(["morning", "afternoon", "evening"], {
        min: 0,
        max: 3,
      }),
      saturday: faker.helpers.arrayElements(
        ["morning", "afternoon", "evening"],
        { min: 0, max: 2 }
      ),
      sunday: faker.helpers.arrayElements(["morning", "afternoon", "evening"], {
        min: 0,
        max: 2,
      }),
    };

    // Generate study preferences
    const preferences = {
      notification_frequency: faker.helpers.arrayElement([
        "immediate",
        "hourly",
        "daily",
        "weekly",
      ]),
      study_reminders: faker.datatype.boolean(),
      peer_matching: faker.datatype.boolean(),
      public_profile: faker.datatype.boolean(),
      share_study_progress: faker.datatype.boolean(),
      theme_preference: faker.helpers.arrayElement(["light", "dark", "auto"]),
      font_size: faker.helpers.arrayElement(["small", "medium", "large"]),
      auto_save: faker.datatype.boolean(),
      offline_mode: faker.datatype.boolean(),
      data_privacy: faker.helpers.arrayElement([
        "public",
        "friends-only",
        "private",
      ]),
    };

    const userData: UserDataSeedData = {
      id: faker.string.uuid(),
      user_id: userId,
      preferences,
      study_goals: selectedGoals,
      availability,
      learning_style: faker.helpers.arrayElement(learningStyles),
      timezone: faker.helpers.arrayElement(timezones),
      language_preference: faker.helpers.arrayElement(languagePreferences),
      subjects_of_interest: selectedSubjects,
      academic_year: faker.helpers.arrayElement(academicYears),
      gpa: faker.helpers.maybe(
        () => faker.number.float({ min: 2.0, max: 4.0, fractionDigits: 2 }),
        { probability: 0.8 }
      ),
      study_hours_per_week: studyHoursPerWeek,
      preferred_study_times: selectedStudyTimes,
      study_environment: faker.helpers.arrayElement(studyEnvironments),
      motivation_level: faker.helpers.arrayElement(motivationLevels),
      collaboration_preference: faker.helpers.arrayElement(
        collaborationPreferences
      ),
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };

    return userData;
  });
}

export function generateUserDataInsertSQL(
  userData: UserDataSeedData[]
): string {
  if (userData.length === 0) {
    return "-- No user data to insert\n";
  }

  const values = userData
    .map((data) => {
      return `(
      '${data.id}',
      '${data.user_id}',
      '${JSON.stringify(data.preferences).replace(/'/g, "''")}',
      ARRAY[${data.study_goals.map((goal) => `'${goal}'`).join(", ")}],
      '${JSON.stringify(data.availability).replace(/'/g, "''")}',
      '${data.learning_style}',
      '${data.timezone}',
      '${data.language_preference}',
      ARRAY[${data.subjects_of_interest
        .map((subject) => `'${subject}'`)
        .join(", ")}],
      '${data.academic_year}',
      ${data.gpa || "NULL"},
      ${data.study_hours_per_week},
      ARRAY[${data.preferred_study_times
        .map((time) => `'${time}'`)
        .join(", ")}],
      '${data.study_environment}',
      '${data.motivation_level}',
      '${data.collaboration_preference}',
      '${data.created_at}',
      '${data.updated_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample user data
INSERT INTO public.user_data (
  id, user_id, preferences, study_goals, availability, learning_style, 
  timezone, language_preference, subjects_of_interest, academic_year, gpa, 
  study_hours_per_week, preferred_study_times, study_environment, 
  motivation_level, collaboration_preference, created_at, updated_at
) VALUES
    ${values};
`;
}
