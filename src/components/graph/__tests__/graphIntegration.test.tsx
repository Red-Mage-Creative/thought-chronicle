import { describe, it, expect } from 'vitest';
import { transformToForceGraphData, getNodeColor, getNodeSize } from '@/utils/graphDataTransform';
import { generateSampleCampaignData } from '@/utils/graphSampleData';

describe('Graph Integration', () => {
  describe('transformToForceGraphData', () => {
    it('should transform campaign, entities, and thoughts into force graph format', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      const graphData = transformToForceGraphData(campaign, entities, thoughts);
      
      expect(graphData).toHaveProperty('nodes');
      expect(graphData).toHaveProperty('links');
      expect(Array.isArray(graphData.nodes)).toBe(true);
      expect(Array.isArray(graphData.links)).toBe(true);
    });

    it('should include campaign node', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      const graphData = transformToForceGraphData(campaign, entities, thoughts);
      
      const campaignNode = graphData.nodes.find(n => n.data.type === 'campaign');
      expect(campaignNode).toBeDefined();
      expect(campaignNode?.label).toBe(campaign.name);
    });

    it('should include all entities as nodes', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      const graphData = transformToForceGraphData(campaign, entities, thoughts);
      
      const entityNodes = graphData.nodes.filter(n => n.data.type === 'entity');
      expect(entityNodes.length).toBe(entities.length);
    });

    it('should include all thoughts as nodes', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      const graphData = transformToForceGraphData(campaign, entities, thoughts);
      
      const thoughtNodes = graphData.nodes.filter(n => n.data.type === 'thought');
      expect(thoughtNodes.length).toBe(thoughts.length);
    });

    it('should create links between campaign and entities', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      const graphData = transformToForceGraphData(campaign, entities, thoughts);
      
      const campaignEntityLinks = graphData.links.filter(
        l => l.data.type === 'campaign-entity'
      );
      expect(campaignEntityLinks.length).toBeGreaterThan(0);
    });

    it('should create links for entity relationships', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      const graphData = transformToForceGraphData(campaign, entities, thoughts);
      
      const parentLinks = graphData.links.filter(l => l.data.type === 'parent');
      const linkedLinks = graphData.links.filter(l => l.data.type === 'linked');
      
      expect(parentLinks.length + linkedLinks.length).toBeGreaterThan(0);
    });

    it('should add entityId and thoughtId to node data for navigation', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      const graphData = transformToForceGraphData(campaign, entities, thoughts);
      
      const entityNode = graphData.nodes.find(n => n.data.type === 'entity');
      const thoughtNode = graphData.nodes.find(n => n.data.type === 'thought');
      
      expect(entityNode?.data.entityId).toBeDefined();
      expect(thoughtNode?.data.thoughtId).toBeDefined();
    });
  });

  describe('Sample Data Generation', () => {
    it('should generate valid campaign data', () => {
      const { campaign, entities, thoughts } = generateSampleCampaignData();
      
      expect(campaign).toBeDefined();
      expect(campaign.name).toBe("The Dragon's Prophecy");
      expect(campaign.id).toBe('sample-campaign-id');
    });

    it('should generate multiple entities of different types', () => {
      const { entities } = generateSampleCampaignData();
      
      expect(entities.length).toBeGreaterThan(5);
      
      const types = new Set(entities.map(e => e.type));
      expect(types.size).toBeGreaterThan(3); // At least 4 different types
    });

    it('should generate thoughts with entity references', () => {
      const { thoughts } = generateSampleCampaignData();
      
      expect(thoughts.length).toBeGreaterThan(3);
      
      thoughts.forEach(thought => {
        expect(thought.relatedEntityIds).toBeDefined();
        expect(thought.relatedEntityIds!.length).toBeGreaterThan(0);
      });
    });

    it('should generate entities with relationships', () => {
      const { entities } = generateSampleCampaignData();
      
      const entitiesWithRelationships = entities.filter(
        e => (e.parentEntityIds && e.parentEntityIds.length > 0) || 
             (e.linkedEntityIds && e.linkedEntityIds.length > 0)
      );
      
      expect(entitiesWithRelationships.length).toBeGreaterThan(0);
    });
  });

  describe('Node Styling', () => {
    it('should return different colors for different node types', () => {
      const campaignNode = { 
        id: 'test', 
        label: 'Test',
        data: { type: 'campaign' as const, originalData: {} as any }
      };
      const entityNode = { 
        id: 'test', 
        label: 'Test',
        data: { type: 'entity' as const, entityType: 'pc', originalData: {} as any }
      };
      const thoughtNode = { 
        id: 'test', 
        label: 'Test',
        data: { type: 'thought' as const, originalData: {} as any }
      };
      
      const campaignColor = getNodeColor(campaignNode);
      const entityColor = getNodeColor(entityNode);
      const thoughtColor = getNodeColor(thoughtNode);
      
      expect(campaignColor).not.toBe(entityColor);
      expect(entityColor).not.toBe(thoughtColor);
      expect(campaignColor).not.toBe(thoughtColor);
    });

    it('should return different sizes for different node types', () => {
      const campaignNode = { 
        id: 'test', 
        label: 'Test',
        data: { type: 'campaign' as const, originalData: {} as any }
      };
      const entityNode = { 
        id: 'test', 
        label: 'Test',
        data: { type: 'entity' as const, thoughtCount: 5, originalData: {} as any }
      };
      const thoughtNode = { 
        id: 'test', 
        label: 'Test',
        data: { type: 'thought' as const, originalData: {} as any }
      };
      
      const campaignSize = getNodeSize(campaignNode);
      const entitySize = getNodeSize(entityNode);
      const thoughtSize = getNodeSize(thoughtNode);
      
      expect(campaignSize).toBeGreaterThan(entitySize);
      expect(entitySize).toBeGreaterThan(thoughtSize);
    });
  });
});
