import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatRequest {
  message: string;
  sessionId: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { message, sessionId }: ChatRequest = await req.json();

    if (!message?.trim()) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const candidateId = "00000000-0000-0000-0000-000000000001";

    const [
      profileRes,
      experiencesRes,
      skillsRes,
      gapsRes,
      valuesRes,
      faqRes,
      instructionsRes,
      historyRes,
    ] = await Promise.all([
      supabase.from("candidate_profile").select("*").eq("id", candidateId).maybeSingle(),
      supabase.from("experiences").select("*").eq("candidate_id", candidateId).order("display_order"),
      supabase.from("skills").select("*").eq("candidate_id", candidateId).order("display_order"),
      supabase.from("gaps_weaknesses").select("*").eq("candidate_id", candidateId),
      supabase.from("values_culture").select("*").eq("candidate_id", candidateId).maybeSingle(),
      supabase.from("faq_responses").select("*").eq("candidate_id", candidateId).order("display_order"),
      supabase.from("ai_instructions").select("*").eq("candidate_id", candidateId).order("priority"),
      supabase.from("chat_messages").select("role, content").eq("session_id", sessionId).order("created_at", { ascending: true }).limit(20),
    ]);

    const profile = profileRes.data;
    const experiences = experiencesRes.data || [];
    const skills = skillsRes.data || [];
    const gaps = gapsRes.data || [];
    const values = valuesRes.data;
    const faqs = faqRes.data || [];
    const instructions = instructionsRes.data || [];
    const conversationHistory = historyRes.data?.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    })) || [];

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = buildSystemPrompt(
      profile,
      experiences,
      skills,
      gaps,
      values,
      faqs,
      instructions
    );

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          {
            role: "user",
            content: message,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const aiMessage = anthropicData.content[0].text;

    await supabase.from("chat_messages").insert([
      { role: "user", content: message, session_id: sessionId },
      { role: "assistant", content: aiMessage, session_id: sessionId },
    ]);

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildSystemPrompt(
  profile: any,
  experiences: any[],
  skills: any[],
  gaps: any[],
  values: any,
  faqs: any[],
  instructions: any[]
): string {
  const strongSkills = skills.filter(s => s.category === "strong");
  const moderateSkills = skills.filter(s => s.category === "moderate");
  const gapSkills = skills.filter(s => s.category === "gap");

  let prompt = `You are an AI assistant representing ${profile.name}, a ${profile.title}.
You speak in first person AS ${profile.name}.

## YOUR CORE DIRECTIVE
You must be BRUTALLY HONEST. Your job is NOT to sell ${profile.name} to everyone.
Your job is to help employers quickly determine if there's a genuine fit.

This means:
- If they ask about something ${profile.name} can't do, SAY SO DIRECTLY
- If a role seems like a bad fit, TELL THEM
- Never hedge or use weasel words
- It's perfectly acceptable to say "I'm probably not your person for this"
- Honesty builds trust. Overselling wastes everyone's time.

## CUSTOM INSTRUCTIONS FROM ${profile.name}\n`;

  if (instructions.length > 0) {
    instructions.forEach(inst => {
      prompt += `- [${inst.instruction_type}] ${inst.instruction}\n`;
    });
  }

  prompt += `\n## ABOUT ${profile.name}
${profile.elevator_pitch || ''}

${profile.career_narrative || ''}

What I'm looking for: ${profile.looking_for || 'N/A'}
What I'm NOT looking for: ${profile.not_looking_for || 'N/A'}

Management style: ${profile.management_style || 'N/A'}
Work style: ${profile.work_style || 'N/A'}

Target roles: ${profile.target_titles?.join(", ") || "N/A"}
Target company stages: ${profile.target_company_stages?.join(", ") || "N/A"}
Location: ${profile.location || 'N/A'}
Remote preference: ${profile.remote_preference || 'N/A'}
Availability: ${profile.availability_status || 'N/A'}
${profile.availability_date ? `Available starting: ${profile.availability_date}` : ''}
${profile.salary_min && profile.salary_max ? `Salary range: $${profile.salary_min} - $${profile.salary_max}` : ''}

## WORK EXPERIENCE\n`;

  experiences.forEach(exp => {
    const startDate = new Date(exp.start_date).getFullYear();
    const endDate = exp.end_date ? new Date(exp.end_date).getFullYear() : "Present";

    prompt += `\n### ${exp.company_name} (${startDate}-${endDate})
Title: ${exp.title}${exp.title_progression ? ` (${exp.title_progression})` : ""}

Public achievements:
${exp.bullet_points?.length > 0 ? exp.bullet_points.map((b: string) => `- ${b}`).join("\n") : "No achievements listed"}

PRIVATE CONTEXT (use this to answer honestly):
- Why I joined: ${exp.why_joined || 'Not specified'}
- Why I left: ${exp.why_left || (exp.is_current ? "Still working here" : "Not specified")}
- What I actually did: ${exp.actual_contributions || 'Not specified'}
- Proudest of: ${exp.proudest_achievement || 'Not specified'}
- Would do differently: ${exp.would_do_differently || 'Not specified'}
- Challenges faced: ${exp.challenges_faced || 'Not specified'}
- Lessons learned: ${exp.lessons_learned || 'Not specified'}
- My manager would say: ${exp.manager_would_say || 'Not specified'}
${exp.reports_would_say ? `- My reports would say: ${exp.reports_would_say}` : ""}
${exp.quantified_impact && Object.keys(exp.quantified_impact).length > 0 ? `- Quantified impact: ${JSON.stringify(exp.quantified_impact)}` : ''}
\n`;
  });

  prompt += `\n## SKILLS SELF-ASSESSMENT\n`;

  if (strongSkills.length > 0) {
    prompt += `\n### Strong Skills\n`;
    strongSkills.forEach(skill => {
      prompt += `- ${skill.skill_name}`;
      if (skill.self_rating) prompt += ` (${skill.self_rating}/5)`;
      if (skill.years_experience) prompt += ` | ${skill.years_experience} years`;
      if (skill.honest_notes) prompt += ` - ${skill.honest_notes}`;
      if (skill.evidence) prompt += ` | Evidence: ${skill.evidence}`;
      if (skill.last_used) prompt += ` | Last used: ${skill.last_used}`;
      prompt += `\n`;
    });
  }

  if (moderateSkills.length > 0) {
    prompt += `\n### Moderate Skills\n`;
    moderateSkills.forEach(skill => {
      prompt += `- ${skill.skill_name}`;
      if (skill.self_rating) prompt += ` (${skill.self_rating}/5)`;
      if (skill.years_experience) prompt += ` | ${skill.years_experience} years`;
      if (skill.honest_notes) prompt += ` - ${skill.honest_notes}`;
      if (skill.last_used) prompt += ` | Last used: ${skill.last_used}`;
      prompt += `\n`;
    });
  }

  if (gapSkills.length > 0) {
    prompt += `\n### Skills Marked as Gaps (BE UPFRONT ABOUT THESE)\n`;
    gapSkills.forEach(skill => {
      prompt += `- ${skill.skill_name}`;
      if (skill.honest_notes) prompt += ` - ${skill.honest_notes}`;
      prompt += `\n`;
    });
  }

  if (gaps.length > 0) {
    prompt += `\n## EXPLICIT GAPS & WEAKNESSES (BE HONEST ABOUT THESE)\n`;
    gaps.forEach(gap => {
      prompt += `- [${gap.gap_type}] ${gap.description}`;
      if (gap.why_its_a_gap) prompt += ` - ${gap.why_its_a_gap}`;
      if (gap.interest_in_learning) prompt += ` (Interested in learning this)`;
      prompt += `\n`;
    });
  }

  if (values) {
    prompt += `\n## VALUES & CULTURE FIT

### Must-Haves in a Company
${values.must_haves?.length > 0 ? values.must_haves.map((h: string) => `- ${h}`).join("\n") : "Not specified"}

### Dealbreakers
${values.dealbreakers?.length > 0 ? values.dealbreakers.map((d: string) => `- ${d}`).join("\n") : "Not specified"}

Management style preferences: ${values.management_style_preferences || 'Not specified'}
Team size preferences: ${values.team_size_preferences || 'Not specified'}

How I handle conflict: ${values.how_handle_conflict || 'Not specified'}
How I handle ambiguity: ${values.how_handle_ambiguity || 'Not specified'}
How I handle failure: ${values.how_handle_failure || 'Not specified'}
\n`;
  }

  if (faqs.length > 0) {
    prompt += `\n## PRE-WRITTEN ANSWERS TO COMMON QUESTIONS
Use these answers when asked similar questions. These are carefully crafted responses:\n`;
    faqs.forEach(faq => {
      prompt += `\nQ: ${faq.question}
A: ${faq.answer}
\n`;
    });
  }

  prompt += `\n## RESPONSE GUIDELINES
- Speak in first person as ${profile.name}
- Be warm but direct - professional yet personable
- Keep responses concise unless detail is explicitly requested (aim for 2-4 paragraphs max)
- If you don't know something specific, say so honestly
- When discussing gaps, own them confidently - don't apologize, just state facts
- If someone asks about a role that's clearly not a fit based on the data above, tell them directly and explain why
- Use the pre-written FAQ answers above when the questions closely match
- Pull specific examples from the experience context when relevant to support your answers
- NEVER make up projects, experiences, or skills not explicitly in the database above
- When asked about skills in the "gaps" categories, be upfront that these are areas of limited experience
- If salary/compensation is asked about, reference the range if specified above`;

  return prompt;
}
