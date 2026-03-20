import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { Copy, Download, RefreshCw, Check } from 'lucide-react';
import WarningBanner from './WarningBanner';

export default function CodeOutput({ code, warnings, onRegenerate, isLoading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Contract.sol';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!code && !isLoading) return null;

  return (
    <div className="glass-panel overflow-hidden w-full flex flex-col shadow-2xl animate-[fadeIn_0.5s_ease-out]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[var(--color-surface)]/80 border-b border-[var(--color-surface-border)]/80">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Generated Contract
        </h3>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-border)] rounded-lg transition-colors flex items-center gap-2 text-sm"
            title="Copy Code"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-2 text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-surface-border)] rounded-lg transition-colors flex items-center gap-2 text-sm"
            title="Download .sol"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <div className="w-px h-6 bg-[var(--color-surface-border)] mx-1" />

          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
            title="Regenerate"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>
        </div>
      </div>

      <WarningBanner warnings={warnings} />

      {/* Code Area */}
      <div className="relative flex-1 overflow-auto bg-[#0d1117] text-sm custom-scrollbar min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 text-[var(--color-text-muted)] bg-[var(--color-background)]/50 backdrop-blur-sm z-20">
            <div className="w-10 h-10 relative">
              <div className="absolute inset-0 border-4 border-[var(--color-surface-border)] rounded-full opacity-30" />
              <div className="absolute inset-0 border-4 border-[var(--color-primary)] rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="animate-pulse font-medium text-white/80">Generating secure contract…</p>
          </div>
        ) : (
          <Highlight theme={themes.vsDark} code={code} language="solidity">
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
              <pre className={`${className} bg-transparent m-0 font-mono text-sm leading-relaxed p-6 min-w-full inline-block`} style={style}>
                {tokens.map((line, i) => (
                  <div key={i} {...getLineProps({ line })} className="flex min-w-full hover:bg-white/[0.03] -mx-6 px-6 transition-colors">
                    <span className="select-none opacity-30 text-xs text-gray-500 pr-6 w-12 text-right shrink-0 border-r border-[var(--color-surface-border)]/30 mr-4">
                      {i + 1}
                    </span>
                    <span className="pr-8 whitespace-pre">
                      {line.map((token, key) => (
                        <span key={key} {...getTokenProps({ token })} />
                      ))}
                    </span>
                  </div>
                ))}
              </pre>
            )}
          </Highlight>
        )}
      </div>
    </div>
  );
}
