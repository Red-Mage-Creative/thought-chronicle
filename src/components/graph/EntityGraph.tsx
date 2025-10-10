import { LocalEntity } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { Campaign } from '@/types/campaigns';
import { transformToGraphData, getNodeColor, getNodeSize } from '@/utils/graphDataTransform';
import { GraphCanvas, GraphEdge as ReaGraphEdge, GraphNode as ReaGraphNode } from 'reagraph';
import { useRef, useState, useEffect } from 'react';
import { GraphControls } from './GraphControls';

interface EntityGraphProps {
  campaign: Campaign | null;
  entities: LocalEntity[];
  thoughts: LocalThought[];
}

export const EntityGraph = ({ campaign, entities, thoughts }: EntityGraphProps) => {
  const graphRef = useRef<any>(null);
  const [visibleNodeCount, setVisibleNodeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  console.log('[EntityGraph] Rendering with:', {
    campaign: campaign?.name,
    campaignId: campaign?.id,
    entitiesCount: entities.length,
    thoughtsCount: thoughts.length
  });

  let graphData;
  try {
    graphData = transformToGraphData(campaign, entities, thoughts);
    console.log('[EntityGraph] Graph data transformed successfully:', {
      nodesCount: graphData.nodes.length,
      edgesCount: graphData.edges.length
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error transforming graph data';
    console.error('[EntityGraph] Error transforming graph data:', err);
    setError(errorMsg);
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

  // Transform to reagraph format
  let allNodes: ReaGraphNode[];
  let allEdges: ReaGraphEdge[];
  
  try {
    allNodes = graphData.nodes.map(node => {
      if (!node.id) {
        throw new Error(`Node missing ID: ${JSON.stringify(node)}`);
      }
      return {
        id: node.id,
        label: node.label,
        fill: getNodeColor(node),
        size: getNodeSize(node),
        data: node.data
      };
    });

    allEdges = graphData.edges.map(edge => {
      if (!edge.id || !edge.source || !edge.target) {
        throw new Error(`Edge missing required fields: ${JSON.stringify(edge)}`);
      }
      return {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        data: edge.data
      };
    });

    console.log('[EntityGraph] Nodes and edges mapped successfully:', {
      nodesCount: allNodes.length,
      edgesCount: allEdges.length,
      sampleNode: allNodes[0],
      sampleEdge: allEdges[0]
    });
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error mapping nodes/edges';
    console.error('[EntityGraph] Error mapping graph data:', err);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4 max-w-lg">
          <h3 className="text-lg font-semibold text-destructive">Graph Mapping Error</h3>
          <p className="text-sm text-muted-foreground">
            Failed to map graph nodes and edges: {errorMsg}
          </p>
        </div>
      </div>
    );
  }

  // Progressive rendering: show nodes one at a time with delay
  useEffect(() => {
    setVisibleNodeCount(0);
    
    if (allNodes.length === 0) return;

    // Stagger node appearance - Obsidian style
    const interval = setInterval(() => {
      setVisibleNodeCount(prev => {
        if (prev >= allNodes.length) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 50); // 50ms delay between each node pop-in

    return () => clearInterval(interval);
  }, [allNodes.length, campaign?.id, entities.length, thoughts.length]);

  // Only show nodes/edges that should be visible
  const nodes = allNodes.slice(0, visibleNodeCount);
  const visibleNodeIds = new Set(nodes.map(n => n.id));
  const edges = allEdges.filter(edge => 
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  );

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (graphRef.current) {
      graphRef.current.zoomOut();
    }
  };

  const handleFitView = () => {
    if (graphRef.current) {
      graphRef.current.fitNodesInView();
    }
  };

  const handleReset = () => {
    if (graphRef.current) {
      graphRef.current.centerGraph();
    }
  };

  if (allNodes.length === 0) {
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

  console.log('[EntityGraph] Rendering graph with:', {
    visibleNodes: nodes.length,
    visibleEdges: edges.length,
    totalNodes: allNodes.length,
    totalEdges: allEdges.length
  });

  return (
    <div className="relative w-full h-full">
      {nodes.length > 0 ? (
        <>
          <GraphCanvas
            ref={graphRef}
            nodes={nodes}
            edges={edges}
            labelType="all"
            layoutType="forceDirected2d"
            draggable
            animated={true}
            edgeInterpolation="curved"
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
          />
          {visibleNodeCount < allNodes.length && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full border border-border shadow-lg">
              <p className="text-sm text-muted-foreground">
                Loading nodes: {visibleNodeCount} / {allNodes.length}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Preparing graph... ({visibleNodeCount}/{allNodes.length} nodes)
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
