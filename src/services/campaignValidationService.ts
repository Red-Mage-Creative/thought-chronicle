import { dataStorageService } from './dataStorageService';
import { LocalCampaign } from '@/types/campaigns';

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
}

export interface ValidationIssue {
  type: 'no_campaigns' | 'orphaned_thoughts' | 'orphaned_entities' | 'no_user_context';
  message: string;
  count?: number;
  affectedIds?: string[];
}

export interface OrphanedData {
  thoughts: Array<{ localId: string; content: string; timestamp: Date }>;
  entities: Array<{ localId: string; name: string; type: string }>;
}

export const campaignValidationService = {
  /**
   * Validates the user's campaign setup and data integrity
   */
  validate(): ValidationResult {
    const data = dataStorageService.getData();
    const issues: ValidationIssue[] = [];

    // Check if user has at least one campaign
    if (!data.campaigns || data.campaigns.length === 0) {
      issues.push({
        type: 'no_campaigns',
        message: 'No campaigns found. You need at least one campaign to organize your thoughts and entities.'
      });
    }

    // Check for thoughts without campaign_id
    const orphanedThoughts = data.thoughts.filter(t => !t.campaign_id);
    if (orphanedThoughts.length > 0) {
      issues.push({
        type: 'orphaned_thoughts',
        message: `Found ${orphanedThoughts.length} thought(s) not linked to any campaign.`,
        count: orphanedThoughts.length,
        affectedIds: orphanedThoughts.map(t => t.localId!).filter(Boolean)
      });
    }

    // Check for entities without campaign_id
    const orphanedEntities = data.entities.filter(e => !e.campaign_id);
    if (orphanedEntities.length > 0) {
      issues.push({
        type: 'orphaned_entities',
        message: `Found ${orphanedEntities.length} entit(ies) not linked to any campaign.`,
        count: orphanedEntities.length,
        affectedIds: orphanedEntities.map(e => e.localId!).filter(Boolean)
      });
    }

    // Check if user context is set
    if (!data.currentUserId) {
      issues.push({
        type: 'no_user_context',
        message: 'User context is not set. Please sign in again.'
      });
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  },

  /**
   * Gets orphaned data for display in migration modal
   */
  getOrphanedData(): OrphanedData {
    const data = dataStorageService.getData();

    return {
      thoughts: data.thoughts
        .filter(t => !t.campaign_id)
        .map(t => ({
          localId: t.localId!,
          content: t.content.substring(0, 100),
          timestamp: t.timestamp
        })),
      entities: data.entities
        .filter(e => !e.campaign_id)
        .map(e => ({
          localId: e.localId!,
          name: e.name,
          type: e.type
        }))
    };
  },

  /**
   * Assigns orphaned data to a campaign
   */
  assignOrphanedDataToCampaign(campaignId: string): void {
    const data = dataStorageService.getData();

    // Assign orphaned thoughts
    data.thoughts.forEach(thought => {
      if (!thought.campaign_id) {
        thought.campaign_id = campaignId;
        thought.modifiedLocally = new Date();
        thought.syncStatus = 'pending';
        
        // Add to pending changes if not already there
        if (thought.localId && !data.pendingChanges.thoughts.modified.includes(thought.localId)) {
          data.pendingChanges.thoughts.modified.push(thought.localId);
        }
      }
    });

    // Assign orphaned entities
    data.entities.forEach(entity => {
      if (!entity.campaign_id) {
        entity.campaign_id = campaignId;
        entity.modifiedLocally = new Date();
        entity.syncStatus = 'pending';
        
        // Add to pending changes if not already there
        if (entity.localId && !data.pendingChanges.entities.modified.includes(entity.localId)) {
          data.pendingChanges.entities.modified.push(entity.localId);
        }
      }
    });

    dataStorageService.saveData(data);
  },

  /**
   * Deletes all orphaned data
   */
  deleteOrphanedData(): void {
    const data = dataStorageService.getData();

    // Remove orphaned thoughts
    const orphanedThoughtIds = data.thoughts
      .filter(t => !t.campaign_id)
      .map(t => t.localId!)
      .filter(Boolean);
    
    data.thoughts = data.thoughts.filter(t => t.campaign_id);
    
    // Add to deleted list
    orphanedThoughtIds.forEach(id => {
      if (!data.pendingChanges.thoughts.deleted.includes(id)) {
        data.pendingChanges.thoughts.deleted.push(id);
      }
    });

    // Remove orphaned entities
    const orphanedEntityIds = data.entities
      .filter(e => !e.campaign_id)
      .map(e => e.localId!)
      .filter(Boolean);
    
    data.entities = data.entities.filter(e => e.campaign_id);
    
    // Add to deleted list
    orphanedEntityIds.forEach(id => {
      if (!data.pendingChanges.entities.deleted.includes(id)) {
        data.pendingChanges.entities.deleted.push(id);
      }
    });

    dataStorageService.saveData(data);
  }
};