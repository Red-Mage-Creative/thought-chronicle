import { ENTITY_TYPE_CONFIGS } from '@/config/entityTypeConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const GraphLegend = () => {
  const [open, setOpen] = useState(false);

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
    <Card className="fixed top-4 right-4 z-20 w-56 md:w-64 max-h-[400px] overflow-y-auto bg-card/95 backdrop-blur-sm shadow-lg">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardHeader className="p-4 pb-2">
          <CollapsibleTrigger className="flex items-center justify-between w-full">
            <CardTitle className="text-sm font-semibold">Legend</CardTitle>
            <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'transform rotate-180' : ''}`} />
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="p-4 pt-2 space-y-3">
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
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
