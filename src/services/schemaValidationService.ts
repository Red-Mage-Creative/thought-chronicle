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
  errors: ValidationError[];
}

export const schemaValidationService = {
  /**
   * Validate and fix a single entity against schema
   */
  validateEntity(entity: any, index: number = 0): { entity: LocalEntity; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const validated = { ...entity };
    
    // Check required fields
    EntitySchema.requiredFields.forEach(field => {
      if (validated[field] === undefined || validated[field] === null) {
        errors.push({
          index,
          field,
          error: `Missing required field: ${field}`
        });
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
    
    // Convert date strings to Date objects
    ['createdLocally', 'modifiedLocally'].forEach(field => {
      if (validated[field] && typeof validated[field] === 'string') {
        validated[field] = new Date(validated[field]);
      }
    });
    
    // Ensure arrays are actually arrays
    ['parentEntities', 'linkedEntities', 'relatedEntities'].forEach(field => {
      if (validated[field] && !Array.isArray(validated[field])) {
        validated[field] = [];
      }
    });
    
    return { entity: validated as LocalEntity, errors };
  },
  
  /**
   * Validate all entities in dataset
   */
  validateAllEntities(entities: any[]): ValidationResult<LocalEntity> {
    const valid: LocalEntity[] = [];
    const errors: ValidationError[] = [];
    
    entities.forEach((entity, index) => {
      const result = this.validateEntity(entity, index);
      valid.push(result.entity);
      errors.push(...result.errors);
    });
    
    return { valid, errors };
  },
  
  /**
   * Validate and fix a single thought against schema
   */
  validateThought(thought: any, index: number = 0): { thought: LocalThought; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const validated = { ...thought };
    
    // Check required fields
    ThoughtSchema.requiredFields.forEach(field => {
      if (validated[field] === undefined || validated[field] === null) {
        errors.push({
          index,
          field,
          error: `Missing required field: ${field}`
        });
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
    
    // Convert date strings to Date objects
    ['timestamp', 'modifiedLocally'].forEach(field => {
      if (validated[field] && typeof validated[field] === 'string') {
        validated[field] = new Date(validated[field]);
      }
    });
    
    // Ensure relatedEntities is an array
    if (validated.relatedEntities && !Array.isArray(validated.relatedEntities)) {
      validated.relatedEntities = [];
    }
    
    return { thought: validated as LocalThought, errors };
  },
  
  /**
   * Validate all thoughts in dataset
   */
  validateAllThoughts(thoughts: any[]): ValidationResult<LocalThought> {
    const valid: LocalThought[] = [];
    const errors: ValidationError[] = [];
    
    thoughts.forEach((thought, index) => {
      const result = this.validateThought(thought, index);
      valid.push(result.thought);
      errors.push(...result.errors);
    });
    
    return { valid, errors };
  },
  
  /**
   * Validate and fix a single campaign against schema
   */
  validateCampaign(campaign: any, index: number = 0): { campaign: LocalCampaign; errors: ValidationError[] } {
    const errors: ValidationError[] = [];
    const validated = { ...campaign };
    
    // Check required fields
    CampaignSchema.requiredFields.forEach(field => {
      if (validated[field] === undefined || validated[field] === null) {
        errors.push({
          index,
          field,
          error: `Missing required field: ${field}`
        });
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
    
    // Convert date strings to Date objects
    ['created_at', 'updated_at', 'modifiedLocally'].forEach(field => {
      if (validated[field] && typeof validated[field] === 'string') {
        validated[field] = new Date(validated[field]);
      }
    });
    
    // Ensure members is an array
    if (validated.members && !Array.isArray(validated.members)) {
      validated.members = [];
    }
    
    return { campaign: validated as LocalCampaign, errors };
  },
  
  /**
   * Validate all campaigns in dataset
   */
  validateAllCampaigns(campaigns: any[]): ValidationResult<LocalCampaign> {
    const valid: LocalCampaign[] = [];
    const errors: ValidationError[] = [];
    
    campaigns.forEach((campaign, index) => {
      const result = this.validateCampaign(campaign, index);
      valid.push(result.campaign);
      errors.push(...result.errors);
    });
    
    return { valid, errors };
  }
};
