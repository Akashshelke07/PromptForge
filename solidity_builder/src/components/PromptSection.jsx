import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

const EXAMPLES = [
  "Create an ERC-20 token named MyCoin with 1 million supply",
  "Build a staking contract where users earn 5% APY",
  "Make a simple NFT minting contract with max supply 10000",
  "A simple Escrow contract holding funds until both parties agree",
  "Flash loan receiver contract compatible with Aave V3",
];

export default function PromptSection({ onSubmit, isLoading }) {
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate();
    }
  };

  return (
    <div className="glass-panel p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <label htmlFor="prompt" className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-main)]">
          <Sparkles className="w-4 h-4 text-[var(--color-primary)]" />
          Describe your Smart Contract
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Create an ERC-20 token named MyCoin with 1 million supply and 2% transfer tax..."
          className="w-full bg-[var(--color-surface)]/50 border border-[var(--color-surface-border)] rounded-xl p-4 text-[var(--color-text-main)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] transition-all resize-none min-h-[140px]"
        />
        <div className="flex justify-between items-center text-xs text-[var(--color-text-muted)] px-1">
          <span>Be as specific as possible for best results.</span>
          <span>
            Press{' '}
            <kbd className="bg-[var(--color-surface-border)] px-1.5 py-0.5 rounded text-white">Cmd</kbd>
            {' '}+{' '}
            <kbd className="bg-[var(--color-surface-border)] px-1.5 py-0.5 rounded text-white">Enter</kbd>
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start justify-between">
        <div className="w-full sm:w-auto">
          <p className="text-xs text-[var(--color-text-muted)] mb-2 px-1">Try an example:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.slice(0, 3).map((example, i) => (
              <button
                key={i}
                onClick={() => setPrompt(example)}
                className="text-xs px-3 py-1.5 bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-full hover:bg-[var(--color-surface-border)] hover:text-white transition-colors text-left truncate max-w-[240px]"
                title={example}
              >
                {example.length > 38 ? example.substring(0, 38) + '…' : example}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
          className="w-full sm:w-auto whitespace-nowrap px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shrink-0 mt-4 sm:mt-0"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          {isLoading ? 'Generating…' : 'Generate Contract'}
        </button>
      </div>
    </div>
  );
}
