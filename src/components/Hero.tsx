import { MessageCircle, ChevronDown } from 'lucide-react';
import { CandidateProfile } from '../lib/supabase';

interface HeroProps {
  profile: CandidateProfile;
  onAskAI: () => void;
}

export function Hero({ profile, onAskAI }: HeroProps) {
  const scrollToExperience = () => {
    const element = document.getElementById('experience');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const statusText = `${profile.target_titles[0] || 'Senior Roles'} at ${profile.target_company_stages.join(', ') || 'Growing Companies'}`;

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 relative">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-full px-4 py-2 text-sm">
          <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse"></span>
          <span className="text-gray-300">
            Open to {statusText}
          </span>
        </div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-serif font-bold text-white leading-tight">
          {profile.name}
        </h1>

        <p className="text-2xl md:text-3xl text-[#3b82f6] font-medium">
          {profile.title}
        </p>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          {profile.elevator_pitch}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          {profile.target_company_stages.map((stage, idx) => (
            <div
              key={idx}
              className="px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full text-sm text-gray-300 hover:bg-white/10 transition-all"
            >
              {stage}
            </div>
          ))}
        </div>

        <div className="pt-8">
          <button
            onClick={onAskAI}
            className="bg-[#3b82f6] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-[#2563eb] transition-all inline-flex items-center gap-3 shadow-2xl shadow-[#3b82f6]/30 hover:scale-105 transform"
          >
            <MessageCircle className="w-5 h-5" />
            Ask AI About Me
          </button>
        </div>
      </div>

      <button
        onClick={scrollToExperience}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500 hover:text-gray-300 transition-colors animate-bounce"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
