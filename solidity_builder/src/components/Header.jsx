import { Code2, Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full py-6 px-6 sm:px-12 flex flex-col sm:flex-row items-center justify-between border-b border-[var(--color-surface-border)]/50 bg-[var(--color-background)]/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[var(--color-primary)]/10 rounded-xl rounded-tl-sm border border-[var(--color-primary)]/20">
          <Code2 className="w-6 h-6 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            SolidityPrompt
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
              Beta
            </span>
          </h1>
        </div>
      </div>
      
      <p className="text-sm text-[var(--color-text-muted)] mt-4 sm:mt-0 flex items-center gap-2">
        <Zap className="w-4 h-4 text-[var(--color-primary)]" />
        Turn English into secure Solidity – No coding required
      </p>
    </header>
  );
}
