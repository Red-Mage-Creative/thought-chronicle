import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Filter, ChevronDown } from 'lucide-react';
import { ENTITY_TYPE_CONFIGS } from '@/config/entityTypeConfig';
import { EntityType } from '@/types/entities';
import { useState } from 'react';

export interface GraphFilters {
  entityTypes: Set<EntityType>;
  relationshipTypes: Set<'parent' | 'linked' | 'mention'>;
  searchQuery: string;
  showThoughts: boolean;
}

interface GraphFilterPanelProps {
  filters: GraphFilters;
  onFiltersChange: (filters: GraphFilters) => void;
  entityCounts: Map<EntityType, number>;
}

export const GraphFilterPanel = ({ filters, onFiltersChange, entityCounts }: GraphFilterPanelProps) => {
  const [isOpen, setIsOpen] = useState(true);

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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="absolute md:top-4 md:left-4 md:max-w-sm bottom-0 left-0 right-0 md:bottom-auto md:right-auto z-30 bg-card/95 backdrop-blur-sm border md:rounded-lg rounded-t-lg shadow-lg mt-16 md:mt-0 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="space-y-4 overflow-y-auto max-h-[calc(100vh-220px)]">
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
              <div className="space-y-2">
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
              <div className="space-y-2">
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
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
