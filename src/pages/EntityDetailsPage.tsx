import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, MessageSquare, Calendar, Clock, Network, GitBranch, Link2 } from 'lucide-react';
import { LocalEntity, EntityWithMetrics, EntityType } from '@/types/entities';
import { LocalThought } from '@/types/thoughts';
import { entityService } from '@/services/entityService';
import { thoughtService } from '@/services/thoughtService';
import { getEntityIcon, getEntityClass } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';
import { format } from 'date-fns';
import { EntityEditForm } from '@/components/forms/EntityEditForm';
import { EntityRelationshipDisplay } from '@/components/display/EntityRelationshipDisplay';
import { MarkdownDisplay } from '@/components/display/MarkdownDisplay';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
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

        // Get related thoughts
        const related = allThoughts.filter(thought =>
          thought.relatedEntities.some(e => 
            e.toLowerCase() === foundEntity.name.toLowerCase()
          )
        ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

        setRelatedThoughts(related);

        // Get relationship entities
        const allEntities = entityService.getAllEntities();
        
        // Parent entities
        const parents = (foundEntity.parentEntities || [])
          .map(name => allEntities.find(e => e.name === name))
          .filter((e): e is LocalEntity => e !== undefined);
        setParentEntities(parents);

        // Child entities
        const children = entityService.getChildEntities(foundEntity.name);
        setChildEntities(children);

        // Linked entities
        const linked = entityService.getLinkedEntities(foundEntity.name);
        setLinkedEntities(linked);
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

  const handleEdit = async (
    name: string, 
    type: EntityType, 
    description?: string,
    newParentEntities?: string[],
    newLinkedEntities?: string[]
  ) => {
    if (!entity) return;

    try {
      const updatedEntity = entityService.updateEntity(
        entity.localId || entity.id!,
        { name, type, description }
      );

      // Handle parent entity changes
      if (newParentEntities !== undefined) {
        const currentParents = entity.parentEntities || [];
        
        // Remove old parents
        currentParents.forEach(parent => {
          if (!newParentEntities.includes(parent)) {
            entityService.removeParentEntity(entity.localId || entity.id!, parent);
          }
        });
        
        // Add new parents
        newParentEntities.forEach(parent => {
          if (!currentParents.includes(parent)) {
            entityService.addParentEntity(entity.localId || entity.id!, parent);
          }
        });
      }

      // Handle linked entity changes
      if (newLinkedEntities !== undefined) {
        const currentLinked = entity.linkedEntities || [];
        
        // Remove old links
        currentLinked.forEach(linked => {
          if (!newLinkedEntities.includes(linked)) {
            entityService.removeLinkedEntity(entity.localId || entity.id!, linked);
          }
        });
        
        // Add new links
        newLinkedEntities.forEach(linked => {
          if (!currentLinked.includes(linked)) {
            entityService.addLinkedEntity(entity.localId || entity.id!, linked);
          }
        });
      }

      // If name changed, navigate to new URL
      if (name !== entity.name) {
        navigate(`/entities/${encodeURIComponent(name)}`, { replace: true });
      } else {
        // Reload data to reflect changes
        window.location.reload();
      }

      setIsEditDialogOpen(false);
      toast({
        title: "Entity updated",
        description: `${name} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error updating entity",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const handleDelete = () => {
    if (!entity) return;

    try {
      entityService.deleteEntity(entity.localId || entity.id!);
      toast({
        title: "Entity deleted",
        description: `${entity.name} has been deleted successfully.`,
      });
      navigate('/entities');
    } catch (error) {
      toast({
        title: "Error deleting entity",
        description: "An error occurred while deleting the entity.",
        variant: "destructive",
      });
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
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Entity</DialogTitle>
              </DialogHeader>
              <EntityEditForm
                entity={entity}
                onSubmit={handleEdit}
                onCancel={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Entity</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{entity.name}"? This action cannot be undone.
                  The entity will be removed from all related thoughts.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
    </div>
  );
};

export default EntityDetailsPage;