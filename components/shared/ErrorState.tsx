interface Props { message: string; onRetry?: () => void; }
export function ErrorState({ message, onRetry }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-4">
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">!</div>
      <p className="text-red-600 font-medium max-w-md">{message}</p>
      {onRetry && <button onClick={onRetry} className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors">Try Again</button>}
    </div>
  );
}
