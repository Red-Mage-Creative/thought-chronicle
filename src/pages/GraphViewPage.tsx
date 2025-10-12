import { lazy, Suspense } from 'react';
import { useEntities } from '@/hooks/useEntities';
import { useThoughts } from '@/hooks/useThoughts';
import { campaignService } from '@/services/campaignService';
import { Card, CardContent } from '@/components/ui/card';
import { Network } from 'lucide-react';
import { GraphErrorBoundary } from '@/components/graph/GraphErrorBoundary';

const EntityGraph = lazy(() => import('@/components/graph/EntityGraph').then(m => ({ default: m.EntityGraph })));
const GraphLegend = lazy(() => import('@/components/graph/GraphLegend').then(m => ({ default: m.GraphLegend })));

export default function GraphViewPage() {
  const { entities, isLoading: entitiesLoading } = useEntities();
  const { thoughts, isLoading: thoughtsLoading } = useThoughts();
  
  const currentCampaign = campaignService.getCurrentCampaign();

  const isLoading = entitiesLoading || thoughtsLoading;

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

  // Show data counts before rendering
  console.log('[GraphViewPage] Data loaded:', {
    campaign: currentCampaign?.name,
    entities: entities.length,
    thoughts: thoughts.length
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

  return (
    <div className="h-screen w-full relative bg-background">
      <GraphErrorBoundary>
        <Suspense fallback={
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-center space-y-4">
              <Network className="h-16 w-16 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">Rendering graph...</p>
              <p className="text-xs text-muted-foreground/60">
                Preparing {entities.length} entities and {thoughts.length} thoughts
              </p>
            </div>
          </div>
        }>
          <GraphLegend />
          <EntityGraph 
            campaign={currentCampaign} 
            entities={entities} 
            thoughts={thoughts} 
          />
        </Suspense>
      </GraphErrorBoundary>
    </div>
  );
}
