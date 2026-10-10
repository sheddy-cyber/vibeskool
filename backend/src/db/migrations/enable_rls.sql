-- ==============================================================================
-- Migration: Enable Row Level Security (RLS) on all public tables
-- VibeSkool Project
-- ==============================================================================
--
-- Why this is needed:
-- Supabase automatically exposes all tables in the `public` schema via PostgREST
-- (Data API). Without RLS enabled, anyone with the project URL and anonymous
-- API key could potentially query or manipulate tables directly.
--
-- Note for VibeSkool:
-- The VibeSkool backend connects as the database superuser/table owner (`postgres`)
-- via DATABASE_URL. In PostgreSQL, table owners and superusers bypass RLS by
-- default, so your Node/Express backend will continue to function normally.
-- Enabling RLS prevents unauthorized direct API access from the internet.
-- ==============================================================================

-- 1. Explicitly enable RLS on all known project tables
ALTER TABLE IF EXISTS users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS skill_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS test_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS exercise_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS test_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS test_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS passed_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_likes ENABLE ROW LEVEL SECURITY;

-- 2. Dynamically ensure RLS is enabled on any other table in the public schema
DO $$
DECLARE
    tbl record;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl.tablename);
    END LOOP;
END $$;
