import { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { Campaign } from '@/types/campaigns';
import { transformToGraphData, transformToEntityCenteredGraph, getNodeColor, validateGraphData } from '@/utils/graphDataTransform';
import { generateSampleCampaignData } from '@/utils/graphSampleData';
import { GraphControls } from './GraphControls';
import { GraphNodeOverlay } from './GraphNodeOverlay';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ForceGraph2DWrapperProps {
  campaign: Campaign | null;
  entities: LocalEntity[];
  thoughts: LocalThought[];
  safeMode?: boolean;
  useSampleData?: boolean;
  centerEntityId?: string;
  mode?: 'campaign' | 'entity';
}

export const ForceGraph2DWrapper = ({ 
  campaign, 
  entities, 
  thoughts, 
  safeMode = false,
  useSampleData = false,
  centerEntityId,
  mode = 'campaign'
}: ForceGraph2DWrapperProps) => {
  const graphRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoveredNodeRef = useRef<any>(null);
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Use sample data if requested or if no real data exists
  const actualData = useSampleData || (!campaign && entities.length === 0) 
    ? generateSampleCampaignData()
    : { campaign, entities, thoughts };

  console.log('[ForceGraph2DWrapper] Rendering with:', {
    campaign: actualData.campaign?.name,
    entitiesCount: actualData.entities.length,
    thoughtsCount: actualData.thoughts.length,
    safeMode,
    useSampleData: useSampleData || (!campaign && entities.length === 0)
  });

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

  // Transform data in three steps: GraphData -> validate -> ForceGraphData
  let graphData;
  try {
    // Step 1: Transform to GraphData (with edges) based on mode
    let intermediateData;
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
    
    // Step 2: Validate the GraphData structure
    const validation = validateGraphData(intermediateData);
    if (!validation.isValid) {
      console.error('[ForceGraph2DWrapper] Validation failed:', validation.errors);
      throw new Error(`Invalid graph data: ${validation.errors.join(', ')}`);
    }
    
    // Step 3: Convert edges to links for react-force-graph
    graphData = {
      nodes: intermediateData.nodes.map(node => {
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
      links: intermediateData.edges.map(edge => ({
        source: edge.source,
        target: edge.target,
        label: edge.label,
        data: edge.data
      }))
    };

    console.log('[ForceGraph2DWrapper] Graph data validated:', {
      nodesCount: graphData.nodes.length,
      linksCount: graphData.links.length,
      warnings: validation.warnings
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[ForceGraph2DWrapper] Error transforming data:', err);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold text-destructive">Graph Transformation Error</h3>
          <p className="text-sm text-muted-foreground">{errorMsg}</p>
        </div>
      </div>
    );
  }

  if (graphData.nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold">No Data to Display</h3>
          <p className="text-sm text-muted-foreground">
            Create entities and thoughts to see them in the graph view.
          </p>
        </div>
      </div>
    );
  }

  const handleNodeClick = useCallback((node: any) => {
    console.log('[ForceGraph2DWrapper] Node clicked:', node);
    
    if (useSampleData || (!campaign && entities.length === 0)) {
      toast({
        title: "Sample Data",
        description: "Create your own campaign to interact with entities",
      });
      return;
    }

    // Navigate to entity or thought detail page
    if (node.data?.type === 'entity' && node.data?.entityId) {
      navigate(`/entities/${node.data.entityId}`);
    } else if (node.data?.type === 'thought' && node.data?.thoughtId) {
      navigate(`/thoughts/${node.data.thoughtId}/edit`);
    }
  }, [useSampleData, campaign, entities.length, navigate]);

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

  return (
    <div ref={containerRef} className="relative w-full h-full bg-background">
      <GraphNodeOverlay graphRef={graphRef} nodes={graphData.nodes} />
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel={(node: any) => node.label}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const size = mode === 'entity' && node.id === `entity:${centerEntityId}` 
            ? 12 // Center entity larger
            : node.data?.type === 'campaign' ? 10
            : node.data?.type === 'thought' ? 4
            : 6;
          
          // Draw colored circle
          ctx.fillStyle = getNodeColor(node);
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fill();
          
          // Draw label ONLY on hover
          if (hoveredNodeRef.current && hoveredNodeRef.current.id === node.id) {
            ctx.fillStyle = getNodeColor(node);
            ctx.font = `${Math.max(12, 12 / globalScale)}px Sans-Serif`;
            ctx.textAlign = 'center';
            
            let labelText = node.label;
            
            // For thought nodes, show creation date instead of content
            if (node.data?.type === 'thought' && node.data?.originalData?.timestamp) {
              const thought = node.data.originalData as LocalThought;
              labelText = format(thought.timestamp, 'MMM d, yyyy');
            }
            
            // Full text, no truncation
            ctx.fillText(labelText, node.x, node.y + size + 10);
          }
        }}
        nodePointerAreaPaint={(node: any, color: string, ctx: CanvasRenderingContext2D) => {
          const size = mode === 'entity' && node.id === `entity:${centerEntityId}` 
            ? 12 : node.data?.type === 'campaign' ? 10
            : node.data?.type === 'thought' ? 4 : 6;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 2, 0, 2 * Math.PI);
          ctx.fill();
        }}
        linkColor={(link: any) => {
          const type = link.data?.relationshipType;
          if (type === 'parent') return '#8b5cf6'; // Violet - hierarchical
          if (type === 'linked') return '#06b6d4'; // Cyan - associative
          if (type === 'mention') return '#94a3b8'; // Slate - thought connection
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
          if (type === 'linked') return [5, 5]; // Dashed for peer relationships
          return null;
        }}
        linkDirectionalArrowLength={(link: any) => {
          const type = link.data?.relationshipType;
          if (type === 'parent') return 6; // Arrow to show hierarchy
          return 0;
        }}
        linkDirectionalArrowRelPos={1}
        linkDirectionalParticles={0}
        onNodeClick={handleNodeClick}
        onNodeHover={(node) => {
          hoveredNodeRef.current = node;
          if (node) {
            document.body.style.cursor = 'pointer';
          } else {
            document.body.style.cursor = 'default';
          }
          // Force canvas redraw without React re-render
          if (graphRef.current) {
            graphRef.current.refresh();
          }
        }}
        cooldownTicks={safeMode ? 0 : 100}
        d3AlphaDecay={safeMode ? 1 : 0.0228}
        d3VelocityDecay={safeMode ? 1 : 0.4}
        enableNodeDrag={!safeMode}
        enableZoomInteraction
        enablePanInteraction
      />
      <GraphControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onReset={handleReset}
        onExportPNG={handleExportPNG}
        disabled={false}
      />
    </div>
  );
};
