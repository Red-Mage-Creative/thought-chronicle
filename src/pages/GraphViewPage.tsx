import { lazy, Suspense, useState, useEffect } from 'react';
import { useEntities } from '@/hooks/useEntities';
import { useThoughts } from '@/hooks/useThoughts';
import { campaignService } from '@/services/campaignService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Network, Settings, TestTube, AlertCircle } from 'lucide-react';
import { GraphErrorBoundary } from '@/components/graph/GraphErrorBoundary';
import { SimpleGraphList } from '@/components/graph/SimpleGraphList';
import { isWebGLAvailable } from '@/utils/webgl';
import { transformToGraphData } from '@/utils/graphDataTransform';

const EntityGraph = lazy(() => import('@/components/graph/EntityGraph').then(m => ({ default: m.EntityGraph })));
const GraphLegend = lazy(() => import('@/components/graph/GraphLegend').then(m => ({ default: m.GraphLegend })));

export default function GraphViewPage() {
  const { entities, isLoading: entitiesLoading } = useEntities();
  const { thoughts, isLoading: thoughtsLoading } = useThoughts();
  
  const currentCampaign = campaignService.getCurrentCampaign();

  const isLoading = entitiesLoading || thoughtsLoading;
  
  // Graph rendering options
  const [safeMode, setSafeMode] = useState(false);
  const [mockData, setMockData] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState<boolean | null>(null);
  
  // Check WebGL availability on mount
  useEffect(() => {
    const available = isWebGLAvailable();
    setWebglAvailable(available);
    console.log('[GraphViewPage] WebGL availability:', available);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <Network className="h-16 w-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading data...</p>
          <p className="text-xs text-muted-foreground/60">Fetching entities and thoughts</p>
        </div>
      </div>
    );
  }

  // Show data counts and diagnostics before rendering
  console.log('[GraphViewPage] Data loaded:', {
    campaign: currentCampaign?.name,
    entities: entities.length,
    thoughts: thoughts.length,
    safeMode,
    mockData,
    webglAvailable
  });

  if (!currentCampaign) {
    return (
      <div className="h-screen flex items-center justify-center p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Network className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Campaign Selected</h3>
            <p className="text-sm text-muted-foreground text-center">
              Please select or create a campaign to view the graph.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If WebGL is unavailable, show fallback list view
  if (webglAvailable === false) {
    const graphData = transformToGraphData(currentCampaign, entities, thoughts);
    
    return (
      <div className="h-screen w-full relative bg-background">
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="destructive" className="gap-2">
            <AlertCircle className="h-3 w-3" />
            WebGL Unavailable
          </Badge>
        </div>
        <SimpleGraphList nodes={graphData.nodes} edges={graphData.edges} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full relative bg-background">
      {/* Debug Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-3 bg-card/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Graph Options</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch id="safe-mode" checked={safeMode} onCheckedChange={setSafeMode} />
          <Label htmlFor="safe-mode" className="text-xs cursor-pointer">
            Safe Mode (no labels/animation)
          </Label>
        </div>
        
        <div className="flex items-center gap-2">
          <Switch id="mock-data" checked={mockData} onCheckedChange={setMockData} />
          <Label htmlFor="mock-data" className="text-xs cursor-pointer flex items-center gap-1">
            <TestTube className="h-3 w-3" />
            Mock Data (2 nodes)
          </Label>
        </div>
        
        <div className="pt-2 border-t space-y-1 text-xs text-muted-foreground">
          <div>Nodes: {mockData ? 2 : entities.length + thoughts.length + (currentCampaign ? 1 : 0)}</div>
          <div>WebGL: {webglAvailable === null ? '...' : webglAvailable ? '✓' : '✗'}</div>
        </div>
      </div>

      <GraphErrorBoundary>
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-center space-y-4">
              <Network className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Rendering graph...</p>
              <p className="text-xs text-muted-foreground/60">
                {mockData ? 'Using mock data' : `Preparing ${entities.length} entities and ${thoughts.length} thoughts`}
              </p>
            </div>
          </div>
        }>
          <GraphLegend />
          <EntityGraph 
            campaign={currentCampaign} 
            entities={entities} 
            thoughts={thoughts}
            safeMode={safeMode}
            mockData={mockData}
          />
        </Suspense>
      </GraphErrorBoundary>
    </div>
  );
}
