import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Experience } from '../lib/supabase';

interface ExperienceSectionProps {
  experiences: Experience[];
}

function ExperienceCard({ experience }: { experience: Experience }) {
  const [showContext, setShowContext] = useState(false);

  const formatDateRange = () => {
    const startYear = new Date(experience.start_date).getFullYear();
    const endYear = experience.end_date ? new Date(experience.end_date).getFullYear() : 'Present';
    return `${startYear}–${endYear}`;
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-2xl font-semibold text-white mb-1">
            {experience.company_name}
          </h3>
          <p className="text-[#3b82f6] font-medium">
            {experience.title_progression || experience.title}
          </p>
        </div>
        <div className="text-gray-400 text-sm whitespace-nowrap">
          {formatDateRange()}
        </div>
      </div>

      <ul className="space-y-2 mb-6">
        {experience.bullet_points.map((achievement, idx) => (
          <li key={idx} className="text-gray-300 flex items-start gap-3">
            <span className="text-[#3b82f6] mt-1">•</span>
            <span>{achievement}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => setShowContext(!showContext)}
        className="inline-flex items-center gap-2 text-[#3b82f6] hover:text-[#2563eb] transition-colors font-medium"
      >
        <Sparkles className="w-4 h-4" />
        {showContext ? 'Hide' : 'Show'} AI Context
      </button>

      {showContext && (
        <div className="mt-6 bg-black/40 border border-white/5 rounded-xl p-6 space-y-4 animate-fadeIn">
          {experience.why_joined && (
            <div>
              <h4 className="text-white font-semibold mb-2 uppercase text-sm tracking-wide">
                Why I Joined
              </h4>
              <p className="text-gray-400 italic leading-relaxed">
                {experience.why_joined}
              </p>
            </div>
          )}
          {experience.actual_contributions && (
            <div>
              <h4 className="text-white font-semibold mb-2 uppercase text-sm tracking-wide">
                Actual Contributions
              </h4>
              <p className="text-gray-400 italic leading-relaxed">
                {experience.actual_contributions}
              </p>
            </div>
          )}
          {experience.challenges_faced && (
            <div>
              <h4 className="text-white font-semibold mb-2 uppercase text-sm tracking-wide">
                Challenges Faced
              </h4>
              <p className="text-gray-400 italic leading-relaxed">
                {experience.challenges_faced}
              </p>
            </div>
          )}
          {experience.lessons_learned && (
            <div>
              <h4 className="text-white font-semibold mb-2 uppercase text-sm tracking-wide">
                Lessons Learned
              </h4>
              <p className="text-gray-400 italic leading-relaxed">
                {experience.lessons_learned}
              </p>
            </div>
          )}
          {experience.why_left && (
            <div>
              <h4 className="text-white font-semibold mb-2 uppercase text-sm tracking-wide">
                Why I Left
              </h4>
              <p className="text-gray-400 italic leading-relaxed">
                {experience.why_left}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  return (
    <section id="experience" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl font-serif font-bold text-white mb-4">
          Experience
        </h2>
        <p className="text-xl text-gray-400 mb-12 max-w-3xl">
          Each role includes queryable AI context—the real story behind the bullet points.
        </p>

        <div className="space-y-6">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </div>
    </section>
  );
}
