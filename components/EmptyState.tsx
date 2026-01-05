import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: 'indigo' | 'emerald' | 'orange' | 'gray' | 'red' | 'purple';
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = 'gray',
  compact = false,
}) => {
  const colorMap = {
    indigo: {
      text: 'text-indigo-400',
      border: 'border-indigo-500/30',
      bg: 'bg-indigo-900/10',
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-900/10',
    },
    orange: {
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      bg: 'bg-orange-900/10',
    },
    gray: {
      text: 'text-gray-400',
      border: 'border-gray-700',
      bg: 'bg-gray-800/50',
    },
    red: {
      text: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'bg-red-900/10',
    },
    purple: {
      text: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-900/10',
    },
  };

  const styles = colorMap[color] || colorMap.gray;

  return (
    <div
      className={`flex flex-col items-center justify-center ${compact ? 'py-6 px-4' : 'py-12 px-6'} rounded-xl border-2 border-dashed animate-fade-in text-center ${styles.border} ${styles.bg}`}
    >
      <div
        className={`rounded-full bg-gray-900 ${compact ? 'p-2 mb-3' : 'p-4 mb-4'} border-2 ${styles.border} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]`}
      >
        <Icon className={`${compact ? 'w-6 h-6' : 'w-10 h-10'} ${styles.text}`} strokeWidth={2} />
      </div>
      <h3
        className={`${compact ? 'text-sm' : 'text-xl'} font-black font-mono uppercase tracking-tight text-white mb-2`}
      >
        {title}
      </h3>
      <p
        className={`${compact ? 'text-xs' : 'text-sm'} font-mono text-gray-400 max-w-sm ${compact ? 'mb-4' : 'mb-6'} leading-relaxed`}
      >
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={`retro-btn ${compact ? 'px-4 py-2 text-[10px]' : 'px-6 py-2.5 text-xs'} bg-white text-black font-bold font-mono uppercase tracking-wider flex items-center gap-2 hover:bg-gray-200 transition-transform active:scale-95 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
