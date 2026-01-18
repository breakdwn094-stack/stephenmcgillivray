/*
  # Comprehensive Portfolio Schema

  1. New Tables
    - `candidate_profile`
      - Core profile information
      - Target roles, companies, compensation
      - Social links and availability
    
    - `experiences`
      - Work history with public achievements
      - Private AI context (why joined/left, lessons, impact)
      - Progression tracking
    
    - `skills`
      - Skills categorized as strong/moderate/gap
      - Self-ratings with evidence
      - Experience timeline
    
    - `gaps_weaknesses`
      - Honest gaps and weaknesses
      - Learning interest tracking
    
    - `values_culture`
      - Cultural preferences and dealbreakers
      - Work style preferences
    
    - `faq_responses`
      - Pre-answered common questions
    
    - `ai_instructions`
      - Instructions for AI behavior and tone

  2. Security
    - Enable RLS on all tables
    - Public read access for portfolio data
    - Authenticated write access for admin

  3. Indexes
    - Foreign key indexes for performance
    - Display order indexes for sorting
*/

-- Drop old tables if they exist
DROP TABLE IF EXISTS profile CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS experience CASCADE;
DROP TABLE IF EXISTS skills CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;

-- Create candidate_profile table
CREATE TABLE IF NOT EXISTS candidate_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  name text NOT NULL DEFAULT 'Alex Rivers',
  email text DEFAULT 'alex@example.com',
  title text NOT NULL DEFAULT 'Staff Engineer',
  target_titles text[] DEFAULT ARRAY['Staff Engineer', 'Principal Engineer', 'Engineering Manager'],
  target_company_stages text[] DEFAULT ARRAY['Series B', 'Series C', 'Series D', 'IPO', 'Post-IPO'],
  elevator_pitch text DEFAULT 'I build technical infrastructure that scales, and I help teams ship faster without cutting corners.',
  career_narrative text DEFAULT 'Started as a generalist, evolved into infrastructure and scaling challenges. I care about systems that work and teams that thrive.',
  looking_for text DEFAULT 'Technical challenges at scale, mentorship opportunities, teams that value craft and velocity.',
  not_looking_for text DEFAULT 'Pure management roles, early-stage chaos, companies that treat engineers as code monkeys.',
  management_style text DEFAULT 'Collaborative, context-driven, focused on growth.',
  work_style text DEFAULT 'Deep work blocks, async-first, strong opinions weakly held.',
  salary_min integer DEFAULT 200000,
  salary_max integer DEFAULT 300000,
  availability_status text DEFAULT 'open' CHECK (availability_status IN ('open', 'passive', 'closed')),
  availability_date date,
  location text DEFAULT 'San Francisco, CA',
  remote_preference text DEFAULT 'remote-first' CHECK (remote_preference IN ('remote-only', 'remote-first', 'hybrid', 'on-site')),
  github_url text DEFAULT 'https://github.com',
  linkedin_url text DEFAULT 'https://linkedin.com',
  twitter_url text
);

-- Create experiences table
CREATE TABLE IF NOT EXISTS experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidate_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  company_name text NOT NULL,
  title text NOT NULL,
  title_progression text,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  bullet_points text[] DEFAULT ARRAY[]::text[],
  why_joined text DEFAULT '',
  why_left text DEFAULT '',
  actual_contributions text DEFAULT '',
  proudest_achievement text DEFAULT '',
  would_do_differently text DEFAULT '',
  challenges_faced text DEFAULT '',
  lessons_learned text DEFAULT '',
  manager_would_say text DEFAULT '',
  reports_would_say text DEFAULT '',
  quantified_impact jsonb DEFAULT '{}'::jsonb,
  display_order integer NOT NULL DEFAULT 0
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidate_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  skill_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('strong', 'moderate', 'gap')),
  self_rating integer CHECK (self_rating >= 1 AND self_rating <= 5),
  evidence text DEFAULT '',
  honest_notes text DEFAULT '',
  years_experience integer,
  last_used date,
  display_order integer NOT NULL DEFAULT 0
);

-- Create gaps_weaknesses table
CREATE TABLE IF NOT EXISTS gaps_weaknesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidate_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  gap_type text NOT NULL CHECK (gap_type IN ('skill', 'experience', 'environment', 'role_type')),
  description text NOT NULL,
  why_its_a_gap text DEFAULT '',
  interest_in_learning boolean DEFAULT false
);

-- Create values_culture table
CREATE TABLE IF NOT EXISTS values_culture (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidate_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  must_haves text[] DEFAULT ARRAY[]::text[],
  dealbreakers text[] DEFAULT ARRAY[]::text[],
  management_style_preferences text DEFAULT '',
  team_size_preferences text DEFAULT '',
  how_handle_conflict text DEFAULT '',
  how_handle_ambiguity text DEFAULT '',
  how_handle_failure text DEFAULT ''
);

-- Create faq_responses table
CREATE TABLE IF NOT EXISTS faq_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidate_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  question text NOT NULL,
  answer text NOT NULL,
  is_common_question boolean DEFAULT false,
  display_order integer NOT NULL DEFAULT 0
);

-- Create ai_instructions table
CREATE TABLE IF NOT EXISTS ai_instructions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid REFERENCES candidate_profile(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  instruction_type text NOT NULL CHECK (instruction_type IN ('honesty', 'tone', 'boundaries', 'general')),
  instruction text NOT NULL,
  priority integer NOT NULL DEFAULT 0
);

-- Create chat_messages table (for visitor conversations)
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  session_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE candidate_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE gaps_weaknesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE values_culture ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_instructions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access (portfolio is public)
CREATE POLICY "Allow public read access to candidate_profile"
  ON candidate_profile FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to experiences"
  ON experiences FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to skills"
  ON skills FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to gaps_weaknesses"
  ON gaps_weaknesses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to values_culture"
  ON values_culture FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to faq_responses"
  ON faq_responses FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to ai_instructions"
  ON ai_instructions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to chat_messages"
  ON chat_messages FOR SELECT
  TO anon
  USING (true);

-- Allow public insert for chat messages
CREATE POLICY "Allow public insert to chat_messages"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated users to manage all data
CREATE POLICY "Allow authenticated full access to candidate_profile"
  ON candidate_profile FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to experiences"
  ON experiences FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to skills"
  ON skills FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to gaps_weaknesses"
  ON gaps_weaknesses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to values_culture"
  ON values_culture FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to faq_responses"
  ON faq_responses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to ai_instructions"
  ON ai_instructions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access to chat_messages"
  ON chat_messages FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_experiences_candidate_id ON experiences(candidate_id);
CREATE INDEX IF NOT EXISTS idx_experiences_display_order ON experiences(display_order);
CREATE INDEX IF NOT EXISTS idx_skills_candidate_id ON skills(candidate_id);
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_display_order ON skills(display_order);
CREATE INDEX IF NOT EXISTS idx_gaps_candidate_id ON gaps_weaknesses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_values_candidate_id ON values_culture(candidate_id);
CREATE INDEX IF NOT EXISTS idx_faq_candidate_id ON faq_responses(candidate_id);
CREATE INDEX IF NOT EXISTS idx_faq_display_order ON faq_responses(display_order);
CREATE INDEX IF NOT EXISTS idx_ai_instructions_candidate_id ON ai_instructions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_ai_instructions_priority ON ai_instructions(priority);
CREATE INDEX IF NOT EXISTS idx_chat_session_id ON chat_messages(session_id, created_at);

-- Insert sample data
INSERT INTO candidate_profile (id) VALUES ('00000000-0000-0000-0000-000000000001');

INSERT INTO experiences (candidate_id, company_name, title, title_progression, start_date, end_date, is_current, bullet_points, why_joined, why_left, actual_contributions, proudest_achievement, challenges_faced, lessons_learned, manager_would_say, reports_would_say, display_order) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  'TechCorp',
  'Staff Engineer',
  'Senior Engineer → Staff Engineer',
  '2021-01-01',
  '2024-03-01',
  false,
  ARRAY[
    'Led migration from monolith to microservices, reducing deploy time by 80%',
    'Built real-time data pipeline processing 50M events/day',
    'Mentored 8 engineers, 3 promoted to senior roles'
  ],
  'They were tackling interesting scaling problems and I wanted to level up my infrastructure skills. The team was small enough that I could have real impact.',
  'The company shifted focus toward enterprise sales and away from product innovation. The technical challenges became more about vendor integrations than building new things.',
  'Beyond the migration, I established deployment standards, built observability tooling, and created a mentorship program that became company-wide.',
  'Getting the microservices migration done without a big-bang cutover. We did it incrementally over 6 months with zero downtime.',
  'Convincing leadership to slow down and do the migration right instead of fast. Also dealing with teams that wanted to stick with the monolith.',
  'Big rewrites fail. Small, reversible changes with clear rollback plans win. Also learned that developer experience is a product—treat it like one.',
  'Probably that I''m opinionated but collaborative. I push back on bad ideas but I''m reasonable about finding the right path forward.',
  'That I care about their growth and make time for mentorship even when I''m busy. Several have told me I helped them level up faster than they expected.',
  1
),
(
  '00000000-0000-0000-0000-000000000001',
  'StartupXYZ',
  'Software Engineer',
  'Software Engineer → Senior Engineer',
  '2018-06-01',
  '2020-12-31',
  false,
  ARRAY[
    'Owned authentication system serving 2M users',
    'Reduced API latency from 800ms to 120ms through query optimization',
    'Implemented feature flagging system enabling safe rollouts'
  ],
  'First engineering role out of school. Wanted to learn by doing, and startups seemed like the place for maximum learning velocity.',
  'Ready for bigger technical challenges and a more established team to learn from. The chaos was good for learning but I wanted more structure.',
  'Rebuilt the entire auth system, became the de facto database expert, and helped establish code review culture.',
  'Making the auth system actually secure and performant. It was a mess when I started and production-ready when I left.',
  'Everything was on fire all the time. Technical debt everywhere. Had to balance fixing critical issues with shipping new features.',
  'Startups need pragmatic engineers who can balance speed with quality. Perfect is the enemy of shipped. But shipped with critical bugs is worse than not shipping.',
  'That I learned incredibly fast and took ownership beyond my title. I was a junior engineer doing senior-level work by the end.',
  'N/A - I didn''t manage anyone at this stage.',
  2
);

INSERT INTO skills (candidate_id, skill_name, category, self_rating, evidence, honest_notes, years_experience, display_order) VALUES
('00000000-0000-0000-0000-000000000001', 'React & TypeScript', 'strong', 5, 'Built multiple production apps, mentored team on best practices', 'Very comfortable. Could architect a complex React app from scratch.', 6, 1),
('00000000-0000-0000-0000-000000000001', 'Node.js & Python', 'strong', 5, 'Built APIs handling millions of requests', 'Strong on both. Prefer TypeScript/Node for APIs but Python for data work.', 6, 2),
('00000000-0000-0000-0000-000000000001', 'PostgreSQL & Redis', 'strong', 5, 'Optimized queries at scale, managed replication', 'Deep knowledge. Can optimize complex queries and design schemas.', 5, 3),
('00000000-0000-0000-0000-000000000001', 'Kubernetes & Docker', 'strong', 4, 'Set up entire K8s infrastructure for production', 'Comfortable but not an expert. Can configure and troubleshoot.', 3, 4),
('00000000-0000-0000-0000-000000000001', 'System Design', 'strong', 5, 'Led architecture for microservices migration', 'Strong. Can design distributed systems and make good tradeoffs.', 6, 5),
('00000000-0000-0000-0000-000000000001', 'GraphQL', 'moderate', 3, 'Built one GraphQL API, it was okay', 'Can work with it but prefer REST. The complexity often isn''t worth it.', 2, 6),
('00000000-0000-0000-0000-000000000001', 'Rust', 'moderate', 3, 'Wrote a few tools, read a lot of code', 'Interested but not production-ready. Good for learning low-level concepts.', 1, 7),
('00000000-0000-0000-0000-000000000001', 'Mobile Development', 'moderate', 2, 'Built a few small apps', 'Basic knowledge. Could prototype but not ship production mobile apps.', 1, 8),
('00000000-0000-0000-0000-000000000001', 'Go', 'gap', 1, 'Read some Go, never shipped anything', 'Want to learn it properly. Seems great for backend services.', 0, 9),
('00000000-0000-0000-0000-000000000001', 'Machine Learning', 'gap', 1, 'Took a course, played with models', 'Not my focus. Can use ML APIs but not train models.', 0, 10),
('00000000-0000-0000-0000-000000000001', 'Game Development', 'gap', 1, 'Personal interest only', 'Would love to learn but not relevant to my career.', 0, 11);

INSERT INTO gaps_weaknesses (candidate_id, gap_type, description, why_its_a_gap, interest_in_learning) VALUES
('00000000-0000-0000-0000-000000000001', 'skill', 'Go / Golang', 'Focused on TypeScript/Python stack, never needed Go professionally', true),
('00000000-0000-0000-0000-000000000001', 'skill', 'Machine Learning / AI', 'Haven''t worked in ML-focused roles, only used ML as a consumer via APIs', false),
('00000000-0000-0000-0000-000000000001', 'experience', 'Leading teams larger than 8 people', 'Most experience with small teams and indirect mentorship', true),
('00000000-0000-0000-0000-000000000001', 'environment', 'Early-stage startup (pre-Series A)', 'Prefer more structure and established teams', false);

INSERT INTO values_culture (candidate_id, must_haves, dealbreakers, management_style_preferences, team_size_preferences, how_handle_conflict, how_handle_ambiguity, how_handle_failure) VALUES
(
  '00000000-0000-0000-0000-000000000001',
  ARRAY[
    'Async-first communication',
    'Focus on impact over hours worked',
    'Strong technical culture',
    'Opportunities to mentor'
  ],
  ARRAY[
    'Mandatory office 5 days/week',
    'Micromanagement',
    'No investment in tooling/infrastructure',
    'Toxic blame culture'
  ],
  'I prefer managers who set context and get out of the way. Give me the problem, let me figure out the solution. I want feedback but not hand-holding.',
  'Sweet spot is 5-15 engineers. Small enough to know everyone, large enough to have interesting problems.',
  'Address it directly and early. I''d rather have an uncomfortable conversation now than let it fester. Focus on the problem, not the person.',
  'I''m comfortable with ambiguity as long as we have clear goals. I''ll make assumptions explicit and propose a direction rather than wait for perfect clarity.',
  'Own it, learn from it, share the lessons. I write postmortems for my failures and I expect the same from my team. Blameless but accountable.'
);

INSERT INTO faq_responses (candidate_id, question, answer, is_common_question, display_order) VALUES
('00000000-0000-0000-0000-000000000001', 'What''s your biggest weakness?', 'My biggest weakness is probably impatience with process that doesn''t add clear value. I''ve learned to channel this into advocating for better tooling and automation rather than just complaining, but I still get frustrated when bureaucracy slows down shipping. I''m working on being more diplomatic about it.', true, 1),
('00000000-0000-0000-0000-000000000001', 'Tell me about a project that failed', 'At StartupXYZ, I pushed hard for a GraphQL migration that ended up being the wrong call. We were already struggling with technical debt, and adding a new API paradigm made things worse instead of better. I learned that fancy tech doesn''t fix organizational problems—sometimes the boring solution is the right one. Now I ask "what problem are we solving?" before jumping to solutions.', true, 2),
('00000000-0000-0000-0000-000000000001', 'Why did you leave TechCorp?', 'I left TechCorp because the company shifted focus toward enterprise sales and away from product innovation. The technical challenges became more about vendor integrations than building new things. It was a mutual realization that my strengths weren''t aligned with where the company was heading. No hard feelings—just different priorities.', true, 3),
('00000000-0000-0000-0000-000000000001', 'What would your last manager say about you?', 'My last manager would probably say I''m opinionated but reasonable. I''ll push back on decisions I disagree with, but I''m collaborative about finding the right path forward. They''d also mention that I care a lot about the team—I''ve spent significant time mentoring and helping others grow, sometimes at the expense of my own deliverables.', true, 4);

INSERT INTO ai_instructions (candidate_id, instruction_type, instruction, priority) VALUES
('00000000-0000-0000-0000-000000000001', 'honesty', 'Always be direct and honest. If you don''t know something, say so. If a role isn''t a good fit, explain why clearly.', 1),
('00000000-0000-0000-0000-000000000001', 'tone', 'Professional but conversational. Avoid corporate speak. Be human. Show personality.', 2),
('00000000-0000-0000-0000-000000000001', 'boundaries', 'Don''t share salary expectations unless directly asked. Don''t commit to anything without the real person''s approval.', 3),
('00000000-0000-0000-0000-000000000001', 'general', 'When answering questions, pull from actual experiences in the database. Be specific with examples.', 4);