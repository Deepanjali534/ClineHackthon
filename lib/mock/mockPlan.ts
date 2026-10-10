import { JourneyPlan } from '@/lib/types';

export function createMockPlan(origin: string = 'Your Location', destination: string = 'Destination'): JourneyPlan {
  return {
    id: 'demo-plan-001',
    outbound: {
      departureTime: '08:00',
      arrivalTime: '08:47',
      steps: [
        {
          type: 'walk',
          description: `Walk to nearest bus stop from ${origin}`,
          durationMins: 5,
          distanceMeters: 400,
          costINR: 0,
          sourceType: 'demo',
        },
        {
          type: 'bus',
          description: `Bus 615 → ${destination} (₹30)`,
          durationMins: 47,
          distanceMeters: 8500,
          costINR: 30,
          serviceId: 'T615_0800',
          sourceType: 'demo',
        },
        {
          type: 'walk',
          description: `Walk to ${destination}`,
          durationMins: 5,
          distanceMeters: 350,
          costINR: 0,
          sourceType: 'demo',
        },
      ],
      costINR: 30,
      walkMeters: 750,
    },
    returnLeg: {
      departureTime: '18:15',
      arrivalTime: '19:05',
      steps: [
        {
          type: 'walk',
          description: `Walk to bus stop near ${destination}`,
          durationMins: 5,
          distanceMeters: 350,
          costINR: 0,
          sourceType: 'demo',
        },
        {
          type: 'bus',
          description: `Bus 615 → ${origin} (₹30)`,
          durationMins: 48,
          distanceMeters: 8500,
          costINR: 30,
          serviceId: 'T615_R1815',
          sourceType: 'demo',
        },
        {
          type: 'walk',
          description: `Walk to ${origin}`,
          durationMins: 5,
          distanceMeters: 400,
          costINR: 0,
          sourceType: 'demo',
        },
      ],
      costINR: 30,
      walkMeters: 750,
    },
    totalCostINR: 60,
    totalWalkMeters: 1500,
    meetsDeadline: true,
    meetsBudget: true,
    meetsWalkLimit: true,
    optimizationMode: 'balanced',
    optimizationScore: 0.85,
    explanation: `Best balanced route from ${origin} to ${destination}. Bus departs at 08:00, arrives 08:47 — 13 minutes before 9AM deadline. Total ₹60 within budget.`,
    weatherSummary: '☀️ Clear, 28°C — good travel conditions',
    version: 1,
    createdAt: new Date().toISOString(),
    agentRunId: 'demo-agent-run-001',
  };
}

// Default export for backward compatibility
export const mockPlan = createMockPlan('Your Location', 'Destination');
export const mockBackupPlan: JourneyPlan = {
  ...createMockPlan('Your Location', 'Destination'),
  id: 'demo-plan-001-backup',
  outbound: {
    departureTime: '08:15',
    arrivalTime: '09:00',
    steps: [
      { type: 'walk', description: 'Walk to bus stop', durationMins: 5, distanceMeters: 400, costINR: 0, sourceType: 'demo' },
      { type: 'bus', description: 'Route 423 (₹25)', durationMins: 45, costINR: 25, serviceId: 'T423_0815', sourceType: 'demo' },
      { type: 'walk', description: 'Walk to destination', durationMins: 5, distanceMeters: 350, costINR: 0, sourceType: 'demo' },
    ],
    costINR: 25,
    walkMeters: 750,
  },
  totalCostINR: 55,
  explanation: 'Backup: Route 423 at 08:15 — arrives exactly at 9AM deadline. Use if primary bus is missed.',
  optimizationScore: 0.72,
};
