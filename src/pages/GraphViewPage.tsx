import { lazy, Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEntities } from "@/hooks/useEntities";
import { useThoughts } from "@/hooks/useThoughts";
import { campaignService } from "@/services/campaignService";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Network, Settings, Sparkles, ArrowLeft } from "lucide-react";
import { GraphErrorBoundary } from "@/components/graph/GraphErrorBoundary";

const ForceGraph2DWrapper = lazy(() =>
  import("@/components/graph/ForceGraph2DWrapper").then((m) => ({ default: m.ForceGraph2DWrapper })),
);
const GraphLegend = lazy(() => import("@/components/graph/GraphLegend").then((m) => ({ default: m.GraphLegend })));

export default function GraphViewPage() {
  const navigate = useNavigate();
  const { entities, isLoading: entitiesLoading } = useEntities();
  const { thoughts, isLoading: thoughtsLoading } = useThoughts();

  const currentCampaign = campaignService.getCurrentCampaign();

  const isLoading = entitiesLoading || thoughtsLoading;

  // Graph rendering options
  const [safeMode, setSafeMode] = useState(false);
  const [useSampleData, setUseSampleData] = useState(false);

  const hasData = currentCampaign && (entities.length > 0 || thoughts.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-[120vh] flex items-center justify-center">
        <div className="animate-pulse text-center space-y-4">
          <Network className="h-16 w-16 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">Loading campaign data...</p>
        </div>
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Network className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Campaign Selected</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Select or create a campaign to view its relationship graph.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show sample data prompt if no entities/thoughts
  if (!hasData && !useSampleData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-lg">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <Network className="h-16 w-16 text-muted-foreground" />
            <h3 className="text-lg font-semibold">No Data Yet</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your campaign doesn't have any entities or thoughts yet. Try viewing sample data to see how the graph
              works.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setUseSampleData(true)} variant="default">
                <Sparkles className="h-4 w-4 mr-2" />
                Try Sample Data
              </Button>
              <Button onClick={() => navigate('/entities/create')} variant="outline">
                Create First Entity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 80px - 200px)' }}>
      {/* Floating exit button - all screen sizes */}
      <Button 
        variant="ghost" 
        size="sm"
        className="absolute top-4 left-4 z-50 bg-background/95 backdrop-blur shadow-lg"
        onClick={() => navigate('/entities')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        <span className="hidden sm:inline">Exit</span>
      </Button>
      
      {/* Campaign name badge - desktop only */}
      {currentCampaign && (
        <div className="hidden md:block absolute top-4 left-24 z-50">
          <Badge variant="outline" className="bg-background/95 backdrop-blur">
            {currentCampaign.name}
          </Badge>
        </div>
      )}
      
      {/* Graph fills container */}
      <div className="w-full h-full">
        {/* Graph Settings Panel */}
        <div className="absolute bottom-6 md:left-6 left-4 z-20 md:w-auto w-[calc(100vw-2rem)] space-y-3 bg-card/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Options</span>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="safe-mode" checked={safeMode} onCheckedChange={setSafeMode} />
            <Label htmlFor="safe-mode" className="text-xs cursor-pointer">
              Safe Mode
            </Label>
          </div>

          {!hasData && (
            <div className="flex items-center gap-2">
              <Switch id="sample-data" checked={useSampleData} onCheckedChange={setUseSampleData} />
              <Label htmlFor="sample-data" className="text-xs cursor-pointer flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Sample Data
              </Label>
            </div>
          )}

          {useSampleData && (
            <Badge variant="secondary" className="text-xs gap-1">
              <Sparkles className="h-3 w-3" />
              Sample Data
            </Badge>
          )}
        </div>

        <GraphErrorBoundary
          onFallbackRequested={() => navigate('/entities')}
          onSampleDataRequested={() => setUseSampleData(true)}
        >
          <Suspense
            fallback={
              <div className="h-full flex items-center justify-center">
                <div className="animate-pulse text-center space-y-4">
                  <Network className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Rendering graph...</p>
                  <p className="text-xs text-muted-foreground/60">
                    {useSampleData
                      ? "Loading sample data"
                      : `Preparing ${entities.length} entities and ${thoughts.length} thoughts`}
                  </p>
                </div>
              </div>
            }
          >
            <GraphLegend />
            <ForceGraph2DWrapper
              campaign={currentCampaign}
              entities={entities}
              thoughts={thoughts}
              safeMode={safeMode}
              useSampleData={useSampleData}
              mode="campaign"
            />
          </Suspense>
        </GraphErrorBoundary>
      </div>
    </div>
  );
}
