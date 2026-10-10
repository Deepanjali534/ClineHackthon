interface Props { message: string; onRetry?: () => void; }
export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">&#9888;&#65039;</div>
      <p className="text-red-400 font-medium max-w-md">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-500 transition-colors">
          Try Again
        </button>
      )}
    </div>
  );
}
