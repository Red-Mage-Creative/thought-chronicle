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

  const graphData = transformToGraphData(campaign, entities, thoughts);

  // Transform to reagraph format
  const allNodes: ReaGraphNode[] = graphData.nodes.map(node => ({
    id: node.id,
    label: node.label,
    fill: getNodeColor(node),
    size: getNodeSize(node),
    data: node.data
  }));

  const allEdges: ReaGraphEdge[] = graphData.edges.map(edge => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    data: edge.data
  }));

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

  return (
    <div className="relative w-full h-full">
      <GraphCanvas
        ref={graphRef}
        nodes={nodes}
        edges={edges}
        labelType="all"
        layoutType="forceDirected2d"
        draggable
        animated={true}
        edgeInterpolation="curved"
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
    </div>
  );
};
