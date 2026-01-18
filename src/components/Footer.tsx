import { useState } from 'react';
import { Github, Linkedin, Mail, Check, Copy } from 'lucide-react';
import { CandidateProfile } from '../lib/supabase';

interface FooterProps {
  profile: CandidateProfile;
}

export function Footer({ profile }: FooterProps) {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    if (profile.email) {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <footer className="py-16 px-6 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-serif font-bold text-white mb-1">
              {profile.name}
            </h3>
            <p className="text-gray-400">{profile.title}</p>
            {profile.location && (
              <p className="text-gray-500 text-sm mt-1">{profile.location}</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            {profile.github_url && (
              <a
                href={profile.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5 text-gray-300" />
              </a>
            )}
            {profile.linkedin_url && profile.linkedin_url !== '[TO FILL IN]' && (
              <a
                href={profile.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5 text-gray-300" />
              </a>
            )}
            <button
              onClick={copyEmail}
              className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition-all text-gray-300 hover:text-white"
              title={`Copy email: ${profile.email}`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#3b82f6]" />
                  <span className="text-sm text-[#3b82f6]">Copied!</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span className="text-sm hidden sm:inline">Copy Email</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            An AI-queryable portfolio. Ask hard questions.
          </p>
          <div className="flex items-center gap-2 text-gray-600 text-xs">
            <span className="w-2 h-2 bg-[#3b82f6] rounded-full animate-pulse"></span>
            <span>Available {profile.availability_date ? `from ${new Date(profile.availability_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` : 'now'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
