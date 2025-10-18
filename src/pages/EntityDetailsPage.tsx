import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, MessageSquare, Calendar, Clock, Network, GitBranch, Link2, Activity } from 'lucide-react';
import { lazy, Suspense } from 'react';

const ForceGraph2DWrapper = lazy(() => import('@/components/graph/ForceGraph2DWrapper').then(m => ({ default: m.ForceGraph2DWrapper })));
import { LocalEntity, EntityWithMetrics, EntityType } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { entityService } from '@/services/entityService';
import { thoughtService } from '@/services/thoughtService';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';
import { format } from 'date-fns';

import { EntityRelationshipDisplay } from '@/components/display/EntityRelationshipDisplay';
import { MarkdownDisplay } from '@/components/display/MarkdownDisplay';
import { EntityDeleteDialog } from '@/components/EntityDeleteDialog';
import { useToast } from '@/hooks/use-toast';

interface EntityDetailsPageProps {
  onEntityClick?: (entity: string) => void;
}

const EntityDetailsPage = ({ onEntityClick }: EntityDetailsPageProps) => {
  const { entityName } = useParams<{ entityName: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [entity, setEntity] = useState<EntityWithMetrics | null>(null);
  const [relatedThoughts, setRelatedThoughts] = useState<LocalThought[]>([]);
  const [parentEntities, setParentEntities] = useState<LocalEntity[]>([]);
  const [childEntities, setChildEntities] = useState<LocalEntity[]>([]);
  const [linkedEntities, setLinkedEntities] = useState<LocalEntity[]>([]);
  const [orphanedParentIds, setOrphanedParentIds] = useState<string[]>([]);
  const [orphanedLinkedIds, setOrphanedLinkedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!entityName) {
      navigate('/entities');
      return;
    }

    const loadEntityData = () => {
      setIsLoading(true);
      try {
        // Get entity data
        const foundEntity = entityService.getEntityByName(decodeURIComponent(entityName));
        if (!foundEntity) {
          toast({
            title: "Entity not found",
            description: `The entity "${entityName}" could not be found.`,
            variant: "destructive",
          });
          navigate('/entities');
          return;
        }

        // Get all thoughts and calculate metrics
        const allThoughts = thoughtService.getAllThoughts();
        const entitiesWithMetrics = entityService.getEntitiesWithMetrics(allThoughts);
        const entityWithMetrics = entitiesWithMetrics.find(e => 
          e.name.toLowerCase() === foundEntity.name.toLowerCase()
        );

        if (entityWithMetrics) {
          setEntity(entityWithMetrics);
        }

        // Get related thoughts (v1.3.0+ uses ID-based references)
        const entityId = foundEntity.localId || foundEntity.id;
        const related = allThoughts.filter(thought => {
          // Check ID-based references first (v1.3.0+)
          if (thought.relatedEntityIds && thought.relatedEntityIds.length > 0 && entityId) {
            return thought.relatedEntityIds.includes(entityId);
          }
          
          // Fall back to legacy name-based references
          return thought.relatedEntities.some(e => 
            e.toLowerCase() === foundEntity.name.toLowerCase()
          );
        }).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setRelatedThoughts(related);

        // Get relationship entities (v1.3.0+ uses ID-based references)
        const allEntities = entityService.getAllEntities();
        
        // Parent entities - use ID-based references first, fall back to names
        let parents: LocalEntity[] = [];
        let orphanedParents: string[] = [];
        if (foundEntity.parentEntityIds && foundEntity.parentEntityIds.length > 0) {
          // Use new ID-based references
          parents = entityService.getEntitiesByIds(foundEntity.parentEntityIds);
          // Detect orphaned IDs
          orphanedParents = foundEntity.parentEntityIds.filter(
            id => !parents.some(p => p.localId === id || p.id === id)
          );
        } else if (foundEntity.parentEntities && foundEntity.parentEntities.length > 0) {
          // Fall back to legacy name-based references
          parents = (foundEntity.parentEntities || [])
            .map(name => allEntities.find(e => e.name === name))
            .filter((e): e is LocalEntity => e !== undefined);
        }
        setParentEntities(parents);
        setOrphanedParentIds(orphanedParents);

        // Child entities (getChildEntities already handles both ID and name-based)
        const children = entityService.getChildEntities(foundEntity.name);
        setChildEntities(children);

        // Linked entities (getLinkedEntities already handles both ID and name-based)
        let linked: LocalEntity[] = [];
        let orphanedLinked: string[] = [];
        if (foundEntity.linkedEntityIds && foundEntity.linkedEntityIds.length > 0) {
          linked = entityService.getEntitiesByIds(foundEntity.linkedEntityIds);
          // Detect orphaned IDs
          orphanedLinked = foundEntity.linkedEntityIds.filter(
            id => !linked.some(l => l.localId === id || l.id === id)
          );
        } else if (foundEntity.linkedEntities && foundEntity.linkedEntities.length > 0) {
          linked = (foundEntity.linkedEntities || [])
            .map(name => allEntities.find(e => e.name === name))
            .filter((e): e is LocalEntity => e !== undefined);
        }
        setLinkedEntities(linked);
        setOrphanedLinkedIds(orphanedLinked);
      } catch (error) {
        toast({
          title: "Error loading entity",
          description: "There was an error loading the entity details.",
          variant: "destructive",
        });
        navigate('/entities');
      } finally {
        setIsLoading(false);
      }
    };

    loadEntityData();
  }, [entityName, navigate, toast]);


  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDelete = (cascadeMode: 'orphan' | 'block' | 'remove') => {
    if (!entity) return;

    try {
      entityService.deleteEntity(entity.localId || entity.id!, cascadeMode);
      toast({
        title: "Entity deleted",
        description: `${entity.name} has been deleted successfully.`,
      });
      navigate('/entities');
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot delete entity')) {
        toast({
          title: "Cannot delete entity",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error deleting entity",
          description: "An error occurred while deleting the entity.",
          variant: "destructive",
        });
      }
    }
  };

  const handleThoughtClick = (thoughtId: string) => {
    navigate(`/history?highlight=${thoughtId}`);
  };

  const handleEntityClick = (entityName: string) => {
    navigate(`/entities/${encodeURIComponent(entityName)}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Entity Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The requested entity could not be found.
          </p>
          <Button onClick={() => navigate('/entities')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Entities
          </Button>
        </Card>
      </div>
    );
  }

  const Icon = getEntityIcon(entity.type);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/entities')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Entities
        </Button>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/entities/${encodeURIComponent(entity.name)}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <Button 
            variant="destructive" 
            size="sm"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Entity Details Card */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Entity Header */}
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-2xl font-bold">{entity.name}</h1>
                <Badge 
                  variant="secondary"
                  className={`${getEntityClass(entity.type)} inline-flex items-center gap-1`}
                >
                  <Icon className="h-3 w-3" />
                  {capitalize(entity.type)}
                </Badge>
              </div>
              
              {entity.description && (
                <MarkdownDisplay 
                  content={entity.description}
                  className="text-muted-foreground text-base leading-relaxed max-w-prose"
                />
              )}
            </div>
          </div>

          {/* Entity Attributes */}
          {entity.attributes && entity.attributes.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold text-base">Attributes</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {entity.attributes.map((attr, index) => (
                    <div key={index} className="space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">{attr.key}</div>
                      <div className="text-sm">{attr.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Entity Relationships */}
          <Separator />
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Network className="h-5 w-5" />
              Entity Relationships
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <EntityRelationshipDisplay
                title="Parent Entities"
                icon={Network}
                entities={parentEntities}
                orphanedIds={orphanedParentIds}
                emptyMessage="No parent entities"
                onEntityClick={handleEntityClick}
              />
              <EntityRelationshipDisplay
                title="Child Entities"
                icon={GitBranch}
                entities={childEntities}
                emptyMessage="No child entities"
                onEntityClick={handleEntityClick}
              />
              <EntityRelationshipDisplay
                title="Linked Entities"
                icon={Link2}
                entities={linkedEntities}
                orphanedIds={orphanedLinkedIds}
                emptyMessage="No linked entities"
                onEntityClick={handleEntityClick}
              />
            </div>
          </div>

          <Separator />

          {/* Metrics and Metadata */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Mention Statistics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total mentions:</span>
                  <span className="font-medium">{entity.metrics.count}</span>
                </div>
                {entity.metrics.lastMentioned && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last mentioned:</span>
                    <span className="font-medium">
                      {format(entity.metrics.lastMentioned, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Entity Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {entity.createdLocally ? format(entity.createdLocally, 'MMM d, yyyy') : 'Unknown'}
                  </span>
                </div>
                {entity.modifiedLocally && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last updated:</span>
                    <span className="font-medium">
                      {format(entity.modifiedLocally, 'MMM d, yyyy')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Creation source:</span>
                  <span className="font-medium">
                    {entity.creationSource === 'auto' ? 'Auto-detected' : 'Manual'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Entity Relationship Graph */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Relationship Graph
        </h3>
        
        <div className="h-[500px] border rounded bg-muted/30">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-center space-y-2">
                <Network className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Loading graph...</p>
              </div>
            </div>
          }>
            <ForceGraph2DWrapper
              campaign={null}
              entities={entityService.getAllEntities()}
              thoughts={thoughtService.getAllThoughts()}
              safeMode={false}
              centerEntityId={entity.localId || entity.id!}
              mode="entity"
            />
          </Suspense>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Showing <span className="font-medium">{entity.name}</span> and its immediate connections. 
          Visit the <a href="/graph" className="text-primary hover:underline">Graph View</a> for the full campaign network.
        </p>
      </Card>

      {/* Relationship Graph */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Relationship Graph
        </h3>
        
        <div className="h-[400px] border rounded bg-muted/10">
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="animate-pulse text-center space-y-4">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Loading graph...</p>
              </div>
            </div>
          }>
            <ForceGraph2DWrapper
              campaign={null}
              entities={entityService.getAllEntities()}
              thoughts={thoughtService.getAllThoughts()}
              safeMode={false}
              centerEntityId={entity.localId || entity.id!}
              mode="entity"
            />
          </Suspense>
        </div>
        
        <p className="text-xs text-muted-foreground mt-3">
          Hover over nodes to see details. Visit Graph View for the full campaign network.
        </p>
      </Card>

      {/* Related Thoughts */}
      <Card className="p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Related Thoughts ({relatedThoughts.length})
        </h3>
        
        {relatedThoughts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No thoughts mention this entity yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {relatedThoughts.map((thought) => (
              <Card 
                key={thought.localId || thought.id} 
                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleThoughtClick(thought.localId || thought.id!)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {format(thought.timestamp, 'MMM d, yyyy \'at\' h:mm a')}
                    </div>
                    {thought.relatedEntities.length > 1 && (
                      <Badge variant="outline" className="text-xs">
                        +{thought.relatedEntities.length - 1} other entities
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed">{thought.content}</p>
                  {thought.relatedEntities.length > 1 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {thought.relatedEntities.filter(e => e.toLowerCase() !== entity.name.toLowerCase()).slice(0, 3).map((entityName, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {entityName}
                        </Badge>
                      ))}
                      {thought.relatedEntities.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{thought.relatedEntities.length - 4} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <EntityDeleteDialog
        entity={entity}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default EntityDetailsPage;