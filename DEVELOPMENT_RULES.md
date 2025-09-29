# D&D Chronicle Development Rules

## Rule 1: Design System First
- ALWAYS check `/design-system` page before creating new components
- Reuse existing components, colors, typography, and patterns
- Adapt existing components rather than duplicating code
- Only create new components if no suitable existing component exists

## Rule 2: Changelog & Versioning
- ALWAYS update `/changelog` page when making changes
- Follow Conventional Commits (https://www.conventionalcommits.org/en/v1.0.0/)
- Version format: MAJOR.MINOR.PATCH
- Update version in ChangelogPage.tsx
- Group changes by type: feat, fix, docs, style, refactor, test, chore
- Check the ***Current*** date and use that for the change log. Use a function if you need to find the actual current date. 

### Current Version: 1.0.0

## Rule 3: Clean Code Principles for Component Development
### 3.1 Component Structure & Naming
- Single Responsibility: Each component should have one clear purpose (e.g., EntityList only displays entities, EntityForm only handles entity creation)
- Descriptive Names: Use clear, descriptive names that reflect the component's purpose (EntityWithMetrics, useEntities, getEntityIcon)
- Consistent Naming: Follow established patterns - hooks start with use, utilities are verbs (getEntityIcon, inferEntityType), types end with descriptive suffixes (EntityFormProps, EntityWithMetrics)

### 3.2 Function & Variable Guidelines
- Pure Functions: Prefer pure functions for utilities (like your getEntityIcon, getEntityClass)
- Small Functions: Keep functions focused and under 20 lines when possible
- Meaningful Variables: Use descriptive variable names (entitiesWithMetrics instead of data, isSubmitting instead of loading)
- Avoid Magic Numbers/Strings: Use constants for repeated values (like your ENTITY_TYPES constants)

### 3.3 TypeScript & Type Safety
- Explicit Types: Always define interfaces for props and complex objects (EntityFormProps, EntityWithMetrics)
- Type Guards: Use type validation functions when needed (isValidEntityType)
- Proper Generics: Use generics appropriately in utilities and hooks
- Optional Chaining: Use safe navigation (entity.metrics?.count, onEntityClick?.(entityName))

### 3.4 React-Specific Patterns
- Custom Hooks: Extract reusable logic into custom hooks (like useEntities, useThoughts)
- Prop Drilling Prevention: Use context or state management for deeply nested data
- Conditional Rendering: Use early returns for loading/empty states
- Event Handlers: Extract complex event handlers into separate functions
- Memoization: Use useMemo/useCallback for expensive operations only

### 3.5 Error Handling & User Experience
- Graceful Degradation: Always handle loading and error states
- User Feedback: Provide clear feedback for user actions (toast notifications, loading states)
- Input Validation: Validate user inputs with clear error messages
- Accessibility: Include proper ARIA labels, keyboard navigation, and semantic HTML

### 3.6 Code Organization & Dependencies
- Import Order: Group imports logically (React, UI components, utils, types)
- Barrel Exports: Use index files to group related exports
- Dependency Management: Keep components loosely coupled
- Utility Separation: Keep business logic in services, UI logic in components

### 3.7 Performance & Optimization
- Lazy Loading: Use React.lazy for large components
- Key Props: Always use stable, unique keys for lists
- Avoid Inline Objects: Don't create objects in render (extract to variables/useMemo)
- Bundle Size: Prefer tree-shakeable imports (import { Button } from '@/components/ui/button')