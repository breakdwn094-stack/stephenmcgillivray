/*
  # Optimize RLS Policy Performance
  
  ## Changes
  
  1. **Performance Optimization**
     - Replace `auth.uid()` with `(select auth.uid())` in all policies
     - This prevents re-evaluation for each row, improving query performance at scale
     - The function is called once per query instead of once per row
  
  2. **Affected Tables**
     - candidate_profile (4 policies)
     - experiences (4 policies)
     - skills (4 policies)
     - gaps_weaknesses (4 policies)
     - values_culture (4 policies)
     - faq_responses (4 policies)
     - ai_instructions (4 policies)
     - chat_messages (4 policies)
  
  ## Security Model (Unchanged)
     - Public (anon): Can SELECT all portfolio data and INSERT chat messages
     - Authenticated (owner): Can manage all portfolio data
*/

-- Drop existing authenticated policies for candidate_profile
DROP POLICY IF EXISTS "Authenticated can select candidate_profile" ON candidate_profile;
DROP POLICY IF EXISTS "Authenticated can insert candidate_profile" ON candidate_profile;
DROP POLICY IF EXISTS "Authenticated can update candidate_profile" ON candidate_profile;
DROP POLICY IF EXISTS "Authenticated can delete candidate_profile" ON candidate_profile;

-- Create optimized policies for candidate_profile
CREATE POLICY "Authenticated can select candidate_profile"
  ON candidate_profile FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert candidate_profile"
  ON candidate_profile FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update candidate_profile"
  ON candidate_profile FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete candidate_profile"
  ON candidate_profile FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop existing authenticated policies for experiences
DROP POLICY IF EXISTS "Authenticated can select experiences" ON experiences;
DROP POLICY IF EXISTS "Authenticated can insert experiences" ON experiences;
DROP POLICY IF EXISTS "Authenticated can update experiences" ON experiences;
DROP POLICY IF EXISTS "Authenticated can delete experiences" ON experiences;

-- Create optimized policies for experiences
CREATE POLICY "Authenticated can select experiences"
  ON experiences FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert experiences"
  ON experiences FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update experiences"
  ON experiences FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete experiences"
  ON experiences FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop existing authenticated policies for skills
DROP POLICY IF EXISTS "Authenticated can select skills" ON skills;
DROP POLICY IF EXISTS "Authenticated can insert skills" ON skills;
DROP POLICY IF EXISTS "Authenticated can update skills" ON skills;
DROP POLICY IF EXISTS "Authenticated can delete skills" ON skills;

-- Create optimized policies for skills
CREATE POLICY "Authenticated can select skills"
  ON skills FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update skills"
  ON skills FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete skills"
  ON skills FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop existing authenticated policies for gaps_weaknesses
DROP POLICY IF EXISTS "Authenticated can select gaps_weaknesses" ON gaps_weaknesses;
DROP POLICY IF EXISTS "Authenticated can insert gaps_weaknesses" ON gaps_weaknesses;
DROP POLICY IF EXISTS "Authenticated can update gaps_weaknesses" ON gaps_weaknesses;
DROP POLICY IF EXISTS "Authenticated can delete gaps_weaknesses" ON gaps_weaknesses;

-- Create optimized policies for gaps_weaknesses
CREATE POLICY "Authenticated can select gaps_weaknesses"
  ON gaps_weaknesses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert gaps_weaknesses"
  ON gaps_weaknesses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update gaps_weaknesses"
  ON gaps_weaknesses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete gaps_weaknesses"
  ON gaps_weaknesses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop existing authenticated policies for values_culture
DROP POLICY IF EXISTS "Authenticated can select values_culture" ON values_culture;
DROP POLICY IF EXISTS "Authenticated can insert values_culture" ON values_culture;
DROP POLICY IF EXISTS "Authenticated can update values_culture" ON values_culture;
DROP POLICY IF EXISTS "Authenticated can delete values_culture" ON values_culture;

-- Create optimized policies for values_culture
CREATE POLICY "Authenticated can select values_culture"
  ON values_culture FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert values_culture"
  ON values_culture FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update values_culture"
  ON values_culture FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete values_culture"
  ON values_culture FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop existing authenticated policies for faq_responses
DROP POLICY IF EXISTS "Authenticated can select faq_responses" ON faq_responses;
DROP POLICY IF EXISTS "Authenticated can insert faq_responses" ON faq_responses;
DROP POLICY IF EXISTS "Authenticated can update faq_responses" ON faq_responses;
DROP POLICY IF EXISTS "Authenticated can delete faq_responses" ON faq_responses;

-- Create optimized policies for faq_responses
CREATE POLICY "Authenticated can select faq_responses"
  ON faq_responses FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert faq_responses"
  ON faq_responses FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update faq_responses"
  ON faq_responses FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete faq_responses"
  ON faq_responses FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop existing authenticated policies for ai_instructions
DROP POLICY IF EXISTS "Authenticated can select ai_instructions" ON ai_instructions;
DROP POLICY IF EXISTS "Authenticated can insert ai_instructions" ON ai_instructions;
DROP POLICY IF EXISTS "Authenticated can update ai_instructions" ON ai_instructions;
DROP POLICY IF EXISTS "Authenticated can delete ai_instructions" ON ai_instructions;

-- Create optimized policies for ai_instructions
CREATE POLICY "Authenticated can select ai_instructions"
  ON ai_instructions FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert ai_instructions"
  ON ai_instructions FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update ai_instructions"
  ON ai_instructions FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete ai_instructions"
  ON ai_instructions FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

-- Drop existing authenticated policies for chat_messages
DROP POLICY IF EXISTS "Authenticated can select chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated can insert chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated can update chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Authenticated can delete chat_messages" ON chat_messages;

-- Create optimized policies for chat_messages
CREATE POLICY "Authenticated can select chat_messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can insert chat_messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can update chat_messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL)
  WITH CHECK ((select auth.uid()) IS NOT NULL);

CREATE POLICY "Authenticated can delete chat_messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING ((select auth.uid()) IS NOT NULL);
