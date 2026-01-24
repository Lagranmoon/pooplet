# Development Guidelines for Bowel Movement Tracker

This document provides comprehensive guidelines for AI agents working on this Next.js + React + TypeScript + Prisma project.

## Build, Lint, and Test Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Linting
- `npm run lint` - Run ESLint on all files (TypeScript + React rules)

### Testing
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once (CI mode)
- `npm run test:ui` - Run tests with UI interface
- `npm run test:rls` - Test RLS policies
- **Single test:** `npm run test filename.test.ts` or `npm run test -- filename.test.ts`
- **Single test method:** `npm run test -- --reporter=verbose filename.test.ts -t "test name"`

## Code Style Guidelines

### Import Guidelines
```typescript
// External libraries first (alphabetical)
import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';

// Internal imports (relative paths)
import { auth } from '@/lib/auth';
import type { Record } from '@prisma/client';
```

### File Organization
```
src/
├── components/     # Reusable UI components
├── contexts/       # React contexts
├── hooks/         # Custom React hooks
├── pages/         # Route page components
├── services/      # API and business logic
├── types/         # TypeScript type definitions
└── test/          # Test files and utilities
```

### Naming Conventions

**Files & Components:**
- PascalCase for React components: `RecordForm.tsx`
- camelCase for utilities and hooks: `useAuth.ts`
- snake_case for service files: `recordService.ts`

**Variables & Functions:**
- camelCase for variables and functions
- PascalCase for types and interfaces
- UPPER_CASE for constants

**Interfaces & Types:**
```typescript
export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export type UseAuthReturn = AuthState & AuthActions;

export interface BowelMovementRecord {
  id: string;
  user_id: string;
}
```

### React Patterns

**Hooks:**
```typescript
export const useAuth = (): UseAuthReturn => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  const signOut = useCallback(async () => {
    // implementation
  }, []);

  return { ...state, signOut };
};
```

**Component Structure:**
```typescript
interface ComponentProps {
  title: string;
  onSubmit: (data: FormData) => void;
}

const MyComponent: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  );
};

export default MyComponent;
```

### Error Handling

**Service Layer:**
```typescript
async createRecord(data: CreateRecordRequest): Promise<ApiResponse<Record>> {
  try {
    const result = await prisma.record.create({
      data: {
        userId: data.userId,
        occurredAt: data.occurredAt,
        qualityRating: data.qualityRating,
        notes: data.notes,
      },
    });

    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Database error' };
  }
}
```

**React Components:**
```typescript
const [error, setError] = useState<string | null>(null);

const handleSubmit = async (data: FormData) => {
  try {
    setError(null);
    await submitData(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Unknown error');
  }
};
```

### Database & Authentication

**Prisma ORM:**
- All database access should go through Prisma Client
- User can only access their own records
- Run migrations with `npm run db:migrate`

**Database Types:**
```typescript
import { prisma } from '@/lib/prisma';
import type { Record } from '@prisma/client';

const records = await prisma.record.findMany({
  where: { userId: user.id },
  orderBy: { occurredAt: 'desc' },
});
```

**better-auth:**
- Use better-auth for user authentication
- Sessions are managed automatically
- Auth routes should be created in `app/api/auth/...`

### Testing Standards

**Test Structure:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Test" onSubmit={jest.fn()} />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Styling Guidelines

**Tailwind CSS:**
- Use utility classes for all styling
- No custom CSS unless necessary
- Responsive design with mobile-first approach

```tsx
const Card: React.FC<Props> = ({ children }) => (
  <div className="bg-white rounded-lg shadow-md p-6 mb-4">
    <div className="space-y-4">
      {children}
    </div>
  </div>
);
```

### Configuration

**Key Files:**
- `tsconfig.json` - TypeScript project references
- `eslint.config.js` - ESLint flat config
- `vitest.config.ts` - Test configuration
- `tailwind.config.js` - Tailwind CSS setup

### Security Best Practices

**Environment Variables:**
- Never commit `.env` files
- Use `.env.example` for template

**Authentication:**
- Always check user authentication before data access
- Use better-auth for authentication and session management

### Development Workflow

1. **Before committing:** Run `npm run lint` and `npm run test:run`
2. **Code review:** Ensure all tests pass
3. **Performance:** Monitor bundle size and load times
4. **Accessibility:** Use semantic HTML and ARIA labels

### Key Dependencies

- React 19 + TypeScript
- Vite for bundling
- Next.js 16 for full-stack framework
- Prisma for database ORM
- better-auth for authentication
- Tailwind CSS for styling
- Vitest for testing