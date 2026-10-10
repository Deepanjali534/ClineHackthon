'use client';

import { OptimizationMode } from '@/lib/types';

interface OptimizationPickerProps {
  value: OptimizationMode;
  onChange: (mode: OptimizationMode) => void;
}

const modes: {
  id: OptimizationMode;
  icon: string;
  label: string;
  subtitle: string;
  color: string;
  selectedBg: string;
  selectedBorder: string;
}[] = [
  {
    id: 'cheapest',
    icon: '💰',
    label: 'CHEAPEST',
    subtitle: 'Save every rupee',
    color: 'text-green-700',
    selectedBg: 'bg-green-50',
    selectedBorder: 'border-green-500',
  },
  {
    id: 'fastest',
    icon: '⏱️',
    label: 'FASTEST',
    subtitle: 'Get there now',
    color: 'text-blue-700',
    selectedBg: 'bg-blue-50',
    selectedBorder: 'border-blue-500',
  },
  {
    id: 'least_walk',
    icon: '🚶',
    label: 'LEAST WALK',
    subtitle: 'Easy on the legs',
    color: 'text-orange-700',
    selectedBg: 'bg-orange-50',
    selectedBorder: 'border-orange-500',
  },
  {
    id: 'comfortable',
    icon: '😌',
    label: 'COMFORTABLE',
    subtitle: 'Fewest transfers',
    color: 'text-purple-700',
    selectedBg: 'bg-purple-50',
    selectedBorder: 'border-purple-500',
  },
  {
    id: 'balanced',
    icon: '⚖️',
    label: 'BALANCED',
    subtitle: 'Cline picks best',
    color: 'text-gray-700',
    selectedBg: 'bg-gray-50',
    selectedBorder: 'border-gray-500',
  },
];

export function OptimizationPicker({ value, onChange }: OptimizationPickerProps) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">Optimization Mode</p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {modes.map((mode) => {
          const selected = value === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onChange(mode.id)}
              className={`flex min-w-[90px] flex-col items-center rounded-xl border-2 p-3 transition-all
                ${selected ? `${mode.selectedBg} ${mode.selectedBorder} shadow-md` : 'border-gray-200 bg-white hover:border-gray-300'}
              `}
            >
              <span className="text-2xl">{mode.icon}</span>
              <span className={`mt-1 text-[10px] font-bold tracking-wide ${selected ? mode.color : 'text-gray-600'}`}>
                {mode.label}
              </span>
              <span className="mt-0.5 text-center text-[9px] text-gray-500">{mode.subtitle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
