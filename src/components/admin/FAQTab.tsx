import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, Loader2, Star } from 'lucide-react';

interface FAQ {
  id?: string;
  question: string;
  answer: string;
  is_common: boolean;
  display_order: number;
}

const emptyFAQ: FAQ = {
  question: '',
  answer: '',
  is_common: false,
  display_order: 0,
};

const COMMON_QUESTIONS = [
  'Tell me about yourself',
  "What's your biggest weakness?",
  'Why are you leaving your current role?',
  'Where do you see yourself in 5 years?',
  'Tell me about a time you failed',
  'What are you looking for in your next role?',
  'Why should we hire you?',
  'Tell me about a difficult project',
];

export function FAQTab() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FAQ>(emptyFAQ);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadFAQs();
  }, []);

  const loadFAQs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('candidate_id', '00000000-0000-0000-0000-000000000001')
        .order('display_order');

      if (error) throw error;
      setFaqs(data || []);
    } catch (error) {
      console.error('Error loading FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id || null);
    setEditForm(faq);
  };

  const handleSave = async () => {
    try {
      const candidate_id = '00000000-0000-0000-0000-000000000001';

      if (editingId && editingId !== 'new') {
        const { error } = await supabase
          .from('faqs')
          .update({ ...editForm, candidate_id })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faqs')
          .insert({ ...editForm, candidate_id });
        if (error) throw error;
      }

      setMessage('FAQ saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      setEditingId(null);
      loadFAQs();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ?')) return;

    try {
      const { error } = await supabase
        .from('faqs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setMessage('FAQ deleted');
      setTimeout(() => setMessage(''), 3000);
      loadFAQs();
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    }
  };

  const loadCommonQuestion = (question: string) => {
    setEditingId('new');
    setEditForm({
      ...emptyFAQ,
      question,
      is_common: true,
      display_order: faqs.length,
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
          <h2 className="text-2xl font-bold text-white mb-2">FAQ</h2>
          <p className="text-gray-400">Pre-written answers to common interview questions</p>
        </div>
        <button
          onClick={() => {
            setEditingId('new');
            setEditForm({ ...emptyFAQ, display_order: faqs.length });
          }}
          className="px-4 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Custom FAQ
        </button>
      </div>

      {!editingId && faqs.length === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-3">Quick Start: Common Questions</h3>
          <p className="text-gray-400 text-sm mb-4">
            Click any question below to start writing your answer
          </p>
          <div className="grid grid-cols-2 gap-2">
            {COMMON_QUESTIONS.map((question) => (
              <button
                key={question}
                onClick={() => loadCommonQuestion(question)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-sm text-left transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

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
              {editingId === 'new' ? 'New FAQ' : 'Edit FAQ'}
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
              Question *
            </label>
            <input
              type="text"
              value={editForm.question}
              onChange={(e) => setEditForm({ ...editForm, question: e.target.value })}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="Tell me about yourself"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Your Answer *
            </label>
            <textarea
              value={editForm.answer}
              onChange={(e) => setEditForm({ ...editForm, answer: e.target.value })}
              rows={8}
              className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="Write your answer here. Be authentic and specific..."
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={editForm.is_common}
                onChange={(e) => setEditForm({ ...editForm, is_common: e.target.checked })}
                className="w-4 h-4 rounded border-white/10 bg-black/40"
              />
              <Star className="w-4 h-4 text-gray-400" />
              <span className="text-gray-300">Mark as common question</span>
            </label>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Display Order:</label>
              <input
                type="number"
                value={editForm.display_order}
                onChange={(e) => setEditForm({ ...editForm, display_order: parseInt(e.target.value) || 0 })}
                className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-[#4ade80]/50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-[#4ade80] text-black rounded-lg font-semibold hover:bg-[#3cc970] transition-all inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save FAQ
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
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-black/40 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{faq.question}</h3>
                {faq.is_common && (
                  <Star className="w-4 h-4 text-[#4ade80] fill-[#4ade80]" />
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(faq)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id!)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-gray-300 whitespace-pre-wrap">{faq.answer}</p>
          </div>
        ))}

        {faqs.length === 0 && !editingId && (
          <div className="text-center py-12 text-gray-400">
            No FAQs yet. Click "Add Custom FAQ" or choose a common question to get started.
          </div>
        )}
      </div>
    </div>
  );
}
