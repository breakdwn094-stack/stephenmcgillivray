import { useState } from 'react';
import { Check, Circle, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Skill } from '../lib/supabase';

interface SkillsMatrixProps {
  skills: Skill[];
}

function SkillItem({ skill, categoryColor }: { skill: Skill; categoryColor: string }) {
  const [expanded, setExpanded] = useState(false);

  const getRatingWidth = () => {
    if (!skill.self_rating) return '60%';
    return `${(skill.self_rating / 5) * 100}%`;
  };

  return (
    <div className="border-b border-white/5 last:border-0 pb-3 last:pb-0 mb-3 last:mb-0">
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-300 font-medium">{skill.skill_name}</span>
            <div className="flex items-center gap-2">
              {skill.years_experience && (
                <span className="text-gray-500 text-xs">{skill.years_experience}y</span>
              )}
              {(skill.honest_notes || skill.evidence) && (
                <span className="text-gray-600 group-hover:text-gray-400 transition-colors">
                  {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              )}
            </div>
          </div>
          {skill.self_rating && (
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${categoryColor}`}
                style={{ width: getRatingWidth() }}
              />
            </div>
          )}
        </div>
      </div>

      {expanded && (skill.honest_notes || skill.evidence) && (
        <div className="mt-3 pl-0 text-sm text-gray-400 space-y-2 animate-fadeIn">
          {skill.evidence && (
            <p><span className="text-gray-500">Evidence:</span> {skill.evidence}</p>
          )}
          {skill.honest_notes && (
            <p><span className="text-gray-500">Notes:</span> {skill.honest_notes}</p>
          )}
          {skill.last_used && (
            <p><span className="text-gray-500">Last used:</span> {new Date(skill.last_used).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function SkillsMatrix({ skills }: SkillsMatrixProps) {
  const strongSkills = skills.filter(s => s.category === 'strong');
  const moderateSkills = skills.filter(s => s.category === 'moderate');
  const gapSkills = skills.filter(s => s.category === 'gap');

  return (
    <section id="skills" className="py-24 px-6 bg-gradient-to-b from-transparent to-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-5xl font-serif font-bold text-white mb-4 text-center">
          Skills Matrix
        </h2>
        <p className="text-xl text-gray-400 mb-12 text-center max-w-2xl mx-auto">
          Honest assessment of strengths, working knowledge, and growth areas. Click any skill for details.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-[#3b82f6]/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#3b82f6]/20 flex items-center justify-center">
                <Check className="w-5 h-5 text-[#3b82f6]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Strong</h3>
                <p className="text-sm text-gray-500">{strongSkills.length} skills</p>
              </div>
            </div>
            <div>
              {strongSkills.map((skill) => (
                <SkillItem key={skill.id} skill={skill} categoryColor="bg-[#3b82f6]" />
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-gray-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-gray-500/20 flex items-center justify-center">
                <Circle className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Moderate</h3>
                <p className="text-sm text-gray-500">{moderateSkills.length} skills</p>
              </div>
            </div>
            <div>
              {moderateSkills.map((skill) => (
                <SkillItem key={skill.id} skill={skill} categoryColor="bg-gray-400" />
              ))}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-[#d4a574]/30 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-[#d4a574]/20 flex items-center justify-center">
                <X className="w-5 h-5 text-[#d4a574]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Gaps</h3>
                <p className="text-sm text-gray-500">{gapSkills.length} skills</p>
              </div>
            </div>
            <div>
              {gapSkills.map((skill) => (
                <SkillItem key={skill.id} skill={skill} categoryColor="bg-[#d4a574]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
