'use client';

import { useState } from 'react';
import { CommuteRequest, OptimizationMode } from '@/lib/types';

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

export interface CommuteFormState {
  origin: string;
  destination: string;
  date: string;
  arrivalDeadline: string;
  returnReadyTime: string;
  dailyBudgetINR: number;
  maxWalkMeters: number;
  optimizationMode: OptimizationMode;
  naturalLanguageInput: string;
}

export function useCommuteForm() {
  const [form, setForm] = useState<CommuteFormState>({
    origin: '',
    destination: '',
    date: tomorrow(),
    arrivalDeadline: '09:00',
    returnReadyTime: '18:00',
    dailyBudgetINR: 120,
    maxWalkMeters: 500,
    optimizationMode: 'balanced',
    naturalLanguageInput: '',
  });

  const update = <K extends keyof CommuteFormState>(key: K, value: CommuteFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = () =>
    form.origin.trim().length > 0 &&
    form.destination.trim().length > 0 &&
    form.date.length > 0 &&
    form.arrivalDeadline.length > 0;

  const toRequest = (): CommuteRequest => ({
    origin: form.origin,
    destination: form.destination,
    date: form.date,
    arrivalDeadline: form.arrivalDeadline,
    returnReadyTime: form.returnReadyTime,
    dailyBudgetINR: form.dailyBudgetINR,
    maxWalkMeters: form.maxWalkMeters,
    optimizationMode: form.optimizationMode,
    naturalLanguageInput: form.naturalLanguageInput || undefined,
  });

  return { form, update, isFormValid, toRequest };
}
