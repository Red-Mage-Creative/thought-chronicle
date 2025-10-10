# D&D Chronicle Development Rules

## Rule 1: Design System First

- ALWAYS check `/design-system` page before creating new components
- Reuse existing components, colors, typography, and patterns
- Adapt existing components rather than duplicating code
- Only create new components if no suitable existing component exists
- Ensure that the DesignSystemPage.tsx is ALWAYS up to date with the most recent version of a component.

## Rule 2: Changelog & Versioning

- ALWAYS update `/changelog` page when making changes
- Follow Conventional Commits (https://www.conventionalcommits.org/en/v1.0.0/)
- Version format: MAJOR.MINOR.PATCH
- Update version in ChangelogPage.tsx
- Update version in AppFooter.tsx
- Group changes by type: feat, fix, docs, style, refactor, test, chore
- Check the **_Current_** date and use that for the change log. Use a function if you need to find the actual current date.

### Current Version: 1.4.2

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

## Rule 5: Data Migration & Schema Versioning

### 5.1 When to Add Migrations

Add a new migration when:

- Adding new required fields to entities, thoughts, or campaigns
- Changing field names or data types
- Changing valid values for a field (e.g., entity types)
- Adding new optional fields that need default values
- Restructuring relationships between data types

### 5.2 Migration Guidelines

- **Sequential Versioning**: Migrations must have version numbers in ascending order
- **Idempotent**: Migrations should be safe to run multiple times
- **Backward Compatible**: Prefer adding optional fields over changing existing ones
- **Test Thoroughly**: Always test migrations with real user data scenarios
- **Document Changes**: Add clear descriptions to migration objects

### 5.3 How to Add a New Migration

1. Update the schema in `src/schemas/dataSchemas.ts` if needed
2. Add migration to `src/services/migrationRegistry.ts`:

```typescript
{
  version: '0.9.0',  // Next version number
  name: 'add-entity-tags',  // Descriptive kebab-case name
  description: 'Add tags array to entities',
  up: (data) => {
    data.entities.forEach(entity => {
      if (!entity.tags) {
        entity.tags = [];
      }
    });
    return data;
  },
  // Optional: Add rollback
  down: (data) => {
    data.entities.forEach(entity => {
      delete entity.tags;
    });
    return data;
  }
}
```

3. Update `schemaVersionService.CURRENT_VERSION` to match migration version
4. Update type definitions in `src/types/entities.ts`, etc.
5. Update schema definitions in `src/schemas/dataSchemas.ts`
6. Add tests in `src/services/__tests__/dataMigrationService.test.ts`
7. Update `ChangelogPage.tsx` with the new version
8. Update `AppFooter.tsx` with the new version
9. Update this file's "Current Version" at the top

### 5.4 Schema Version Format

- Use semantic versioning: MAJOR.MINOR.PATCH
- PATCH (0.7.1): Bug fixes, no schema changes
- MINOR (0.8.0): New features, backward-compatible schema changes
- MAJOR (1.0.0): Breaking changes OR production-ready release

### 5.5 Migration Progress & Error Handling

#### Progress Callbacks

When running migrations programmatically, use progress callbacks for user feedback:

```typescript
await dataMigrationService.runMigrations({
  onProgress: (progress) => {
    console.log(`Phase: ${progress.phase}`);
    console.log(`Status: ${progress.status}`);

    if (progress.phase === 'migration') {
      console.log(`Migration ${progress.currentStep}/${progress.totalSteps}`);
    }

    if (progress.phase === 'validation') {
      console.log(`Entities: ${progress.validation?.entitiesChecked}`);
      console.log(`Issues Fixed: ${progress.validation?.issuesFixed}`);
    }
  },
  onError: (error) => {
    console.error('Migration failed:', error);
  }
});
```

#### Validation Failure Handling

The validation system separates valid and invalid items:

- **Valid items**: Passed all checks or had minor issues that were auto-fixed
- **Invalid items**: Missing required fields or critical data corruption
- **Auto-fixes**: Missing optional fields, null arrays, invalid dates

When validation fails:

1. Migration process stops immediately
2. Backup is automatically restored
3. Error details are logged for debugging
4. User is presented with recovery options

#### Loading State Patterns

Use `MigrationLoadingScreen` component for consistent UX:

- Shows current phase (Backup → Migration → Validation → Complete)
- Displays progress bar for multiple migrations
- Reports validation statistics in real-time
- Provides estimated time remaining

#### Error Recovery Flows

Use `MigrationErrorScreen` component to give users options:

- **Restore from Backup**: Safe rollback to pre-migration state
- **Retry Migration**: Attempt migration again (useful for transient errors)
- **Continue Anyway**: Advanced option with clear warning
- **View History**: Link to Migration History page for detailed logs
- **Report Issue**: Pre-filled GitHub issue link

## Rule 6: Entity Attribute System

### 6.1 Attribute Structure

- Attributes are key-value pairs stored in `EntityAttribute[]`
- Each attribute has `{ key: string, value: string }`
- Attributes are optional on entities (can be empty array)
- Example: `[{ key: "Class", value: "Wizard" }, { key: "Level", value: "5" }]`

### 6.2 Default Attributes Configuration

- Default attributes defined in `DefaultEntityAttribute[]`
- Each default has: `key`, `defaultValue?`, `required`, `entityTypes[]`
- Stored in localStorage via `dataStorageService`
- Loaded by entity type when creating/editing entities
- Example: `{ key: "Class", required: true, entityTypes: ['pc'], defaultValue: '' }`

### 6.3 Validation Requirements

- Use `validateRequiredAttributes()` before entity save
- Display clear error messages for missing required fields
- Show toast notification listing missing required attributes
- Prevent form submission until all required attributes filled
- Validation is case-insensitive for attribute key matching
- Empty strings and whitespace-only values are treated as missing

### 6.4 Component Usage

- Use `AttributeEditor` component for all attribute input
- Pass `defaultAttributes` to show required indicators
- Handle `onChange` callback to update parent state
- Support disabled state for view-only scenarios
- Example usage:
  ```tsx
  <AttributeEditor
    attributes={entity.attributes}
    onChange={(attrs) => setEntity({...entity, attributes: attrs})}
    defaultAttributes={defaultAttributes}
    disabled={isLoading}
  />
  ```

### 6.5 UI Patterns

- Required attributes marked with "Required" badge
- Add/remove buttons for each attribute row
- Clear separation between existing and new attributes
- Settings page for managing default attributes per entity type
- Hint text shows all required attributes for current entity type
- Enter key in input fields triggers add action

### 6.6 Storage & Persistence

- Entity attributes stored in `attributes: EntityAttribute[]` field
- Default configurations stored in localStorage key `defaultEntityAttributes`
- Attributes persist through sync operations
- Attributes included in entity export/import operations

## Rule 4: Testing Standards & Integrity

### 4.1 Core Testing Principles

- **NO SPOOFED TESTS**: Tests must NEVER be faked, spoofed, or artificially made to pass
- **Real Testing Only**: All tests must validate actual functionality with real data and real user interactions
- **Honest Failures**: If a test fails, fix the code or the test logic - never fake a passing result
- **Meaningful Assertions**: Every test must assert something meaningful about the application's behavior

### 4.2 Testing Types & Coverage

- **Unit Tests**: Test individual functions, utilities, and components in isolation
- **Integration Tests**: Test component interactions and data flow between services
- **End-to-End Tests**: Test complete user workflows from start to finish
- **Accessibility Tests**: Validate keyboard navigation, screen reader compatibility, and ARIA labels
- **Performance Tests**: Validate loading times and responsiveness under realistic conditions

### 4.3 Test Organization & Naming

- **Descriptive Names**: Test names should clearly describe what is being tested and expected outcome
- **Arrange-Act-Assert**: Structure tests with clear setup, action, and verification phases
- **Test Files**: Co-locate test files with components (component.test.tsx) or group in **tests** directories
- **Mock Strategy**: Mock external dependencies but test actual component logic and user interactions

### 4.4 Quality Standards

- **Test Reliability**: Tests must consistently pass or fail based on actual code behavior
- **Test Independence**: Each test should be able to run independently without relying on other tests
- **Realistic Data**: Use realistic test data that represents actual user scenarios
- **Error Scenarios**: Test both happy paths and error conditions thoroughly
- **Regression Prevention**: Add tests for every bug fix to prevent future regressions
