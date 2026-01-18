import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Plus, X } from 'lucide-react';

export function ValuesTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [mustHaves, setMustHaves] = useState<string[]>(['']);
  const [dealbreakers, setDealbreakers] = useState<string[]>(['']);

  const [formData, setFormData] = useState({
    management_preferences: '',
    team_size_preference: '',
    conflict_handling: '',
    ambiguity_handling: '',
    failure_handling: '',
  });

  useEffect(() => {
    loadValues();
  }, []);

  const loadValues = async () => {
    try {
      const { data, error } = await supabase
        .from('values_culture')
        .select('*')
        .eq('candidate_id', '00000000-0000-0000-0000-000000000001')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          management_preferences: data.management_preferences || '',
          team_size_preference: data.team_size_preference || '',
          conflict_handling: data.conflict_handling || '',
          ambiguity_handling: data.ambiguity_handling || '',
          failure_handling: data.failure_handling || '',
        });
        setMustHaves(data.must_haves?.length > 0 ? data.must_haves : ['']);
        setDealbreakers(data.dealbreakers?.length > 0 ? data.dealbreakers : ['']);
      }
    } catch (error) {
      console.error('Error loading values:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const filteredMustHaves = mustHaves.filter(m => m.trim());
      const filteredDealbreakers = dealbreakers.filter(d => d.trim());

      const { error } = await supabase
        .from('values_culture')
        .upsert({
          candidate_id: '00000000-0000-0000-0000-000000000001',
          ...formData,
          must_haves: filteredMustHaves,
          dealbreakers: filteredDealbreakers,
        });

      if (error) throw error;
      setMessage('Values saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving values:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addMustHave = () => setMustHaves([...mustHaves, '']);
  const removeMustHave = (index: number) => setMustHaves(mustHaves.filter((_, i) => i !== index));
  const updateMustHave = (index: number, value: string) => {
    const updated = [...mustHaves];
    updated[index] = value;
    setMustHaves(updated);
  };

  const addDealbreaker = () => setDealbreakers([...dealbreakers, '']);
  const removeDealbreaker = (index: number) => setDealbreakers(dealbreakers.filter((_, i) => i !== index));
  const updateDealbreaker = (index: number, value: string) => {
    const updated = [...dealbreakers];
    updated[index] = value;
    setDealbreakers(updated);
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
        <h2 className="text-2xl font-bold text-white mb-2">Values & Culture</h2>
        <p className="text-gray-400">What matters to you in a workplace</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Must-Haves in a Company
        </label>
        {mustHaves.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateMustHave(index, e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="e.g., Strong engineering culture, remote-first, transparent leadership..."
            />
            {mustHaves.length > 1 && (
              <button
                onClick={() => removeMustHave(index)}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addMustHave}
          className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Must-Have
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Dealbreakers
        </label>
        {dealbreakers.map((item, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={item}
              onChange={(e) => updateDealbreaker(index, e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="e.g., No on-call, no return-to-office mandates, no toxic cultures..."
            />
            {dealbreakers.length > 1 && (
              <button
                onClick={() => removeDealbreaker(index)}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addDealbreaker}
          className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Dealbreaker
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Management Style Preferences (what you want from a manager)
        </label>
        <textarea
          value={formData.management_preferences}
          onChange={(e) => setFormData({ ...formData, management_preferences: e.target.value })}
          rows={4}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="How you want to be managed, what kind of support you need..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Team Size Preferences
        </label>
        <input
          type="text"
          value={formData.team_size_preference}
          onChange={(e) => setFormData({ ...formData, team_size_preference: e.target.value })}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="e.g., Small teams (5-10), startup (< 50), etc."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          How do you handle conflict?
        </label>
        <textarea
          value={formData.conflict_handling}
          onChange={(e) => setFormData({ ...formData, conflict_handling: e.target.value })}
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="Your approach to disagreements, difficult conversations..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          How do you handle ambiguity?
        </label>
        <textarea
          value={formData.ambiguity_handling}
          onChange={(e) => setFormData({ ...formData, ambiguity_handling: e.target.value })}
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="How you work when things aren't clear, your tolerance for uncertainty..."
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          How do you handle failure?
        </label>
        <textarea
          value={formData.failure_handling}
          onChange={(e) => setFormData({ ...formData, failure_handling: e.target.value })}
          rows={3}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="Your approach to mistakes, setbacks, and learning from failure..."
        />
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
              Save Values
            </>
          )}
        </button>
      </div>
    </div>
  );
}
