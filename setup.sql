-- Run this in your Supabase SQL Editor

-- Create Quizzes Table
CREATE TABLE quizzes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text,
  time_limit_minutes int NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create Questions Table
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  text text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create Options Table
CREATE TABLE options (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  text text NOT NULL,
  is_correct boolean DEFAULT false
);

-- Create Results Table
CREATE TABLE results (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score int NOT NULL,
  total_questions int NOT NULL,
  completed_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security (RLS) for everyone (for testing purposes, public can read quizzes)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- Creating policies (Basic setup: authenticated users can read quizzes and save their own results)
CREATE POLICY "Public quizzes are viewable by everyone." ON quizzes FOR SELECT USING (true);
CREATE POLICY "Public questions are viewable by everyone." ON questions FOR SELECT USING (true);
CREATE POLICY "Public options are viewable by everyone." ON options FOR SELECT USING (true);

-- Users can read their own results
CREATE POLICY "Users can view their own results." ON results FOR SELECT USING (auth.uid() = user_id);
-- Users can insert their results
CREATE POLICY "Users can insert their own results." ON results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Disable permissions on editing quizzes to anyone but let's insert sample data manually
-- Sample Data Insertion:

INSERT INTO quizzes (id, title, description, time_limit_minutes) VALUES 
('11111111-1111-1111-1111-111111111111', 'React Basics', 'Test your knowledge about React Hooks and Components.', 10),
('22222222-2222-2222-2222-222222222222', 'Python Mastery', 'A short quiz to evaluate your Python skills.', 5);

-- Insert Questions for React Basics
INSERT INTO questions (id, quiz_id, text) VALUES 
('11111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'Which hook is used for side effects?'),
('11111111-1111-1111-1111-111111111113', '11111111-1111-1111-1111-111111111111', 'What does JSX stand for?');

-- Options for Q1
INSERT INTO options (question_id, text, is_correct) VALUES 
('11111111-1111-1111-1111-111111111112', 'useState', false),
('11111111-1111-1111-1111-111111111112', 'useEffect', true),
('11111111-1111-1111-1111-111111111112', 'useContext', false);

-- Options for Q2
INSERT INTO options (question_id, text, is_correct) VALUES 
('11111111-1111-1111-1111-111111111113', 'JavaScript XML', true),
('11111111-1111-1111-1111-111111111113', 'Java Syntax Extension', false),
('11111111-1111-1111-1111-111111111113', 'JSON XSLT', false);

-- Insert Questions for Python Mastery
INSERT INTO questions (id, quiz_id, text) VALUES 
('22222222-2222-2222-2222-222222222223', '22222222-2222-2222-2222-222222222222', 'Which keyword is used to define a function in Python?');

-- Options for PythonA Q1
INSERT INTO options (question_id, text, is_correct) VALUES 
('22222222-2222-2222-2222-222222222223', 'func', false),
('22222222-2222-2222-2222-222222222223', 'define', false),
('22222222-2222-2222-2222-222222222223', 'def', true);

-- Add Profiles Table to explicitly manage User Roles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  role text DEFAULT 'user'
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Create a Trigger to automatically generate a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (new.id, new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
