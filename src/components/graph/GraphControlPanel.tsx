import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ChevronDown, 
  Filter, 
  List, 
  Settings, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  RotateCcw, 
  Download,
  Sparkles
} from 'lucide-react';
import { ENTITY_TYPE_CONFIGS } from '@/config/entityTypeConfig';
import { EntityType } from '@/types/entities';
import { useState } from 'react';

export interface GraphFilters {
  entityTypes: Set<EntityType>;
  relationshipTypes: Set<'parent' | 'linked' | 'mention'>;
  searchQuery: string;
  showThoughts: boolean;
}

interface GraphControlPanelProps {
  // Filters
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  entityCounts: Map<EntityType, number>;
  
  // Graph controls
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onReset: () => void;
  onExportPNG?: () => void;
  disabled?: boolean;
  
  // Options
  safeMode: boolean;
  onSafeModeChange: (enabled: boolean) => void;
  useSampleData: boolean;
  onUseSampleDataChange: (enabled: boolean) => void;
  hasRealData: boolean;
}

export const GraphControlPanel = ({
  filters,
  onFiltersChange,
  entityCounts,
  onZoomIn,
  onZoomOut,
  onFitView,
  onReset,
  onExportPNG,
  disabled = false,
  safeMode,
  onSafeModeChange,
  useSampleData,
  onUseSampleDataChange,
  hasRealData,
}: GraphControlPanelProps) => {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(true);

  const toggleEntityType = (type: EntityType) => {
    const newTypes = new Set(filters.entityTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    onFiltersChange({ ...filters, entityTypes: newTypes });
  };

  const toggleRelationshipType = (type: 'parent' | 'linked' | 'mention') => {
    const newTypes = new Set(filters.relationshipTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    onFiltersChange({ ...filters, relationshipTypes: newTypes });
  };

  const colorMap: Record<string, string> = {
    'pc': '#3b82f6',
    'npc': '#a855f7',
    'race': '#f97316',
    'religion': '#ec4899',
    'quest': '#10b981',
    'enemy': '#ef4444',
    'location': '#06b6d4',
    'organization': '#6366f1',
    'item': '#eab308',
    'plot-thread': '#d946ef'
  };

  return (
    <Card className="w-72 md:w-80 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col bg-card/95 backdrop-blur-sm shadow-lg">
      {/* Filters Section */}
      <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 p-3 pt-0 max-h-[40vh] overflow-y-auto">
            {/* Search */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Search</Label>
              <Input
                placeholder="Find entities..."
                value={filters.searchQuery}
                onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
                className="h-8 text-xs"
              />
            </div>

            {/* Entity Types */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Entity Types</Label>
              <div className="space-y-1.5">
                {ENTITY_TYPE_CONFIGS.map((config) => {
                  const count = entityCounts.get(config.value) || 0;
                  const Icon = config.icon;
                  return (
                    <div key={config.value} className="flex items-center gap-2">
                      <Checkbox
                        id={`filter-${config.value}`}
                        checked={filters.entityTypes.has(config.value)}
                        onCheckedChange={() => toggleEntityType(config.value)}
                      />
                      <Label
                        htmlFor={`filter-${config.value}`}
                        className="flex items-center gap-2 text-xs cursor-pointer flex-1"
                      >
                        <Icon className="h-3 w-3" />
                        {config.label}
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {count}
                        </Badge>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Relationship Types */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Relationships</Label>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="filter-parent"
                    checked={filters.relationshipTypes.has('parent')}
                    onCheckedChange={() => toggleRelationshipType('parent')}
                  />
                  <Label htmlFor="filter-parent" className="text-xs cursor-pointer">
                    Parent (hierarchical)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="filter-linked"
                    checked={filters.relationshipTypes.has('linked')}
                    onCheckedChange={() => toggleRelationshipType('linked')}
                  />
                  <Label htmlFor="filter-linked" className="text-xs cursor-pointer">
                    Linked (associative)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="filter-mention"
                    checked={filters.relationshipTypes.has('mention')}
                    onCheckedChange={() => toggleRelationshipType('mention')}
                  />
                  <Label htmlFor="filter-mention" className="text-xs cursor-pointer">
                    Mentions (thoughts)
                  </Label>
                </div>
              </div>
            </div>

            {/* Show Thoughts */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="filter-thoughts"
                  checked={filters.showThoughts}
                  onCheckedChange={(checked) => 
                    onFiltersChange({ ...filters, showThoughts: checked as boolean })
                  }
                />
                <Label htmlFor="filter-thoughts" className="text-xs cursor-pointer">
                  Show Thoughts
                </Label>
              </div>
            </div>
          </CardContent>
          <Separator />
        </CollapsibleContent>
      </Collapsible>

      {/* Legend Section */}
      <Collapsible open={legendOpen} onOpenChange={setLegendOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Legend
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${legendOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-3 p-3 pt-0">
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Node Types</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#fbbf24' }} />
                  <span className="text-xs">Campaign</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#9ca3af' }} />
                  <span className="text-xs">Thought</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Entity Types</h4>
              <div className="space-y-1.5">
                {ENTITY_TYPE_CONFIGS.map(config => {
                  const Icon = config.icon;
                  return (
                    <div key={config.value} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: colorMap[config.value] }}
                      />
                      <Icon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs">{config.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Relationships</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5" style={{ backgroundColor: '#8b5cf6' }} />
                  <span className="text-xs">Parent (Hierarchical)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#06b6d4' }} />
                  <span className="text-xs">Linked (Associative)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5" style={{ backgroundColor: '#94a3b8' }} />
                  <span className="text-xs">Thought Mention</span>
                </div>
              </div>
            </div>
          </CardContent>
          <Separator />
        </CollapsibleContent>
      </Collapsible>

      {/* Options Section */}
      <Collapsible open={optionsOpen} onOpenChange={setOptionsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors p-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Options
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${optionsOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 p-3 pt-0">
            {/* Graph Controls */}
            <div>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">View Controls</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onZoomIn} 
                  disabled={disabled}
                  className="h-8 text-xs"
                >
                  <ZoomIn className="h-3 w-3 mr-1" />
                  Zoom In
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onZoomOut} 
                  disabled={disabled}
                  className="h-8 text-xs"
                >
                  <ZoomOut className="h-3 w-3 mr-1" />
                  Zoom Out
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onFitView} 
                  disabled={disabled}
                  className="h-8 text-xs"
                >
                  <Maximize className="h-3 w-3 mr-1" />
                  Fit View
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onReset} 
                  disabled={disabled}
                  className="h-8 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              </div>
              {onExportPNG && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onExportPNG} 
                  disabled={disabled}
                  className="h-8 text-xs w-full mt-2"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export PNG
                </Button>
              )}
            </div>

            {/* Settings */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="safe-mode" className="text-xs cursor-pointer">
                  Safe Mode
                </Label>
                <Switch 
                  id="safe-mode" 
                  checked={safeMode} 
                  onCheckedChange={onSafeModeChange}
                  className="scale-75"
                />
              </div>

              {!hasRealData && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="sample-data" className="text-xs cursor-pointer flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Sample Data
                  </Label>
                  <Switch 
                    id="sample-data" 
                    checked={useSampleData} 
                    onCheckedChange={onUseSampleDataChange}
                    className="scale-75"
                  />
                </div>
              )}

              {useSampleData && (
                <Badge variant="secondary" className="text-xs gap-1 w-full justify-center">
                  <Sparkles className="h-3 w-3" />
                  Using Sample Data
                </Badge>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
