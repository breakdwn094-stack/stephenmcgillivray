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
import { AlertCircle, RefreshCw } from 'lucide-react';

const CACHE_KEY = 'portfolio_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  profile: CandidateProfile;
  experiences: Experience[];
  skills: Skill[];
  timestamp: number;
}

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation skeleton */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="w-10 h-10 bg-white/10 rounded-lg animate-pulse" />
          <div className="w-24 h-10 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </nav>

      {/* Hero skeleton */}
      <section className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-6 animate-pulse" />
          <div className="h-12 bg-white/10 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-white/10 rounded-lg w-1/2 mx-auto mb-8 animate-pulse" />
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="h-4 bg-white/5 rounded w-full animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-white/5 rounded w-4/5 animate-pulse" />
          </div>
          <div className="flex gap-4 justify-center mt-8">
            <div className="w-32 h-12 bg-white/10 rounded-lg animate-pulse" />
            <div className="w-32 h-12 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </section>

      {/* Experience skeleton */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-10 bg-white/10 rounded-lg w-64 mx-auto mb-12 animate-pulse" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="h-6 bg-white/10 rounded w-48 mb-2 animate-pulse" />
                    <div className="h-4 bg-white/5 rounded w-32 animate-pulse" />
                  </div>
                  <div className="h-6 bg-white/10 rounded w-24 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/5 rounded w-full animate-pulse" />
                  <div className="h-3 bg-white/5 rounded w-5/6 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

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
    // Try to load from cache first for instant display
    const cached = loadFromCache();
    if (cached) {
      setProfile(cached.profile);
      setExperiences(cached.experiences);
      setSkills(cached.skills);
      setLoading(false);
      
      // Refresh in background if cache is stale
      if (Date.now() - cached.timestamp > CACHE_DURATION) {
        fetchFreshData(false);
      }
      return;
    }

    // No cache, fetch fresh data
    await fetchFreshData(true);
  };

  const loadFromCache = (): CachedData | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Cache read error:', e);
    }
    return null;
  };

  const saveToCache = (data: CachedData) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Cache write error:', e);
    }
  };

  const fetchFreshData = async (showLoading: boolean) => {
    if (showLoading) {
      setLoading(true);
    }
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

      const freshData = {
        profile: profileRes.data,
        experiences: experiencesRes.data || [],
        skills: skillsRes.data || [],
        timestamp: Date.now()
      };

      // Save to cache
      saveToCache(freshData);

      // Update state
      setProfile(freshData.profile);
      setExperiences(freshData.experiences);
      setSkills(freshData.skills);
    } catch (err) {
      console.error('Error loading data:', err);
      if (showLoading) {
        setError(err instanceof Error ? err.message : 'Failed to load portfolio data');
      }
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <SkeletonLoader />;
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
          onClick={() => fetchFreshData(true)}
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
