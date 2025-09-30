import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Trash2, Edit } from 'lucide-react';
import { EntityType, DefaultEntityAttribute } from '@/types/entities';
import { dataStorageService } from '@/services/dataStorageService';
import { getEntityIcon } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

const entityTypes: EntityType[] = ['pc', 'npc', 'race', 'religion', 'quest', 'enemy', 'location', 'organization', 'item'];

export const DefaultAttributesConfig = () => {
  const [attributes, setAttributes] = useState<DefaultEntityAttribute[]>(
    dataStorageService.getDefaultEntityAttributes()
  );
  const [selectedType, setSelectedType] = useState<EntityType>('npc');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<DefaultEntityAttribute | null>(null);
  const { toast } = useToast();

  // Form state for add/edit dialog
  const [formKey, setFormKey] = useState('');
  const [formDefaultValue, setFormDefaultValue] = useState('');
  const [formRequired, setFormRequired] = useState(false);
  const [formEntityTypes, setFormEntityTypes] = useState<EntityType[]>([selectedType]);

  const handleSave = () => {
    dataStorageService.saveDefaultEntityAttributes(attributes);
    toast({
      title: 'Settings saved',
      description: 'Default attributes have been updated.'
    });
  };

  const handleAddAttribute = () => {
    if (!formKey.trim()) {
      toast({
        title: 'Error',
        description: 'Attribute key is required.',
        variant: 'destructive'
      });
      return;
    }

    const newAttribute: DefaultEntityAttribute = {
      id: crypto.randomUUID(),
      key: formKey.trim(),
      defaultValue: formDefaultValue.trim() || undefined,
      required: formRequired,
      entityTypes: formEntityTypes
    };

    setAttributes([...attributes, newAttribute]);
    resetForm();
    setIsAddDialogOpen(false);
    
    toast({
      title: 'Attribute added',
      description: `"${formKey}" has been added as a default attribute.`
    });
  };

  const handleUpdateAttribute = () => {
    if (!editingAttribute || !formKey.trim()) return;

    const updated = attributes.map(attr =>
      attr.id === editingAttribute.id
        ? {
            ...attr,
            key: formKey.trim(),
            defaultValue: formDefaultValue.trim() || undefined,
            required: formRequired,
            entityTypes: formEntityTypes
          }
        : attr
    );

    setAttributes(updated);
    resetForm();
    setEditingAttribute(null);
    
    toast({
      title: 'Attribute updated',
      description: `"${formKey}" has been updated.`
    });
  };

  const handleDeleteAttribute = (id: string) => {
    const updated = attributes.filter(attr => attr.id !== id);
    setAttributes(updated);
    
    toast({
      title: 'Attribute deleted',
      description: 'The default attribute has been removed.'
    });
  };

  const handleEditAttribute = (attr: DefaultEntityAttribute) => {
    setFormKey(attr.key);
    setFormDefaultValue(attr.defaultValue || '');
    setFormRequired(attr.required);
    setFormEntityTypes(attr.entityTypes);
    setEditingAttribute(attr);
  };

  const resetForm = () => {
    setFormKey('');
    setFormDefaultValue('');
    setFormRequired(false);
    setFormEntityTypes([selectedType]);
  };

  const toggleEntityType = (type: EntityType) => {
    if (formEntityTypes.includes(type)) {
      setFormEntityTypes(formEntityTypes.filter(t => t !== type));
    } else {
      setFormEntityTypes([...formEntityTypes, type]);
    }
  };

  const attributesForType = attributes.filter(attr => attr.entityTypes.includes(selectedType));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Default Entity Attributes</CardTitle>
          <CardDescription>
            Configure default attributes that will be pre-populated when creating entities of specific types.
            Required attributes must be filled before saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Entity Type Tabs */}
          <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as EntityType)}>
            <TabsList className="grid grid-cols-3 lg:grid-cols-5 gap-2">
              {entityTypes.map((type) => {
                const Icon = getEntityIcon(type);
                return (
                  <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{capitalize(type)}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {entityTypes.map((type) => (
              <TabsContent key={type} value={type} className="space-y-4 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">
                    Attributes for {capitalize(type)} entities
                  </h3>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" onClick={resetForm}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Attribute
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Default Attribute</DialogTitle>
                        <DialogDescription>
                          Create a new default attribute that will be available for selected entity types.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="attr-key">Attribute Key *</Label>
                          <Input
                            id="attr-key"
                            value={formKey}
                            onChange={(e) => setFormKey(e.target.value)}
                            placeholder="e.g., Height, Age, Class"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="attr-default">Default Value (optional)</Label>
                          <Input
                            id="attr-default"
                            value={formDefaultValue}
                            onChange={(e) => setFormDefaultValue(e.target.value)}
                            placeholder="e.g., Unknown"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            id="attr-required"
                            checked={formRequired}
                            onCheckedChange={setFormRequired}
                          />
                          <Label htmlFor="attr-required" className="cursor-pointer">
                            Required field
                          </Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Entity Types</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {entityTypes.map((entityType) => {
                              const Icon = getEntityIcon(entityType);
                              const isSelected = formEntityTypes.includes(entityType);
                              return (
                                <Button
                                  key={entityType}
                                  type="button"
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleEntityType(entityType)}
                                  className="justify-start"
                                >
                                  <Icon className="h-4 w-4 mr-2" />
                                  {capitalize(entityType)}
                                </Button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleAddAttribute}>
                          Add Attribute
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Attributes List */}
                {attributesForType.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No default attributes configured for {capitalize(type)} entities.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {attributesForType.map((attr) => (
                      <Card key={attr.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{attr.key}</span>
                                {attr.required && (
                                  <Badge variant="secondary" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              {attr.defaultValue && (
                                <p className="text-sm text-muted-foreground">
                                  Default: {attr.defaultValue}
                                </p>
                              )}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {attr.entityTypes.map((t) => {
                                  const Icon = getEntityIcon(t);
                                  return (
                                    <Badge key={t} variant="outline" className="text-xs">
                                      <Icon className="h-3 w-3 mr-1" />
                                      {capitalize(t)}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditAttribute(attr)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Edit Attribute</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-attr-key">Attribute Key *</Label>
                                      <Input
                                        id="edit-attr-key"
                                        value={formKey}
                                        onChange={(e) => setFormKey(e.target.value)}
                                      />
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="edit-attr-default">Default Value</Label>
                                      <Input
                                        id="edit-attr-default"
                                        value={formDefaultValue}
                                        onChange={(e) => setFormDefaultValue(e.target.value)}
                                      />
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <Switch
                                        id="edit-attr-required"
                                        checked={formRequired}
                                        onCheckedChange={setFormRequired}
                                      />
                                      <Label htmlFor="edit-attr-required" className="cursor-pointer">
                                        Required field
                                      </Label>
                                    </div>

                                    <div className="space-y-2">
                                      <Label>Entity Types</Label>
                                      <div className="grid grid-cols-2 gap-2">
                                        {entityTypes.map((entityType) => {
                                          const Icon = getEntityIcon(entityType);
                                          const isSelected = formEntityTypes.includes(entityType);
                                          return (
                                            <Button
                                              key={entityType}
                                              type="button"
                                              variant={isSelected ? "default" : "outline"}
                                              size="sm"
                                              onClick={() => toggleEntityType(entityType)}
                                              className="justify-start"
                                            >
                                              <Icon className="h-4 w-4 mr-2" />
                                              {capitalize(entityType)}
                                            </Button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="outline" onClick={() => setEditingAttribute(null)}>
                                      Cancel
                                    </Button>
                                    <Button onClick={handleUpdateAttribute}>
                                      Update Attribute
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Attribute</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{attr.key}"? This will not affect existing entities.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteAttribute(attr.id!)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};