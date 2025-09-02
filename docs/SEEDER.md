# KawanStudy Database Seeding System

This comprehensive database seeding system generates realistic sample data for the KawanStudy application using Faker.js. The system is designed to populate all database tables based on the migration files with meaningful, interconnected data.

## 🎯 Overview

The seeding system provides:

- **Comprehensive data generation** for all database tables
- **Realistic Malaysian university context** (universities, locations, names)
- **Interconnected data relationships** (users, notes, quizzes, achievements, etc.)
- **Configurable data volumes** (minimal vs full seeding)
- **Academic authenticity** (subjects, courses, difficulty levels)

## 📊 Generated Data

### Core User Data (100 users in full mode)

- **Profiles**: Malaysian university students with realistic academic information
- **User Data**: Study preferences, learning styles, availability schedules
- **User Sessions**: Login sessions with device information

### Gamification System

- **19 Achievements**: From common (Welcome Aboard!) to legendary (Study Legend)
- **15 Daily Challenges**: Easy, medium, and hard difficulty levels
- **Point Transactions**: Earning and spending points through various activities
- **User Achievement Progress**: Realistic achievement unlocking based on points

### Educational Content

- **200 Notes** (full mode): Across 20+ subjects with proper academic metadata
- **75 Quizzes**: Subject-specific with realistic questions and answers
- **964 Quiz Questions**: Mix of single/multiple choice with explanations
- **426 Quiz Attempts**: Realistic scoring and completion times

### Social Features

- **50 Conversations**: Study-focused peer-to-peer messaging
- **505 Messages**: Academic discussions and study coordination
- **Social Interactions**: Note likes, comments, views, downloads

### Notification System

- **500 Notifications**: Achievement unlocks, messages, study reminders
- **Notification Settings**: Personalized preferences for each user

## 🚀 Quick Start

### Generate and Apply Seeders

```powershell
# Generate minimal seeder (10 users, essential data)
npm run db:seed:minimal

# Generate comprehensive seeder (100 users, full dataset)
npm run db:seed:full

# Reset database and apply a specific seeder
npm run db:reset
npm run db:apply-seeder comprehensive_seeder_full_[timestamp].sql
```

### One-Command Database Setup

```powershell
# Reset and apply essential seeder
npm run db:reset:seed
```

## 📋 Available Commands

| Command                              | Description                               |
| ------------------------------------ | ----------------------------------------- |
| `npm run db:seed:minimal`            | Generate minimal seeder (10 users)        |
| `npm run db:seed:full`               | Generate comprehensive seeder (100 users) |
| `npm run db:apply-seeder <filename>` | Apply a generated SQL seeder file         |
| `npm run db:reset`                   | Reset database to migration state         |
| `npm run db:reset:seed`              | Reset and apply essential seeder          |

## 📁 File Structure

```
supabase/
├── seed/                           # TypeScript seeder modules
│   ├── profile.ts                  # User profiles with Malaysian context
│   ├── achievements.ts             # Gamification achievements
│   ├── daily_challenges.ts         # Daily challenge system
│   ├── point_transactions.ts       # Point earning/spending history
│   ├── user_achievements.ts        # Achievement progress tracking
│   ├── conversations.ts            # Peer messaging system
│   ├── messages.ts                 # Study-focused chat messages
│   ├── notes.ts                    # Academic note sharing
│   ├── quizzes.ts                  # Quiz creation and attempts
│   ├── notifications.ts            # Notification system
│   ├── user_data.ts               # Study preferences and schedules
│   ├── user_sessions.ts           # Session management
│   └── activity_log.ts            # User activity tracking
├── comprehensive_seeder_*.sql      # Generated SQL files
└── essential_seeder.sql           # Simple essential data

scripts/
├── generate-comprehensive-seeder.ts # Main seeder generator
├── apply-seeder.js                 # SQL file applicator
└── seed.js                        # Legacy simple seeder
```

## 🎓 Academic Context

### Malaysian Universities

- Universiti Malaya (UM)
- Universiti Kebangsaan Malaysia (UKM)
- Universiti Putra Malaysia (UPM)
- Taylor's University, Sunway University, etc.

### Academic Subjects

- STEM: Mathematics, Computer Science, Physics, Chemistry, Biology
- Business: Economics, Business Administration, Accounting
- Liberal Arts: Psychology, History, Literature, Philosophy

### Study Features

- **Note Types**: Lecture notes, summaries, cheat sheets, practice problems
- **Academic Levels**: High school, undergraduate, graduate, professional
- **Learning Styles**: Visual, auditory, kinesthetic, reading-writing
- **Study Environments**: Library quiet, background music, group settings

## 🔧 Customization

### Modify Data Volumes

Edit `scripts/generate-comprehensive-seeder.ts`:

```typescript
const configs = {
  minimal: {
    userCount: 10, // Number of users
    noteCount: 20, // Notes per dataset
    quizCount: 10, // Quizzes to generate
    conversationCount: 5, // Peer conversations
    // ... other settings
  },
  full: {
    userCount: 100, // Scale up for production-like data
    noteCount: 200,
    quizCount: 75,
    conversationCount: 50,
    // ... other settings
  },
};
```

### Add New Data Types

1. Create a new seeder module in `supabase/seed/`
2. Import and integrate in `generate-comprehensive-seeder.ts`
3. Add SQL generation logic

### Modify Academic Context

Update arrays in seeder files:

- `malaysianUniversities` in `profile.ts`
- `subjects` and `noteTopics` in `notes.ts`
- `achievementTemplates` in `achievements.ts`

## 📈 Data Relationships

The seeding system maintains proper relationships:

```
Users (Profiles)
├── Points & Achievements
├── Notes & Quizzes (authored content)
├── Quiz Attempts (learning progress)
├── Conversations & Messages (social)
├── Notifications (engagement)
├── Daily Progress (gamification)
└── Activity Logs (analytics)
```

## 🛠️ Development Workflow

### 1. Database Development

```powershell
# Start with fresh database
npm run db:reset

# Generate and apply minimal data for quick testing
npm run db:seed:minimal
npm run db:apply-seeder [generated-file].sql
```

### 2. Feature Testing

```powershell
# Generate comprehensive data for full feature testing
npm run db:seed:full
npm run db:apply-seeder [generated-file].sql
```

### 3. Production Preparation

```powershell
# Use minimal data for staging environments
npm run db:seed:minimal
```

## 🔍 Data Quality

### Realistic Data Characteristics

- **Malaysian Context**: Universities, locations, and cultural context
- **Academic Authenticity**: Proper course codes, subjects, and terminology
- **Temporal Consistency**: Realistic timestamps and progression
- **Engagement Patterns**: Believable user interaction frequencies
- **Performance Distribution**: Realistic quiz scores and achievement progress

### Data Integrity

- **Foreign Key Relationships**: All references are properly maintained
- **Unique Constraints**: No duplicate usernames or conflicting data
- **Enum Validation**: All values match database constraints
- **JSON Structure**: Proper metadata formatting for complex fields

## 📊 Sample Data Overview

After running the full seeder, you'll have:

- **100 diverse student profiles** from Malaysian universities
- **19 gamification achievements** from beginner to legendary
- **200 academic notes** across 20+ subjects
- **75 interactive quizzes** with nearly 1000 questions
- **50 study conversations** with 500+ messages
- **Realistic social interactions**: likes, comments, downloads
- **Comprehensive activity logs** for analytics

This creates a rich, authentic environment for developing and testing all KawanStudy features! 🎉

## 🐛 Troubleshooting

### Common Issues

**Error: "constraint violation"**

- Check migration files are applied: `npm run db:reset`
- Verify foreign key relationships in seeder data

**Error: "table does not exist"**

- Ensure all migrations are applied before seeding
- Check table names match migration definitions

**TypeScript compilation errors**

- Run `npm install tsx --save-dev` if missing
- Check import paths in seeder modules

### Performance Tips

- Use minimal seeder for rapid development cycles
- Generate full seeder for comprehensive testing
- Consider database connection pooling for large datasets

## 🔄 Updates and Maintenance

When adding new migrations:

1. Update corresponding seeder modules
2. Test with minimal seeder first
3. Regenerate comprehensive seeders
4. Update this documentation

The seeding system is designed to grow with your application! 🌱
