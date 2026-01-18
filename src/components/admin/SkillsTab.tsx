import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';

interface Skill {
  id?: string;
  skill_name: string;
  category: string;
  self_rating: number;
  evidence: string;
  honest_notes: string;
  years_experience: number;
  last_used: string;
  display_order: number;
}

const emptySkill: Skill = {
  skill_name: '',
  category: 'strong',
  self_rating: 3,
  evidence: '',
  honest_notes: '',
  years_experience: 0,
  last_used: '',
  display_order: 0,
};

const CATEGORIES = ['strong', 'moderate', 'gap'];

export function SkillsTab() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Skill>(emptySkill);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('candidate_id', '00000000-0000-0000-0000-000000000001')
        .order('display_order');

      if (error) throw error;
      setSkills(data || []);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (skill: Skill) => {
    setEditingId(skill.id || null);
    setEditForm(skill);
  };

  const handleSave = async () => {
    try {
      const candidate_id = '00000000-0000-0000-0000-000000000001';

      if (editingId && editingId !== 'new') {
        const { error } = await supabase
          .from('skills')
          .update({ ...editForm, candidate_id })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('skills')
          .insert({ ...editForm, candidate_id });
        if (error) throw error;
      }

      setMessage('Skill saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      setEditingId(null);
      loadSkills();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this skill?')) return;

    try {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage('Skill deleted');
      setTimeout(() => setMessage(''), 3000);
      loadSkills();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'strong': return 'text-[#4ade80] bg-[#4ade80]/10 border-[#4ade80]/30';
      case 'moderate': return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      case 'gap': return 'text-[#d4a574] bg-[#d4a574]/10 border-[#d4a574]/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
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
          <h2 className="text-2xl font-bold text-white mb-2">Skills</h2>
          <p className="text-gray-400">Track your skills with honest assessments</p>
        </div>
        <button
          onClick={() => {
            setEditingId('new');
            setEditForm({ ...emptySkill, display_order: skills.length });
          }}
          className="px-4 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Skill
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
              {editingId === 'new' ? 'New Skill' : 'Edit Skill'}
            </h3>
            <button
              onClick={() => setEditingId(null)}
              className="p-2 hover:bg-white/5 rounded-lg transition-all"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Skill Name *
            </label>
            <input
              type="text"
              value={editForm.skill_name}
              onChange={(e) => setEditForm({ ...editForm, skill_name: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="PostgreSQL, React, Kubernetes, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Category *
              </label>
              <select
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              >
                <option value="strong">Strong</option>
                <option value="moderate">Moderate</option>
                <option value="gap">Gap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Self-Rating (1-5)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={editForm.self_rating}
                  onChange={(e) => setEditForm({ ...editForm, self_rating: parseInt(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-white font-bold w-8 text-center">{editForm.self_rating}</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Evidence (projects, years, certifications)
            </label>
            <textarea
              value={editForm.evidence}
              onChange={(e) => setEditForm({ ...editForm, evidence: e.target.value })}
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="Built 3 production apps with this, 5 years experience, certified..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Honest Notes
            </label>
            <textarea
              value={editForm.honest_notes}
              onChange={(e) => setEditForm({ ...editForm, honest_notes: e.target.value })}
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="e.g., Haven't used this in 2 years, rusty on advanced features..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                value={editForm.years_experience}
                onChange={(e) => setEditForm({ ...editForm, years_experience: parseInt(e.target.value) || 0 })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Last Used
              </label>
              <input
                type="date"
                value={editForm.last_used}
                onChange={(e) => setEditForm({ ...editForm, last_used: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={editForm.display_order}
                onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Skill
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
        {['strong', 'moderate', 'gap'].map(category => {
          const categorySkills = skills.filter(s => s.category === category);
          if (categorySkills.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="text-lg font-bold text-white mb-3 capitalize">
                {category} Skills ({categorySkills.length})
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className={`bg-black/40 border rounded-xl p-4 hover:border-white/20 transition-all ${getCategoryColor(skill.category)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold">{skill.skill_name}</h4>
                          <span className="text-xs px-2 py-1 rounded bg-black/20">
                            {skill.self_rating}/5
                          </span>
                        </div>
                        {skill.evidence && (
                          <p className="text-xs text-gray-400 mt-1">{skill.evidence}</p>
                        )}
                        {skill.honest_notes && (
                          <p className="text-xs text-gray-500 mt-1 italic">{skill.honest_notes}</p>
                        )}
                        {skill.years_experience > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            {skill.years_experience} {skill.years_experience === 1 ? 'year' : 'years'}
                            {skill.last_used && ` • Last used ${new Date(skill.last_used).getFullYear()}`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(skill)}
                          className="p-1 hover:bg-black/20 rounded"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(skill.id!)}
                          className="p-1 hover:bg-black/20 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {skills.length === 0 && !editingId && (
          <div className="text-center py-12 text-gray-400">
            No skills yet. Click "Add Skill" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
