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
}

export const EntityGraph = ({ campaign, entities, thoughts }: EntityGraphProps) => {
  const graphRef = useRef<any>(null);

  console.log('[EntityGraph] Rendering with:', {
    campaign: campaign?.name,
    campaignId: campaign?.id,
    entitiesCount: entities.length,
    thoughtsCount: thoughts.length
  });

  // Transform and validate data
  let graphData;
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

  // Transform to reagraph format - render all nodes immediately (no progressive loading)
  const nodes: ReaGraphNode[] = graphData.nodes.map(node => ({
    id: node.id,
    label: node.label,
    fill: getNodeColor(node),
    size: getNodeSize(node),
    data: node.data
  }));

  const edges: ReaGraphEdge[] = graphData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    data: edge.data
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

  console.log('[EntityGraph] Rendering GraphCanvas with:', {
    nodes: nodes.length,
    edges: edges.length
  });

  return (
    <div className="relative w-full h-full">
      <GraphCanvas
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        labelType="all"
        draggable
        animated={true}
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
