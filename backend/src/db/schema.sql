-- Users & Auth
-- Stores user accounts for students, teachers, and admins
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  settings JSONB DEFAULT '{}',
  xp INTEGER DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Classrooms
-- Represents a teacher's classroom
CREATE TABLE IF NOT EXISTS classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  invite_code TEXT UNIQUE NOT NULL,
  ai_provider TEXT DEFAULT 'gemini',
  ai_api_key TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Classroom Members
-- Links students to their classrooms
CREATE TABLE IF NOT EXISTS classroom_members (
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (classroom_id, student_id)
);

-- Skill Paths
-- Groupings of lessons forming a curriculum path
CREATE TABLE IF NOT EXISTS skill_paths (
  id TEXT PRIMARY KEY,
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  tag TEXT,
  modules_json JSONB DEFAULT '[]'::jsonb,
  order_index INT DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Lessons
-- Individual lessons within a skill path
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  path_id TEXT REFERENCES skill_paths(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL NULL,
  title TEXT NOT NULL,
  duration TEXT,
  part_name TEXT,
  mek_label TEXT,
  content_json JSONB NOT NULL,
  ai_prompt TEXT,
  terminal_mission TEXT,
  order_index INT DEFAULT 0,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Exercises
-- Activities for students to practice skills
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE NULL,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('coding', 'multiple_choice', 'fill_blank', 'free_response')),
  title TEXT NOT NULL,
  instructions TEXT,
  starter_code TEXT,
  solution_code TEXT,
  test_cases JSONB,
  options JSONB,
  points INT DEFAULT 10,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tests
-- Assessments created by teachers
CREATE TABLE IF NOT EXISTS tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit_min INT,
  due_date TIMESTAMPTZ,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Test Questions
-- Links exercises to tests as specific questions
CREATE TABLE IF NOT EXISTS test_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INT DEFAULT 0,
  points INT DEFAULT 10
);

-- Exercise Submissions
-- Records of student attempts at exercises
CREATE TABLE IF NOT EXISTS exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  code TEXT,
  answer_text TEXT,
  output TEXT,
  passed BOOLEAN,
  score INT,
  feedback TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- Test Submissions
-- Overall records of student test attempts
CREATE TABLE IF NOT EXISTS test_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  total_score INT,
  graded BOOLEAN DEFAULT false
);

-- Test Answers
-- Individual question answers within a test submission
CREATE TABLE IF NOT EXISTS test_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_submission_id UUID REFERENCES test_submissions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES test_questions(id) ON DELETE CASCADE,
  code TEXT,
  answer_text TEXT,
  score INT,
  feedback TEXT
);

-- Lesson Progress
-- Tracks which lessons a student has completed
CREATE TABLE IF NOT EXISTS lesson_progress (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  PRIMARY KEY (student_id, lesson_id)
);

-- Student Streaks
-- Tracks learning consistency
CREATE TABLE IF NOT EXISTS student_streaks (
  student_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INT DEFAULT 0,
  longest_streak INT DEFAULT 0,
  last_active DATE
);

-- Passed Modules
-- Records completed larger modules/courses
CREATE TABLE IF NOT EXISTS passed_modules (
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  score INT,
  passed_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (student_id, module_id)
);

-- AI Conversations
-- Stores chat sessions with the AI tutor
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT REFERENCES lessons(id) ON DELETE SET NULL NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Messages
-- Individual messages within an AI conversation
CREATE TABLE IF NOT EXISTS ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  persona TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Community Tables
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES forum_posts(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL,
  language TEXT DEFAULT 'javascript',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_likes (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (project_id, student_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_classrooms_invite_code ON classrooms(invite_code);
CREATE INDEX IF NOT EXISTS idx_classroom_members_student_id ON classroom_members(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_path_id ON lessons(path_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson_id ON lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_exercises_lesson_id ON exercises(lesson_id);
