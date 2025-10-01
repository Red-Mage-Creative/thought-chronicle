import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { User, Database, Shield } from 'lucide-react';
import { DefaultAttributesConfig } from '@/components/settings/DefaultAttributesConfig';
import { ValidationResultsDisplay } from '@/components/ValidationResultsDisplay';
import { schemaValidationService } from '@/services/schemaValidationService';
import { thoughtService } from '@/services/thoughtService';
import { entityService } from '@/services/entityService';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const SettingsPage = () => {
  const [validationResults, setValidationResults] = useState<ReturnType<typeof schemaValidationService.validateEntityIdReferences> | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleRunValidation = () => {
    setIsValidating(true);
    try {
      const thoughts = thoughtService.getAllThoughts();
      const entities = entityService.getAllEntities();
      const results = schemaValidationService.validateEntityIdReferences(thoughts, entities);
      setValidationResults(results);
      
      toast({
        title: "Validation complete",
        description: results.totalInvalidReferences > 0 
          ? `Found ${results.totalInvalidReferences} orphaned reference${results.totalInvalidReferences !== 1 ? 's' : ''}`
          : "All references are valid!",
        variant: results.totalInvalidReferences > 0 ? "default" : "default",
      });
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "An error occurred while validating entity references.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and application preferences.
        </p>
      </div>

      <Tabs defaultValue="attributes" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Default Attributes
          </TabsTrigger>
          <TabsTrigger value="validation" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Data Validation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Profile settings coming soon. This section will allow you to update your display name,
                avatar, and other personal preferences.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attributes">
          <DefaultAttributesConfig />
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle>Data Validation</CardTitle>
              <CardDescription>
                Check for orphaned entity references and data integrity issues in your campaign data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between pb-4 border-b">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Run Entity Reference Validation</p>
                  <p className="text-xs text-muted-foreground">
                    Scans all thoughts and entities for references to deleted or missing entities.
                  </p>
                </div>
                <Button 
                  onClick={handleRunValidation}
                  disabled={isValidating}
                  className="gap-2"
                >
                  <Shield className="h-4 w-4" />
                  {isValidating ? 'Validating...' : 'Run Validation'}
                </Button>
              </div>

              {validationResults && (
                <ValidationResultsDisplay results={validationResults} />
              )}

              {!validationResults && !isValidating && (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Click "Run Validation" to check your data for orphaned references.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;