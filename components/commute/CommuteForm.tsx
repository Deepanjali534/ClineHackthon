'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { OptimizationPicker } from '@/components/shared/OptimizationPicker';
import { InterpretedRequirements } from './InterpretedRequirements';
import { useCommuteForm } from '@/lib/hooks/useCommuteForm';
import { CommuteRequest, OptimizationMode } from '@/lib/types';

function detectModeFromNL(text: string): OptimizationMode | null {
  if (/i'?m late|hurry|urgent|fast/i.test(text)) return 'fastest';
  if (/broke|cheap|budget|save/i.test(text)) return 'cheapest';
  if (/leg|walk|tired/i.test(text)) return 'least_walk';
  return null;
}

function parseNL(text: string): Partial<CommuteRequest> {
  const result: Partial<CommuteRequest> = {
    origin: 'Lajpat Nagar', destination: 'Connaught Place',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    arrivalDeadline: '09:00', returnReadyTime: '18:00',
    dailyBudgetINR: 120, maxWalkMeters: 500, optimizationMode: 'balanced',
  };
  const arrMatch = text.match(/by\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (arrMatch) {
    let h = parseInt(arrMatch[1]);
    const m = parseInt(arrMatch[2] || '0');
    if (arrMatch[3]?.toLowerCase() === 'pm' && h < 12) h += 12;
    result.arrivalDeadline = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  const budgetMatch = text.match(/[₹rs\.]+\s*(\d+)/i);
  if (budgetMatch) result.dailyBudgetINR = parseInt(budgetMatch[1]);
  if (/don.?t want to walk|less walk|easy on|leg/i.test(text)) result.maxWalkMeters = 500;
  const mode = detectModeFromNL(text);
  if (mode) result.optimizationMode = mode;
  return result;
}

interface CommuteFormProps {
  onSubmit: (request: CommuteRequest) => void;
  isLoading?: boolean;
}

export function CommuteForm({ onSubmit, isLoading }: CommuteFormProps) {
  const { form, update, isFormValid, toRequest } = useCommuteForm();
  const [interpreted, setInterpreted] = useState<Partial<CommuteRequest> | null>(null);
  const [nlError, setNlError] = useState('');

  const handleInterpret = () => {
    if (!form.naturalLanguageInput.trim()) { setNlError('Please enter your requirement first.'); return; }
    setNlError('');
    setInterpreted(parseNL(form.naturalLanguageInput));
  };

  const handleNLConfirm = () => {
    if (!interpreted) return;
    onSubmit({
      origin: interpreted.origin || form.origin,
      destination: interpreted.destination || form.destination,
      date: interpreted.date || form.date,
      arrivalDeadline: interpreted.arrivalDeadline || form.arrivalDeadline,
      returnReadyTime: interpreted.returnReadyTime || form.returnReadyTime,
      dailyBudgetINR: interpreted.dailyBudgetINR ?? form.dailyBudgetINR,
      maxWalkMeters: interpreted.maxWalkMeters ?? form.maxWalkMeters,
      optimizationMode: interpreted.optimizationMode || form.optimizationMode,
      naturalLanguageInput: form.naturalLanguageInput,
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-gray-800">🗺️ Plan My Daily Commute</h2>
      <Tabs defaultValue="form">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="form" className="flex-1">📋 Form</TabsTrigger>
          <TabsTrigger value="nl" className="flex-1">💬 Natural Language</TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div><Label>From</Label><Input placeholder="Lajpat Nagar" value={form.origin} onChange={(e) => update('origin', e.target.value)} /></div>
            <div><Label>To</Label><Input placeholder="Connaught Place" value={form.destination} onChange={(e) => update('destination', e.target.value)} /></div>
          </div>
          <div><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Arrive by</Label><Input type="time" value={form.arrivalDeadline} onChange={(e) => update('arrivalDeadline', e.target.value)} /></div>
            <div><Label>Return after</Label><Input type="time" value={form.returnReadyTime} onChange={(e) => update('returnReadyTime', e.target.value)} /></div>
          </div>
          <div>
            <Label>Daily Budget — ₹{form.dailyBudgetINR}</Label>
            <Slider min={0} max={500} step={10} value={[form.dailyBudgetINR]} onValueChange={(v) => update('dailyBudgetINR', Array.isArray(v) ? v[0] : v)} className="mt-2" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>₹0</span><span>₹500</span></div>
          </div>
          <div>
            <Label>Max Walking — {form.maxWalkMeters}m</Label>
            <Slider min={0} max={2000} step={50} value={[form.maxWalkMeters]} onValueChange={(v) => update('maxWalkMeters', Array.isArray(v) ? v[0] : v)} className="mt-2" />
            <div className="flex justify-between text-xs text-gray-400 mt-1"><span>0m</span><span>2000m</span></div>
          </div>
          <OptimizationPicker value={form.optimizationMode} onChange={(m) => update('optimizationMode', m)} />
          <button onClick={() => onSubmit(toRequest())} disabled={!isFormValid() || isLoading}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? '⏳ Planning...' : '🚀 Plan My Journey'}
          </button>
        </TabsContent>

        <TabsContent value="nl" className="space-y-4">
          <div>
            <Label>Describe your commute</Label>
            <Textarea rows={5}
              placeholder={`Reach CP by 9AM, return after 6PM, ₹120 budget, don't want to walk much`}
              value={form.naturalLanguageInput}
              onChange={(e) => { update('naturalLanguageInput', e.target.value); const m = detectModeFromNL(e.target.value); if (m) update('optimizationMode', m); }}
              className="mt-1" />
            {nlError && <p className="mt-1 text-xs text-red-600">{nlError}</p>}
          </div>
          <button onClick={handleInterpret} disabled={isLoading}
            className="w-full rounded-xl border border-blue-300 bg-blue-50 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">
            🔍 Interpret
          </button>
          {interpreted && (
            <InterpretedRequirements interpreted={interpreted} onConfirm={handleNLConfirm}
              onEdit={(key, value) => setInterpreted((prev) => ({ ...prev, [key]: value }))} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
