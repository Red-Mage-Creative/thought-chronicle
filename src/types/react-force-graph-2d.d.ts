declare module 'react-force-graph-2d' {
  import { FC, MutableRefObject } from 'react';

  export interface GraphData {
    nodes: Array<{
      id: string;
      fx?: number;
      fy?: number;
      [key: string]: any;
    }>;
    links: any[];
  }

  export interface ForceGraph2DProps {
    graphData: GraphData;
    nodeLabel?: string | ((node: any) => string);
    nodeColor?: string | ((node: any) => string);
    nodeRelSize?: number;
    nodeVal?: number | ((node: any) => number);
    nodeCanvasObject?: (node: any, ctx: CanvasRenderingContext2D, globalScale: number) => void;
    nodePointerAreaPaint?: (node: any, color: string, ctx: CanvasRenderingContext2D) => void;
    linkDirectionalParticles?: number | ((link: any) => number);
    linkDirectionalParticleSpeed?: number | ((link: any) => number);
    linkColor?: string | ((link: any) => string);
    linkWidth?: number | ((link: any) => number);
    linkLineDash?: number[] | ((link: any) => number[] | null) | null;
    linkDirectionalArrowLength?: number | ((link: any) => number);
    linkDirectionalArrowRelPos?: number;
    onNodeClick?: (node: any, event: MouseEvent) => void;
    onNodeHover?: (node: any | null, previousNode: any | null) => void;
    onLinkClick?: (link: any, event: MouseEvent) => void;
    cooldownTicks?: number;
    d3AlphaDecay?: number;
    d3VelocityDecay?: number;
    enableNodeDrag?: boolean;
    enableZoomInteraction?: boolean;
    enablePanInteraction?: boolean;
    width?: number;
    height?: number;
  }

  export interface ForceGraph2DInstance {
    zoom(value: number, duration?: number): void;
    zoomToFit(duration?: number, padding?: number): void;
    centerAt(x?: number, y?: number, duration?: number): void;
    renderer(): { domElement: HTMLCanvasElement };
  }

  const ForceGraph2D: FC<ForceGraph2DProps & { ref?: MutableRefObject<ForceGraph2DInstance | null> }>;
  
  export default ForceGraph2D;
}
