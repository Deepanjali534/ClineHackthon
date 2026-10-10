'use client';

import { CommuteRequest } from '@/lib/types';

interface InterpretedRequirementsProps {
  interpreted: Partial<CommuteRequest>;
  onConfirm: () => void;
  onEdit: (field: keyof CommuteRequest, value: string) => void;
}

type FieldConfig = {
  key: keyof CommuteRequest;
  label: string;
  confident: boolean;
  warn?: string;
};

export function InterpretedRequirements({ interpreted, onConfirm, onEdit }: InterpretedRequirementsProps) {
  const fields: FieldConfig[] = [
    { key: 'origin', label: 'From', confident: !!interpreted.origin },
    { key: 'destination', label: 'To', confident: !!interpreted.destination },
    { key: 'arrivalDeadline', label: 'Arrive by', confident: !!interpreted.arrivalDeadline },
    { key: 'returnReadyTime', label: 'Return after', confident: !!interpreted.returnReadyTime },
    { key: 'dailyBudgetINR', label: 'Budget (₹)', confident: !!interpreted.dailyBudgetINR },
    {
      key: 'maxWalkMeters',
      label: 'Max walking',
      confident: !!interpreted.maxWalkMeters,
      warn: interpreted.maxWalkMeters ? undefined : 'Interpreted as 500m max',
    },
  ];

  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-3">
      <p className="text-sm font-semibold text-blue-800">🤖 Here is what I understood:</p>
      <div className="space-y-2">
        {fields.map((f) => {
          const val = interpreted[f.key];
          return (
            <div key={f.key} className="flex items-center gap-2">
              <span className={f.confident ? 'text-green-600' : 'text-yellow-600'}>
                {f.confident ? '✅' : '⚠️'}
              </span>
              <span className="text-sm font-medium text-gray-700 w-28">{f.label}:</span>
              <input
                className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm"
                defaultValue={val !== undefined ? String(val) : ''}
                onBlur={(e) => onEdit(f.key, e.target.value)}
              />
              {f.warn && <span className="text-xs text-yellow-700">{f.warn}</span>}
            </div>
          );
        })}
      </div>
      <button
        onClick={onConfirm}
        className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        ✅ Confirm & Plan Journey
      </button>
    </div>
  );
}
