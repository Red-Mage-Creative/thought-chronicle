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
   * Validate that all required attributes are present for an entity
   */
  validateRequiredAttributes(
    entity: LocalEntity, 
    defaultAttributes: any[]
  ): { valid: boolean; missingFields: string[] } {
    const requiredAttrs = defaultAttributes.filter(attr => attr.required);
    const entityAttrs = entity.attributes || [];
    const missingFields: string[] = [];

    requiredAttrs.forEach(reqAttr => {
      const hasAttribute = entityAttrs.some(
        entityAttr => entityAttr.key.toLowerCase() === reqAttr.key.toLowerCase()
      );
      
      if (!hasAttribute) {
        missingFields.push(reqAttr.key);
      }
    });

    return {
      valid: missingFields.length === 0,
      missingFields
    };
  }
};
