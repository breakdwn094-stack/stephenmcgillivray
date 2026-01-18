import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, Plus, X } from 'lucide-react';

const EXAMPLE_INSTRUCTIONS = [
  'Never oversell me',
  "If they need X and I don't have it, say so directly",
  "Use 'I'm probably not your person' when appropriate",
  "Don't hedge—be direct",
  "It's okay to recommend they not hire me",
  'Focus on authentic fit over selling',
  'Call out gaps before they ask',
  'Be honest about what I have and haven\'t done',
];

export function AIInstructionsTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [honestyLevel, setHonestyLevel] = useState(8);
  const [instructions, setInstructions] = useState<string[]>(['']);
  const [customInstructions, setCustomInstructions] = useState('');

  useEffect(() => {
    loadInstructions();
  }, []);

  const loadInstructions = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_instructions')
        .select('*')
        .eq('candidate_id', '00000000-0000-0000-0000-000000000001')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHonestyLevel(data.honesty_level || 8);
        setInstructions(data.instruction_rules?.length > 0 ? data.instruction_rules : ['']);
        setCustomInstructions(data.custom_instructions || '');
      }
    } catch (error) {
      console.error('Error loading AI instructions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const filteredInstructions = instructions.filter(i => i.trim());

      const { error } = await supabase
        .from('ai_instructions')
        .upsert({
          candidate_id: '00000000-0000-0000-0000-000000000001',
          honesty_level: honestyLevel,
          instruction_rules: filteredInstructions,
          custom_instructions: customInstructions,
        });

      if (error) throw error;
      setMessage('AI instructions saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error saving AI instructions:', error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => setInstructions(instructions.filter((_, i) => i !== index));
  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = value;
    setInstructions(updated);
  };

  const addExampleInstruction = (example: string) => {
    if (!instructions.some(i => i === example)) {
      setInstructions([...instructions.filter(i => i.trim()), example, '']);
    }
  };

  const getHonestyLabel = (level: number) => {
    if (level <= 3) return 'Diplomatic';
    if (level <= 6) return 'Balanced';
    if (level <= 8) return 'Direct';
    return 'Brutally Honest';
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
        <h2 className="text-2xl font-bold text-white mb-2">AI Instructions</h2>
        <p className="text-gray-400">Tell the AI how to represent you</p>
      </div>

      <div className="bg-[#4ade80]/10 border border-[#4ade80]/30 rounded-xl p-4">
        <p className="text-[#4ade80] text-sm">
          These instructions control how the AI behaves when answering questions and analyzing job fits.
          The more honest you are here, the more useful the AI becomes.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-3">
          Honesty Level: {honestyLevel}/10 - {getHonestyLabel(honestyLevel)}
        </label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">Diplomatic</span>
          <input
            type="range"
            min="1"
            max="10"
            value={honestyLevel}
            onChange={(e) => setHonestyLevel(parseInt(e.target.value))}
            className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #4ade80 0%, #4ade80 ${(honestyLevel - 1) * 11.11}%, #374151 ${(honestyLevel - 1) * 11.11}%, #374151 100%)`
            }}
          />
          <span className="text-sm text-gray-400">Brutally Honest</span>
          <span className="text-white font-bold w-12 text-center">{honestyLevel}</span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {honestyLevel <= 3 && "The AI will be diplomatic and focus on positive framing"}
          {honestyLevel > 3 && honestyLevel <= 6 && "The AI will be honest but tactful"}
          {honestyLevel > 6 && honestyLevel <= 8 && "The AI will be direct and straightforward"}
          {honestyLevel > 8 && "The AI will be brutally honest, even if uncomfortable"}
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Instruction Rules
        </label>
        <p className="text-sm text-gray-400 mb-3">
          Add specific rules for how the AI should behave. Click examples below to add them.
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {EXAMPLE_INSTRUCTIONS.map((example) => (
            <button
              key={example}
              onClick={() => addExampleInstruction(example)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 text-xs transition-all"
            >
              + {example}
            </button>
          ))}
        </div>

        {instructions.map((instruction, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={instruction}
              onChange={(e) => updateInstruction(index, e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
              placeholder="e.g., Never oversell me, be direct about gaps..."
            />
            {instructions.length > 1 && (
              <button
                onClick={() => removeInstruction(index)}
                className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addInstruction}
          className="mt-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 transition-all inline-flex items-center gap-2 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Instruction Rule
        </button>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-300 mb-2">
          Custom Instructions (Free-form)
        </label>
        <textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          rows={6}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#4ade80]/50"
          placeholder="Additional instructions for the AI about your communication style, preferences, boundaries, etc..."
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
              Save AI Instructions
            </>
          )}
        </button>
      </div>
    </div>
  );
}
