# Testing Strategy - D&D Chronicle

## Overview

D&D Chronicle follows a comprehensive testing approach that ensures code quality, prevents regressions, and validates business logic integrity. Our testing philosophy emphasizes **real tests with real data** - no spoofed or faked test results.

## Core Testing Principles

### 1. NO SPOOFED TESTS
- Tests must NEVER be faked or artificially made to pass
- All tests validate actual functionality with real data
- Honest failures lead to code fixes, never test manipulation
- Every assertion must be meaningful

### 2. Test Independence
- Each test runs independently without relying on others
- Tests can be run in any order
- Mock external dependencies, test actual component logic
- Cleanup after each test to prevent state pollution

### 3. Realistic Scenarios
- Use realistic test data representing actual user scenarios
- Test both happy paths and error conditions
- Include edge cases and boundary conditions
- Test performance under realistic load

## Testing Pyramid

```
     /\
    /  \    E2E Tests (Future)
   /----\   - Complete user workflows
  /      \  - Real browser interactions
 /--------\ 
/----------\ Integration Tests
|          | - Component interactions
|          | - Service layer integration
|          | - Data flow validation
|----------|
|          |
|          | Unit Tests
|          | - Individual functions
|          | - Utilities and helpers
|          | - Component logic
|__________|
```

## Test Coverage by Layer

### Unit Tests (Primary Focus)

#### Services
**Location**: `src/services/__tests__/`

**Coverage**:
- ✅ `entityService.test.ts` - Entity CRUD operations, relationships
- ✅ `thoughtEntityOperations.test.ts` - Thought operations with ID-based refs
- ✅ `idBasedValidation.test.ts` - Validation and cascade deletion
- ✅ `businessLogicService.test.ts` - Business rules and logic
- ✅ `dataMigrationService.test.ts` - Data migrations
- ✅ `schemaValidationService.test.ts` - Schema validation
- ✅ `attributeValidation.test.ts` - Attribute validation rules
- ✅ `entityReferenceValidation.test.ts` - Reference integrity

**Key Patterns**:
```typescript
describe('Service Name', () => {
  beforeEach(() => {
    // Setup mock data
    mockData = createRealisticMockData();
    vi.mocked(dataStorageService.getData).mockReturnValue(mockData);
  });

  it('should perform action correctly', () => {
    // Arrange
    const input = createTestInput();
    
    // Act
    const result = service.method(input);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.property).toBe(expectedValue);
  });
});
```

#### Utilities
**Location**: `src/utils/__tests__/`

**Coverage**:
- ✅ `entityUtils.test.ts` - Entity utility functions
- ✅ `formatters.test.ts` - Date and string formatters

#### Components
**Location**: `src/components/**/__tests__/`

**Coverage**:
- ✅ `AttributeEditor.test.tsx` - Attribute editing component
- 🔄 `formIntegration.test.ts` - Form integration documentation
- 🔄 More component tests planned for v1.4.0

### Integration Tests

**Location**: `src/components/forms/__tests__/formIntegration.test.ts`

**Purpose**: Document and test interaction between layers

**Scenarios**:
- Form submits name → Service converts to ID → Storage saves both
- Display queries by ID → Falls back to name if needed
- Entity rename → All references updated correctly
- Entity deletion → Cascade modes work as expected

### E2E Tests (Planned for v1.4.0)

**Future Coverage**:
- Complete user workflows (login → create campaign → add entities → create thoughts)
- Real browser interactions using Playwright
- Visual regression testing
- Performance benchmarking

## Test Organization

### File Structure
```
src/
├── services/
│   ├── entityService.ts
│   └── __tests__/
│       ├── entityService.test.ts
│       ├── thoughtEntityOperations.test.ts
│       └── idBasedValidation.test.ts
├── components/
│   ├── forms/
│   │   ├── ThoughtForm.tsx
│   │   └── __tests__/
│   │       └── formIntegration.test.ts
│   └── __tests__/
│       └── ComponentName.test.tsx
└── utils/
    ├── entityUtils.ts
    └── __tests__/
        └── entityUtils.test.ts
```

### Naming Conventions
- Test files: `*.test.ts` or `*.test.tsx`
- Test descriptions: Clear, descriptive statements
- Test names: `should [expected behavior] when [condition]`

## Testing ID-Based Reference System

### Critical Test Scenarios

#### 1. Name-to-ID Conversion
```typescript
it('should convert entity names to IDs when creating thought', () => {
  const result = thoughtService.createThought({
    content: 'Test thought',
    relatedEntities: ['Gandalf', 'Frodo']
  });
  
  expect(result.relatedEntityIds).toContain('entity-1'); // Gandalf's ID
  expect(result.relatedEntityIds).toContain('entity-2'); // Frodo's ID
});
```

#### 2. Backward Compatibility
```typescript
it('should handle legacy data without ID fields', () => {
  const legacyThought = {
    relatedEntities: ['Gandalf'],
    relatedEntityIds: undefined // Legacy data
  };
  
  const entities = thoughtService.getThoughtsByEntity('Gandalf');
  expect(entities).toContain(legacyThought);
});
```

#### 3. Cascade Deletion
```typescript
it('should remove all references in remove mode', () => {
  const result = entityService.deleteEntity('entity-1', 'remove');
  
  expect(result.success).toBe(true);
  expect(result.affectedThoughts).toBeGreaterThan(0);
  expect(result.affectedEntities).toBeGreaterThan(0);
});
```

#### 4. Orphaned Reference Detection
```typescript
it('should detect orphaned references after deletion', () => {
  entityService.deleteEntity('entity-1', 'orphan');
  
  const validation = schemaValidationService.validateEntityIdReferences(
    mockData.thoughts,
    mockData.entities
  );
  
  expect(validation.totalInvalidReferences).toBeGreaterThan(0);
});
```

## Mocking Strategy

### When to Mock
- External services (API calls, database)
- Storage layer (localStorage, IndexedDB)
- Time-dependent operations (Date.now())
- Random number generation

### When NOT to Mock
- Business logic being tested
- Pure functions and utilities
- Data transformations
- Validation logic

### Mock Patterns

#### Service Mocks
```typescript
vi.mock('../dataStorageService');

beforeEach(() => {
  vi.mocked(dataStorageService.getData).mockReturnValue(mockData);
  vi.mocked(dataStorageService.saveData).mockImplementation((data) => {
    mockData = data;
  });
});
```

#### Component Mocks
```typescript
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: 'test-id' })
}));
```

## Test Data Management

### Creating Realistic Mock Data
```typescript
function createRealisticMockData() {
  return {
    currentCampaignId: 'camp-1',
    currentUserId: 'user-1',
    entities: [
      {
        localId: 'entity-1',
        name: 'Gandalf',
        type: 'npc',
        parentEntityIds: [],
        linkedEntityIds: [],
        campaign_id: 'camp-1',
        created_by: 'user-1',
        syncStatus: 'synced'
      }
    ],
    thoughts: [
      {
        localId: 'thought-1',
        content: 'Met Gandalf',
        relatedEntityIds: ['entity-1'],
        relatedEntities: ['Gandalf'],
        campaign_id: 'camp-1',
        created_by: 'user-1',
        syncStatus: 'synced',
        timestamp: new Date()
      }
    ],
    // ... other required fields
  };
}
```

### Data Builders (Future)
```typescript
// Planned for v1.4.0
const entity = new EntityBuilder()
  .withName('Gandalf')
  .withType('npc')
  .withParents(['Frodo'])
  .build();
```

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test entityService.test.ts
```

### CI/CD Integration (Future)
- Automated test runs on PR
- Coverage reports in PR comments
- Block merge if tests fail
- Performance regression detection

## Coverage Goals

### Current Coverage
- Services: ~80% coverage
- Utilities: ~90% coverage
- Components: ~40% coverage (growing)

### Target Coverage (v1.4.0)
- Services: 90%+
- Utilities: 95%+
- Components: 70%+
- Integration: 60%+
- Overall: 80%+

## Common Testing Patterns

### Testing Async Operations
```typescript
it('should handle async operations', async () => {
  const promise = service.asyncMethod();
  await expect(promise).resolves.toBeDefined();
});
```

### Testing Error Conditions
```typescript
it('should throw error for invalid input', () => {
  expect(() => service.method(invalidInput)).toThrow('Expected error');
});
```

### Testing State Changes
```typescript
it('should update state correctly', () => {
  const initialState = mockData.entities.length;
  entityService.createEntity({ name: 'New' });
  expect(mockData.entities.length).toBe(initialState + 1);
});
```

### Testing Side Effects
```typescript
it('should mark affected items for sync', () => {
  entityService.updateEntity('entity-1', { name: 'New Name' });
  
  const entity = mockData.entities.find(e => e.localId === 'entity-1');
  expect(entity?.syncStatus).toBe('pending');
  expect(entity?.modifiedLocally).toBeInstanceOf(Date);
});
```

## Debugging Failed Tests

### Steps
1. Read the error message completely
2. Check the test's expectations vs actual results
3. Add `console.log` to understand data flow
4. Use `it.only` to focus on failing test
5. Check mock setup and data
6. Verify test assumptions are correct

### Common Issues
- **Mock not working**: Ensure vi.mock() is at top of file
- **State pollution**: Add proper cleanup in beforeEach/afterEach
- **Timing issues**: Use proper async/await patterns
- **Wrong assertions**: Verify expected values are correct

## Test Quality Checklist

Before committing tests:
- [ ] Tests have descriptive names
- [ ] Tests are independent and can run in any order
- [ ] Mock data is realistic and complete
- [ ] All assertions are meaningful
- [ ] Error cases are tested
- [ ] Edge cases are covered
- [ ] Tests run quickly (<100ms per test ideally)
- [ ] No console errors or warnings
- [ ] Code coverage doesn't decrease

## Future Improvements

### v1.4.0
- [ ] Component testing with React Testing Library
- [ ] Snapshot testing for UI components
- [ ] Performance benchmarking tests
- [ ] Test data builders/factories

### v1.5.0
- [ ] E2E tests with Playwright
- [ ] Visual regression testing
- [ ] Accessibility testing (a11y)
- [ ] Load testing for large datasets

### v2.0.0
- [ ] Mutation testing
- [ ] Property-based testing
- [ ] Contract testing for API
- [ ] Security testing

## Related Documentation

- [Development Rules](../DEVELOPMENT_RULES.md)
- [ID-Based References](./ID_BASED_REFERENCES.md)
- [Service Layer Tests](../src/services/__tests__/)
- [Component Tests](../src/components/__tests__/)
