import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EntityCategorize } from "@/components/ui/entity-categorize";
import { UncategorizedNotice } from "@/components/ui/uncategorized-notice";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  User, 
  MapPin, 
  Sword, 
  Users, 
  Building, 
  Brain,
  Calendar,
  Clock,
  MessageSquare,
  Tag,
  Sparkles,
  Network,
  Link2
} from "lucide-react";
import { AttributeEditor } from "@/components/forms/AttributeEditor";
import { EntityRelationshipDisplay } from "@/components/display/EntityRelationshipDisplay";
import { FormControls } from "@/components/forms/FormControls";
import type { LocalEntity } from "@/types/entities";

export default function DesignSystemPage() {
  const [demoValue, setDemoValue] = useState("");
  const [progress, setProgress] = useState(33);
  const [demoAttributes, setDemoAttributes] = useState([
    { key: "Height", value: "6'0\"" },
    { key: "Weight", value: "180 lbs" }
  ]);
  const [demoRequiredAttributes, setDemoRequiredAttributes] = useState([
    { key: "Class", value: "Wizard" }
  ]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Design System</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              A comprehensive showcase of all UI components, design tokens, and patterns used in D&D Chronicle.
            </p>
          </div>

          {/* Typography */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Typography</h2>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <h1 className="text-4xl font-bold">Heading 1</h1>
                  <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
                </div>
                <div>
                  <h2 className="text-3xl font-semibold">Heading 2</h2>
                  <p className="text-sm text-muted-foreground">text-3xl font-semibold</p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold">Heading 3</h3>
                  <p className="text-sm text-muted-foreground">text-2xl font-semibold</p>
                </div>
                <div>
                  <h4 className="text-xl font-semibold">Heading 4</h4>
                  <p className="text-sm text-muted-foreground">text-xl font-semibold</p>
                </div>
                <div>
                  <p className="text-base">Body text - Regular paragraph text for content.</p>
                  <p className="text-sm text-muted-foreground">text-base</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Small text - Secondary information and labels.</p>
                  <p className="text-xs text-muted-foreground">text-sm text-muted-foreground</p>
                </div>
                <div>
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">Code text</code>
                  <p className="text-sm text-muted-foreground">font-mono bg-muted</p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Colors */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Primary Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded border"></div>
                    <div>
                      <p className="font-medium">Primary</p>
                      <p className="text-sm text-muted-foreground">--primary</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-secondary rounded border"></div>
                    <div>
                      <p className="font-medium">Secondary</p>
                      <p className="text-sm text-muted-foreground">--secondary</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-accent rounded border"></div>
                    <div>
                      <p className="font-medium">Accent</p>
                      <p className="text-sm text-muted-foreground">--accent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Entity Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 border-green-300 border rounded"></div>
                    <div>
                      <p className="font-medium">Player</p>
                      <p className="text-sm text-muted-foreground">entity-player</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 border-blue-300 border rounded"></div>
                    <div>
                      <p className="font-medium">NPC</p>
                      <p className="text-sm text-muted-foreground">entity-npc</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 border-purple-300 border rounded"></div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">entity-location</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 border-amber-300 border rounded"></div>
                    <div>
                      <p className="font-medium">Item</p>
                      <p className="text-sm text-muted-foreground">entity-item</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 border-red-300 border rounded"></div>
                    <div>
                      <p className="font-medium">Organization</p>
                      <p className="text-sm text-muted-foreground">entity-organization</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Semantic Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-destructive rounded border"></div>
                    <div>
                      <p className="font-medium">Destructive</p>
                      <p className="text-sm text-muted-foreground">--destructive</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded border"></div>
                    <div>
                      <p className="font-medium">Muted</p>
                      <p className="text-sm text-muted-foreground">--muted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-border rounded border"></div>
                    <div>
                      <p className="font-medium">Border</p>
                      <p className="text-sm text-muted-foreground">--border</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Buttons */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Buttons</h2>
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="space-y-2">
                    <Button className="w-full pointer-events-none">Default</Button>
                    <p className="text-xs text-muted-foreground text-center">variant="default"</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="secondary" className="w-full pointer-events-none">Secondary</Button>
                    <p className="text-xs text-muted-foreground text-center">variant="secondary"</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full pointer-events-none">Outline</Button>
                    <p className="text-xs text-muted-foreground text-center">variant="outline"</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="ghost" className="w-full pointer-events-none">Ghost</Button>
                    <p className="text-xs text-muted-foreground text-center">variant="ghost"</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="destructive" className="w-full pointer-events-none">Destructive</Button>
                    <p className="text-xs text-muted-foreground text-center">variant="destructive"</p>
                  </div>
                  <div className="space-y-2">
                    <Button variant="link" className="w-full pointer-events-none">Link</Button>
                    <p className="text-xs text-muted-foreground text-center">variant="link"</p>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="flex gap-4 items-center">
                  <Button size="sm" className="pointer-events-none">Small</Button>
                  <Button size="default" className="pointer-events-none">Default</Button>
                  <Button size="lg" className="pointer-events-none">Large</Button>
                  <Button size="icon" className="pointer-events-none">
                    <User className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Form Controls */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Form Controls</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Input Elements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Text Input</Label>
                    <Input 
                      placeholder="Enter text here..." 
                      value={demoValue} 
                      onChange={(e) => setDemoValue(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Textarea</Label>
                    <Textarea placeholder="Enter longer text here..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Select</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Toggles & Selections</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="demo-checkbox" />
                    <Label htmlFor="demo-checkbox">Checkbox option</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="demo-switch" />
                    <Label htmlFor="demo-switch">Switch toggle</Label>
                  </div>
                  <RadioGroup defaultValue="option1">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="r1" />
                      <Label htmlFor="r1">Radio Option 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="r2" />
                      <Label htmlFor="r2">Radio Option 2</Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Form Controls Component */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Form Controls Component</h2>
            <Card>
              <CardHeader>
                <CardTitle>FormControls - Standardized Save/Cancel Actions</CardTitle>
                <CardDescription>
                  A reusable component that provides consistent save and cancel controls across all forms.
                  Used in Entity and Thought creation/edit pages.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Default Variant</h4>
                  <p className="text-sm text-muted-foreground">
                    Full-width layout with keyboard shortcut hint, unsaved changes indicator, and action buttons.
                    Typically used at the bottom of forms.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <FormControls
                      onSave={() => console.log('Save clicked')}
                      onCancel={() => console.log('Cancel clicked')}
                      isSubmitting={false}
                      isSaveDisabled={false}
                      saveLabel="Save Entity"
                      variant="default"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Compact Variant</h4>
                  <p className="text-sm text-muted-foreground">
                    Compact layout with right-aligned buttons, no keyboard shortcut hint.
                    Typically used at the top of forms for quick access.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <FormControls
                      onSave={() => console.log('Save clicked')}
                      onCancel={() => console.log('Cancel clicked')}
                      isSubmitting={false}
                      isSaveDisabled={false}
                      saveLabel="Save Entity"
                      variant="compact"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">With Unsaved Changes</h4>
                  <p className="text-sm text-muted-foreground">
                    Shows a pulsing amber indicator and highlights the save button when there are unsaved changes.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <FormControls
                      onSave={() => setHasUnsavedChanges(false)}
                      onCancel={() => setHasUnsavedChanges(false)}
                      isSubmitting={false}
                      isSaveDisabled={false}
                      saveLabel="Save Entity"
                      hasUnsavedChanges={true}
                      variant="default"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Submitting State</h4>
                  <p className="text-sm text-muted-foreground">
                    Disables buttons and shows loading text when a form is being submitted.
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <FormControls
                      onSave={() => {}}
                      onCancel={() => {}}
                      isSubmitting={true}
                      isSaveDisabled={false}
                      saveLabel="Save Entity"
                      variant="default"
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">Disabled Save Button</h4>
                  <p className="text-sm text-muted-foreground">
                    Save button can be disabled independently (e.g., for validation errors).
                  </p>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <FormControls
                      onSave={() => {}}
                      onCancel={() => console.log('Cancel clicked')}
                      isSubmitting={false}
                      isSaveDisabled={true}
                      saveLabel="Save Entity"
                      variant="default"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-medium">Component Props:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• <code>onSave</code>: () =&gt; void - Callback when save button is clicked</li>
                    <li>• <code>onCancel</code>: () =&gt; void - Callback when cancel button is clicked</li>
                    <li>• <code>isSubmitting</code>: boolean - Shows loading state and disables buttons</li>
                    <li>• <code>isSaveDisabled</code>: boolean - Disables save button independently</li>
                    <li>• <code>saveLabel</code>: string - Text for save button (e.g., "Save Entity", "Update Thought")</li>
                    <li>• <code>hasUnsavedChanges?</code>: boolean - Shows unsaved changes indicator (default: false)</li>
                    <li>• <code>variant?</code>: 'default' | 'compact' - Layout variant (default: 'default')</li>
                  </ul>
                </div>
                
                <div className="space-y-2 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Standard Usage Pattern
                  </p>
                  <div className="text-xs text-muted-foreground space-y-2">
                    <p><strong>Compact at top:</strong> Quick access controls above the form card</p>
                    <p><strong>Default at bottom:</strong> Full controls below the form card with keyboard hints</p>
                    <p><strong>Example:</strong></p>
                    <pre className="bg-muted p-2 rounded text-[10px] overflow-x-auto">
{`<FormControls variant="compact" ... />
<Card>
  {/* Form content */}
</Card>
<FormControls variant="default" hasUnsavedChanges={...} ... />`}
                    </pre>
                  </div>
                </div>
                
                <div className="space-y-2 bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-medium">Key Features:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• Consistent button styling and spacing across all forms</li>
                    <li>• Visual feedback for unsaved changes (pulsing amber indicator)</li>
                    <li>• Keyboard shortcut hint (Ctrl+S) in default variant</li>
                    <li>• Automatic button text transformation during submission (e.g., "Save" → "Saving...")</li>
                    <li>• Save button highlight ring when unsaved changes present</li>
                    <li>• Proper disabled states for loading and validation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Attribute Editor */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Attribute Editor</h2>
            <Card>
              <CardHeader>
                <CardTitle>Entity Attributes</CardTitle>
                <CardDescription>
                  Component for managing key-value attributes on entities.
                  Supports required attributes, default values, and real-time editing.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Basic Usage</h4>
                  <p className="text-sm text-muted-foreground">
                    The AttributeEditor component allows users to add, edit, and remove custom attributes.
                  </p>
                  <AttributeEditor
                    attributes={demoAttributes}
                    onChange={setDemoAttributes}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">With Required Attributes</h4>
                  <p className="text-sm text-muted-foreground">
                    Required attributes are marked with a "Required" badge and shown with hint text.
                  </p>
                  <AttributeEditor
                    attributes={demoRequiredAttributes}
                    defaultAttributes={[
                      { key: "Class", required: true, entityTypes: ['pc'] },
                      { key: "Level", required: true, entityTypes: ['pc'] }
                    ]}
                    onChange={setDemoRequiredAttributes}
                  />
                </div>
                
                <div className="space-y-2 bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-medium">Component Props:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• <code>attributes</code>: EntityAttribute[] - current attributes</li>
                    <li>• <code>onChange</code>: (attributes: EntityAttribute[]) =&gt; void - callback on change</li>
                    <li>• <code>defaultAttributes?</code>: DefaultEntityAttribute[] - for required indicators</li>
                    <li>• <code>disabled?</code>: boolean - disable all inputs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Entity Relationship Display */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Entity Relationship Display</h2>
            <Card>
              <CardHeader>
                <CardTitle>Relationship Display with Orphaned References</CardTitle>
                <CardDescription>
                  Component for displaying entity relationships with visual indicators for broken/orphaned references (v1.3.0+)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Valid References</h4>
                  <p className="text-sm text-muted-foreground">
                    Shows entity relationships with clickable badges, type icons, and proper styling
                  </p>
                  <EntityRelationshipDisplay
                    title="Parent Entities"
                    icon={Network}
                    entities={[
                      { 
                        localId: 'entity-1', 
                        name: 'Castle Town', 
                        type: 'location', 
                        syncStatus: 'synced',
                        campaign_id: 'demo',
                        created_by: 'demo'
                      } as LocalEntity,
                      { 
                        localId: 'entity-2', 
                        name: 'Kingdom', 
                        type: 'location', 
                        syncStatus: 'synced',
                        campaign_id: 'demo',
                        created_by: 'demo'
                      } as LocalEntity
                    ]}
                    emptyMessage="No parent entities"
                    onEntityClick={() => {}}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-3">
                  <h4 className="font-medium">With Orphaned References</h4>
                  <p className="text-sm text-muted-foreground">
                    Orphaned references appear with dashed borders, warning icons, and tooltips explaining the issue
                  </p>
                  <EntityRelationshipDisplay
                    title="Linked Entities"
                    icon={Link2}
                    entities={[
                      { 
                        localId: 'entity-3', 
                        name: 'Gandalf', 
                        type: 'npc', 
                        syncStatus: 'synced',
                        campaign_id: 'demo',
                        created_by: 'demo'
                      } as LocalEntity
                    ]}
                    orphanedIds={['deleted-entity-123', 'missing-entity-456']}
                    emptyMessage="No linked entities"
                    onEntityClick={() => {}}
                  />
                </div>
                
                <div className="space-y-2 bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-medium">Visual Design:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• <strong>Valid entities</strong>: Colored badge with entity type icon, clickable</li>
                    <li>• <strong>Orphaned refs</strong>: Gray/muted badge with dashed border, AlertTriangle icon, non-clickable</li>
                    <li>• <strong>Header count</strong>: Shows "X valid, Y orphaned" when orphans exist</li>
                    <li>• <strong>Tooltip</strong>: Explains that the entity was deleted or data is corrupted</li>
                  </ul>
                </div>
                
                <div className="space-y-2 bg-muted/50 p-4 rounded-md">
                  <p className="text-sm font-medium">Component Props:</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• <code>title</code>: string - Section title (e.g., "Parent Entities")</li>
                    <li>• <code>icon</code>: LucideIcon - Icon for the section header</li>
                    <li>• <code>entities</code>: LocalEntity[] - Array of valid resolved entities</li>
                    <li>• <code>orphanedIds?</code>: string[] - Array of IDs that couldn't be resolved</li>
                    <li>• <code>emptyMessage</code>: string - Message when no entities exist</li>
                    <li>• <code>onEntityClick?</code>: (name: string) =&gt; void - Click handler for navigation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Badges & Tags */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Badges & Entity Tags</h2>
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Standard Badges</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                </div>
                <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium">Entity Type Tags</h4>
                    <p className="text-sm text-muted-foreground">
                      Entity tags use Badge component with entity-specific CSS classes. They are clickable and include type-specific icons.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="entity-player cursor-pointer hover:opacity-80 transition-opacity">
                        <User className="h-3 w-3 mr-1" />
                        Character
                      </Badge>
                      <Badge className="entity-location cursor-pointer hover:opacity-80 transition-opacity">
                        <MapPin className="h-3 w-3 mr-1" />
                        Location
                      </Badge>
                      <Badge className="entity-item cursor-pointer hover:opacity-80 transition-opacity">
                        <Sword className="h-3 w-3 mr-1" />
                        Item
                      </Badge>
                      <Badge className="entity-organization cursor-pointer hover:opacity-80 transition-opacity">
                        <Building className="h-3 w-3 mr-1" />
                        Organization
                      </Badge>
                      <Badge className="entity-plot-thread cursor-pointer hover:opacity-80 transition-opacity">
                        <Building className="h-3 w-3 mr-1" />
                        Plot Thread
                      </Badge>
                      <Badge className="entity-uncategorized cursor-pointer hover:opacity-80 transition-opacity">
                        <Tag className="h-3 w-3 mr-1" />
                        Uncategorized
                      </Badge>
                    </div>
                  <p className="text-xs text-muted-foreground">
                    Icons are automatically inferred based on entity type using the getEntityIcon utility function.
                  </p>
                  <div className="space-y-2 bg-muted/50 p-4 rounded-md mt-4">
                    <p className="text-sm font-medium">Centralized Configuration:</p>
                    <p className="text-xs text-muted-foreground">
                      All entity types are now defined in <code className="bg-muted px-1 py-0.5 rounded">src/config/entityTypeConfig.ts</code> as a single source of truth.
                      This ensures consistency across manual creation, auto-creation from thoughts, editing, and all display components.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Available entity classes: entity-pc, entity-npc, entity-race, entity-religion, entity-quest, entity-enemy, entity-location, entity-organization, entity-item, entity-plot-thread, entity-uncategorized
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Cards & Layout */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Cards & Layout</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Card</CardTitle>
                  <CardDescription>A simple card with header and content</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This is the card content area where you can put any information.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Entity Card Style</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 entity-tag entity-player">
                      <User className="h-3 w-3" />
                      Player
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Mentioned 5 times</div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Dec 15, 2024
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground pt-2 border-t flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Dec 1, 2024
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Dec 10, 2024
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Loading State</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Alerts & Feedback */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Alerts & Feedback</h2>
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Information</AlertTitle>
                <AlertDescription>
                  This is an informational alert that provides helpful context.
                </AlertDescription>
              </Alert>
              
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  This is a destructive alert indicating an error or warning.
                </AlertDescription>
              </Alert>

              <UncategorizedNotice 
                count={3} 
                onShowUncategorized={() => {}} 
              />
            </div>
          </section>

          {/* Interactive Elements */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Interactive Elements</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress & Loading</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Progress Bar</Label>
                    <Progress value={progress} className="w-full" />
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => setProgress(Math.max(0, progress - 10))}
                      >
                        -10
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => setProgress(Math.min(100, progress + 10))}
                      >
                        +10
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <div className="flex gap-2">
                      <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>AM</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tooltips & Custom Components</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Tooltip Example</Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline">Hover me</Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This is a helpful tooltip</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label>Entity Categorize</Label>
                    <EntityCategorize
                      entityName="Demo Entity"
                      currentType="uncategorized"
                      onCategorize={() => {}}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Navigation Patterns */}
          <section>
            <h2 className="text-3xl font-semibold text-foreground mb-6">Navigation Patterns</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Active Navigation States</h3>
                <div className="flex gap-2 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 py-2 px-3 text-sm font-medium bg-accent text-accent-foreground rounded-md">
                    <Users className="h-4 w-4" />
                    <span>Active Page</span>
                  </div>
                  <div className="flex items-center gap-2 py-2 px-3 text-sm font-medium text-foreground hover:bg-muted rounded-md">
                    <Calendar className="h-4 w-4" />
                    <span>Inactive Page</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Card Interaction Patterns */}
          <section>
            <h2 className="text-3xl font-semibold text-foreground mb-6">Card Interaction Patterns</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Clickable Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="cursor-pointer hover:bg-accent/10 transition-colors">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground mb-2">Standard Hover</h4>
                      <p className="text-muted-foreground text-sm">Subtle background highlight on hover</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-foreground mb-2">Non-Interactive</h4>
                      <p className="text-muted-foreground text-sm">No hover effects for static content</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </section>

          {/* Loading & Empty States */}
          <section>
            <h2 className="text-3xl font-semibold text-foreground mb-6">Loading & Empty States</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Loading Skeletons</h3>
                <div className="space-y-4">
                  {[...Array(2)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded w-full" />
                          <div className="h-4 bg-muted rounded w-3/4" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Empty States</h3>
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">No Items Found</h4>
                    <p className="text-muted-foreground">
                      This is how empty states should be displayed with an icon and descriptive text.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Stats & Metrics Display */}
          <section>
            <h2 className="text-3xl font-semibold text-foreground mb-6">Stats & Metrics Display</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Statistics Cards</h3>
                <Card>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center">
                        <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">156</div>
                        <div className="text-sm text-muted-foreground">Total Items</div>
                      </div>
                      <div className="text-center">
                        <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">42</div>
                        <div className="text-sm text-muted-foreground">Recent Activity</div>
                      </div>
                      <div className="text-center">
                        <Calendar className="h-8 w-8 text-secondary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-foreground">7</div>
                        <div className="text-sm text-muted-foreground">This Week</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Markdown Display */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Markdown Display</h2>
            <Card>
              <CardHeader>
                <CardTitle>MarkdownDisplay Component</CardTitle>
                <CardDescription>
                  Renders markdown-formatted text with custom styling for entity descriptions and other rich content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Supported Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>**Bold** and *italic* text</li>
                    <li>[Links](url) with automatic external link handling</li>
                    <li>Ordered and unordered lists</li>
                    <li>Headings (H1-H3)</li>
                    <li>`Inline code` and code blocks</li>
                    <li>&gt; Blockquotes</li>
                  </ul>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Example Output</h4>
                  <div className="p-4 border rounded-md bg-muted/30">
                    <div className="text-muted-foreground text-base leading-relaxed max-w-prose space-y-2">
                      <p className="mb-4"><strong className="font-semibold">Bold text</strong> and <em className="italic">italic text</em></p>
                      <ul className="list-disc list-inside mb-4 space-y-1">
                        <li className="ml-4">List item one</li>
                        <li className="ml-4">List item two</li>
                      </ul>
                      <p className="mb-4">
                        <a className="text-primary hover:underline" href="https://example.com" target="_blank" rel="noopener noreferrer">
                          External link
                        </a>
                      </p>
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono">Inline code</code>
                    </div>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-medium">Usage</h4>
                  <code className="block bg-muted p-4 rounded text-sm font-mono overflow-x-auto">
                    {`import { MarkdownDisplay } from '@/components/display/MarkdownDisplay';\n\n<MarkdownDisplay \n  content={entity.description}\n  className="text-muted-foreground text-base leading-relaxed"\n/>`}
                  </code>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Layout Components */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Layout Components</h2>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tabs</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="tab1" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1" className="mt-4">
                      <p className="text-sm text-muted-foreground">Content for tab 1</p>
                    </TabsContent>
                    <TabsContent value="tab2" className="mt-4">
                      <p className="text-sm text-muted-foreground">Content for tab 2</p>
                    </TabsContent>
                    <TabsContent value="tab3" className="mt-4">
                      <p className="text-sm text-muted-foreground">Content for tab 3</p>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Accordion</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Section 1</AccordionTrigger>
                      <AccordionContent>
                        Content for the first accordion section goes here.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>Section 2</AccordionTrigger>
                      <AccordionContent>
                        Content for the second accordion section goes here.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Section 3</AccordionTrigger>
                      <AccordionContent>
                        Content for the third accordion section goes here.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Animations */}
          <section className="space-y-6">
            <h2 className="text-3xl font-semibold">Animations</h2>
            <Card>
              <CardHeader>
                <CardTitle>Page Transitions & Micro-Interactions</CardTitle>
                <CardDescription>
                  Smooth animations for enhanced user experience with GPU-accelerated CSS transforms.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Animation Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4 space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h5 className="font-medium">Fade In</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Smooth fade with upward motion
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded block">
                        animate-fade-in
                      </code>
                    </Card>
                    
                    <Card className="p-4 space-y-2 animate-scale-in">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h5 className="font-medium">Scale In</h5>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Emphasis with scale effect
                      </p>
                      <code className="text-xs bg-muted px-2 py-1 rounded block">
                        animate-scale-in
                      </code>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">Interactive Classes</h4>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-md space-y-2">
                      <p className="text-sm font-medium">Hover Scale</p>
                      <div className="bg-background p-3 rounded border hover-scale cursor-pointer">
                        Hover me for a lift effect
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block">
                        .hover-scale
                      </code>
                    </div>
                    
                    <div className="p-4 bg-muted/50 rounded-md space-y-2">
                      <p className="text-sm font-medium">Pulse Animation</p>
                      <div className="bg-background p-3 rounded border pulse">
                        Pulsing attention grabber
                      </div>
                      <code className="text-xs bg-muted px-2 py-1 rounded block">
                        .pulse
                      </code>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-medium">PageTransition Component</h4>
                  <p className="text-sm text-muted-foreground">
                    Wrapper component for consistent page animations with customizable variants, delays, and durations.
                  </p>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <code className="text-xs block whitespace-pre-wrap">
{`<PageTransition variant="enter">
  <YourContent />
</PageTransition>`}
                    </code>
                  </div>
                  <div className="text-xs space-y-1">
                    <p><strong>Variants:</strong> fade, scale, slide, enter (default)</p>
                    <p><strong>Props:</strong> delay (ms), duration (ms), className</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 bg-accent/10 p-4 rounded-md">
                  <p className="text-sm font-medium">Performance & Accessibility</p>
                  <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                    <li>• GPU-accelerated with CSS transforms</li>
                    <li>• Respects prefers-reduced-motion media query</li>
                    <li>• Timing: 300ms pages, 200ms micro-interactions, 150ms hovers</li>
                    <li>• All animations use ease-out for natural feel</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </TooltipProvider>
  );
}