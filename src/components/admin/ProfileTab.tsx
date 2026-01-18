import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Plus, X } from 'lucide-react';

const STAGES = ['Seed', 'Series A', 'Series B', 'Series C', 'Series D', 'Public'];
const REMOTE_OPTIONS = ['Remote only', 'Hybrid', 'On-site', 'Flexible'];
const AVAILABILITY_OPTIONS = ['Actively looking', 'Open to opportunities', 'Not looking'];

export function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [targetTitles, setTargetTitles] = useState<string[]>(['']);
  const [targetStages, setTargetStages] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    elevator_pitch: '',
    career_narrative: '',
    looking_for: '',
    not_looking_for: '',
    management_style: '',
    work_style: '',
    salary_min: '',
    salary_max: '',
    availability_status: 'Open to opportunities',
    availability_date: '',
    location: '',
    remote_preference: 'Flexible',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_profile')
        .select('*')
        .eq('id', '00000000-0000-0000-0000-000000000001')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          title: data.title || '',
          elevator_pitch: data.elevator_pitch || '',
          career_narrative: data.career_narrative || '',
          looking_for: data.looking_for || '',
          not_looking_for: data.not_looking_for || '',
          management_style: data.management_style || '',
          work_style: data.work_style || '',
          salary_min: data.salary_min || '',
          salary_max: data.salary_max || '',
          availability_status: data.availability_status || 'Open to opportunities',
          availability_date: data.availability_date || '',
          location: data.location || '',
          remote_preference: data.remote_preference || 'Flexible',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          twitter_url: data.twitter_url || '',
        });
        setTargetTitles(data.target_titles || ['']);
        setTargetStages(data.target_company_stages || []);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setMessage('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const filteredTitles = targetTitles.filter(t => t.trim());

      const { error } = await supabase
        .from('candidate_profile')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          ...formData,
          availability_date: formData.availability_date || null,
          target_titles: filteredTitles,
          target_company_stages: targetStages,
        });

      if (error) throw error;
      setMessage('Profile saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addTargetTitle = () => {
    setTargetTitles([...targetTitles, '']);
  };

  const removeTargetTitle = (index: number) => {
    setTargetTitles(targetTitles.filter((_, i) => i !== index));
  };

  const updateTargetTitle = (index: number, value: string) => {
    const updated = [...targetTitles];
    updated[index] = value;
    setTargetTitles(updated);
  };

  const toggleStage = (stage: string) => {
    setTargetStages(prev =>
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#4ade80]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Profile Information</h2>
        <p className="text-gray-400">Basic information about you and what you're looking for</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Current Title
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="Senior Backend Engineer"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Target Titles
        </label>
        {targetTitles.map((title, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={title}
              onChange={(e) => updateTargetTitle(index, e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="Engineering Manager, Staff Engineer, etc."
            />
            {targetTitles.length > 1 && (
              <button
                onClick={() => removeTargetTitle(index)}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addTargetTitle}
          className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Another Title
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Target Company Stages
        </label>
        <div className="grid grid-cols-3 gap-3">
          {STAGES.map(stage => (
            <label key={stage} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={targetStages.includes(stage)}
                onChange={() => toggleStage(stage)}
                className="w-4 h-4 rounded border-white/10 bg-black/40"
              />
              <span className="text-gray-300">{stage}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Elevator Pitch (2-3 sentences)
        </label>
        <textarea
          value={formData.elevator_pitch}
          onChange={(e) => setFormData({ ...formData, elevator_pitch: e.target.value })}
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="Brief introduction that captures who you are professionally..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Career Narrative (Your Story)
        </label>
        <textarea
          value={formData.career_narrative}
          onChange={(e) => setFormData({ ...formData, career_narrative: e.target.value })}
          rows={6}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="Tell your career story - the arc, the transitions, what drives you..."
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            What You're Looking For
          </label>
          <textarea
            value={formData.looking_for}
            onChange={(e) => setFormData({ ...formData, looking_for: e.target.value })}
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="What excites you about your next role..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            What You're NOT Looking For
          </label>
          <textarea
            value={formData.not_looking_for}
            onChange={(e) => setFormData({ ...formData, not_looking_for: e.target.value })}
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="Dealbreakers, environments to avoid..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Management Style (if applicable)
          </label>
          <textarea
            value={formData.management_style}
            onChange={(e) => setFormData({ ...formData, management_style: e.target.value })}
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="How you lead and develop teams..."
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Work Style Preferences
          </label>
          <textarea
            value={formData.work_style}
            onChange={(e) => setFormData({ ...formData, work_style: e.target.value })}
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="How you work best, collaboration style..."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Salary Range - Min
          </label>
          <input
            type="number"
            value={formData.salary_min}
            onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="150000"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Salary Range - Max
          </label>
          <input
            type="number"
            value={formData.salary_max}
            onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="200000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Availability Status
          </label>
          <select
            value={formData.availability_status}
            onChange={(e) => setFormData({ ...formData, availability_status: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          >
            {AVAILABILITY_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Available Starting
          </label>
          <input
            type="date"
            value={formData.availability_date}
            onChange={(e) => setFormData({ ...formData, availability_date: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="San Francisco, CA"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Remote Preference
          </label>
          <select
            value={formData.remote_preference}
            onChange={(e) => setFormData({ ...formData, remote_preference: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          >
            {REMOTE_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          LinkedIn URL
        </label>
        <input
          type="url"
          value={formData.linkedin_url}
          onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="https://linkedin.com/in/yourprofile"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            GitHub URL
          </label>
          <input
            type="url"
            value={formData.github_url}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="https://github.com/yourusername"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Twitter URL
          </label>
          <input
            type="url"
            value={formData.twitter_url}
            onChange={(e) => setFormData({ ...formData, twitter_url: e.target.value })}
            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            placeholder="https://twitter.com/yourusername"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${
          message.includes('Error')
            ? 'bg-red-500/10 border border-red-500/20 text-red-400'
            : 'bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80]'
        }`}>
          {message}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
