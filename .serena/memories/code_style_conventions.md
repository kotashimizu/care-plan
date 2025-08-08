# Code Style & Conventions

## TypeScript Conventions
- **Strict TypeScript** configuration enabled
- **Interface definitions** in `src/lib/types.ts`
- **Type-safe** React components with proper prop types
- **Explicit return types** for API functions

## React Component Patterns
- **Functional components** with hooks
- **Default exports** for main components
- **Named exports** for utilities and types
- **Props interfaces** defined for all components
- **State management** with React hooks (useState)

## File Naming
- **PascalCase** for React components (`SupportPlanDisplay.tsx`)
- **camelCase** for utility files (`utils.ts`, `validation.ts`)
- **kebab-case** for API routes (`generate-plan/route.ts`)
- **UPPERCASE** for environment variables

## Import Organization
```typescript
// 1. React imports
import React, { useState } from 'react'

// 2. Third-party libraries  
import { NextRequest, NextResponse } from 'next/server'

// 3. Internal imports
import { IndividualSupportPlan } from '@/lib/types'
import { generateSystemPrompt } from '@/lib/prompts'
```

## CSS/Styling
- **Tailwind CSS** utility classes
- **shadcn/ui** component variants
- **Responsive design** principles
- **Consistent spacing** with Tailwind scale

## Error Handling
- **Comprehensive try-catch** blocks in API routes
- **User-friendly error messages** in Japanese
- **Detailed console logging** for debugging
- **Graceful degradation** for failed API calls