import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { LocalCampaign } from '@/types/campaigns';
import { EntitySchema, ThoughtSchema, CampaignSchema } from '@/schemas/dataSchemas';

export interface ValidationError {
  index: number;
  field: string;
  error: string;
}

export interface ValidationResult<T> {
  valid: T[];
  invalid: T[];
  errors: ValidationError[];
}

export interface ValidationSummary {
  totalChecked: number;
  validCount: number;
  invalidCount: number;
  issuesFixed: number;
  criticalErrors: number;
  orphanedReferences?: number;
  entitiesAutoCreated?: number;
}

export interface EntityReferenceValidationResult {
  orphanedReferences: {
    thoughtIndex: number;
    thoughtContent: string;
    missingEntities: string[];
  }[];
  orphanedParentReferences: {
    entityName: string;
    missingParents: string[];
  }[];
  orphanedLinkedReferences: {
    entityName: string;
    missingLinked: string[];
  }[];
  totalOrphaned: number;
  entitiesCreated: string[];
}

export const schemaValidationService = {
  /**
   * Helper to check if a date string is valid
   */
  isValidDate(dateString: any): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  },

  /**
   * Validate and fix a single entity against schema
   */
  validateEntity(entity: any, index: number = 0): { entity: LocalEntity | null; errors: ValidationError[]; isValid: boolean } {
    const errors: ValidationError[] = [];
    const validated = { ...entity };
    let hasRequiredFieldErrors = false;
    
    // Check required fields
    EntitySchema.requiredFields.forEach(field => {
      if (validated[field] === undefined || validated[field] === null) {
        errors.push({
          index,
          field,
          error: `Missing required field: ${field}`
        });
        hasRequiredFieldErrors = true;
      }
    });
    
    // Fill missing optional fields with defaults
    Object.keys(EntitySchema.defaults).forEach(field => {
      if (validated[field] === undefined) {
        const defaultValue = EntitySchema.defaults[field];
        validated[field] = typeof defaultValue === 'function' 
          ? defaultValue() 
          : Array.isArray(defaultValue) 
            ? [...defaultValue]
            : defaultValue;
      }
    });
    
    // Convert date strings to Date objects with validation
    ['createdLocally', 'modifiedLocally'].forEach(field => {
      if (validated[field] && typeof validated[field] === 'string') {
        if (this.isValidDate(validated[field])) {
          validated[field] = new Date(validated[field]);
        } else {
          console.warn(`[Validation] Invalid date string for ${field}, using current date`);
          validated[field] = new Date();
        }
      }
    });
    
    // Ensure arrays are actually arrays
    ['parentEntities', 'linkedEntities', 'relatedEntities'].forEach(field => {
      if (validated[field] && !Array.isArray(validated[field])) {
        validated[field] = [];
      }
    });
    
    // If required fields are missing, mark as invalid
    if (hasRequiredFieldErrors) {
      return { entity: null, errors, isValid: false };
    }
    
    return { entity: validated as LocalEntity, errors, isValid: true };
  },
  
  /**
   * Validate all entities in dataset
   */
  validateAllEntities(entities: any[]): ValidationResult<LocalEntity> {
    const valid: LocalEntity[] = [];
    const invalid: LocalEntity[] = [];
    const errors: ValidationError[] = [];
    
    entities.forEach((entity, index) => {
      const result = this.validateEntity(entity, index);
      if (result.isValid && result.entity) {
        valid.push(result.entity);
      } else if (result.entity) {
        invalid.push(result.entity);
      }
      errors.push(...result.errors);
    });
    
    return { valid, invalid, errors };
  },
  
  /**
   * Validate and fix a single thought against schema
   */
  validateThought(thought: any, index: number = 0): { thought: LocalThought | null; errors: ValidationError[]; isValid: boolean } {
    const errors: ValidationError[] = [];
    const validated = { ...thought };
    let hasRequiredFieldErrors = false;
    
    // Check required fields
    ThoughtSchema.requiredFields.forEach(field => {
      if (validated[field] === undefined || validated[field] === null) {
        errors.push({
          index,
          field,
          error: `Missing required field: ${field}`
        });
        hasRequiredFieldErrors = true;
      }
    });
    
    // Fill missing optional fields with defaults
    Object.keys(ThoughtSchema.defaults).forEach(field => {
      if (validated[field] === undefined) {
        const defaultValue = ThoughtSchema.defaults[field];
        validated[field] = typeof defaultValue === 'function' 
          ? defaultValue() 
          : Array.isArray(defaultValue)
            ? [...defaultValue]
            : defaultValue;
      }
    });
    
    // Convert date strings to Date objects with validation
    ['timestamp', 'modifiedLocally'].forEach(field => {
      if (validated[field] && typeof validated[field] === 'string') {
        if (this.isValidDate(validated[field])) {
          validated[field] = new Date(validated[field]);
        } else {
          console.warn(`[Validation] Invalid date string for ${field}, using current date`);
          validated[field] = new Date();
        }
      }
    });
    
    // Ensure relatedEntities is an array
    if (validated.relatedEntities && !Array.isArray(validated.relatedEntities)) {
      validated.relatedEntities = [];
    }
    
    // If required fields are missing, mark as invalid
    if (hasRequiredFieldErrors) {
      return { thought: null, errors, isValid: false };
    }
    
    return { thought: validated as LocalThought, errors, isValid: true };
  },
  
  /**
   * Validate all thoughts in dataset
   */
  validateAllThoughts(thoughts: any[]): ValidationResult<LocalThought> {
    const valid: LocalThought[] = [];
    const invalid: LocalThought[] = [];
    const errors: ValidationError[] = [];
    
    thoughts.forEach((thought, index) => {
      const result = this.validateThought(thought, index);
      if (result.isValid && result.thought) {
        valid.push(result.thought);
      } else if (result.thought) {
        invalid.push(result.thought);
      }
      errors.push(...result.errors);
    });
    
    return { valid, invalid, errors };
  },
  
  /**
   * Validate and fix a single campaign against schema
   */
  validateCampaign(campaign: any, index: number = 0): { campaign: LocalCampaign | null; errors: ValidationError[]; isValid: boolean } {
    const errors: ValidationError[] = [];
    const validated = { ...campaign };
    let hasRequiredFieldErrors = false;
    
    // Check required fields
    CampaignSchema.requiredFields.forEach(field => {
      if (validated[field] === undefined || validated[field] === null) {
        errors.push({
          index,
          field,
          error: `Missing required field: ${field}`
        });
        hasRequiredFieldErrors = true;
      }
    });
    
    // Fill missing optional fields with defaults
    Object.keys(CampaignSchema.defaults).forEach(field => {
      if (validated[field] === undefined) {
        const defaultValue = CampaignSchema.defaults[field];
        validated[field] = typeof defaultValue === 'function' 
          ? defaultValue() 
          : Array.isArray(defaultValue)
            ? [...defaultValue]
            : defaultValue;
      }
    });
    
    // Convert date strings to Date objects with validation
    ['created_at', 'updated_at', 'modifiedLocally'].forEach(field => {
      if (validated[field] && typeof validated[field] === 'string') {
        if (this.isValidDate(validated[field])) {
          validated[field] = new Date(validated[field]);
        } else {
          console.warn(`[Validation] Invalid date string for ${field}, using current date`);
          validated[field] = new Date();
        }
      }
    });
    
    // Ensure members is an array
    if (validated.members && !Array.isArray(validated.members)) {
      validated.members = [];
    }
    
    // If required fields are missing, mark as invalid
    if (hasRequiredFieldErrors) {
      return { campaign: null, errors, isValid: false };
    }
    
    return { campaign: validated as LocalCampaign, errors, isValid: true };
  },
  
  /**
   * Validate all campaigns in dataset
   */
  validateAllCampaigns(campaigns: any[]): ValidationResult<LocalCampaign> {
    const valid: LocalCampaign[] = [];
    const invalid: LocalCampaign[] = [];
    const errors: ValidationError[] = [];
    
    campaigns.forEach((campaign, index) => {
      const result = this.validateCampaign(campaign, index);
      if (result.isValid && result.campaign) {
        valid.push(result.campaign);
      } else if (result.campaign) {
        invalid.push(result.campaign);
      }
      errors.push(...result.errors);
    });
    
    return { valid, invalid, errors };
  },

  /**
   * Validate that all required attributes are present and have non-empty values for an entity
   */
  validateRequiredAttributes(
    entity: LocalEntity, 
    defaultAttributes: any[]
  ): { valid: boolean; missingFields: string[] } {
    const requiredAttrs = defaultAttributes.filter(attr => attr.required);
    const entityAttrs = entity.attributes || [];
    const missingFields: string[] = [];

    requiredAttrs.forEach(reqAttr => {
      const attribute = entityAttrs.find(
        entityAttr => entityAttr.key.toLowerCase() === reqAttr.key.toLowerCase()
      );
      
      // Check if attribute exists and has a non-empty, non-whitespace value
      if (!attribute || !attribute.value || attribute.value.trim() === '') {
        missingFields.push(reqAttr.key);
      }
    });

    return {
      valid: missingFields.length === 0,
      missingFields
    };
  },

  /**
   * Validate that all entity references point to existing entities
   * Auto-creates missing entities as 'uncategorized'
   */
  validateAndRepairEntityReferences(
    thoughts: LocalThought[], 
    entities: LocalEntity[],
    campaignId: string,
    userId: string
  ): EntityReferenceValidationResult {
    const result: EntityReferenceValidationResult = {
      orphanedReferences: [],
      orphanedParentReferences: [],
      orphanedLinkedReferences: [],
      totalOrphaned: 0,
      entitiesCreated: []
    };
    
    // Create a case-insensitive lookup map of existing entities
    const entityMap = new Map<string, LocalEntity>();
    entities.forEach(entity => {
      entityMap.set(entity.name.toLowerCase(), entity);
    });
    
    // Check thoughts for orphaned entity references
    thoughts.forEach((thought, index) => {
      const missingEntities: string[] = [];
      
      thought.relatedEntities.forEach(entityName => {
        if (!entityMap.has(entityName.toLowerCase())) {
          missingEntities.push(entityName);
        }
      });
      
      if (missingEntities.length > 0) {
        result.orphanedReferences.push({
          thoughtIndex: index,
          thoughtContent: thought.content.substring(0, 50) + '...',
          missingEntities
        });
        result.totalOrphaned += missingEntities.length;
      }
    });
    
    // Check entities for orphaned parent references
    entities.forEach(entity => {
      const missingParents: string[] = [];
      const missingLinked: string[] = [];
      
      entity.parentEntities?.forEach(parentName => {
        if (!entityMap.has(parentName.toLowerCase())) {
          missingParents.push(parentName);
        }
      });
      
      entity.linkedEntities?.forEach(linkedName => {
        if (!entityMap.has(linkedName.toLowerCase())) {
          missingLinked.push(linkedName);
        }
      });
      
      if (missingParents.length > 0) {
        result.orphanedParentReferences.push({
          entityName: entity.name,
          missingParents
        });
        result.totalOrphaned += missingParents.length;
      }
      
      if (missingLinked.length > 0) {
        result.orphanedLinkedReferences.push({
          entityName: entity.name,
          missingLinked
        });
        result.totalOrphaned += missingLinked.length;
      }
    });
    
    // Auto-create missing entities
    const allMissingNames = new Set<string>();
    
    // Collect all missing entity names
    result.orphanedReferences.forEach(ref => {
      ref.missingEntities.forEach(name => allMissingNames.add(name));
    });
    result.orphanedParentReferences.forEach(ref => {
      ref.missingParents.forEach(name => allMissingNames.add(name));
    });
    result.orphanedLinkedReferences.forEach(ref => {
      ref.missingLinked.forEach(name => allMissingNames.add(name));
    });
    
    // Create each missing entity
    allMissingNames.forEach(entityName => {
      // Only create if it truly doesn't exist (case-insensitive check)
      if (!entityMap.has(entityName.toLowerCase())) {
        const newEntity: LocalEntity = {
          localId: this.generateLocalId(),
          name: entityName,
          type: 'uncategorized',
          description: 'Auto-created to resolve orphaned reference',
          parentEntities: [],
          linkedEntities: [],
          attributes: [],
          campaign_id: campaignId,
          created_by: userId,
          syncStatus: 'pending',
          creationSource: 'auto',
          createdLocally: new Date(),
          modifiedLocally: new Date()
        };
        
        entities.push(newEntity);
        entityMap.set(entityName.toLowerCase(), newEntity);
        result.entitiesCreated.push(entityName);
      }
    });
    
    return result;
  },

  /**
   * Helper method to generate a local ID
   */
  generateLocalId(): string {
    return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};
