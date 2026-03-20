import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import PromptSection from './components/PromptSection';
import CodeOutput from './components/CodeOutput';
import { generateContract } from './api/mockGenerate';

function App() {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [warnings, setWarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (prompt) => {
    setIsLoading(true);
    setCurrentPrompt(prompt);
    setGeneratedCode('');
    setWarnings([]);

    try {
      const response = await generateContract(prompt);
      setGeneratedCode(response.code);
      setWarnings(response.warnings);
    } catch (error) {
      console.error(error);
      setWarnings(['An error occurred while generating the contract. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (currentPrompt) handleGenerate(currentPrompt);
  };

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{ backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)', userSelect: 'auto' }}
    >
      {/* Subtle gradient top glow */}
      <div
        className="pointer-events-none absolute top-0 inset-x-0 h-96 opacity-60"
        style={{ background: 'radial-gradient(ellipse at top, color-mix(in srgb, var(--color-primary) 8%, transparent), transparent 70%)' }}
      />

      {/* Grid background */}
      <div className="pointer-events-none absolute top-0 inset-x-0 h-[40rem] opacity-10">
        <svg className="absolute inset-0 h-full w-full text-[var(--color-primary)]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse" x="50%" y="100%">
              <path d="M0 32V.5H32" fill="none" stroke="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Corner blurs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full opacity-5 pointer-events-none blur-[120px]"
           style={{ backgroundColor: 'var(--color-primary)' }} />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-5 pointer-events-none blur-[120px]"
           style={{ backgroundColor: 'var(--color-primary)' }} />

      <Header />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10 relative z-10">
        {/* Hero */}
        <div
          className="text-center space-y-4 max-w-2xl mx-auto mt-8"
          style={{ animation: 'fadeIn 0.6s ease-out' }}
        >
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Smart Contracts,<br />Generated Instantly.
          </h2>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Describe your blockchain logic in plain English. We output production-ready, secure Solidity code in seconds.
          </p>
        </div>

        {/* Input + Output */}
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-8 pb-12">
          <PromptSection onSubmit={handleGenerate} isLoading={isLoading} />

          {(isLoading || generatedCode) && (
            <CodeOutput
              code={generatedCode}
              warnings={warnings}
              onRegenerate={handleRegenerate}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
