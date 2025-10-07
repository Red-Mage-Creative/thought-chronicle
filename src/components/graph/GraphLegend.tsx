import { ENTITY_TYPE_CONFIGS } from '@/config/entityTypeConfig';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

export const GraphLegend = () => {
  const [open, setOpen] = useState(true);

  const colorMap: Record<string, string> = {
    'pc': 'hsl(210, 100%, 50%)',
    'npc': 'hsl(270, 100%, 50%)',
    'race': 'hsl(30, 100%, 50%)',
    'religion': 'hsl(330, 100%, 50%)',
    'quest': 'hsl(150, 100%, 40%)',
    'enemy': 'hsl(0, 100%, 50%)',
    'location': 'hsl(180, 100%, 40%)',
    'organization': 'hsl(240, 100%, 50%)',
    'item': 'hsl(45, 100%, 50%)',
    'plot-thread': 'hsl(300, 100%, 50%)'
  };

  return (
    <Card className="absolute top-4 left-4 w-64 z-10 bg-background/95 backdrop-blur">
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
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }} />
                  <span className="text-xs">Campaign</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--muted))' }} />
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
                  <div className="w-8 h-0.5 bg-primary" />
                  <span className="text-xs">Campaign → Entity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-accent" />
                  <span className="text-xs">Parent/Linked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-muted" />
                  <span className="text-xs">Entity → Thought</span>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
