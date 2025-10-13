import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { Campaign } from '@/types/campaigns';
import { transformToGraphData, getNodeColor, getNodeSize, validateGraphData } from '@/utils/graphDataTransform';
import { GraphCanvas, GraphEdge as ReaGraphEdge, GraphNode as ReaGraphNode } from 'reagraph';
import { useRef } from 'react';
import { GraphControls } from './GraphControls';

interface EntityGraphProps {
  campaign: Campaign | null;
  entities: LocalEntity[];
  thoughts: LocalThought[];
  safeMode?: boolean;
  mockData?: boolean;
}

export const EntityGraph = ({ campaign, entities, thoughts, safeMode = false, mockData = false }: EntityGraphProps) => {
  const graphRef = useRef<any>(null);

  console.log('[EntityGraph] Rendering with:', {
    campaign: campaign?.name,
    campaignId: campaign?.id,
    entitiesCount: entities.length,
    thoughtsCount: thoughts.length,
    safeMode,
    mockData
  });

  // Mock data mode - use minimal hardcoded graph for testing
  let graphData;
  if (mockData) {
    console.log('[EntityGraph] Using MOCK DATA for deterministic testing');
    graphData = {
      nodes: [
        { id: 'mock-campaign', label: 'Test Campaign', type: 'campaign' as const, data: { type: 'campaign' } },
        { id: 'mock-entity-1', label: 'Test Entity 1', type: 'entity' as const, data: { type: 'entity', entityType: 'pc' } }
      ],
      edges: [
        { id: 'mock-edge-1', source: 'mock-campaign', target: 'mock-entity-1', label: 'campaign-entity', data: { type: 'campaign-entity' } }
      ]
    };
  } else {
    // Transform and validate real data
    try {
      graphData = transformToGraphData(campaign, entities, thoughts);
      
      // Validate the transformed data
      const validation = validateGraphData(graphData);
      if (!validation.isValid) {
        console.error('[EntityGraph] Graph data validation failed:', validation.errors);
        throw new Error(`Invalid graph data: ${validation.errors.join(', ')}`);
      }
      
      console.log('[EntityGraph] Graph data transformed and validated:', {
        nodesCount: graphData.nodes.length,
        edgesCount: graphData.edges.length,
        warnings: validation.warnings.length > 0 ? validation.warnings : 'none'
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error transforming graph data';
      console.error('[EntityGraph] Error transforming graph data:', err);
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-4 max-w-lg">
            <h3 className="text-lg font-semibold text-destructive">Graph Transformation Error</h3>
            <p className="text-sm text-muted-foreground">
              Failed to transform data into graph format: {errorMsg}
            </p>
            <pre className="text-xs bg-muted p-4 rounded-lg text-left overflow-auto max-h-40">
              {JSON.stringify({ campaign, entities: entities.length, thoughts: thoughts.length }, null, 2)}
            </pre>
          </div>
        </div>
      );
    }
  }

  // Transform to reagraph format with defensive null checks
  const nodes: ReaGraphNode[] = graphData.nodes
    .filter(node => node && node.id && node.label) // Remove any invalid nodes
    .map(node => ({
      id: String(node.id), // Ensure string
      label: String(node.label || 'Unnamed'), // Ensure string with fallback
      fill: getNodeColor(node) || '#71717a', // Ensure color with fallback
      size: getNodeSize(node) || 10, // Ensure number with fallback
      data: node.data || {} // Ensure object
    }));

  const edges: ReaGraphEdge[] = graphData.edges
    .filter(edge => edge && edge.id && edge.source && edge.target) // Remove any invalid edges
    .map(edge => ({
      id: String(edge.id), // Ensure string
      source: String(edge.source), // Ensure string
      target: String(edge.target), // Ensure string
      label: edge.label ? String(edge.label) : undefined, // Optional but ensure string if present
      data: edge.data || {} // Ensure object
    }));

  console.log('[EntityGraph] Reagraph data prepared:', {
    nodesCount: nodes.length,
    edgesCount: edges.length,
    sampleNode: nodes[0] ? { id: nodes[0].id, label: nodes[0].label, fill: nodes[0].fill, size: nodes[0].size } : null,
    sampleEdge: edges[0] ? { id: edges[0].id, source: edges[0].source, target: edges[0].target } : null
  });

  // Validate reagraph ref methods exist
  const isGraphReady = graphRef.current !== null;

  const handleZoomIn = () => {
    if (graphRef.current && typeof graphRef.current.zoomIn === 'function') {
      graphRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current && typeof graphRef.current.zoomOut === 'function') {
      graphRef.current.zoomOut();
    }
  };

  const handleFitView = () => {
    if (graphRef.current && typeof graphRef.current.fitNodesInView === 'function') {
      graphRef.current.fitNodesInView();
    }
  };

  const handleReset = () => {
    if (graphRef.current && typeof graphRef.current.centerGraph === 'function') {
      graphRef.current.centerGraph();
    }
  };

  if (nodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <h3 className="text-lg font-semibold text-foreground">No Data to Display</h3>
          <p className="text-sm text-muted-foreground">
            Create entities and thoughts to see them in the graph view.
          </p>
        </div>
      </div>
    );
  }

  // Check container size before rendering
  const containerRef = useRef<HTMLDivElement>(null);
  
  console.log('[EntityGraph] Rendering GraphCanvas with:', {
    nodes: nodes.length,
    edges: edges.length,
    safeMode,
    mockData
  });

  // Log container dimensions for debugging zero-size issues
  if (containerRef.current) {
    const { clientWidth, clientHeight } = containerRef.current;
    console.log('[EntityGraph] Container dimensions:', { clientWidth, clientHeight });
    
    if (clientWidth === 0 || clientHeight === 0) {
      console.warn('[EntityGraph] WARNING: Container has zero size, graph may not render');
    }
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      <GraphCanvas
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        labelType={safeMode ? "none" : "all"}
        draggable
        animated={!safeMode}
        onNodeClick={(node) => {
          console.log('[EntityGraph] Node clicked:', node);
        }}
        onEdgeClick={(edge) => {
          console.log('[EntityGraph] Edge clicked:', edge);
        }}
      />
      <GraphControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onReset={handleReset}
        disabled={!isGraphReady}
      />
    </div>
  );
};
