// Centralized type definitions for the application

export interface AssessmentResults {
  score: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  timestamp: Date;
  responses?: Record<string, number>;
}

export interface BurnoutData {
  energyTank?: number;
  recoverySpeed?: number;
  emotionalLeakage?: number;
  performanceSignal?: number;
  tomorrowReadiness?: number;
  exhaustion?: number;
  detachment?: number;
  inefficacy?: number;
  overload?: number;
  recovery?: number;
  totalScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  date: string;
  timestamp: Date | string;
  count?: number;
  contextFactors?: {
    workloadIntensity?: 'light' | 'moderate' | 'heavy';
    emotionalDemand?: 'low' | 'medium' | 'high';
    hadBreaks?: boolean;
    teamSupport?: boolean;
    difficultSession?: boolean;
  };
  recommendations?: string[];
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
  } | null;
  session: {
    access_token: string;
    refresh_token: string;
  } | null;
}

export type ViewMode = 'daily' | 'weekly' | 'monthly';

export interface ModalResults {
  [key: string]: string | number | boolean | undefined;
}
