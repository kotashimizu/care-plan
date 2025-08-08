export interface FacilitySettings {
  facilityType: 'employment-a' | 'employment-b' | 'transition' | 'daily-care' | 'training-life' | 'training-function';
  workTypes: string[];
  facilityFeatures: string[];
  userCharacteristics: {
    ageGroup: string;
    disabilityTypes: string[];
    averageUsagePeriod: string;
    userCount: string;
  };
}

// 新しい事業区分とプラン詳細度の型定義
export type ServiceType = 'employment-a' | 'employment-b' | 'daily-care';
export type PlanDetailLevel = 'basic' | 'detailed';

// 支援計画案のオプション
export interface SupportPlanOption {
  id: string;
  title: string;
  content: string;
  category: 'A' | 'B' | 'C';
}

export interface SupportGoal {
  itemName: string;
  objective: string;
  supportContent: string;
  achievementPeriod: string;
  provider: string;
  userRole: string;
  priority: string;
}

export interface IndividualSupportPlan {
  userAndFamilyIntentions: string;
  comprehensiveSupport: string;
  longTermGoal: string;
  shortTermGoal: string;
  supportGoals: {
    employment: SupportGoal;
    dailyLife: SupportGoal;
    socialLife: SupportGoal;
  };
  qualityScore: QualityScore;
}

export interface QualityScore {
  expertise: number;
  specificity: number;
  feasibility: number;
  consistency: number;
  overall: number;
}


export interface GeneratePlanRequest {
  interviewRecord: string;
  facilitySettings: FacilitySettings;
  requestType: 'standard';
}

export interface PromptTemplate {
  systemPrompt: string;
  userPrompt: string;
  facilityContext: string;
  userCharacteristics: string;
}

export interface HomePageState {
  interviewRecord: string;
  facilitySettings: FacilitySettings;
  generatedPlan: IndividualSupportPlan | null;
  isGenerating: boolean;
  error: string | null;
  // 新しいワークフロー用の状態
  serviceType: ServiceType | null;
  planDetailLevel: PlanDetailLevel | null;
  supportPlanOptions: SupportPlanOption[];
  selectedOptions: string[];
  currentStep: 'service-selection' | 'data-input' | 'detail-level' | 'plan-generation' | 'plan-selection';
  userAndFamilyIntentions: string | null;
  comprehensiveSupport: string | null;
}

export interface InterviewRecordInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}