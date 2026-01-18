import { useState } from 'react';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';

const STRONG_FIT_JD = `Senior Backend Engineer - Series B Fintech
We're looking for a senior backend engineer to help scale our payment processing infrastructure. You'll work with PostgreSQL, Redis, and Kubernetes to build systems that handle millions of transactions daily.

Requirements:
- 5+ years backend development
- Strong experience with PostgreSQL and Redis
- Kubernetes and microservices experience
- Experience mentoring junior engineers
- Fintech or payments experience preferred`;

const WEAK_FIT_JD = `Machine Learning Engineer - Computer Vision
We need an ML engineer to build our next-gen computer vision models for autonomous vehicles. You'll train models, optimize inference pipelines, and work closely with our robotics team.

Requirements:
- PhD in Computer Science or related field
- 3+ years experience with PyTorch/TensorFlow
- Strong background in computer vision and deep learning
- Experience with CUDA and model optimization
- Published research in top-tier conferences (CVPR, ICCV, etc.)
- Robotics experience required`;

interface Gap {
  requirement: string;
  gap_title: string;
  explanation: string;
}

interface FitResult {
  verdict: 'strong_fit' | 'worth_conversation' | 'probably_not';
  headline: string;
  opening: string;
  gaps: Gap[];
  transfers: string;
  recommendation: string;
}

export function JDAnalyzer() {
  const [jdText, setJdText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<FitResult | null>(null);

  const analyzeFit = async () => {
    setAnalyzing(true);
    setResult(null);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-jd`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jdText
        })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze job description');
      }

      const data: FitResult = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing job description:', error);
      alert('Failed to analyze job description. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadExample = (type: 'strong' | 'weak') => {
    setJdText(type === 'strong' ? STRONG_FIT_JD : WEAK_FIT_JD);
    setResult(null);
  };

  return (
    <section id="fit-check" className="py-24 px-6 bg-gradient-to-b from-white/[0.02] to-transparent">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-5xl font-serif font-bold text-white mb-4">
          Honest Fit Assessment
        </h2>
        <p className="text-xl text-gray-400 mb-8 max-w-3xl">
          Paste a job description. Get an honest assessment of whether I'm the right person—including when I'm not.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => loadExample('strong')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all"
          >
            Load Strong Fit Example
          </button>
          <button
            onClick={() => loadExample('weak')}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-gray-300 transition-all"
          >
            Load Weak Fit Example
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-6">
          <textarea
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="Paste job description here..."
            className="w-full h-64 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#3b82f6]/50 resize-none font-mono text-sm"
          />

          <button
            onClick={analyzeFit}
            disabled={!jdText.trim() || analyzing}
            className="mt-4 bg-[#3b82f6] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2563eb] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                Analyze Fit
              </>
            )}
          </button>
        </div>

        {result && (
          <div className="space-y-6 animate-fadeIn">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold ${
              result.verdict === 'strong_fit'
                ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/40 text-[#3b82f6]'
                : result.verdict === 'probably_not'
                ? 'bg-[#d4a574]/20 border border-[#d4a574]/40 text-[#d4a574]'
                : 'bg-gray-500/20 border border-gray-500/40 text-gray-300'
            }`}>
              {result.verdict === 'strong_fit' && '✓ Strong Fit'}
              {result.verdict === 'worth_conversation' && '○ Worth a Conversation'}
              {result.verdict === 'probably_not' && '✗ Probably Not Your Person'}
            </div>

            {result.headline && (
              <h3 className="text-2xl font-bold text-white">
                {result.headline}
              </h3>
            )}

            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <p className="text-gray-300 leading-relaxed text-lg">
                {result.opening}
              </p>
            </div>

            {result.gaps.length > 0 && (
              <div className="bg-white/5 backdrop-blur-sm border border-[#d4a574]/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-[#d4a574]" />
                  WHERE I DON'T FIT
                </h3>
                <div className="space-y-4">
                  {result.gaps.map((gap, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-start gap-3">
                        <span className="text-[#d4a574] mt-1">•</span>
                        <div className="flex-1">
                          <p className="text-white font-semibold">
                            {gap.gap_title}
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            Requirement: {gap.requirement}
                          </p>
                          <p className="text-gray-300 mt-2">
                            {gap.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.transfers && (
              <div className="bg-white/5 backdrop-blur-sm border border-[#3b82f6]/30 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  WHAT TRANSFERS
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {result.transfers}
                </p>
              </div>
            )}

            <div className="bg-gradient-to-br from-[#3b82f6]/10 to-transparent border border-[#3b82f6]/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-3">
                MY RECOMMENDATION
              </h3>
              <p className="text-gray-300 leading-relaxed mb-6">
                {result.recommendation}
              </p>
              <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                <p className="text-sm text-gray-400 italic">
                  This signals something completely different than "please consider my resume." You're qualifying them. Your time is valuable too.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
