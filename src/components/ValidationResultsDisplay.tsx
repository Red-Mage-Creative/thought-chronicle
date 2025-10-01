import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, AlertTriangle, Info, ExternalLink } from 'lucide-react';
import { schemaValidationService } from '@/services/schemaValidationService';
import { entityService } from '@/services/entityService';
import { useNavigate } from 'react-router-dom';

interface ValidationResultsDisplayProps {
  results: ReturnType<typeof schemaValidationService.validateEntityIdReferences>;
}

export const ValidationResultsDisplay = ({ results }: ValidationResultsDisplayProps) => {
  const navigate = useNavigate();
  const totalIssues = results.totalInvalidReferences;
  const hasIssues = totalIssues > 0;

  const getEntityNameById = (id: string) => {
    return entityService.getEntityNameById(id) || `Unknown (${id.slice(0, 8)}...)`;
  };

  if (!hasIssues) {
    return (
      <Alert className="border-green-500/50 bg-green-500/10">
        <CheckCircle2 className="h-5 w-5 text-green-600" />
        <AlertDescription className="ml-2">
          <strong className="text-green-700">All references are valid!</strong>
          <p className="text-sm text-muted-foreground mt-1">
            No orphaned entity references detected. Your data is in excellent shape.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Alert className="border-amber-500/50 bg-amber-500/10">
        <AlertTriangle className="h-5 w-5 text-amber-600" />
        <AlertDescription className="ml-2">
          <strong className="text-amber-700">{totalIssues} orphaned reference{totalIssues !== 1 ? 's' : ''} detected</strong>
          <p className="text-sm text-muted-foreground mt-1">
            These references point to entities that no longer exist. This can happen after entity deletions or data migrations.
          </p>
        </AlertDescription>
      </Alert>

      <Accordion type="multiple" className="space-y-3">
        {results.invalidThoughtReferences.length > 0 && (
          <AccordionItem value="thoughts" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="rounded-full">
                  {results.invalidThoughtReferences.length}
                </Badge>
                <span className="font-semibold">Thoughts with invalid references</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {results.invalidThoughtReferences.map((ref, idx) => (
                  <Card key={idx} className="border-destructive/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Thought: {ref.thoughtContent.slice(0, 60)}...
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Invalid entity IDs: {ref.invalidEntityIds.map(id => getEntityNameById(id)).join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/history?highlight=${ref.thoughtId}`)}
                        className="gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Thought
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {results.invalidParentReferences.length > 0 && (
          <AccordionItem value="parents" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="rounded-full">
                  {results.invalidParentReferences.length}
                </Badge>
                <span className="font-semibold">Entities with invalid parent references</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {results.invalidParentReferences.map((ref, idx) => (
                  <Card key={idx} className="border-destructive/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Entity: {ref.entityName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Invalid parent IDs: {ref.invalidParentIds.map(id => getEntityNameById(id)).join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/entities/${encodeURIComponent(ref.entityName)}`)}
                        className="gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Entity
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {results.invalidLinkedReferences.length > 0 && (
          <AccordionItem value="linked" className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3">
                <Badge variant="destructive" className="rounded-full">
                  {results.invalidLinkedReferences.length}
                </Badge>
                <span className="font-semibold">Entities with invalid linked references</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {results.invalidLinkedReferences.map((ref, idx) => (
                  <Card key={idx} className="border-destructive/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">
                        Entity: {ref.entityName}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Invalid linked IDs: {ref.invalidLinkedIds.map(id => getEntityNameById(id)).join(', ')}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/entities/${encodeURIComponent(ref.entityName)}`)}
                        className="gap-2"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Entity
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="ml-2 text-sm">
          <strong>How to fix:</strong> These orphaned references won't break your app, but they'll show as "(deleted)" in the UI. 
          You can either manually remove them by editing the affected thoughts/entities, or they'll be automatically cleaned during the next data migration.
        </AlertDescription>
      </Alert>
    </div>
  );
};
