import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../Router';
import {
  User,
  Briefcase,
  Code,
  AlertTriangle,
  Heart,
  MessageSquare,
  Brain,
  LogOut,
  Eye,
  Loader2
} from 'lucide-react';
import { ProfileTab } from '../components/admin/ProfileTab';
import { ExperienceTab } from '../components/admin/ExperienceTab';
import { SkillsTab } from '../components/admin/SkillsTab';
import { GapsTab } from '../components/admin/GapsTab';
import { ValuesTab } from '../components/admin/ValuesTab';
import { FAQTab } from '../components/admin/FAQTab';
import { AIInstructionsTab } from '../components/admin/AIInstructionsTab';

type TabType = 'profile' | 'experience' | 'skills' | 'gaps' | 'values' | 'faq' | 'ai';

const tabs = [
  { id: 'profile' as TabType, name: 'Profile', icon: User },
  { id: 'experience' as TabType, name: 'Experience', icon: Briefcase },
  { id: 'skills' as TabType, name: 'Skills', icon: Code },
  { id: 'gaps' as TabType, name: 'Gaps', icon: AlertTriangle },
  { id: 'values' as TabType, name: 'Values & Culture', icon: Heart },
  { id: 'faq' as TabType, name: 'FAQ', icon: MessageSquare },
  { id: 'ai' as TabType, name: 'AI Instructions', icon: Brain },
];

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [signingOut, setSigningOut] = useState(false);
  const { user, signOut } = useAuth();
  const { navigate } = useRouter();

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="bg-black/40 border-b border-white/10 sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all inline-flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Site
            </button>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all inline-flex items-center gap-2 disabled:opacity-50"
            >
              {signingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-6">
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sticky top-24">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-2 ${
                      activeTab === tab.id
                        ? 'bg-[#4ade80] text-black font-semibold'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.name}
                  </button>
                );
              })}
            </div>
          </nav>

          <main className="flex-1">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              {activeTab === 'profile' && <ProfileTab />}
              {activeTab === 'experience' && <ExperienceTab />}
              {activeTab === 'skills' && <SkillsTab />}
              {activeTab === 'gaps' && <GapsTab />}
              {activeTab === 'values' && <ValuesTab />}
              {activeTab === 'faq' && <FAQTab />}
              {activeTab === 'ai' && <AIInstructionsTab />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
