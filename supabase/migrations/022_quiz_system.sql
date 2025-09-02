-- 022_quiz_system.sql
-- Quiz system tables and functions

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Quizzes table
create table public.quizzes (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  thumbnail_url text,
  subject text not null,
  grade_level text,
  play_count integer default 0,
  time_limit_minutes integer,
  shuffle_questions boolean default false,
  metadata jsonb default '{}',
  created_by uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Questions table
create table public.quiz_questions (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question_text text not null,
  question_type text not null check (question_type in ('single', 'multiple')),
  options jsonb not null, -- Array of option strings
  correct_answers jsonb not null, -- Array of correct option indices
  explanation text,
  tags text[],
  time_limit_seconds integer,
  order_index integer not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quiz attempts table
create table public.quiz_attempts (
  id uuid primary key default uuid_generate_v4(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  user_answers jsonb not null, -- Map of question_id -> answer(s)
  score integer not null,
  total_questions integer not null,
  percentage decimal(5,2) not null,
  time_taken integer not null, -- in seconds
  started_at timestamp with time zone not null,
  completed_at timestamp with time zone not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add indexes for performance
create index idx_quizzes_created_by on public.quizzes(created_by);
create index idx_quizzes_subject on public.quizzes(subject);
create index idx_quizzes_created_at on public.quizzes(created_at);
create index idx_quiz_questions_quiz_id on public.quiz_questions(quiz_id);
create index idx_quiz_questions_order on public.quiz_questions(quiz_id, order_index);
create index idx_quiz_attempts_quiz_id on public.quiz_attempts(quiz_id);
create index idx_quiz_attempts_user_id on public.quiz_attempts(user_id);
create index idx_quiz_attempts_completed_at on public.quiz_attempts(completed_at);

-- Enable Row Level Security
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- RLS Policies for quizzes
create policy "Quizzes are viewable by everyone" on public.quizzes
  for select using (true);

create policy "Users can create their own quizzes" on public.quizzes
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own quizzes" on public.quizzes
  for update using (auth.uid() = created_by);

create policy "Users can delete their own quizzes" on public.quizzes
  for delete using (auth.uid() = created_by);

-- RLS Policies for quiz_questions
create policy "Quiz questions are viewable by everyone" on public.quiz_questions
  for select using (true);

create policy "Users can manage questions for their own quizzes" on public.quiz_questions
  for all using (
    auth.uid() in (
      select created_by from public.quizzes where id = quiz_id
    )
  );

-- RLS Policies for quiz_attempts
create policy "Users can view all quiz attempts" on public.quiz_attempts
  for select using (true);

create policy "Users can create their own quiz attempts" on public.quiz_attempts
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own quiz attempts" on public.quiz_attempts
  for update using (auth.uid() = user_id);

-- Function to update quiz play count
create or replace function public.increment_quiz_play_count(p_quiz_id uuid)
returns void as $$
begin
  update public.quizzes
  set play_count = play_count + 1,
      updated_at = now()
  where id = p_quiz_id;
end;
$$ language plpgsql security definer;

-- Function to get quiz with questions
create or replace function public.get_quiz_with_questions(p_quiz_id uuid)
returns json as $$
declare
  quiz_data json;
begin
  select json_build_object(
    'quiz', (
      select to_json(q.*) from public.quizzes q where q.id = p_quiz_id
    ),
    'questions', (
      select json_agg(
        json_build_object(
          'id', qq.id,
          'text', qq.question_text,
          'kind', qq.question_type,
          'options', qq.options,
          'correct', qq.correct_answers,
          'explanation', qq.explanation,
          'tags', qq.tags,
          'timeLimitSeconds', qq.time_limit_seconds
        ) order by qq.order_index
      )
      from public.quiz_questions qq
      where qq.quiz_id = p_quiz_id
    )
  ) into quiz_data;
  
  return quiz_data;
end;
$$ language plpgsql security definer;

-- Function to get user's quiz attempts with stats
create or replace function public.get_user_quiz_attempts(p_user_id uuid, p_quiz_id uuid)
returns json as $$
declare
  attempts_data json;
begin
  select json_build_object(
    'quiz', (
      select json_build_object(
        'id', id,
        'title', title,
        'description', description,
        'subject', subject,
        'grade_level', grade_level,
        'total_questions', (
          select count(*) from public.quiz_questions where quiz_id = p_quiz_id
        )
      )
      from public.quizzes
      where id = p_quiz_id
    ),
    'attempts', (
      select json_agg(
        json_build_object(
          'id', id,
          'score', score,
          'total_questions', total_questions,
          'percentage', percentage,
          'time_taken', time_taken,
          'completed_at', completed_at
        ) order by completed_at desc
      )
      from public.quiz_attempts
      where user_id = p_user_id and quiz_id = p_quiz_id
    ),
    'best_attempt', (
      select json_build_object(
        'id', id,
        'score', score,
        'total_questions', total_questions,
        'percentage', percentage,
        'time_taken', time_taken,
        'completed_at', completed_at
      )
      from public.quiz_attempts
      where user_id = p_user_id and quiz_id = p_quiz_id
      order by percentage desc, time_taken asc
      limit 1
    ),
    'total_attempts', (
      select count(*)
      from public.quiz_attempts
      where user_id = p_user_id and quiz_id = p_quiz_id
    )
  ) into attempts_data;
  
  return attempts_data;
end;
$$ language plpgsql security definer;

-- Function to calculate quiz score
create or replace function public.calculate_quiz_score(
  p_quiz_id uuid,
  p_user_answers jsonb
)
returns json as $$
declare
  total_questions integer;
  correct_count integer := 0;
  question_record record;
  user_answer jsonb;
  correct_answers jsonb;
  is_correct boolean;
  results json;
begin
  -- Get total questions
  select count(*) into total_questions
  from public.quiz_questions
  where quiz_id = p_quiz_id;
  
  -- Calculate score for each question
  for question_record in
    select id, correct_answers, question_type
    from public.quiz_questions
    where quiz_id = p_quiz_id
  loop
    user_answer := p_user_answers->question_record.id::text;
    correct_answers := question_record.correct_answers;
    
    if user_answer is not null then
      if question_record.question_type = 'single' then
        -- Single choice: check if the answer matches
        is_correct := (user_answer->>0)::integer = (correct_answers->>0)::integer;
      else
        -- Multiple choice: check if arrays match (sorted)
        is_correct := (
          select array_agg(value::integer order by value::integer) 
          from jsonb_array_elements_text(user_answer)
        ) = (
          select array_agg(value::integer order by value::integer) 
          from jsonb_array_elements_text(correct_answers)
        );
      end if;
      
      if is_correct then
        correct_count := correct_count + 1;
      end if;
    end if;
  end loop;
  
  return json_build_object(
    'score', correct_count,
    'total', total_questions,
    'percentage', round((correct_count::decimal / total_questions * 100), 2)
  );
end;
$$ language plpgsql security definer;

-- Trigger to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.update_updated_at_column();

create trigger update_quiz_questions_updated_at
  before update on public.quiz_questions
  for each row execute function public.update_updated_at_column();

create trigger update_quiz_attempts_updated_at
  before update on public.quiz_attempts
  for each row execute function public.update_updated_at_column();
