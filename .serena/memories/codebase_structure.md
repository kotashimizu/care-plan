# Codebase Structure

## Directory Layout
```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Edge Functions)
│   │   ├── generate-plan/ # Main plan generation endpoint
│   │   └── generate-alternatives/ # Alternative plans
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React Components
│   ├── ui/              # shadcn/ui base components
│   ├── InterviewRecordInput.tsx # Interview form
│   ├── SupportPlanDisplay.tsx   # Plan viewer
│   ├── EditableSupportPlan.tsx  # Plan editor
│   ├── FacilitySettingsPanel.tsx # Settings panel
│   └── ValidationWarnings.tsx   # Validation feedback
├── lib/                 # Utilities and Logic
│   ├── types.ts        # TypeScript type definitions
│   ├── prompts.ts      # AI prompt templates
│   ├── prompts-improved.ts # Enhanced prompts
│   ├── utils.ts        # Utility functions
│   └── validation.ts   # Data validation logic
└── types/              # Additional type definitions
    └── react-contenteditable.d.ts
```

## Key Files
- `src/app/api/generate-plan/route.ts` - Core AI plan generation API
- `src/lib/types.ts` - Central type definitions
- `src/lib/prompts.ts` - AI prompt engineering
- `src/components/SupportPlanDisplay.tsx` - Main plan display component