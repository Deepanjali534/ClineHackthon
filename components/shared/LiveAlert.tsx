'use client';

interface LiveAlertProps {
  message: string;
  onAccept: () => void;
  onIgnore: () => void;
  isReplanning?: boolean;
}

export function LiveAlert({ message, onAccept, onIgnore, isReplanning }: LiveAlertProps) {
  return (
    <div className="animate-slide-down rounded-xl border border-orange-300 bg-orange-50 p-4 shadow-lg">
      <div className="flex items-start gap-2">
        <span className="text-2xl">⚠️</span>
        <div className="flex-1">
          <p className="font-semibold text-orange-800">{message}</p>
          {isReplanning && (
            <p className="mt-1 text-sm text-orange-600">🤖 Cline is recalculating your route...</p>
          )}
          <div className="mt-3 flex gap-2">
            <button
              onClick={onAccept}
              className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
            >
              ✅ Accept New Plan
            </button>
            <button
              onClick={onIgnore}
              className="rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              ❌ Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
