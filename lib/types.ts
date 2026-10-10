export type OptimizationMode =
  | 'cheapest'
  | 'fastest'
  | 'least_walk'
  | 'comfortable'
  | 'balanced';

export interface CommuteRequest {
  origin: string;
  destination: string;
  date: string;
  arrivalDeadline: string;
  returnReadyTime: string;
  dailyBudgetINR: number;
  maxWalkMeters: number;
  optimizationMode: OptimizationMode;
  naturalLanguageInput?: string;
}

export interface JourneyStep {
  type: 'walk' | 'bus' | 'metro' | 'auto' | 'wait';
  description: string;
  durationMins: number;
  distanceMeters?: number;
  costINR?: number;
  serviceId?: string;
  sourceType: 'live' | 'scheduled' | 'estimated' | 'demo';
}

export interface JourneyLeg {
  departureTime: string;
  arrivalTime: string;
  steps: JourneyStep[];
  costINR: number;
  walkMeters: number;
}

export interface JourneyPlan {
  id: string;
  outbound: JourneyLeg;
  returnLeg: JourneyLeg;
  totalCostINR: number;
  totalWalkMeters: number;
  meetsDeadline: boolean;
  meetsBudget: boolean;
  meetsWalkLimit: boolean;
  optimizationMode: OptimizationMode;
  optimizationScore: number;
  explanation: string;
  weatherSummary: string;
  backup?: JourneyPlan;
  version: number;
  createdAt: string;
}

export interface SSEEvent {
  type: 'tool_start' | 'tool_end' | 'plan_ready' | 'alert' | 'replan' | 'error';
  toolName?: string;
  durationMs?: number;
  message?: string;
  plan?: JourneyPlan;
  agentRunId?: string;
}

export interface ServiceNotice {
  id: string;
  rawText: string;
  extractedData: {
    affectedRoute: string;
    changeType: 'cancellation' | 'delay' | 'diversion' | 'stop_change';
    effectiveDate: string;
    effectiveTime: string;
    originalStop?: string;
    replacementStop?: string;
    ambiguousFields: string[];
  };
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface TripRequest {
  destination: string;
  startDate: string;
  endDate: string;
  totalBudgetINR: number;
  interests: string[];
  optimizationMode: OptimizationMode;
}

export interface TripDay {
  day: number;
  date: string;
  slots: {
    time: 'morning' | 'afternoon' | 'evening';
    place: string;
    type: 'monument' | 'restaurant' | 'activity' | 'transport' | 'hotel';
    durationMins: number;
    estimatedCostINR: number;
    transport?: string;
    notes?: string;
  }[];
  weatherSummary: string;
  dayTotalCostINR: number;
}

export interface TripPlan {
  id: string;
  destination: string;
  days: TripDay[];
  totalCostINR: number;
  optimizationMode: OptimizationMode;
  explanation: string;
}
