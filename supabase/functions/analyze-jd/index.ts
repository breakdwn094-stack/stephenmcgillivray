import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AnalyzeJDRequest {
  jobDescription: string;
}

interface Gap {
  requirement: string;
  gap_title: string;
  explanation: string;
}

interface AnalysisResult {
  verdict: "strong_fit" | "worth_conversation" | "probably_not";
  headline: string;
  opening: string;
  gaps: Gap[];
  transfers: string;
  recommendation: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { jobDescription }: AnalyzeJDRequest = await req.json();

    if (!jobDescription?.trim()) {
      return new Response(
        JSON.stringify({ error: "Job description is required" }),
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
      instructionsRes,
    ] = await Promise.all([
      supabase.from("candidate_profile").select("*").eq("id", candidateId).maybeSingle(),
      supabase.from("experiences").select("*").eq("candidate_id", candidateId).order("display_order"),
      supabase.from("skills").select("*").eq("candidate_id", candidateId).order("display_order"),
      supabase.from("gaps_weaknesses").select("*").eq("candidate_id", candidateId),
      supabase.from("values_culture").select("*").eq("candidate_id", candidateId).maybeSingle(),
      supabase.from("ai_instructions").select("*").eq("candidate_id", candidateId).order("priority"),
    ]);

    const profile = profileRes.data;
    const experiences = experiencesRes.data || [];
    const skills = skillsRes.data || [];
    const gaps = gapsRes.data || [];
    const values = valuesRes.data;
    const instructions = instructionsRes.data || [];

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const systemPrompt = buildAnalysisPrompt(profile, experiences, skills, gaps, values, instructions);

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
        max_tokens: 2048,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Here is the job description to analyze:\n\n${jobDescription}`,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get AI analysis" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    let aiResponse = anthropicData.content[0].text;

    // Strip markdown code fences if present
    aiResponse = aiResponse.trim();
    if (aiResponse.startsWith("```json")) {
      aiResponse = aiResponse.slice(7);
    } else if (aiResponse.startsWith("```")) {
      aiResponse = aiResponse.slice(3);
    }
    if (aiResponse.endsWith("```")) {
      aiResponse = aiResponse.slice(0, -3);
    }
    aiResponse = aiResponse.trim();

    let analysis: AnalysisResult;
    try {
      analysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse);
      return new Response(
        JSON.stringify({ error: "Failed to parse analysis response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-jd function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function buildAnalysisPrompt(
  profile: any,
  experiences: any[],
  skills: any[],
  gaps: any[],
  values: any,
  instructions: any[]
): string {
  const strongSkills = skills.filter(s => s.category === "strong");
  const gapSkills = skills.filter(s => s.category === "gap");

  let prompt = `You are analyzing a job description to assess fit for ${profile.name}.
Give a BRUTALLY HONEST assessment of whether ${profile.name} is a good fit.

Your assessment MUST:
1. Identify specific requirements from the JD that ${profile.name} DOES NOT meet
2. Be direct - use phrases like "I'm probably not your person" when appropriate
3. Explain what DOES transfer even if it's not a perfect fit
4. Give a clear recommendation

## CRITICAL INSTRUCTIONS - READ THESE FIRST

`;

  // Add ai_instructions at the TOP of the prompt so they take priority
  if (instructions.length > 0) {
    instructions.forEach(inst => {
      prompt += `- ${inst.instruction}\n`;
    });
  }

  prompt += `
## ABOUT ${profile.name}

${profile.elevator_pitch}

Current title: ${profile.title}
Target roles: ${profile.target_titles?.join(", ") || "N/A"}
Looking for: ${profile.looking_for}
NOT looking for: ${profile.not_looking_for}

## EXPERIENCE SUMMARY (WITH LEADERSHIP DETAILS)

`;

  // Include more detail about each experience, including leadership
  experiences.forEach(exp => {
    const startYear = new Date(exp.start_date).getFullYear();
    const endYear = exp.end_date ? new Date(exp.end_date).getFullYear() : "Present";
    prompt += `### ${exp.company_name} (${startYear}-${endYear}): ${exp.title}\n`;
    if (exp.actual_contributions) {
      prompt += `${exp.actual_contributions}\n`;
    }
    if (exp.manager_would_say) {
      prompt += `Manager perspective: ${exp.manager_would_say}\n`;
    }
    prompt += `\n`;
  });

  prompt += `## STRONG SKILLS\n`;
  strongSkills.forEach(skill => {
    prompt += `- ${skill.skill_name}`;
    if (skill.honest_notes) prompt += ` (${skill.honest_notes})`;
    prompt += `\n`;
  });

  prompt += `\n## KNOWN GAPS (Be careful - only list these as gaps if they are ACTUALLY gaps)\n`;
  gapSkills.forEach(skill => {
    prompt += `- ${skill.skill_name}`;
    if (skill.honest_notes) prompt += ` (${skill.honest_notes})`;
    prompt += `\n`;
  });

  gaps.forEach(gap => {
    prompt += `- ${gap.description}`;
    if (gap.why_its_a_gap) prompt += ` - ${gap.why_its_a_gap}`;
    prompt += `\n`;
  });

  if (values) {
    prompt += `\n## DEALBREAKERS\n`;
    if (values.dealbreakers && values.dealbreakers.length > 0) {
      values.dealbreakers.forEach((d: string) => {
        prompt += `- ${d}\n`;
      });
    }
  }

  prompt += `\n## OUTPUT FORMAT

Respond ONLY with valid JSON in this exact format:
{
  "verdict": "strong_fit" | "worth_conversation" | "probably_not",
  "headline": "Brief headline for the assessment",
  "opening": "1-2 sentence direct assessment in first person",
  "gaps": [
    {
      "requirement": "What the JD asks for",
      "gap_title": "Short title",
      "explanation": "Why this is a gap for me"
    }
  ],
  "transfers": "What skills/experience DO transfer",
  "recommendation": "Direct advice - can be 'don't hire me for this'"
}

Rules:
- Speak in first person as ${profile.name}
- Be brutally honest about ACTUAL gaps, but do NOT invent gaps that don't exist
- If the CRITICAL INSTRUCTIONS say something is a strength, do NOT list it as a gap
- If there are NO gaps, use an empty array for gaps
- If it's a bad fit, say so directly
- Don't sugarcoat anything
- Never use em dashes; use commas, semicolons, or separate sentences instead`;

  return prompt;
}
