# ID-Based Entity Reference System (v1.3.0)

## Overview

Starting in v1.3.0, D&D Chronicle uses an **ID-based entity reference system** instead of name-based references. This improves data integrity, enables entity renaming, and prevents cascade failures when entities are deleted.

## Architecture

### Core Principles

1. **IDs as Primary Keys**: All entity relationships use unique local IDs (`localId`) as the source of truth
2. **Backward Compatibility**: Legacy name-based fields are maintained for migration period
3. **Dual-Field Storage**: Both ID and name fields are populated during transition
4. **Service Layer Conversion**: Forms work with names (UX), services handle ID conversion (data integrity)

### Data Structure

#### Entities (LocalEntity)
```typescript
{
  localId: 'entity-123',           // Unique local identifier
  name: 'Gandalf',                 // Human-readable name (can be changed)
  
  // NEW: ID-based references (v1.3.0+)
  parentEntityIds: ['entity-456'], // Parent relationships by ID
  linkedEntityIds: ['entity-789'], // Non-hierarchical relationships by ID
  
  // LEGACY: Name-based references (deprecated, maintained for compatibility)
  parentEntities: ['Frodo'],       // Deprecated
  linkedEntities: ['Rivendell']    // Deprecated
}
```

#### Thoughts (LocalThought)
```typescript
{
  localId: 'thought-123',
  content: 'Met Gandalf in Rivendell',
  
  // NEW: ID-based references (v1.3.0+)
  relatedEntityIds: ['entity-123', 'entity-789'],
  
  // LEGACY: Name-based references (deprecated)
  relatedEntities: ['Gandalf', 'Rivendell']
}
```

## Components & Responsibilities

### Form Components (UI Layer)
**Responsibility**: User-friendly interface working with entity names

- `ThoughtForm.tsx`: Accepts entity names for related entities
- `EntityRelationshipSelector.tsx`: Displays/selects entities by name
- `EntityEditForm.tsx`: Works with entity names for relationships

**Pattern**: Forms pass names to services, never directly manipulate IDs

### Service Layer (Data Layer)
**Responsibility**: Convert names to IDs, maintain data integrity

- `thoughtService.ts`: Converts entity names to IDs when saving thoughts
- `entityService.ts`: Manages relationships using IDs internally
- `schemaValidationService.ts`: Validates ID references, detects orphans

**Pattern**: Services resolve names to IDs, store both fields, prioritize IDs for queries

### Display Components (Presentation Layer)
**Responsibility**: Show data, handle missing references gracefully

- `ThoughtList.tsx`: Shows orphaned references with warning icons
- `EntityDetailsPage.tsx`: Displays relationships using ID-based queries
- `EntityList.tsx`: Uses IDs for filtering and display logic

**Pattern**: Query by ID first, fall back to names, show warnings for orphans

## Key Features

### 1. Entity Renaming Support
Entities can be renamed without breaking references:

```typescript
// Before rename
entity = { localId: 'e1', name: 'Gandalf' }
thought = { relatedEntityIds: ['e1'], relatedEntities: ['Gandalf'] }

// After rename to "Gandalf the Grey"
entity = { localId: 'e1', name: 'Gandalf the Grey' }
thought = { relatedEntityIds: ['e1'], relatedEntities: ['Gandalf the Grey'] }
// ✅ Relationship preserved via ID
```

### 2. Cascade Deletion Modes

Three modes for handling entity deletion:

#### Orphan Mode (Default)
```typescript
entityService.deleteEntity('entity-id', 'orphan');
```
- Deletes entity, leaves references intact
- Orphaned references shown with warning icon
- Best for: Preserving historical context

#### Block Mode
```typescript
entityService.deleteEntity('entity-id', 'block');
```
- Prevents deletion if entity has references
- Returns count of blocking references
- Best for: Protecting important entities

#### Remove Mode
```typescript
entityService.deleteEntity('entity-id', 'remove');
```
- Deletes entity AND removes all references
- Updates affected thoughts/entities
- Marks all changes for sync
- Best for: Clean deletion with automatic cleanup

### 3. Reference Validation

Detect and report invalid ID references:

```typescript
const report = schemaValidationService.validateEntityIdReferences(
  thoughts,
  entities
);

console.log(report.totalInvalidReferences);
console.log(report.invalidThoughtReferences);
console.log(report.invalidParentReferences);
console.log(report.invalidLinkedReferences);
console.log(report.recommendation);
```

### 4. Orphaned Reference Display

Visual indicators for missing entities in `EntityRelationshipDisplay` component:

**Valid Entity Badge:**
- Colored background with entity type color (green, blue, purple, etc.)
- Entity type icon (User, MapPin, Sword, etc.)
- Entity name and type label
- Clickable for navigation
- Hover effect for interactivity

**Orphaned Reference Badge:**
- Muted gray background (`bg-muted/50`)
- Dashed border (`border-dashed`)
- AlertTriangle warning icon
- "Unknown Entity" label with truncated ID
- Non-clickable (no navigation)
- Tooltip explaining the issue

**Header Count Display:**
- Without orphans: "Parent Entities (2)"
- With orphans: "Parent Entities (2 valid, 1 orphaned)"

**Example Usage:**
```tsx
<EntityRelationshipDisplay
  title="Parent Entities"
  icon={Network}
  entities={[validEntity1, validEntity2]}
  orphanedIds={['deleted-entity-123']}
  emptyMessage="No parent entities"
  onEntityClick={handleEntityClick}
/>
```

**Tooltip Content:**
"This reference points to an entity that no longer exists. The entity may have been deleted or the data may be corrupted. You can remove this reference by editing the entity."

## Migration Guide

### Phase 1: Dual-Field Storage (Current)
- System stores both ID and name fields
- Queries prioritize IDs, fall back to names
- All new data uses ID-based references
- Legacy data continues to work

### Phase 2: Background Migration (Future v1.4.0)
- Automatic conversion of legacy data
- Migration service runs in background
- Progress tracking and reporting
- No user intervention required

### Phase 3: Name-Field Deprecation (Future v2.0.0)
- Name-based fields become read-only
- System fully ID-based
- Legacy fields removed from types
- Complete migration to new system

## Best Practices

### For Form Development
✅ **DO**: Accept entity names from users
✅ **DO**: Pass names directly to service methods
❌ **DON'T**: Manually resolve names to IDs in components
❌ **DON'T**: Access or modify ID fields directly in forms

### For Service Development
✅ **DO**: Convert names to IDs internally
✅ **DO**: Store both ID and name fields during transition
✅ **DO**: Query by ID first, fall back to names
❌ **DON'T**: Assume all data has ID fields populated
❌ **DON'T**: Remove name-based fallback logic yet

### For Display Development
✅ **DO**: Use ID-based queries as primary method
✅ **DO**: Handle missing entities gracefully
✅ **DO**: Show visual indicators for orphaned references
❌ **DON'T**: Rely solely on name-based lookups
❌ **DON'T**: Hide orphaned references silently

## Testing Guidelines

### Unit Tests
- Test ID resolution and conversion
- Test all cascade deletion modes
- Test validation functions
- Test fallback logic

### Integration Tests
- Test form-to-service data flow
- Test name-to-ID conversion
- Test backward compatibility
- Test display with mixed data

### E2E Tests
- Test entity rename workflow
- Test entity deletion scenarios
- Test orphaned reference display
- Test migration scenarios

## Troubleshooting

### Issue: Orphaned References After Deletion
**Cause**: Entity deleted in `orphan` mode
**Solution**: Use `remove` mode or manually clean references

### Issue: Cannot Find Entity by Name
**Cause**: Entity renamed, old name used in query
**Solution**: System should use ID-based query automatically

### Issue: Validation Reports Invalid References
**Cause**: Data inconsistency from migration or bugs
**Solution**: Run cleanup with `remove` mode deletion

### Issue: Tests Failing with ID Fields
**Cause**: Mock data missing new ID-based fields
**Solution**: Add `parentEntityIds`, `linkedEntityIds`, `relatedEntityIds` to mocks

## API Reference

### entityService

```typescript
// Add parent relationship (accepts name, uses ID internally)
addParentEntity(entityName: string, parentName: string): void

// Remove parent relationship (accepts name, uses ID internally)
removeParentEntity(entityName: string, parentName: string): void

// Add linked relationship (accepts name, uses ID internally)
addLinkedEntity(entityName: string, linkedName: string): void

// Remove linked relationship (accepts name, uses ID internally)
removeLinkedEntity(entityName: string, linkedName: string): void

// Delete entity with cascade mode
deleteEntity(localId: string, mode?: 'orphan' | 'block' | 'remove'): DeleteResult

// Get child entities (uses ID-based query)
getChildEntities(entityName: string): LocalEntity[]

// Get linked entities (uses ID-based query)
getLinkedEntities(entityName: string): LocalEntity[]
```

### thoughtService

```typescript
// Create thought (converts names to IDs)
createThought(thoughtData: Partial<LocalThought>): LocalThought

// Update thought (converts names to IDs)
updateThought(localId: string, updates: Partial<LocalThought>): LocalThought

// Get thoughts by entity (uses ID-based query)
getThoughtsByEntity(entityName: string): LocalThought[]
```

### schemaValidationService

```typescript
// Validate all ID references
validateEntityIdReferences(
  thoughts: LocalThought[],
  entities: LocalEntity[]
): ValidationReport

interface ValidationReport {
  totalInvalidReferences: number;
  invalidThoughtReferences: InvalidThoughtRef[];
  invalidParentReferences: InvalidEntityRef[];
  invalidLinkedReferences: InvalidEntityRef[];
  recommendation: string;
}
```

## Performance Considerations

### ID Lookups vs Name Lookups
- ID-based lookups: O(1) with Map/Object
- Name-based lookups: O(n) with array iteration
- **Impact**: ~5-10x faster for large datasets (1000+ entities)

### Memory Usage
- Dual-field storage adds ~10-20% memory overhead
- Temporary during migration period
- Will be removed in v2.0.0

### Sync Performance
- ID-based updates more efficient (no name resolution on server)
- Fewer conflicts from concurrent name changes
- Cleaner merge resolution

## Version History

### v1.3.0 (Current)
- ✅ ID-based reference system implemented
- ✅ Dual-field storage active
- ✅ Cascade deletion modes
- ✅ Reference validation
- ✅ Orphaned reference detection

### v1.4.0 (Planned)
- 🔄 Background migration service
- 🔄 Automatic data conversion
- 🔄 Migration progress tracking

### v2.0.0 (Future)
- 🔮 Name-based fields removed
- 🔮 Fully ID-based system
- 🔮 Breaking changes for legacy data

## Related Documentation

- [Development Rules](../DEVELOPMENT_RULES.md)
- [Changelog](../src/pages/ChangelogPage.tsx)
- [Testing Strategy](./TESTING_STRATEGY.md)
- [Entity Service Tests](../src/services/__tests__/entityService.test.ts)
- [ID-Based Validation Tests](../src/services/__tests__/idBasedValidation.test.ts)
