import { useRef, useCallback, useEffect, useState, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { Campaign } from '@/types/campaigns';
import { 
  transformToGraphData, 
  transformToEntityCenteredGraph, 
  getNodeColor, 
  validateGraphData,
  calculateNodeMetrics,
  getConnectedNodes,
  GraphNode,
  GraphEdge
} from '@/utils/graphDataTransform';
import { generateSampleCampaignData } from '@/utils/graphSampleData';
import { GraphControlPanel, GraphFilters } from './GraphControlPanel';
import { GraphTooltip } from './GraphTooltip';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { createIconCache, drawIcon } from '@/utils/graphIconCache';
import { EntityType } from '@/types/entities';
import { getAllEntityTypeValues } from '@/config/entityTypeConfig';

interface ForceGraph2DWrapperProps {
  campaign: Campaign | null;
  entities: LocalEntity[];
  thoughts: LocalThought[];
  safeMode?: boolean;
  useSampleData?: boolean;
  onSafeModeChange?: (enabled: boolean) => void;
  onUseSampleDataChange?: (enabled: boolean) => void;
  centerEntityId?: string;
  mode?: 'campaign' | 'entity';
}

export const ForceGraph2DWrapper = ({ 
  campaign, 
  entities, 
  thoughts, 
  safeMode = false,
  useSampleData = false,
  onSafeModeChange,
  onUseSampleDataChange,
  centerEntityId,
  mode = 'campaign'
}: ForceGraph2DWrapperProps) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredNodeRef = useRef<any>(null);
  const graphLinksRef = useRef<any[]>([]);
  const hasCenteredRef = useRef(false);
  const lastHoverIdRef = useRef<string | null>(null);
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [iconCache, setIconCache] = useState<Map<EntityType, HTMLImageElement>>(new Map());
  
  // Interactivity state
  const [tooltipData, setTooltipData] = useState<{node: GraphNode, x: number, y: number} | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<GraphFilters>({
    entityTypes: new Set(getAllEntityTypeValues()),
    relationshipTypes: new Set(['parent', 'linked', 'mention']),
    searchQuery: '',
    showThoughts: true
  });

  // Use sample data if requested or if no real data exists
  const actualData = useMemo(() => {
    if (useSampleData || (!campaign && entities.length === 0)) {
      return generateSampleCampaignData();
    }
    // Important: returning this object inside useMemo makes its identity stable across renders
    return { campaign, entities, thoughts };
  }, [useSampleData, campaign, entities, thoughts]);

  // Create icon cache on mount
  useEffect(() => {
    createIconCache().then(cache => {
      setIconCache(cache);
      console.log('[ForceGraph2DWrapper] Icon cache ready');
    });
  }, []);

  // Update dimensions when container size changes
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: Math.max(clientWidth, 400),
          height: Math.max(clientHeight, 400)
        });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Transform and filter data
  const { graphData, nodeMetrics, entityCounts } = useMemo(() => {
    let intermediateData;
    
    try {
      // Step 1: Transform to GraphData based on mode
      if (mode === 'entity' && centerEntityId) {
        intermediateData = transformToEntityCenteredGraph(
          centerEntityId,
          actualData.entities,
          actualData.thoughts
        );
      } else {
        intermediateData = transformToGraphData(
          actualData.campaign, 
          actualData.entities, 
          actualData.thoughts
        );
      }

      // Step 2: Apply filters
      let filteredNodes = intermediateData.nodes.filter(node => {
        // Filter by entity type
        if (node.data.type === 'entity' && node.data.entityType) {
          if (!filters.entityTypes.has(node.data.entityType as EntityType)) {
            return false;
          }
        }

        // Filter thoughts visibility
        if (node.data.type === 'thought' && !filters.showThoughts) {
          return false;
        }

        // Filter by search query
        if (filters.searchQuery) {
          const query = filters.searchQuery.toLowerCase();
          if (!node.label.toLowerCase().includes(query)) {
            return false;
          }
        }

        return true;
      });

      // Get valid node IDs after filtering
      const validNodeIds = new Set(filteredNodes.map(n => n.id));

      // Filter edges based on filtered nodes and relationship types
      let filteredEdges = intermediateData.edges.filter(edge => {
        // Only keep edges where both nodes are visible
        if (!validNodeIds.has(edge.source) || !validNodeIds.has(edge.target)) {
          return false;
        }

        // Filter by relationship type
        if (edge.data.relationshipType) {
          if (!filters.relationshipTypes.has(edge.data.relationshipType)) {
            return false;
          }
        }

        return true;
      });

      // Step 3: Validate
      const validation = validateGraphData({ nodes: filteredNodes, edges: filteredEdges });
      if (!validation.isValid) {
        console.error('[ForceGraph2DWrapper] Validation failed:', validation.errors);
        throw new Error(`Invalid graph data: ${validation.errors.join(', ')}`);
      }

      // Step 4: Calculate metrics
      const metrics = calculateNodeMetrics(filteredNodes, filteredEdges);

      // Step 5: Count entities by type for filter UI
      const counts = new Map<EntityType, number>();
      actualData.entities.forEach(entity => {
        counts.set(entity.type as EntityType, (counts.get(entity.type as EntityType) || 0) + 1);
      });

      // Step 6: Convert to force graph format
      const forceData = {
        nodes: filteredNodes.map(node => {
          const originalData = node.data.originalData;
          let entityId: string | undefined;
          let thoughtId: string | undefined;
          
          if (node.data.type === 'entity' && 'id' in originalData) {
            entityId = originalData.id || (originalData as LocalEntity).localId;
          } else if (node.data.type === 'thought' && 'id' in originalData) {
            thoughtId = originalData.id || (originalData as LocalThought).localId;
          }
          
          return {
            ...node,
            data: {
              ...node.data,
              entityId,
              thoughtId
            }
          };
        }),
        links: filteredEdges.map(edge => ({
          source: edge.source,
          target: edge.target,
          label: edge.label,
          data: edge.data
        }))
      };

      // Store links in ref for stable access
      graphLinksRef.current = forceData.links;
      
      return { graphData: forceData, nodeMetrics: metrics, entityCounts: counts };
    } catch (err) {
      console.error('[ForceGraph2DWrapper] Error:', err);
      return { 
        graphData: { nodes: [], links: [] }, 
        nodeMetrics: new Map(), 
        entityCounts: new Map() 
      };
    }
  }, [actualData, filters, mode, centerEntityId]);

  // Reset centering flag when data context changes
  useEffect(() => {
    hasCenteredRef.current = false;
  }, [mode, centerEntityId, campaign?.id]);

  // Center camera on pinned node after graph loads (only once per dataset)
  useEffect(() => {
    if (!graphRef.current) return;
    if (graphData.nodes.length === 0) return;
    if (hasCenteredRef.current) return;

    const timer = setTimeout(() => {
      graphRef.current.centerAt(0, 0, 1000);
      graphRef.current.zoom(1.5, 1000);
      hasCenteredRef.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [graphData.nodes.length]);

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No Data to Display</h3>
          <p className="text-sm text-muted-foreground">
            {filters.searchQuery || filters.entityTypes.size < getAllEntityTypeValues().length
              ? 'Try adjusting your filters'
              : 'Create entities and thoughts to see them in the graph view'}
          </p>
        </div>
      </div>
    );
  }

  const handleNodeClick = useCallback((node: any) => {
    if (useSampleData || (!campaign && entities.length === 0)) {
      toast({
        title: "Sample Data",
        description: "Create your own campaign to interact with entities",
      });
      return;
    }

    // Navigate directly to entity or thought detail page
    if (node.data?.type === 'entity' && node.data.entityId) {
      navigate(`/entities/${node.data.entityId}`);
    } else if (node.data?.type === 'thought' && node.data.thoughtId) {
      navigate(`/thoughts/${node.data.thoughtId}/edit`);
    }
  }, [useSampleData, campaign, entities.length, navigate]);

  const handleNodeHover = useCallback((node: any) => {
    hoveredNodeRef.current = node;
    
    if (node) {
      document.body.style.cursor = 'pointer';
      
      // Calculate screen position for tooltip with error handling (always update for smooth tracking)
      if (graphRef.current) {
        try {
          const coords = graphRef.current.graph2ScreenCoords(node.x, node.y);
          setTooltipData({ node, x: coords.x, y: coords.y });
        } catch (err) {
          console.error('Tooltip positioning error:', err);
          setTooltipData(null);
        }
      }

      // Only recompute connected nodes when the hovered node actually changes
      if (node.id !== lastHoverIdRef.current) {
        lastHoverIdRef.current = node.id;
        const edges = graphLinksRef.current.map(l => ({
          id: `${l.source}-${l.target}`,
          source: typeof l.source === 'object' ? (l.source as any).id : l.source,
          target: typeof l.target === 'object' ? (l.target as any).id : l.target,
          data: l.data
        }));
        const connected = getConnectedNodes(node.id, edges);
        setHighlightedNodes(connected);
      }
    } else {
      document.body.style.cursor = 'default';
      setTooltipData(null);
      setHighlightedNodes(new Set());
      lastHoverIdRef.current = null;
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 1.2, 400);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom();
      graphRef.current.zoom(currentZoom * 0.8, 400);
    }
  }, []);

  const handleFitView = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 50);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (graphRef.current) {
      graphRef.current.zoom(1, 0);
      graphRef.current.centerAt(0, 0, 0);
    }
  }, []);

  const handleExportPNG = useCallback(() => {
    if (graphRef.current) {
      const canvas = graphRef.current.renderer().domElement;
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${actualData.campaign?.name || 'graph'}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Graph Exported",
        description: "PNG image downloaded successfully",
      });
    }
  }, [actualData.campaign?.name]);

  // Get connected nodes for selection panel
  const hasRealData = !!campaign && (entities.length > 0 || thoughts.length > 0);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => node.label}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const metrics = nodeMetrics.get(node.id);
          const size = metrics?.size || (
            mode === 'entity' && node.id === `entity:${centerEntityId}` ? 12
            : node.data?.type === 'campaign' ? 10
            : node.data?.type === 'thought' ? 4
            : 6
          );
          
          // Add glow for highlighted nodes
          if (highlightedNodes.has(node.id)) {
            ctx.shadowColor = getNodeColor(node);
            ctx.shadowBlur = 15;
          }
          
          // Draw colored circle
          ctx.fillStyle = getNodeColor(node);
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fill();
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          
          // Draw icon if cached and entity type
          if (node.data?.type === 'entity' && node.data?.entityType) {
            const iconImage = iconCache.get(node.data.entityType as EntityType);
            if (iconImage) {
              const iconSize = Math.max(size * 1.2, 12);
              drawIcon(ctx, iconImage, node.x, node.y, iconSize);
            }
          }
        }}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const metrics = nodeMetrics.get(node.id);
          const size = metrics?.size || 6;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkColor={(link: any) => {
          const type = link.data?.relationshipType;
          if (type === 'parent') return '#8b5cf6';
          if (type === 'linked') return '#06b6d4';
          if (type === 'mention') return '#94a3b8';
          return '#94a3b8';
        }}
        linkWidth={(link: any) => {
          const type = link.data?.relationshipType;
          if (type === 'parent') return 3;
          if (type === 'linked') return 2;
          return 1;
        }}
        linkLineDash={(link: any) => {
          const type = link.data?.relationshipType;
          if (type === 'linked') return [5, 5];
          return null;
        }}
        linkDirectionalArrowLength={(link: any) => {
          const type = link.data?.relationshipType;
          if (type === 'parent') return 6;
          return 0;
        }}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={(link: any) => {
          const type = link.data?.relationshipType;
          if (type === 'mention') return 2;
          return 0;
        }}
        linkDirectionalParticleSpeed={0.005}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        cooldownTicks={safeMode ? 0 : 100}
        d3AlphaDecay={safeMode ? 1 : 0.0228}
        d3VelocityDecay={safeMode ? 1 : 0.4}
        enableNodeDrag={!safeMode}
        enableZoomInteraction
        enablePanInteraction
      />
      
      {mode === 'campaign' && onSafeModeChange && onUseSampleDataChange && (
        <GraphControlPanel
          filters={filters}
          onFiltersChange={setFilters}
          entityCounts={entityCounts}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitView={handleFitView}
          onReset={handleReset}
          onExportPNG={handleExportPNG}
          disabled={false}
          safeMode={safeMode}
          onSafeModeChange={onSafeModeChange}
          useSampleData={useSampleData}
          onUseSampleDataChange={onUseSampleDataChange}
          hasRealData={hasRealData}
        />
      )}
      
      <GraphTooltip node={tooltipData?.node || null} position={tooltipData} />
    </div>
  );
};
