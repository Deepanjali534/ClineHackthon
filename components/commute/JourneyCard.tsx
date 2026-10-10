import { JourneyPlan } from '@/lib/types';
import { JourneyTimeline } from './JourneyTimeline';
import { BudgetBar } from '@/components/shared/BudgetBar';
import { WalkIndicator } from '@/components/shared/WalkIndicator';
import { SourceBadge } from '@/components/shared/SourceBadge';

const modeLabel: Record<string, string> = {
  cheapest: '💰 CHEAPEST MODE',
  fastest: '⏱️ FASTEST MODE',
  least_walk: '🚶 LEAST WALK MODE',
  comfortable: '😌 COMFORTABLE MODE',
  balanced: '⚖️ BALANCED MODE',
};

interface JourneyCardProps {
  plan: JourneyPlan;
  budget: number;
  maxWalk: number;
  isHighlighted?: boolean;
  onNavigate?: () => void;
  onSave?: () => void;
  onViewBackup?: () => void;
}

export function JourneyCard({ plan, budget, maxWalk, isHighlighted, onNavigate, onSave, onViewBackup }: JourneyCardProps) {
  return (
    <div className={`rounded-2xl border-2 bg-white p-5 shadow-sm space-y-4 ${isHighlighted ? 'border-green-500 ring-2 ring-green-100' : 'border-gray-200'}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-bold text-gray-700">{modeLabel[plan.optimizationMode]}</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {plan.meetsDeadline && <span className="text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5">✅ On time</span>}
            {plan.meetsBudget && <span className="text-xs text-green-700 bg-green-50 rounded-full px-2 py-0.5">✅ In budget</span>}
            {!plan.meetsDeadline && <span className="text-xs text-red-700 bg-red-50 rounded-full px-2 py-0.5">❌ Misses deadline</span>}
            {!plan.meetsBudget && <span className="text-xs text-red-700 bg-red-50 rounded-full px-2 py-0.5">❌ Over budget</span>}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">₹{plan.totalCostINR}</div>
          <div className="text-xs text-gray-500">Score: {plan.optimizationScore}/100</div>
        </div>
      </div>

      {/* Outbound */}
      <JourneyTimeline leg={plan.outbound} label="OUTBOUND" emoji="🌅" />

      <div className="border-t border-dashed border-gray-200" />

      {/* Return */}
      <JourneyTimeline leg={plan.returnLeg} label="RETURN" emoji="🌆" />

      <div className="border-t border-gray-100" />

      {/* Metrics */}
      <BudgetBar spent={plan.totalCostINR} total={budget} />
      <WalkIndicator meters={plan.totalWalkMeters} maxMeters={maxWalk} />

      {/* Weather */}
      <p className="text-sm text-gray-600">{plan.weatherSummary}</p>

      {/* AI Explanation */}
      <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">🤖 Cline says: </span>{plan.explanation}
        </p>
      </div>

      {/* Data sources */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-xs text-gray-500">📋 Data:</span>
        <SourceBadge type="demo" />
        <SourceBadge type="scheduled" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        {onNavigate && (
          <button onClick={onNavigate} className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Navigate
          </button>
        )}
        {onSave && (
          <button onClick={onSave} className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Save
          </button>
        )}
        {plan.backup && onViewBackup && (
          <button onClick={onViewBackup} className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Backup ▼
          </button>
        )}
      </div>
    </div>
  );
}
