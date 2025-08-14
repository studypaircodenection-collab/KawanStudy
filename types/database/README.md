# Database Type Generation for Supabase

This directory contains generated TypeScript types for your Supabase database schema.

## Setup

1. **Install Supabase CLI**

   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**

   ```bash
   supabase login
   ```

3. **Link to your project**

   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Generate types**
   ```bash
   npm run db:types
   ```

## Usage

Import types in your code:

```typescript
import { Database } from "@/types/database.types";

// Use with Supabase client
const supabase = createClient<Database>();

// Type-safe queries
const { data } = await supabase.from("profiles").select("*").eq("id", userId);
```

## Auto-generation

Types will be automatically generated when:

- Database schema changes
- Running `npm run db:types`
- During CI/CD pipeline (if configured)

## Custom Types

For custom business logic types, create separate files:

- `app.types.ts` - Application-specific types
- `api.types.ts` - API request/response types
- `form.types.ts` - Form validation types

## Best Practices

1. **Always use generated types** with Supabase queries
2. **Regenerate after schema changes**
3. **Version control the generated files**
4. **Use type assertions carefully** - prefer type guards
5. **Create union types** for complex queries

## Example Schema

```sql
-- Example table for type generation
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table profiles enable row level security;

-- Create policy
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);
```
