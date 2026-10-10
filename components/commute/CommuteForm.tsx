'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OptimizationPicker } from '@/components/shared/OptimizationPicker';
import { InterpretedRequirements } from './InterpretedRequirements';
import { useCommuteForm } from '@/lib/hooks/useCommuteForm';
import { CommuteRequest, OptimizationMode } from '@/lib/types';

const inputCls = 'w-full bg-[#060d1a] border border-[#1e3a5f] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-slate-600';
const labelCls = 'block text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5';

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
    <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <h2 className="text-lg font-bold text-white">Plan Your Commute</h2>
        <p className="text-xs text-slate-500 mt-1">Delhi corridor — AI-optimized routing</p>
      </div>
      <Tabs defaultValue="form" className="p-6">
        <TabsList className="mb-6 w-full bg-black/30 border border-white/5 rounded-xl p-1">
          <TabsTrigger value="form" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500">
            Form Input
          </TabsTrigger>
          <TabsTrigger value="nl" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-blue-600 data-[state=active]:text-white text-slate-500">
            Natural Language
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>From</label><input className={inputCls} placeholder="Lajpat Nagar" value={form.origin} onChange={(e) => update('origin', e.target.value)} /></div>
            <div><label className={labelCls}>To</label><input className={inputCls} placeholder="Connaught Place" value={form.destination} onChange={(e) => update('destination', e.target.value)} /></div>
          </div>
          <div><label className={labelCls}>Date</label><input type="date" className={inputCls} value={form.date} onChange={(e) => update('date', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelCls}>Arrive by</label><input type="time" className={inputCls} value={form.arrivalDeadline} onChange={(e) => update('arrivalDeadline', e.target.value)} /></div>
            <div><label className={labelCls}>Return after</label><input type="time" className={inputCls} value={form.returnReadyTime} onChange={(e) => update('returnReadyTime', e.target.value)} /></div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className={labelCls}>Daily Budget</label>
              <span className="text-xs font-black text-white">&#8377;{form.dailyBudgetINR}</span>
            </div>
            <input type="range" min={0} max={500} step={10} value={form.dailyBudgetINR}
              onChange={(e) => update('dailyBudgetINR', parseInt(e.target.value))}
              className="w-full accent-blue-500 h-1 rounded-full" />
            <div className="flex justify-between text-xs text-slate-600 mt-1"><span>&#8377;0</span><span>&#8377;500</span></div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className={labelCls}>Max Walking</label>
              <span className="text-xs font-black text-white">{form.maxWalkMeters}m</span>
            </div>
            <input type="range" min={0} max={2000} step={50} value={form.maxWalkMeters}
              onChange={(e) => update('maxWalkMeters', parseInt(e.target.value))}
              className="w-full accent-blue-500 h-1 rounded-full" />
            <div className="flex justify-between text-xs text-slate-600 mt-1"><span>0m</span><span>2000m</span></div>
          </div>
          <OptimizationPicker value={form.optimizationMode} onChange={(m) => update('optimizationMode', m)} />
          <button onClick={() => onSubmit(toRequest())} disabled={!isFormValid() || isLoading}
            className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
            {isLoading ? 'Planning...' : 'Plan My Journey  \u2192'}
          </button>
        </TabsContent>

        <TabsContent value="nl" className="space-y-4">
          <div>
            <label className={labelCls}>Describe your commute</label>
            <textarea rows={5} className={`${inputCls} resize-none`}
              placeholder="Reach CP by 9AM, return after 6PM, budget 120 rupees, prefer less walking"
              value={form.naturalLanguageInput}
              onChange={(e) => { update('naturalLanguageInput', e.target.value); const m = detectModeFromNL(e.target.value); if (m) update('optimizationMode', m); }} />
            {nlError && <p className="mt-1 text-xs text-red-400">{nlError}</p>}
          </div>
          <button onClick={handleInterpret} disabled={isLoading}
            className="w-full py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-semibold hover:bg-blue-500/20 transition-all">
            Interpret
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
