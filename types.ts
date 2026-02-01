
export enum AppState {
  LANDING = 'LANDING',
  DASHBOARD = 'DASHBOARD',
  SIMULATION_SETUP = 'SIMULATION_SETUP',
  SIMULATION_RUNNING = 'SIMULATION_RUNNING',
  SIMULATION_RESULTS = 'SIMULATION_RESULTS',
  MY_USERS = 'MY_USERS',
  TOPIC_LIBRARY = 'TOPIC_LIBRARY',
  STRATEGY_VAULT = 'STRATEGY_VAULT',
  TEST_SQUARE = 'TEST_SQUARE',
}

export type PlanLevel = 'FREE' | 'PRO' | 'PRO_PLUS';

// --- PDD BUSINESS RULES ---
export const PLAN_LIMITS = {
  FREE: { maxBriefs: 1, monthlyCredits: 20, name: 'Free' },
  PRO: { maxBriefs: 20, monthlyCredits: 2000, name: 'Pro' },
  PRO_PLUS: { maxBriefs: 100, monthlyCredits: 6000, name: 'Pro Plus' }
};

export const COST_TABLE = {
  RUN_SIMULATION: 10,
  CREATE_COHORT: 5,
  FOLLOW_UP_5_TURNS: 1
};

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  points: number;
  // SaaS Specific Fields
  plan_level: PlanLevel;
  subscription_status: 'active' | 'inactive' | 'past_due';
  next_billing_date?: number;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  planId: string;
  createdAt: number;
}

export type ExperimentType = 'VALIDATION' | 'PREFERENCE';

// --- NUWA ENGINE TYPES ---

export interface AS_Nuwa_Radar {
  PAT: number; // Patience (0-100)
  LOG: number; // Logic (0-100)
  IMP: number; // Impulse (0-100)
  BUD: number; // Budget/Price Sensitivity (0-100)
}

export interface AS_Persona {
  id: string;
  name: string;
  age: number;
  gender: string;
  location: string;
  occupation: string;
  education: string;
  socioeconomicStatus: string;
  familyStatus: string;
  incomeLevel: string;
  
  // Legacy / Hybrid Traits
  personality: string; 
  coreValues: string;
  painPoints: string;
  traitFingerprint: AS_TraitFingerprint; // Keeping for compatibility

  // Nuwa Specifics
  nuwa_radar?: AS_Nuwa_Radar;
  nuwa_mindset?: string; // "The Skeptical Techie"
  nuwa_actionFormula?: string; // "High Logic + Low Impulse = Researches for 3 days"
  nuwa_innerMonologue?: string; // "I feel like they are hiding the fees..."
}

export interface AS_TraitFingerprint {
  skepticism: number;
  innovation: number;
  priceSensitivity: number;
  socialProof: number;
  brandLoyalty: number;
}

export interface AS_MotherPopulationConfig {
  id: string;
  title: string;
  description: string;
  tags: string[];
  
  // Demographics
  genderRatio: number; // 0 to 1 (Ratio of Male)
  ageRange: [number, number]; // [Min, Max]
  
  // Distributions (Map of Option -> Weight 0-100)
  incomeDist: { label: string; weight: number }[]; 
  vocationDist: { label: string; weight: number }[];
  educationDist: { label: string; weight: number }[];
  
  // Psychographics
  traits: string[]; // Multi-select
  decisionMotive: string; // "Risk Aversion", "High Standards", etc.
  
  // New: Custom User Instruction
  customInstruction?: string; 
}

export interface AS_MarketStat {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
}

export interface AS_CohortArchetype {
  id: string;
  type: 'HAPPY_PATH' | 'BASELINE' | 'STRESS_TEST';
  name: string;
  role: string;
  age: number;
  tags: string[];
  context: string;
  decisionWeights: { price: string; brand: string; social: string; function: string };
  adResistance: string;
  adResistanceReason: string;
  cognitiveLoadPreference: string;
  triggers: string[];
  frictions: string[];
  switchingCost: string;
  difficultyRating: string;
  difficultyReason: string;
  decisionPath: string;
  aiStrategyTip: string;
}

export interface AS_GroupOverview {
  totalUsers: number;
  characteristics: string;
  distribution: { happyPath: number; baseline: number; stressTest: number };
  visualHint: string;
}

export interface AS_AudienceCohort {
  id: string;
  as_category: string;
  as_name: string;
  as_description: string;
  as_language: string;
  as_isOfficial?: boolean;
  as_tags: string[];
  as_marketStats?: AS_MarketStat[];
  as_personas: AS_Persona[];
  as_archetypes: AS_CohortArchetype[];
  as_groupOverview: AS_GroupOverview;
  createdAt: number;
}

export interface MB_BriefVersion {
  id: string;
  label: string;
  content: string;
  createdAt: number;
}

export interface MB_MasterBrief {
  id: string;
  mb_title: string;
  mb_content: string;
  mb_type: string;
  mb_folder: string;
  mb_subFolder: string;
  mb_tags?: string[];
  mb_versions?: MB_BriefVersion[];
  mb_images?: string[];
  createdAt: number;
}

export interface ExperimentOption {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export interface AS_SimulationSnapshot {
  sourceBriefId: string;
  frozenTitle: string;
  frozenContent: string;
  frozenImages: string[];
  options?: ExperimentOption[];
}

export interface TemplateDefinition {
  id: string;
  title: string;
  description: string;
  modes: ExperimentType[];
  icon: string;
  placeholder: string;
  inputs?: string[];
  outputs?: string[];
  tags?: string[];
  isPopular?: boolean;
  timeEstimate?: string;
}

export interface SimulationConfig {
  template: TemplateDefinition | null;
  mode: ExperimentType;
  cohort: AS_AudienceCohort | null;
  activeBriefSnapshot: AS_SimulationSnapshot | null; 
  customInput?: string; 
  compareTopics?: MB_MasterBrief[]; 
}

export interface AnalysisResult {
  personaId: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  score: number;
  selectedOptionId?: string;
  reaction: string;
  keyConcernOrPraise: string;
  purchaseIntent: "High" | "Medium" | "Low" | "None";
  landingPageMetrics?: {
    bounced: boolean;
    scrollDepth: number;
    timeOnPage: number;
    clickedCTA: boolean;
    converted: boolean;
  } | null;
}

export interface UniversalChartData {
  title?: string;
  type: 'funnel' | 'bar' | 'line' | 'radar' | 'scatter' | 'heatmap';
  series: any[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface UniversalDashboardData {
  pulse?: { label: string; value: string; status: 'green' | 'red' | 'yellow' | 'gray'; benchmark: string }[];
  visualData?: UniversalChartData;
  diagnosis?: { title: string; dataPoint: string; psychology: string; conclusion: string }[];
  actions?: { label: string; priority: string; desc: string }[];
  comparativeMetrics?: { label: string; winnerValue: string; loserValue: string; insight: string }[];
  comparativeVisualData?: UniversalChartData;
  comparativeDiagnostics?: {
      variableEffect?: string;
      cognitiveLoad?: string;
      frictionPoints?: string;
      statisticalConfidence?: string;
  };
  strategy?: {
      decision?: string;
      fusionSuggestion?: string;
      nextHypothesis?: string;
  };
  summary?: string;
}

export interface AnalysisRecord {
  id: string;
  timestamp: number;
  type: ExperimentType;
  directive: string;
  options?: ExperimentOption[];
  images?: string[];
  results: AnalysisResult[];
  confidenceScore: number;
  summary: string;
  shortTitle?: string;
  followUps?: any[];
  structuredInsights?: UniversalDashboardData;
  actionItems?: string[];
}

export interface Session {
  id: string;
  timestamp: number;
  cohortId: string;
  cohortName: string;
  cohortLanguage: string;
  personas: AS_Persona[];
  analyses: AnalysisRecord[];
  templateId: string;
  topicId: string;
  topicTitle: string;
  shortTitle?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  coverImage?: string;
  tags: string[];
  authorName: string;
  authorAvatar: string;
  createdAt: number;
}
