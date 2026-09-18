import React from 'react';
import { ShieldCheck, Sparkles, Clock, Calendar, AlertCircle, RefreshCw, ExternalLink, Activity } from 'lucide-react';
import { DataClassification } from '../../types/index';
import { useI18n } from '../../i18n/index';

interface BadgeProps {
  classification: DataClassification;
  customLabel?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  classification,
  customLabel,
  size = 'sm',
  className = '',
}) => {
  const { t } = useI18n();

  const config = {
    [DataClassification.VERIFIED]: {
      label: customLabel || t.dataStatus.verified,
      icon: ShieldCheck,
      colorClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800',
    },
    [DataClassification.AI_GENERATED]: {
      label: customLabel || t.dataStatus.aiGenerated,
      icon: Sparkles,
      colorClass: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800',
    },
    [DataClassification.ESTIMATED]: {
      label: customLabel || t.dataStatus.estimated,
      icon: Clock,
      colorClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
    },
    [DataClassification.SCHEDULED]: {
      label: customLabel || t.dataStatus.scheduled,
      icon: Calendar,
      colorClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800',
    },
    [DataClassification.LIVE]: {
      label: customLabel || 'Live Observation',
      icon: Activity,
      colorClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800',
    },
    [DataClassification.EXTERNAL_PROVIDER]: {
      label: customLabel || t.dataStatus.externalProvider,
      icon: ExternalLink,
      colorClass: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800',
    },
    [DataClassification.UNAVAILABLE]: {
      label: customLabel || t.dataStatus.unavailable,
      icon: AlertCircle,
      colorClass: 'bg-stone-100 text-stone-700 border-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-700',
    },
    [DataClassification.STALE]: {
      label: customLabel || t.dataStatus.stale,
      icon: RefreshCw,
      colorClass: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-700',
    },
    [DataClassification.USER_GENERATED]: {
      label: customLabel || 'Traveler Experience',
      icon: Sparkles,
      colorClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    },
    [DataClassification.MOCK_DEVELOPMENT_ONLY]: {
      label: customLabel || t.dataStatus.mock,
      icon: AlertCircle,
      colorClass: 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    },
  }[classification] || {
    label: customLabel || classification,
    icon: ShieldCheck,
    colorClass: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  const IconComponent = config.icon;
  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';

  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full whitespace-nowrap select-none max-w-full ${sizeClass} ${config.colorClass} ${className}`}
      title={`Data Status: ${config.label}`}
    >
      <IconComponent className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} aria-hidden="true" />
      <span className="truncate">{config.label}</span>
    </span>
  );
};
