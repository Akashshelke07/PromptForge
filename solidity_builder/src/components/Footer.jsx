import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full py-8 mt-auto border-t border-[var(--color-surface-border)]/50 text-center flex flex-col items-center gap-4">
      <p className="text-sm text-[var(--color-text-muted)]">
        Powered by fine-tuned Llama-3.2-1B-Instruct + LoRA
      </p>
      <a
        href="https://github.com"
        target="_blank"
        rel="noreferrer"
        className="text-[var(--color-text-muted)] hover:text-white transition-colors flex items-center gap-2 text-sm"
      >
        <Github className="w-4 h-4" />
        View Source
      </a>
    </footer>
  );
}
