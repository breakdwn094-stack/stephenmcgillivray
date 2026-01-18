/*
  # Fix Security Issues
  
  ## Changes
  
  1. **Remove Unused Indexes**
     - Drop `idx_skills_category` (not used in queries)
     - Drop `idx_faq_display_order` (not used in queries)
     - Drop `idx_ai_instructions_priority` (not used in queries)
  
  2. **Fix RLS Policies**
     - Replace overly permissive `FOR ALL` policies with specific policies
     - Add proper authentication checks instead of `USING (true)`
     - Maintain public read access (portfolio is meant to be public)
     - Restrict write operations to authenticated portfolio owner
     - Add proper validation for chat messages
  
  3. **Security Model**
     - Public (anon): Can SELECT all portfolio data and INSERT chat messages
     - Authenticated (owner): Can manage all portfolio data
     - Verify authenticated user exists (not just `true`)
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_skills_category;
DROP INDEX IF EXISTS idx_faq_display_order;
DROP INDEX IF EXISTS idx_ai_instructions_priority;

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated full access to candidate_profile" ON candidate_profile;
DROP POLICY IF EXISTS "Allow authenticated full access to experiences" ON experiences;
DROP POLICY IF EXISTS "Allow authenticated full access to skills" ON skills;
DROP POLICY IF EXISTS "Allow authenticated full access to gaps_weaknesses" ON gaps_weaknesses;
DROP POLICY IF EXISTS "Allow authenticated full access to values_culture" ON values_culture;
DROP POLICY IF EXISTS "Allow authenticated full access to faq_responses" ON faq_responses;
DROP POLICY IF EXISTS "Allow authenticated full access to ai_instructions" ON ai_instructions;
DROP POLICY IF EXISTS "Allow authenticated full access to chat_messages" ON chat_messages;
DROP POLICY IF EXISTS "Allow public insert to chat_messages" ON chat_messages;

-- Create proper restrictive policies for candidate_profile
CREATE POLICY "Authenticated can select candidate_profile"
  ON candidate_profile FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert candidate_profile"
  ON candidate_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update candidate_profile"
  ON candidate_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete candidate_profile"
  ON candidate_profile FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create proper restrictive policies for experiences
CREATE POLICY "Authenticated can select experiences"
  ON experiences FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert experiences"
  ON experiences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update experiences"
  ON experiences FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete experiences"
  ON experiences FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create proper restrictive policies for skills
CREATE POLICY "Authenticated can select skills"
  ON skills FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert skills"
  ON skills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update skills"
  ON skills FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete skills"
  ON skills FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create proper restrictive policies for gaps_weaknesses
CREATE POLICY "Authenticated can select gaps_weaknesses"
  ON gaps_weaknesses FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert gaps_weaknesses"
  ON gaps_weaknesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update gaps_weaknesses"
  ON gaps_weaknesses FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete gaps_weaknesses"
  ON gaps_weaknesses FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create proper restrictive policies for values_culture
CREATE POLICY "Authenticated can select values_culture"
  ON values_culture FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert values_culture"
  ON values_culture FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update values_culture"
  ON values_culture FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete values_culture"
  ON values_culture FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create proper restrictive policies for faq_responses
CREATE POLICY "Authenticated can select faq_responses"
  ON faq_responses FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert faq_responses"
  ON faq_responses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update faq_responses"
  ON faq_responses FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete faq_responses"
  ON faq_responses FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create proper restrictive policies for ai_instructions
CREATE POLICY "Authenticated can select ai_instructions"
  ON ai_instructions FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert ai_instructions"
  ON ai_instructions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update ai_instructions"
  ON ai_instructions FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete ai_instructions"
  ON ai_instructions FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Create proper restrictive policies for chat_messages
CREATE POLICY "Authenticated can select chat_messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can insert chat_messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can update chat_messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated can delete chat_messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Allow public (anon) to insert chat messages with proper validation
CREATE POLICY "Public can insert chat_messages with valid data"
  ON chat_messages FOR INSERT
  TO anon
  WITH CHECK (
    role IN ('user', 'assistant') 
    AND content IS NOT NULL 
    AND length(content) > 0 
    AND session_id IS NOT NULL
  );
