import { faker } from "@faker-js/faker";

export interface NoteSeedData {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  content?: string;
  content_type: string;
  subject: string;
  topic?: string;
  academic_level: string;
  grade_year?: string;
  institution?: string;
  course?: string;
  professor?: string;
  semester?: string;
  tags: string[];
  note_type: string;
  language: string;
  difficulty_level: string;
  status: string;
  visibility: string;
  target_audience: string;
  license: string;
  allow_download: boolean;
  allow_comments: boolean;
  source_attribution?: string;
  source_type: string;
  source_reference?: string;
  file_name?: string;
  file_size?: number;
  file_url?: string;
  file_path?: string;
  estimated_read_time: number;
  created_at: string;
  updated_at: string;
}

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
  "Political Science",
  "Environmental Science",
  "Art History",
  "Music Theory",
  "Linguistics",
  "Anthropology",
];

const noteTopics = {
  Mathematics: [
    "Calculus",
    "Linear Algebra",
    "Statistics",
    "Discrete Mathematics",
    "Probability",
    "Differential Equations",
  ],
  "Computer Science": [
    "Data Structures",
    "Algorithms",
    "Database Systems",
    "Machine Learning",
    "Web Development",
    "Software Engineering",
  ],
  Physics: [
    "Mechanics",
    "Thermodynamics",
    "Electromagnetism",
    "Quantum Physics",
    "Optics",
    "Relativity",
  ],
  Chemistry: [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Analytical Chemistry",
    "Biochemistry",
  ],
  Biology: [
    "Cell Biology",
    "Genetics",
    "Evolution",
    "Ecology",
    "Molecular Biology",
    "Anatomy",
  ],
  Economics: [
    "Microeconomics",
    "Macroeconomics",
    "International Trade",
    "Development Economics",
    "Behavioral Economics",
  ],
  Psychology: [
    "Cognitive Psychology",
    "Social Psychology",
    "Developmental Psychology",
    "Abnormal Psychology",
    "Research Methods",
  ],
};

const noteTypes = [
  "lecture-notes",
  "summary",
  "cheat-sheet",
  "practice-problems",
  "solutions",
  "mind-map",
  "other",
];
const academicLevels = [
  "high-school",
  "undergraduate",
  "graduate",
  "professional",
];
const difficulties = ["beginner", "intermediate", "advanced"];
const languages = ["english", "bahasa-malaysia", "chinese", "tamil", "other"];
const visibilities = ["public", "friends-only", "private"];
const targetAudiences = ["students", "educators", "general"];
const licenses = ["cc-by", "cc-by-sa", "cc-by-nc", "all-rights-reserved"];
const sourceTypes = ["original", "textbook", "lecture", "research", "other"];

const semesters = [
  "Fall 2023",
  "Spring 2024",
  "Summer 2024",
  "Fall 2024",
  "Spring 2025",
];

const malaysianUniversities = [
  "Universiti Malaya",
  "Universiti Kebangsaan Malaysia",
  "Universiti Putra Malaysia",
  "Universiti Sains Malaysia",
  "Universiti Teknologi Malaysia",
  "Taylor's University",
  "Sunway University",
];

export function generateNoteSeedData(
  userIds: string[],
  count: number = 100
): NoteSeedData[] {
  const notes: NoteSeedData[] = [];

  for (let i = 0; i < count; i++) {
    const subject = faker.helpers.arrayElement(subjects);
    const topic = noteTopics[subject as keyof typeof noteTopics]
      ? faker.helpers.arrayElement(
          noteTopics[subject as keyof typeof noteTopics]
        )
      : undefined;

    const noteType = faker.helpers.arrayElement(noteTypes);
    const contentType = faker.helpers.arrayElement(["pdf", "text"]);
    const academicLevel = faker.helpers.arrayElement(academicLevels);

    // Generate realistic title based on subject and type
    const title = generateNoteTitle(subject, topic, noteType);

    // Generate content based on type
    const content =
      contentType === "text"
        ? generateNoteContent(subject, noteType)
        : undefined;

    // Generate tags based on subject and topic
    const tags = generateNoteTags(subject, topic, noteType);

    const note: NoteSeedData = {
      id: faker.string.uuid(),
      user_id: faker.helpers.arrayElement(userIds),
      title,
      description: faker.lorem.sentences(2),
      content,
      content_type: contentType,
      subject,
      topic,
      academic_level: academicLevel,
      grade_year: faker.helpers.maybe(
        () => `Year ${faker.number.int({ min: 1, max: 4 })}`,
        { probability: 0.7 }
      ),
      institution: faker.helpers.maybe(
        () => faker.helpers.arrayElement(malaysianUniversities),
        { probability: 0.8 }
      ),
      course: faker.helpers.maybe(
        () => `${subject} ${faker.number.int({ min: 100, max: 499 })}`,
        { probability: 0.8 }
      ),
      professor: faker.helpers.maybe(() => `Dr. ${faker.person.lastName()}`, {
        probability: 0.6,
      }),
      semester: faker.helpers.maybe(
        () => faker.helpers.arrayElement(semesters),
        { probability: 0.7 }
      ),
      tags,
      note_type: noteType,
      language: faker.helpers.arrayElement(languages),
      difficulty_level: faker.helpers.arrayElement(difficulties),
      status: faker.helpers.weightedArrayElement([
        { weight: 0.7, value: "published" },
        { weight: 0.2, value: "draft" },
        { weight: 0.1, value: "pending" },
      ]),
      visibility: faker.helpers.weightedArrayElement([
        { weight: 0.6, value: "public" },
        { weight: 0.25, value: "friends-only" },
        { weight: 0.15, value: "private" },
      ]),
      target_audience: faker.helpers.arrayElement(targetAudiences),
      license: faker.helpers.arrayElement(licenses),
      allow_download:
        faker.helpers.maybe(() => true, { probability: 0.8 }) ?? true,
      allow_comments:
        faker.helpers.maybe(() => true, { probability: 0.9 }) ?? true,
      source_attribution: faker.helpers.maybe(() => faker.lorem.sentence(), {
        probability: 0.3,
      }),
      source_type: faker.helpers.arrayElement(sourceTypes),
      source_reference: faker.helpers.maybe(
        () => `Chapter ${faker.number.int({ min: 1, max: 20 })}`,
        { probability: 0.4 }
      ),
      file_name:
        contentType === "pdf"
          ? `${title.toLowerCase().replace(/\s+/g, "_")}.pdf`
          : undefined,
      file_size:
        contentType === "pdf"
          ? faker.number.int({ min: 100000, max: 5000000 })
          : undefined,
      file_url: contentType === "pdf" ? faker.internet.url() : undefined,
      file_path:
        contentType === "pdf" ? `notes/${faker.string.uuid()}.pdf` : undefined,
      estimated_read_time: faker.number.int({ min: 5, max: 60 }),
      created_at: faker.date.past({ years: 1 }).toISOString(),
      updated_at: faker.date.recent({ days: 30 }).toISOString(),
    };

    notes.push(note);
  }

  return notes;
}

function generateNoteTitle(
  subject: string,
  topic?: string,
  noteType?: string
): string {
  const titleTemplates = [
    () => `${subject} ${topic ? `- ${topic}` : ""} Notes`,
    () => `${topic || subject} Study Guide`,
    () =>
      `${subject} ${noteType === "cheat-sheet" ? "Cheat Sheet" : "Summary"}`,
    () => `Complete Guide to ${topic || subject}`,
    () =>
      `${subject} ${
        noteType === "practice-problems" ? "Practice Problems" : "Lecture Notes"
      }`,
    () => `${topic || subject} - Key Concepts`,
    () =>
      `${subject} ${
        noteType === "solutions" ? "Problem Solutions" : "Review Notes"
      }`,
  ];

  return faker.helpers.arrayElement(titleTemplates)();
}

function generateNoteContent(subject: string, noteType: string): string {
  const contentTemplates = {
    "lecture-notes": () => `
# ${subject} Lecture Notes

## Introduction
${faker.lorem.paragraphs(2)}

## Key Concepts
${Array.from(
  { length: 3 },
  (_, i) => `
### Concept ${i + 1}
${faker.lorem.paragraph()}
`
).join("")}

## Examples
${faker.lorem.paragraphs(2)}

## Summary
${faker.lorem.paragraph()}
    `,
    summary: () => `
# ${subject} Summary

## Overview
${faker.lorem.paragraph()}

## Main Points
${Array.from(
  { length: 5 },
  (_, i) => `
${i + 1}. ${faker.lorem.sentence()}
`
).join("")}

## Key Takeaways
${faker.lorem.paragraph()}
    `,
    "cheat-sheet": () => `
# ${subject} Cheat Sheet

## Quick Reference
${Array.from(
  { length: 8 },
  () => `
• ${faker.lorem.sentence()}
`
).join("")}

## Formulas & Key Points
${Array.from(
  { length: 5 },
  (_, i) => `
Formula ${i + 1}: ${faker.lorem.sentence()}
`
).join("")}
    `,
  };

  const generator = contentTemplates[noteType as keyof typeof contentTemplates];
  return generator ? generator() : faker.lorem.paragraphs(3);
}

function generateNoteTags(
  subject: string,
  topic?: string,
  noteType?: string
): string[] {
  const baseTags = [subject.toLowerCase().replace(/\s+/g, "-")];

  if (topic) {
    baseTags.push(topic.toLowerCase().replace(/\s+/g, "-"));
  }

  if (noteType) {
    baseTags.push(noteType);
  }

  // Add some random relevant tags
  const additionalTags = [
    "study-guide",
    "exam-prep",
    "notes",
    "university",
    "college",
    "tutorial",
    "learning",
    "education",
    "academic",
    "research",
  ];

  baseTags.push(
    ...faker.helpers.arrayElements(additionalTags, { min: 1, max: 3 })
  );

  return baseTags;
}

export function generateNoteInsertSQL(notes: NoteSeedData[]): string {
  if (notes.length === 0) {
    return "-- No notes to insert\n";
  }

  const values = notes
    .map((note) => {
      return `(
      '${note.id}',
      '${note.user_id}',
      '${note.title.replace(/'/g, "''")}',
      ${
        note.description ? `'${note.description.replace(/'/g, "''")}'` : "NULL"
      },
      ${note.content ? `'${note.content.replace(/'/g, "''")}'` : "NULL"},
      '${note.content_type}',
      '${note.subject}',
      ${note.topic ? `'${note.topic}'` : "NULL"},
      '${note.academic_level}',
      ${note.grade_year ? `'${note.grade_year}'` : "NULL"},
      ${
        note.institution ? `'${note.institution.replace(/'/g, "''")}'` : "NULL"
      },
      ${note.course ? `'${note.course}'` : "NULL"},
      ${note.professor ? `'${note.professor}'` : "NULL"},
      ${note.semester ? `'${note.semester}'` : "NULL"},
      ARRAY[${note.tags.map((tag) => `'${tag}'`).join(", ")}],
      '${note.note_type}',
      '${note.language}',
      '${note.difficulty_level}',
      '${note.status}',
      '${note.visibility}',
      '${note.target_audience}',
      '${note.license}',
      ${note.allow_download},
      ${note.allow_comments},
      ${
        note.source_attribution
          ? `'${note.source_attribution.replace(/'/g, "''")}'`
          : "NULL"
      },
      '${note.source_type}',
      ${note.source_reference ? `'${note.source_reference}'` : "NULL"},
      ${note.file_name ? `'${note.file_name}'` : "NULL"},
      ${note.file_size || "NULL"},
      ${note.file_url ? `'${note.file_url}'` : "NULL"},
      ${note.file_path ? `'${note.file_path}'` : "NULL"},
      ${note.estimated_read_time},
      '${note.created_at}',
      '${note.updated_at}'
    )`;
    })
    .join(",\n    ");

  return `
-- Insert sample notes
INSERT INTO public.notes (
  id, user_id, title, description, content, content_type, subject, topic, 
  academic_level, grade_year, institution, course, professor, semester, tags, 
  note_type, language, difficulty_level, status, visibility, target_audience, license, 
  allow_download, allow_comments, source_attribution, source_type, source_reference, 
  file_name, file_size, file_url, file_path, estimated_read_time, created_at, updated_at
) VALUES
    ${values};
`;
}
