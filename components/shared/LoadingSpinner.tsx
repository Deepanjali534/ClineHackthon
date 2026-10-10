interface Props { message?: string; }
export function LoadingSpinner({ message='Loading...' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
