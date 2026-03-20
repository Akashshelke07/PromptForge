import { AlertTriangle } from 'lucide-react';

export default function WarningBanner({ warnings }) {
  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="m-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3 animate-[fadeIn_0.5s_ease-out]">
      <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="text-orange-400 font-semibold text-sm">Security Warnings</h4>
        <ul className="list-disc list-inside text-sm text-orange-200/80 space-y-1">
          {warnings.map((warn, i) => (
            <li key={i}>{warn}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
