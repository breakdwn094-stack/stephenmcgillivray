import { MessageCircle, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavigationProps {
  initials: string;
  onAskAI: () => void;
}

export function Navigation({ initials, onAskAI }: NavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  const handleAskAI = () => {
    setMobileMenuOpen(false);
    onAskAI();
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-xl font-serif font-bold text-white hover:text-[#3b82f6] transition-colors"
          >
            {initials}
          </button>
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => scrollToSection('experience')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection('skills')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection('fit-check')}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Fit Check
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAskAI}
            className="hidden sm:flex bg-[#3b82f6] text-white px-5 py-2.5 rounded-lg font-medium hover:bg-[#2563eb] transition-all items-center gap-2 shadow-lg shadow-[#3b82f6]/20"
          >
            <MessageCircle className="w-4 h-4" />
            Ask AI
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/10 z-50 p-6 space-y-4 animate-fadeIn">
            <button
              onClick={() => scrollToSection('experience')}
              className="block w-full text-left text-gray-300 hover:text-white py-2 transition-colors"
            >
              Experience
            </button>
            <button
              onClick={() => scrollToSection('skills')}
              className="block w-full text-left text-gray-300 hover:text-white py-2 transition-colors"
            >
              Skills
            </button>
            <button
              onClick={() => scrollToSection('fit-check')}
              className="block w-full text-left text-gray-300 hover:text-white py-2 transition-colors"
            >
              Fit Check
            </button>
            <button
              onClick={handleAskAI}
              className="w-full bg-[#3b82f6] text-white px-5 py-3 rounded-lg font-medium hover:bg-[#2563eb] transition-all flex items-center justify-center gap-2 mt-4"
            >
              <MessageCircle className="w-4 h-4" />
              Ask AI About Me
            </button>
          </div>
        </>
      )}
    </nav>
  );
}
