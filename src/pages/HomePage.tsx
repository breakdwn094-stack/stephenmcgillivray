import { useEffect, useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Hero } from '../components/Hero';
import { ExperienceSection } from '../components/ExperienceSection';
import { SkillsMatrix } from '../components/SkillsMatrix';
import { JDAnalyzer } from '../components/JDAnalyzer';
import { ChatDrawer } from '../components/ChatDrawer';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { supabase, CandidateProfile, Experience, Skill } from '../lib/supabase';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

export function HomePage() {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const candidateId = '00000000-0000-0000-0000-000000000001';

      const [profileRes, experiencesRes, skillsRes] = await Promise.all([
        supabase.from('candidate_profile').select('*').eq('id', candidateId).maybeSingle(),
        supabase.from('experiences').select('*').eq('candidate_id', candidateId).order('display_order'),
        supabase.from('skills').select('*').eq('candidate_id', candidateId).order('display_order')
      ]);

      if (profileRes.error) throw profileRes.error;
      if (experiencesRes.error) throw experiencesRes.error;
      if (skillsRes.error) throw skillsRes.error;

      if (!profileRes.data) {
        throw new Error('Profile not found');
      }

      setProfile(profileRes.data);
      setExperiences(experiencesRes.data || []);
      setSkills(skillsRes.data || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-[#3b82f6] animate-spin" />
        <p className="text-gray-400">Loading portfolio...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Portfolio</h1>
          <p className="text-gray-400 max-w-md">{error || 'Profile data not found'}</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-white transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Navigation initials={profile.name.split(' ').map(n => n[0]).join('')} onAskAI={() => setChatOpen(true)} />

      <main>
        <Hero
          profile={profile}
          onAskAI={() => setChatOpen(true)}
        />

        <ExperienceSection experiences={experiences} />

        <SkillsMatrix skills={skills} />

        <JDAnalyzer />
      </main>

      <Footer profile={profile} />

      <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />

      <ScrollToTop />
    </div>
  );
}
