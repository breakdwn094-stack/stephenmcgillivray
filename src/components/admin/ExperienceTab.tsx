import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface Experience {
  id?: string;
  company_name: string;
  title: string;
  title_progression: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  achievements: string[];
  why_joined: string;
  why_left: string;
  what_you_did: string;
  proudest_of: string;
  do_differently: string;
  hard_parts: string;
  lessons_learned: string;
  manager_perspective: string;
  reports_perspective: string;
  conflicts_challenges: string;
  quantified_impact: any;
  display_order: number;
}

const emptyExperience: Experience = {
  company_name: '',
  title: '',
  title_progression: '',
  start_date: '',
  end_date: '',
  is_current: false,
  achievements: [''],
  why_joined: '',
  why_left: '',
  what_you_did: '',
  proudest_of: '',
  do_differently: '',
  hard_parts: '',
  lessons_learned: '',
  manager_perspective: '',
  reports_perspective: '',
  conflicts_challenges: '',
  quantified_impact: {},
  display_order: 0,
};

export function ExperienceTab() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Experience>(emptyExperience);
  const [showPrivate, setShowPrivate] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      const { data, error } = await supabase
        .from('experiences')
        .select('*')
        .eq('candidate_id', '00000000-0000-0000-0000-000000000001')
        .order('display_order');

      if (error) throw error;
      setExperiences(data || []);
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp: Experience) => {
    setEditingId(exp.id || null);
    setEditForm(exp);
    setShowPrivate(false);
  };

  const handleSave = async () => {
    try {
      const candidate_id = '00000000-0000-0000-0000-000000000001';

      if (editingId) {
        const { error } = await supabase
          .from('experiences')
          .update({ ...editForm, candidate_id })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('experiences')
          .insert({ ...editForm, candidate_id });
        if (error) throw error;
      }

      setMessage('Experience saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      setEditingId(null);
      loadExperiences();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience?')) return;

    try {
      const { error } = await supabase
        .from('experiences')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage('Experience deleted');
      setTimeout(() => setMessage(''), 3000);
      loadExperiences();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const addAchievement = () => {
    setEditForm({
      ...editForm,
      achievements: [...editForm.achievements, '']
    });
  };

  const updateAchievement = (index: number, value: string) => {
    const updated = [...editForm.achievements];
    updated[index] = value;
    setEditForm({ ...editForm, achievements: updated });
  };

  const removeAchievement = (index: number) => {
    setEditForm({
      ...editForm,
      achievements: editForm.achievements.filter((_, i) => i !== index)
    });
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Experience</h2>
          <p className="text-gray-400">Your work history with public and private context</p>
        </div>
        <button
          onClick={() => {
            setEditingId('new');
            setEditForm({ ...emptyExperience, display_order: experiences.length });
            setShowPrivate(false);
          }}
          className="px-4 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Experience
        </button>
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

      {editingId && (
        <div className="bg-black/40 border border-white/10 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">
              {editingId === 'new' ? 'New Experience' : 'Edit Experience'}
            </h3>
            <button
              onClick={() => setEditingId(null)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={editForm.company_name}
                onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Title Progression (optional)
            </label>
            <input
              type="text"
              value={editForm.title_progression}
              onChange={(e) => setEditForm({ ...editForm, title_progression: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="e.g., Senior → Staff"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={editForm.start_date}
                onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                End Date
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                  disabled={editForm.is_current}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50 disabled:opacity-50"
                />
                <label className="flex items-center gap-2 text-gray-300">
                  <input
                    type="checkbox"
                    checked={editForm.is_current}
                    onChange={(e) => setEditForm({ ...editForm, is_current: e.target.checked, end_date: '' })}
                    className="w-4 h-4"
                  />
                  Current
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Achievement Bullets
            </label>
            {editForm.achievements.map((achievement, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={achievement}
                  onChange={(e) => updateAchievement(index, e.target.value)}
                  className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                  placeholder="Led migration that reduced latency by 40%..."
                />
                {editForm.achievements.length > 1 && (
                  <button
                    onClick={() => removeAchievement(index)}
                    className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addAchievement}
              className="mt-2 px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Add Achievement
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={editForm.display_order}
              onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) })}
              className="w-32 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            />
          </div>

          <button
            onClick={() => setShowPrivate(!showPrivate)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all"
          >
            <span className="font-semibold">Private AI Context (Hidden from public)</span>
            {showPrivate ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>

          {showPrivate && (
            <div className="space-y-4 pl-4 border-l-2 border-[#4ade80]/30">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Why did you join this company?
                </label>
                <textarea
                  value={editForm.why_joined}
                  onChange={(e) => setEditForm({ ...editForm, why_joined: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Why did you leave? (be honest)
                </label>
                <textarea
                  value={editForm.why_left}
                  onChange={(e) => setEditForm({ ...editForm, why_left: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What did YOU actually do vs. the team?
                </label>
                <textarea
                  value={editForm.what_you_did}
                  onChange={(e) => setEditForm({ ...editForm, what_you_did: e.target.value })}
                  rows={3}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What are you proudest of?
                </label>
                <textarea
                  value={editForm.proudest_of}
                  onChange={(e) => setEditForm({ ...editForm, proudest_of: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What would you do differently?
                </label>
                <textarea
                  value={editForm.do_differently}
                  onChange={(e) => setEditForm({ ...editForm, do_differently: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  What was hard or frustrating?
                </label>
                <textarea
                  value={editForm.hard_parts}
                  onChange={(e) => setEditForm({ ...editForm, hard_parts: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Lessons learned
                </label>
                <textarea
                  value={editForm.lessons_learned}
                  onChange={(e) => setEditForm({ ...editForm, lessons_learned: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  How would your manager describe you?
                </label>
                <textarea
                  value={editForm.manager_perspective}
                  onChange={(e) => setEditForm({ ...editForm, manager_perspective: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  How would your reports describe you? (if applicable)
                </label>
                <textarea
                  value={editForm.reports_perspective}
                  onChange={(e) => setEditForm({ ...editForm, reports_perspective: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Any conflicts or challenges?
                </label>
                <textarea
                  value={editForm.conflicts_challenges}
                  onChange={(e) => setEditForm({ ...editForm, conflicts_challenges: e.target.value })}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Experience
            </button>
            <button
              onClick={() => setEditingId(null)}
              className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{exp.company_name}</h3>
                <p className="text-lg text-gray-300 mt-1">
                  {exp.title}
                  {exp.title_progression && <span className="text-gray-500"> ({exp.title_progression})</span>}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : new Date(exp.end_date).getFullYear()}
                </p>
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {exp.achievements.map((achievement, idx) => (
                      <li key={idx} className="text-gray-400 text-sm flex gap-2">
                        <span>•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(exp)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(exp.id!)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {experiences.length === 0 && !editingId && (
          <div className="text-center py-12 text-gray-400">
            No experiences yet. Click "Add Experience" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
