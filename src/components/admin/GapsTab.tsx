import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Loader2 } from 'lucide-react';

interface Gap {
  id?: string;
  gap_type: string;
  description: string;
  why_its_a_gap: string;
  interested_in_learning: boolean;
}

const emptyGap: Gap = {
  gap_type: 'skill_gap',
  description: '',
  why_its_a_gap: '',
  interested_in_learning: false,
};

const GAP_TYPES = [
  'skill_gap',
  'experience_gap',
  'environment_mismatch',
  'role_type_mismatch',
];

const GAP_TYPE_LABELS: Record<string, string> = {
  skill_gap: 'Skill Gap',
  experience_gap: 'Experience Gap',
  environment_mismatch: 'Environment Mismatch',
  role_type_mismatch: 'Role Type Mismatch',
};

export function GapsTab() {
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Gap>(emptyGap);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadGaps();
  }, []);

  const loadGaps = async () => {
    try {
      const { data, error } = await supabase
        .from('gaps_weaknesses')
        .select('*')
        .eq('candidate_id', '00000000-0000-0000-0000-000000000001');

      if (error) throw error;
      setGaps(data || []);
    } catch (error) {
      console.error('Error loading gaps:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (gap: Gap) => {
    setEditingId(gap.id || null);
    setEditForm(gap);
  };

  const handleSave = async () => {
    try {
      const candidate_id = '00000000-0000-0000-0000-000000000001';

      if (editingId && editingId !== 'new') {
        const { error } = await supabase
          .from('gaps_weaknesses')
          .update({ ...editForm, candidate_id })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('gaps_weaknesses')
          .insert({ ...editForm, candidate_id });
        if (error) throw error;
      }

      setMessage('Gap saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      setEditingId(null);
      loadGaps();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gap?')) return;

    try {
      const { error } = await supabase
        .from('gaps_weaknesses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage('Gap deleted');
      setTimeout(() => setMessage(''), 3000);
      loadGaps();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
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
          <h2 className="text-2xl font-bold text-white mb-2">Gaps & Weaknesses</h2>
          <p className="text-gray-400">Be honest about your gaps—this is what makes the AI valuable</p>
        </div>
        <button
          onClick={() => {
            setEditingId('new');
            setEditForm(emptyGap);
          }}
          className="px-4 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Gap
        </button>
      </div>

      <div className="bg-[#d4a574]/10 border border-[#d4a574]/30 rounded-xl p-4">
        <p className="text-[#d4a574] text-sm">
          Being honest about gaps makes your AI more trustworthy. When the AI can say "I'm probably not your person for this"
          it becomes genuinely useful for both you and employers.
        </p>
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
              {editingId === 'new' ? 'New Gap' : 'Edit Gap'}
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
              Gap Type *
            </label>
            <select
              value={editForm.gap_type}
              onChange={(e) => setEditForm({ ...editForm, gap_type: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
            >
              {GAP_TYPES.map(type => (
                <option key={type} value={type}>{GAP_TYPE_LABELS[type]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={2}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="e.g., No experience with machine learning or AI"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Why it's a gap (be specific)
            </label>
            <textarea
              value={editForm.why_its_a_gap}
              onChange={(e) => setEditForm({ ...editForm, why_its_a_gap: e.target.value })}
              rows={3}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="Explain why this is a gap for you and what makes it challenging..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.interested_in_learning}
                onChange={(e) => setEditForm({ ...editForm, interested_in_learning: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-black/40"
              />
              <span className="text-gray-300">Interested in learning this</span>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Gap
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
        {gaps.map((gap) => (
          <div
            key={gap.id}
            className="bg-black/40 border border-[#d4a574]/30 rounded-xl p-4 hover:border-[#d4a574]/50 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 rounded bg-[#d4a574]/20 text-[#d4a574] border border-[#d4a574]/30">
                    {GAP_TYPE_LABELS[gap.gap_type]}
                  </span>
                  {gap.interested_in_learning && (
                    <span className="text-xs px-2 py-1 rounded bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30">
                      Interested in learning
                    </span>
                  )}
                </div>
                <p className="text-white font-semibold mb-2">{gap.description}</p>
                {gap.why_its_a_gap && (
                  <p className="text-gray-400 text-sm">{gap.why_its_a_gap}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(gap)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(gap.id!)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {gaps.length === 0 && !editingId && (
          <div className="text-center py-12 text-gray-400">
            No gaps documented yet. Click "Add Gap" to get started.
          </div>
        )}
      </div>
    </div>
  );
}
