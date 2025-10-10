import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntities } from '@/hooks/useEntities';
import { useThoughts } from '@/hooks/useThoughts';
import { groupThoughtsByPlotThread, filterActiveThreads, searchPlotThreads, isPlotThreadActive } from '@/utils/plotThreadUtils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Search, Network, Plus, Calendar, MessageSquare } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDistanceToNow } from 'date-fns';
import { MarkdownDisplay } from '@/components/display/MarkdownDisplay';

export default function PlotThreadsPage() {
  const navigate = useNavigate();
  const { entities, isLoading: entitiesLoading } = useEntities();
  const { thoughts, isLoading: thoughtsLoading } = useThoughts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  // Get all plot thread entities
  const plotThreadEntities = useMemo(() => 
    entities.filter(e => e.type === 'plot-thread'),
    [entities]
  );

  // Group thoughts by plot thread
  const allGroups = useMemo(() => 
    groupThoughtsByPlotThread(plotThreadEntities, thoughts),
    [plotThreadEntities, thoughts]
  );

  // Apply filters
  const filteredGroups = useMemo(() => {
    let groups = allGroups;

    // Apply active filter
    if (filter === 'active') {
      groups = filterActiveThreads(groups);
    }

    // Apply search
    if (searchTerm.trim()) {
      groups = searchPlotThreads(groups, searchTerm);
    }

    // Sort by last mention (most recent first)
    return groups.sort((a, b) => {
      const aTime = a.metrics.lastMention?.getTime() || 0;
      const bTime = b.metrics.lastMention?.getTime() || 0;
      return bTime - aTime;
    });
  }, [allGroups, filter, searchTerm]);

  const isLoading = entitiesLoading || thoughtsLoading;

  const totalThoughts = filteredGroups.reduce((sum, g) => sum + g.metrics.thoughtCount, 0);
  const activeCount = allGroups.filter(g => g.metrics.isActive).length;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4" />
          <div className="h-12 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (plotThreadEntities.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Network className="h-6 w-6" />
                Plot Threads
              </CardTitle>
            </div>
            <CardDescription>Track your campaign's storylines</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Network className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Plot Threads Yet</h3>
            <p className="text-sm text-muted-foreground text-center mb-4 max-w-md">
              Create plot thread entities to organize your campaign's storylines and track related thoughts.
            </p>
            <Button onClick={() => navigate('/entities/create?type=plot-thread')}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Plot Thread
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-6 w-6" />
                Plot Threads
              </CardTitle>
              <CardDescription>Track your campaign's storylines</CardDescription>
            </div>
            <Button onClick={() => navigate('/entities/create?type=plot-thread')}>
              <Plus className="h-4 w-4 mr-2" />
              New Plot Thread
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search plot threads or thoughts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'active')}>
              <TabsList>
                <TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
                <TabsTrigger value="all">All ({allGroups.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                {filter === 'active' 
                  ? 'No active plot threads. Mark plot threads as Active="Yes" in their attributes.' 
                  : 'No plot threads match your search.'}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" className="space-y-4">
              {filteredGroups.map((group) => (
                <AccordionItem 
                  key={group.entity.id || group.entity.localId} 
                  value={group.entity.id || group.entity.localId || ''}
                  className="border rounded-lg"
                >
                  <AccordionTrigger className="px-6 hover:no-underline">
                    <div className="flex items-start justify-between w-full pr-4">
                      <div className="flex items-start gap-3">
                        <Network className="h-5 w-5 mt-1 text-primary" />
                        <div className="text-left">
                          <h3 className="font-semibold text-foreground">{group.entity.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {group.metrics.thoughtCount} thought{group.metrics.thoughtCount !== 1 ? 's' : ''}
                            </Badge>
                            {isPlotThreadActive(group.entity) && (
                              <Badge variant="default" className="text-xs">Active</Badge>
                            )}
                            {group.metrics.lastMention && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(group.metrics.lastMention, { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    {group.entity.description && (
                      <p className="text-sm text-muted-foreground mb-4 italic">
                        {group.entity.description}
                      </p>
                    )}
                    <div className="space-y-4">
                      {group.thoughts.map((thought) => (
                        <Card key={thought.id || thought.localId} className="bg-muted/30">
                          <CardContent className="p-4">
                            <div className="space-y-2">
                              <MarkdownDisplay content={thought.content} />
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {formatDistanceToNow(new Date(thought.timestamp), { addSuffix: true })}
                                {thought.gameDate && (
                                  <span className="ml-2">• Game Date: {thought.gameDate}</span>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
