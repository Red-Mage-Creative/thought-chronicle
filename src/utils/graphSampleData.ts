import { Campaign } from '@/types/campaigns';
import { LocalEntity, EntityType } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';

/**
 * Generates realistic sample data for graph visualization
 * Used when user has no campaign/entities or when mock data is enabled
 */
export const generateSampleCampaignData = (): {
  campaign: Campaign;
  entities: LocalEntity[];
  thoughts: LocalThought[];
} => {
  const now = new Date();
  const userId = 'sample-user';
  const campaignId = 'sample-campaign-id';

  const campaign: Campaign = {
    id: campaignId,
    name: 'The Dragon\'s Prophecy',
    description: 'A sample campaign showing graph relationships',
    created_by: userId,
    members: [
      {
        user_id: userId,
        role: 'dm',
        joined_at: now
      }
    ],
    created_at: now,
    updated_at: now
  };

  const entities: LocalEntity[] = [
    {
      id: 'sample-entity-1',
      name: 'Aria Moonwhisper',
      type: 'pc' as EntityType,
      description: 'A brave elven ranger',
      campaign_id: campaignId,
      created_by: userId,
      syncStatus: 'synced',
      attributes: [
        { key: 'Class', value: 'Ranger' },
        { key: 'Level', value: '5' }
      ]
    },
    {
      id: 'sample-entity-2',
      name: 'Thornwick the Wise',
      type: 'npc' as EntityType,
      description: 'An ancient wizard mentor',
      campaign_id: campaignId,
      created_by: userId,
      syncStatus: 'synced',
      linkedEntityIds: ['sample-entity-1'] // Linked to Aria
    },
    {
      id: 'sample-entity-3',
      name: 'Shadowfang Mountains',
      type: 'location' as EntityType,
      description: 'Treacherous mountain range',
      campaign_id: campaignId,
      created_by: userId,
      syncStatus: 'synced'
    },
    {
      id: 'sample-entity-4',
      name: 'The Dragon Cult',
      type: 'organization' as EntityType,
      description: 'Secret society seeking to awaken ancient dragons',
      campaign_id: campaignId,
      created_by: userId,
      syncStatus: 'synced',
      linkedEntityIds: ['sample-entity-6'] // Linked to quest
    },
    {
      id: 'sample-entity-5',
      name: 'Crimson Drake',
      type: 'enemy' as EntityType,
      description: 'A fearsome red dragon',
      campaign_id: campaignId,
      created_by: userId,
      syncStatus: 'synced',
      parentEntityIds: ['sample-entity-4'] // Child of Dragon Cult
    },
    {
      id: 'sample-entity-6',
      name: 'Stop the Awakening',
      type: 'quest' as EntityType,
      description: 'Prevent the cult from awakening the ancient dragon',
      campaign_id: campaignId,
      created_by: userId,
      syncStatus: 'synced',
      linkedEntityIds: ['sample-entity-1', 'sample-entity-3'] // Linked to Aria and location
    },
    {
      id: 'sample-entity-7',
      name: 'The Dragonstone Amulet',
      type: 'item' as EntityType,
      description: 'A magical amulet that protects against dragon fire',
      campaign_id: campaignId,
      created_by: userId,
      syncStatus: 'synced',
      linkedEntityIds: ['sample-entity-1'] // Owned by Aria
    }
  ];

  const thoughts: LocalThought[] = [
    {
      id: 'sample-thought-1',
      content: 'Aria discovered ancient ruins in the Shadowfang Mountains containing clues about the Dragon Cult.',
      relatedEntityIds: ['sample-entity-1', 'sample-entity-3', 'sample-entity-4'],
      relatedEntities: ['Aria Moonwhisper', 'Shadowfang Mountains', 'The Dragon Cult'],
      campaign_id: campaignId,
      created_by: userId,
      timestamp: now,
      syncStatus: 'synced',
      gameDate: 'Day 15'
    },
    {
      id: 'sample-thought-2',
      content: 'Thornwick revealed the prophecy: "When the crimson drake awakens, only moonlight can pierce its scales."',
      relatedEntityIds: ['sample-entity-2', 'sample-entity-5'],
      relatedEntities: ['Thornwick the Wise', 'Crimson Drake'],
      campaign_id: campaignId,
      created_by: userId,
      timestamp: new Date(now.getTime() + 86400000), // +1 day
      syncStatus: 'synced',
      gameDate: 'Day 16'
    },
    {
      id: 'sample-thought-3',
      content: 'The party found the Dragonstone Amulet in a hidden chamber. Aria claimed it.',
      relatedEntityIds: ['sample-entity-1', 'sample-entity-7'],
      relatedEntities: ['Aria Moonwhisper', 'The Dragonstone Amulet'],
      campaign_id: campaignId,
      created_by: userId,
      timestamp: new Date(now.getTime() + 172800000), // +2 days
      syncStatus: 'synced',
      gameDate: 'Day 18'
    },
    {
      id: 'sample-thought-4',
      content: 'The quest intensifies as cult activity increases near the mountains.',
      relatedEntityIds: ['sample-entity-6', 'sample-entity-4', 'sample-entity-3'],
      relatedEntities: ['Stop the Awakening', 'The Dragon Cult', 'Shadowfang Mountains'],
      campaign_id: campaignId,
      created_by: userId,
      timestamp: new Date(now.getTime() + 259200000), // +3 days
      syncStatus: 'synced',
      gameDate: 'Day 20'
    }
  ];

  return { campaign, entities, thoughts };
};
