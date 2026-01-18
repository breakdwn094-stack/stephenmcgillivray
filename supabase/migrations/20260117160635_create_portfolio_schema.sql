/*
  # Create Portfolio Website Schema

  1. New Tables
    - `profile`
      - `id` (uuid, primary key)
      - `name` (text) - Full name
      - `initials` (text) - For logo
      - `title` (text) - Current title
      - `status_role_type` (text) - e.g., "Senior Engineering Roles"
      - `status_company_stage` (text) - e.g., "Series B–IPO Companies"
      - `positioning_statement` (text) - One-line pitch
      - `footer_tagline` (text) - Footer text
      - `github_url` (text) - Social link
      - `linkedin_url` (text) - Social link
      - `email` (text) - Contact email
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text) - Company name
      - `display_order` (integer) - For sorting badges
      - `created_at` (timestamptz)
    
    - `experience`
      - `id` (uuid, primary key)
      - `company_name` (text)
      - `date_range` (text) - e.g., "2020–2023"
      - `title` (text) - Can include progression like "Senior → Staff Engineer"
      - `achievements` (jsonb) - Array of achievement strings
      - `ai_context_situation` (text)
      - `ai_context_approach` (text)
      - `ai_context_technical` (text)
      - `ai_context_lessons` (text)
      - `display_order` (integer)
      - `created_at` (timestamptz)
    
    - `skills`
      - `id` (uuid, primary key)
      - `name` (text) - Skill name
      - `category` (text) - 'strong', 'moderate', or 'gap'
      - `display_order` (integer)
      - `created_at` (timestamptz)
    
    - `chat_messages`
      - `id` (uuid, primary key)
      - `role` (text) - 'user' or 'assistant'
      - `content` (text) - Message content
      - `session_id` (uuid) - For grouping conversations
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (portfolio is public)
    - Restrict write access to authenticated users only

  3. Indexes
    - Add indexes on display_order fields for efficient sorting
    - Add index on chat session_id for quick lookups
*/

-- Create profile table
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Alex Rivers',
  initials text NOT NULL DEFAULT 'AR',
  title text NOT NULL DEFAULT 'Staff Engineer',
  status_role_type text NOT NULL DEFAULT 'Senior Engineering Roles',
  status_company_stage text NOT NULL DEFAULT 'Series B–IPO Companies',
  positioning_statement text NOT NULL DEFAULT 'I build technical infrastructure that scales, and I help teams ship faster without cutting corners.',
  footer_tagline text NOT NULL DEFAULT 'An AI-queryable portfolio. Ask hard questions.',
  github_url text DEFAULT 'https://github.com',
  linkedin_url text DEFAULT 'https://linkedin.com',
  email text DEFAULT 'hello@example.com',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create experience table
CREATE TABLE IF NOT EXISTS experience (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  date_range text NOT NULL,
  title text NOT NULL,
  achievements jsonb DEFAULT '[]'::jsonb,
  ai_context_situation text DEFAULT '',
  ai_context_approach text DEFAULT '',
  ai_context_technical text DEFAULT '',
  ai_context_lessons text DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('strong', 'moderate', 'gap')),
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  session_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access (portfolio is public)
CREATE POLICY "Allow public read access to profile"
  ON profile FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to companies"
  ON companies FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to experience"
  ON experience FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to skills"
  ON skills FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to chat_messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

-- Allow public insert for chat messages (visitor can chat)
CREATE POLICY "Allow public insert to chat_messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to manage all data
CREATE POLICY "Allow authenticated full access to profile"
  ON profile FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to companies"
  ON companies FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to experience"
  ON experience FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to skills"
  ON skills FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to chat_messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_companies_display_order ON companies(display_order);
CREATE INDEX IF NOT EXISTS idx_experience_display_order ON experience(display_order);
CREATE INDEX IF NOT EXISTS idx_skills_display_order ON skills(display_order);
CREATE INDEX IF NOT EXISTS idx_chat_session_id ON chat_messages(session_id, created_at);

-- Insert placeholder data
INSERT INTO profile (id) VALUES ('00000000-0000-0000-0000-000000000001');

INSERT INTO companies (name, display_order) VALUES
  ('Stripe', 1),
  ('Airbnb', 2),
  ('Coinbase', 3),
  ('Figma', 4),
  ('Notion', 5);

INSERT INTO experience (company_name, date_range, title, achievements, ai_context_situation, ai_context_approach, ai_context_technical, ai_context_lessons, display_order) VALUES
  (
    'TechCorp',
    '2021–2024',
    'Senior → Staff Engineer',
    '["Led migration from monolith to microservices, reducing deploy time by 80%", "Built real-time data pipeline processing 50M events/day", "Mentored 8 engineers, 3 promoted to senior roles"]',
    'The team was struggling with a monolithic architecture that made deployments risky and slow. Each release required coordination across 12 teams and took 6+ hours.',
    'I advocated for incremental decomposition rather than a big-bang rewrite. Started with the highest-pain service boundaries, built shared tooling, and created migration runbooks.',
    'Built Kubernetes-based infrastructure with ArgoCD, implemented event-driven architecture using Kafka, created observability stack with Datadog and custom dashboards.',
    'Big rewrites fail. Small, reversible changes with clear rollback plans win. Also learned that developer experience is a product—treat it like one.',
    1
  ),
  (
    'StartupXYZ',
    '2018–2021',
    'Software Engineer',
    '["Owned authentication system serving 2M users", "Reduced API latency from 800ms to 120ms through query optimization", "Implemented feature flagging system enabling safe rollouts"]',
    'Fast-growing startup with technical debt piling up. The auth system was a security liability and performance was degrading as we scaled.',
    'Prioritized ruthlessly. Fixed the security issues first, then tackled performance. Built relationships with product to negotiate scope on new features while paying down debt.',
    'Rebuilt auth with OAuth 2.0 and JWT, optimized PostgreSQL queries with proper indexing and connection pooling, built feature flag system with Redis.',
    'Startups need pragmatic engineers who can balance speed with quality. Perfect is the enemy of shipped. But shipped with critical bugs is worse than not shipping.',
    2
  );

INSERT INTO skills (name, category, display_order) VALUES
  ('React & TypeScript', 'strong', 1),
  ('Node.js & Python', 'strong', 2),
  ('PostgreSQL & Redis', 'strong', 3),
  ('Kubernetes & Docker', 'strong', 4),
  ('System Design', 'strong', 5),
  ('GraphQL', 'moderate', 6),
  ('Rust', 'moderate', 7),
  ('Mobile Development', 'moderate', 8),
  ('Go', 'gap', 9),
  ('Machine Learning', 'gap', 10),
  ('Game Development', 'gap', 11);