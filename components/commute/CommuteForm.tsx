'use client';
import { useState } from 'react';
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
  const arr = text.match(/by\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (arr) {
    let h = parseInt(arr[1]); const m = parseInt(arr[2] || '0');
    if (arr[3]?.toLowerCase() === 'pm' && h < 12) h += 12;
    result.arrivalDeadline = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  }
  const b = text.match(/[₹rs\.]+\s*(\d+)/i);
  if (b) result.dailyBudgetINR = parseInt(b[1]);
  if (/don.?t want to walk|less walk|easy on|leg/i.test(text)) result.maxWalkMeters = 500;
  const mode = detectModeFromNL(text); if (mode) result.optimizationMode = mode;
  return result;
}

const inp = 'w-full bg-[#060d1a] border border-[#1e3a5f] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600';
const lbl = 'block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5';

interface Props { onSubmit: (r: CommuteRequest) => void; isLoading?: boolean; }

export function CommuteForm({ onSubmit, isLoading }: Props) {
  const { form, update, isFormValid, toRequest } = useCommuteForm();
  const [mode, setMode] = useState<'form'|'nl'>('form');
  const [nlText, setNlText] = useState('');
  const [interpreted, setInterpreted] = useState<Partial<CommuteRequest> | null>(null);
  const [nlError, setNlError] = useState('');

  const handleNLConfirm = () => {
    if (!interpreted) return;
    onSubmit({
      origin: interpreted.origin || 'Lajpat Nagar',
      destination: interpreted.destination || 'Connaught Place',
      date: interpreted.date || form.date,
      arrivalDeadline: interpreted.arrivalDeadline || form.arrivalDeadline,
      returnReadyTime: interpreted.returnReadyTime || form.returnReadyTime,
      dailyBudgetINR: interpreted.dailyBudgetINR ?? form.dailyBudgetINR,
      maxWalkMeters: interpreted.maxWalkMeters ?? form.maxWalkMeters,
      optimizationMode: interpreted.optimizationMode || form.optimizationMode,
      naturalLanguageInput: nlText,
    });
  };

  return (
    <div className="rounded-2xl border border-[#1e3a5f] bg-[#0d1526] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5">
        <h2 className="text-lg font-black text-white">Plan Your Commute</h2>
        <p className="text-xs text-slate-500 mt-1">Delhi corridor — AI-optimized routing</p>
      </div>

      {/* Mode toggle */}
      <div className="px-6 pt-5">
        <div className="flex rounded-xl bg-black/40 border border-white/5 p-1 gap-1">
          <button type="button" onClick={() => setMode('form')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'form' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            Form Input
          </button>
          <button type="button" onClick={() => setMode('nl')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              mode === 'nl' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
            Natural Language
          </button>
        </div>
      </div>

      <div className="px-6 pb-6 pt-4 space-y-4">
        {mode === 'form' ? (
          <>
            {/* From / To */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>From</label>
                <input className={inp} placeholder="Lajpat Nagar" value={form.origin} onChange={e => update('origin', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>To</label>
                <input className={inp} placeholder="Connaught Place" value={form.destination} onChange={e => update('destination', e.target.value)} />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className={lbl}>Date</label>
              <input type="date" className={inp} value={form.date} onChange={e => update('date', e.target.value)} />
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={lbl}>Arrive By</label>
                <input type="time" className={inp} value={form.arrivalDeadline} onChange={e => update('arrivalDeadline', e.target.value)} />
              </div>
              <div>
                <label className={lbl}>Return After</label>
                <input type="time" className={inp} value={form.returnReadyTime} onChange={e => update('returnReadyTime', e.target.value)} />
              </div>
            </div>

            {/* Budget */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={lbl}>Daily Budget</label>
                <span className="text-sm font-black text-white">₹{form.dailyBudgetINR}</span>
              </div>
              <input type="range" min={0} max={500} step={10} value={form.dailyBudgetINR}
                onChange={e => update('dailyBudgetINR', parseInt(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>₹0</span><span>₹500</span></div>
            </div>

            {/* Walk */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className={lbl}>Max Walking</label>
                <span className="text-sm font-black text-white">{form.maxWalkMeters}m</span>
              </div>
              <input type="range" min={0} max={2000} step={50} value={form.maxWalkMeters}
                onChange={e => update('maxWalkMeters', parseInt(e.target.value))}
                className="w-full accent-blue-500" />
              <div className="flex justify-between text-[10px] text-slate-600 mt-1"><span>0m</span><span>2000m</span></div>
            </div>

            {/* Optimization */}
            <OptimizationPicker value={form.optimizationMode} onChange={m => update('optimizationMode', m)} />

            {/* Submit */}
            <button onClick={() => onSubmit(toRequest())} disabled={!isFormValid() || isLoading}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-black text-sm hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              {isLoading ? 'Planning your route...' : 'Plan My Journey  →'}
            </button>
          </>
        ) : (
          <>
            <div>
              <label className={lbl}>Describe your commute</label>
              <textarea rows={4} className={`${inp} resize-none mt-1`}
                placeholder="Reach CP by 9AM, return after 6PM, budget 120 rupees, prefer less walking"
                value={nlText}
                onChange={e => { setNlText(e.target.value); const m = detectModeFromNL(e.target.value); if (m) update('optimizationMode', m); }}
              />
              {nlError && <p className="text-xs text-red-400 mt-1">{nlError}</p>}
            </div>
            <button onClick={() => {
              if (!nlText.trim()) { setNlError('Please enter your travel requirement.'); return; }
              setNlError(''); setInterpreted(parseNL(nlText));
            }}
              className="w-full py-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm font-bold hover:bg-blue-500/20 transition-all">
              Interpret with AI
            </button>
            {interpreted && (
              <InterpretedRequirements interpreted={interpreted} onConfirm={handleNLConfirm}
                onEdit={(key, value) => setInterpreted(prev => ({ ...prev, [key]: value }))} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
