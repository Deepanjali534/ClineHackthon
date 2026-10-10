'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OptimizationPicker } from '@/components/shared/OptimizationPicker';
import { TripRequest, OptimizationMode } from '@/lib/types';

const INTERESTS = [
  { id: 'history', label: '🏛️ History' },
  { id: 'food', label: '🍜 Food' },
  { id: 'nature', label: '🌿 Nature' },
  { id: 'shopping', label: '🛍️ Shopping' },
  { id: 'adventure', label: '🧗 Adventure' },
  { id: 'culture', label: '🎭 Culture' },
  { id: 'relaxation', label: '🧘 Relaxation' },
];

interface TripFormProps {
  onSubmit: (req: TripRequest) => void;
  isLoading?: boolean;
}

export function TripForm({ onSubmit, isLoading }: TripFormProps) {
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(8000);
  const [interests, setInterests] = useState<string[]>([]);
  const [mode, setMode] = useState<OptimizationMode>('balanced');

  const toggleInterest = (id: string) =>
    setInterests((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const isValid = destination.trim() && startDate && endDate && interests.length > 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-gray-800">✈️ Plan My Trip</h2>
      <div>
        <Label>Destination</Label>
        <Input placeholder="Jaipur, Manali, Goa..." value={destination} onChange={(e) => setDestination(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Start Date</Label><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
        <div><Label>End Date</Label><Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
      </div>
      <div>
        <Label>Total Budget — ₹{budget.toLocaleString()}</Label>
        <input type="range" min={1000} max={50000} step={500} value={budget}
          onChange={(e) => setBudget(parseInt(e.target.value))}
          className="w-full mt-2 accent-blue-600" />
        <div className="flex justify-between text-xs text-gray-400"><span>₹1,000</span><span>₹50,000</span></div>
      </div>
      <div>
        <Label className="mb-2 block">Interests</Label>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button key={i.id} type="button" onClick={() => toggleInterest(i.id)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                interests.includes(i.id) ? 'border-blue-500 bg-blue-100 text-blue-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
              {i.label}
            </button>
          ))}
        </div>
        {interests.length === 0 && <p className="mt-1 text-xs text-red-500">Select at least one interest</p>}
      </div>
      <OptimizationPicker value={mode} onChange={setMode} />
      <button onClick={() => isValid && onSubmit({ destination, startDate, endDate, totalBudgetINR: budget, interests, optimizationMode: mode })}
        disabled={!isValid || isLoading}
        className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? '⏳ Planning trip...' : '✈️ Plan My Trip'}
      </button>
    </div>
  );
}
