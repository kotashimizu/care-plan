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

export interface SupportGoal {
  objective: string;
  supportContent: string;
  userRole: string;
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
  requestType: 'standard' | 'quality-check' | 'alternatives';
}

export interface GeneratePlanResponse {
  plan: IndividualSupportPlan;
  qualityCheck?: QualityCheckResult;
}

export interface QualityCheckResult {
  score: QualityScore;
  improvements: string[];
  suggestions: string[];
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
}

export interface InterviewRecordInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}