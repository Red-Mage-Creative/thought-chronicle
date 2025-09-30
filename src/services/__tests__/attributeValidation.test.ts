import { describe, it, expect } from 'vitest';
import { schemaValidationService } from '../schemaValidationService';
import { LocalEntity, DefaultEntityAttribute, EntityType } from '@/types/entities';

describe('schemaValidationService - validateRequiredAttributes', () => {
  const createEntity = (attributes: any[] = []): LocalEntity => ({
    id: 'test-entity-1',
    name: 'Test Entity',
    type: 'pc',
    description: 'Test description',
    parentEntities: [],
    linkedEntities: [],
    attributes,
    campaign_id: 'test-campaign',
    created_by: 'test-user',
    syncStatus: 'synced'
  });

  const createDefaultAttribute = (
    key: string, 
    required: boolean = true,
    entityTypes: EntityType[] = ['pc']
  ): DefaultEntityAttribute => ({
    key,
    required,
    entityTypes,
    defaultValue: ''
  });

  describe('valid scenarios', () => {
    it('should validate entity with all required attributes filled', () => {
      const entity = createEntity([
        { key: 'Class', value: 'Wizard' },
        { key: 'Level', value: '5' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true),
        createDefaultAttribute('Level', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should validate entity with required and optional attributes', () => {
      const entity = createEntity([
        { key: 'Class', value: 'Rogue' },
        { key: 'Background', value: 'Criminal' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should validate entity with extra non-required attributes', () => {
      const entity = createEntity([
        { key: 'Class', value: 'Fighter' },
        { key: 'Height', value: '6ft' },
        { key: 'Weight', value: '200lbs' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should validate entity when no required defaults exist', () => {
      const entity = createEntity([
        { key: 'Background', value: 'Noble' }
      ]);
      const defaults = [
        createDefaultAttribute('Height', false),
        createDefaultAttribute('Weight', false)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });
  });

  describe('invalid scenarios', () => {
    it('should detect missing required attribute', () => {
      const entity = createEntity([
        { key: 'Background', value: 'Soldier' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('Class');
      expect(result.missingFields).toHaveLength(1);
    });

    it('should detect multiple missing required attributes', () => {
      const entity = createEntity([]);
      const defaults = [
        createDefaultAttribute('Class', true),
        createDefaultAttribute('Level', true),
        createDefaultAttribute('Race', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('Class');
      expect(result.missingFields).toContain('Level');
      expect(result.missingFields).toContain('Race');
      expect(result.missingFields).toHaveLength(3);
    });

    it('should detect missing required attribute when entity has other attributes', () => {
      const entity = createEntity([
        { key: 'Background', value: 'Acolyte' },
        { key: 'Height', value: '5ft 8in' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true),
        createDefaultAttribute('Level', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('Class');
      expect(result.missingFields).toContain('Level');
      expect(result.missingFields).toHaveLength(2);
    });
  });

  describe('edge cases', () => {
    it('should handle empty attributes array with required defaults', () => {
      const entity = createEntity([]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('Class');
    });

    it('should handle attributes with empty string values for required fields', () => {
      const entity = createEntity([
        { key: 'Class', value: '' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('Class');
    });

    it('should handle attributes with whitespace-only values', () => {
      const entity = createEntity([
        { key: 'Class', value: '   ' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('Class');
    });

    it('should be case-insensitive when matching attribute keys', () => {
      const entity = createEntity([
        { key: 'class', value: 'Paladin' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });

    it('should handle entity with no attributes property', () => {
      const entity = createEntity();
      entity.attributes = undefined as any;
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(false);
      expect(result.missingFields).toContain('Class');
    });

    it('should validate when required attribute has valid non-empty value', () => {
      const entity = createEntity([
        { key: 'Class', value: '0' }
      ]);
      const defaults = [
        createDefaultAttribute('Class', true)
      ];

      const result = schemaValidationService.validateRequiredAttributes(entity, defaults);

      expect(result.valid).toBe(true);
      expect(result.missingFields).toHaveLength(0);
    });
  });
});
