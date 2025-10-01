import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Bug, Palette, Wrench, FileText, TestTube, Calendar, GitBranch } from "lucide-react";

interface ChangelogEntry {
  version: string;
  date: string;
  features: string[];
  improvements: string[];
  fixes: string[];
  docs?: string[];
  refactor?: string[];
  tests?: string[];
  chores?: string[];
  maintenance?: string[];
}

const changelog: ChangelogEntry[] = [{
  version: "1.3.2",
  date: "2025-10-01",
  features: [
    "Added data import functionality to restore exported Chronicle JSON files",
    "Added cascade deletion dialog with three modes: orphan (safe), block (preventive), and remove (destructive)",
    "Added manual data validation tool in Settings for checking orphaned entity references",
    "Added rename safety indicator on entity edit form showing ID-based reference protection",
    "Added comprehensive validation results display with navigation to affected items",
    "Added visual indicators for orphaned entity references in relationship displays"
  ],
  improvements: [
    "Added Upload Data option to user dropdown menu for easy data import",
    "Import dialog provides clear file validation and campaign data preview",
    "Enhanced entity deletion UX with preview of affected thoughts and entities before deletion",
    "Improved data integrity visibility with detailed validation reporting",
    "Added visual feedback for cascade deletion impacts",
    "Enhanced Settings page with dedicated Data Validation tab",
    "Entity relationship displays now show orphaned references with warning badges and tooltips",
    "EntityDetailsPage now detects and displays broken ID references for parent and linked entities"
  ],
  fixes: [],
  docs: [
    "Added EntityDeleteDialog component to design system",
    "Added ValidationResultsDisplay component to design system",
    "Added EntityRelationshipDisplay with orphaned references to design system",
    "Documented cascade deletion modes and their use cases",
    "Updated ID_BASED_REFERENCES.md with orphaned reference UI documentation"
  ],
  refactor: [],
  tests: [],
  maintenance: [
    "Created dataImportService for file validation and data import",
    "Created DataImportDialog component for import workflow",
    "Updated AppHeader with import button and dialog integration",
    "Created EntityDeleteDialog component for consistent deletion workflow",
    "Created ValidationResultsDisplay component for validation feedback",
    "Extended SettingsPage with validation functionality",
    "Enhanced EntityRelationshipDisplay with orphanedIds prop and visual indicators",
    "Updated EntityDetailsPage to detect and pass orphaned IDs to display components"
  ]
}, {
  version: "1.3.1",
  date: "2025-10-01",
  features: [
    "Added comprehensive page animation system with fade, scale, and slide transitions",
    "Created PageTransition component for consistent page animations",
    "Added interactive animation classes: hover-scale, pulse, story-link",
    "Implemented GPU-accelerated animations for smooth performance"
  ],
  improvements: [
    "Enhanced user experience with smooth page transitions (300ms)",
    "Added micro-interactions for better visual feedback (200ms)",
    "Improved accessibility with prefers-reduced-motion support",
    "Enhanced AppLayout with automatic PageTransition wrapper"
  ],
  fixes: [],
  docs: [
    "Added comprehensive animations section to Design System page",
    "Documented all animation types, timing, and usage examples",
    "Added PageTransition component documentation with props and variants",
    "Documented performance and accessibility best practices"
  ],
  refactor: [],
  tests: [],
  maintenance: [
    "Extended tailwind.config.ts with fade, scale, and slide keyframes",
    "Added combined animation utilities (enter, exit) for complex transitions",
    "Updated AppLayout to wrap all page content in PageTransition"
  ]
}, {
  version: "1.3.0",
  date: "2025-09-30",
  features: [
    "Implemented ID-based entity references for improved data integrity",
    "Automatic migration from name-based to ID-based references on app startup",
    "Added backward compatibility with legacy name-based references",
    "Added helper methods for converting between entity names and IDs",
    "Thoughts now store entity references as IDs internally",
    "Entity relationships (parent/linked) now use IDs internally",
    "All UI components seamlessly work with ID-based system",
    "Added ID-based validation to detect invalid entity references",
    "Added cascade deletion with three modes: orphan, block, remove"
  ],
  improvements: [
    "Enhanced data integrity by eliminating orphaned entity references",
    "Improved entity relationship tracking with unique identifiers",
    "Added automatic entity creation during reference migration",
    "Added efficient entity lookup by ID with O(n) complexity",
    "Thought creation/update now maintains both ID and name references",
    "Entity relationship operations now use IDs with name-based API",
    "Entity details page now uses ID-based queries for better performance",
    "Form components maintain user-friendly name-based interface",
    "Display components show visual indicators for orphaned entity references",
    "Validation system can now detect and report invalid entity IDs"
  ],
  fixes: [],
  docs: [
    "Created ID_BASED_REFERENCES.md with complete system architecture and API documentation",
    "Created TESTING_STRATEGY.md with testing philosophy, patterns, and best practices",
    "Documented ID-based reference architecture pattern with migration guide",
    "Added migration rollback capabilities for v1.3.0",
    "Documented new entity service helper methods with usage examples",
    "Added comprehensive JSDoc comments to all ID-based methods",
    "Added inline documentation explaining name→ID conversion in forms",
    "Documented cascade deletion modes and their use cases",
    "Added comprehensive validation documentation with troubleshooting guide",
    "Documented performance improvements (5-10x faster lookups for large datasets)"
  ],
  refactor: [
    "Major architectural refactor: Entity references now use IDs instead of names",
    "Thoughts now use relatedEntityIds as primary reference system",
    "Entity relationships now use parentEntityIds and linkedEntityIds as primary",
    "Updated thoughtService.createThought() to store ID-based references",
    "Updated thoughtService.updateThought() to store ID-based references",
    "Updated entity relationship methods to use IDs internally",
    "Enhanced getThoughtsByEntity() to work with both names and IDs",
    "Enhanced getChildEntities() and getLinkedEntities() to use ID-based queries",
    "Updated EntityDetailsPage to query using IDs with name fallback",
    "Updated all form components to document name→ID conversion flow",
    "Refactored deleteEntity() to support cascade modes (orphan, block, remove)",
    "Updated ThoughtList to show indicators for orphaned entity references"
  ],
  tests: [
    "Added comprehensive unit tests for entity ID/name conversion methods",
    "Added tests for getEntityById, getEntityIdByName, getEntityNameById",
    "Added tests for batch operations: getEntitiesByIds, convertNamesToIds, convertIdsToNames",
    "Added round-trip conversion tests to verify data integrity",
    "Added comprehensive tests for thought and entity operations with ID-based refs",
    "Added tests for entity relationship operations (add/remove parent/linked)",
    "Added tests for querying thoughts by entity name or ID",
    "Added backward compatibility tests for legacy name-based references",
    "Added tests for ID-based validation (validateEntityIdReferences)",
    "Added tests for cascade deletion in all three modes (orphan, block, remove)",
    "Added tests for orphaned reference handling in display components",
    "Added edge case tests for entity deletion with server IDs"
  ],
  maintenance: [
    "Created comprehensive migration system for ID-based references",
    "Added new type definitions for ID-based fields",
    "Implemented migration_1_3_0 with automatic entity creation",
    "Extended type system to support both legacy and new reference formats",
    "Added 6 new helper methods to entityService for ID/name operations",
    "Updated thoughtService with ID-based reference storage",
    "Updated entityService relationship methods with ID-based storage",
    "Updated form components with clarifying comments about name→ID flow",
    "Updated EntityDetailsPage with ID-based queries and legacy fallback",
    "Added validateEntityIdReferences method to schemaValidationService",
    "Enhanced deleteEntity with cascade behavior support",
    "Updated ThoughtList with orphaned reference detection and display"
  ]
}, {
  version: "1.2.2",
  date: "2025-09-30",
  features: [
    "Added user feedback notifications when new entities are auto-created during thought editing",
    "Entity list now automatically refreshes after editing thoughts with new entities"
  ],
  improvements: [],
  fixes: [
    "Fixed entity creation during thought editing - entities are now properly created when adding new tags to existing thoughts",
    "Added comprehensive error handling to thought editing workflow to prevent silent failures"
  ],
  docs: [],
  maintenance: []
}, {
  version: "1.2.1",
  date: "2025-09-30",
  features: [],
  improvements: [],
  fixes: [
    "Added automatic detection and repair of orphaned entity references on app startup",
    "Auto-creates missing entities when thoughts or entities reference non-existent entities",
    "Improved data integrity validation during app initialization"
  ],
  docs: [],
  maintenance: [
    "Extended schemaValidationService with entity reference validation",
    "Added EntityReferenceValidationResult interface for detailed validation reporting"
  ]
}, {
  version: "1.2.0",
  date: "2025-09-30",
  features: [
    "Added Plot Thread entity type for tracking storylines, mysteries, and campaign to-dos",
    "Created centralized entity type configuration for consistency across all forms"
  ],
  improvements: [
    "Improved entity type consistency across manual creation, auto-creation, and editing flows",
    "Enhanced entity suggestions to use valid entity types"
  ],
  fixes: [
    "Fixed invalid entity types being hidden - now properly shown as uncategorized",
    "Fixed entity suggestions using invalid 'character' type - now uses 'npc'",
    "Fixed gaps between entities created in different flows"
  ],
  docs: [
    "Documented centralized entity type configuration pattern in design system"
  ],
  maintenance: [
    "Created src/config/entityTypeConfig.ts as single source of truth for entity types",
    "Refactored all forms to use centralized entity type configuration"
  ]
}, {
  version: "0.9.0",
  date: "2025-09-30",
  features: [
    "Added flexible entity attribute system with key-value pairs",
    "Implemented default entity attributes configuration per entity type",
    "Added required attribute validation with form submission blocking",
    "Created Settings page with Profile and Default Attributes sections",
    "Added AttributeEditor component for managing entity attributes",
    "Implemented attribute display on entity details page"
  ],
  improvements: [
    "Enhanced entity creation/editing with dynamic attribute support",
    "Improved entity data model with optional attributes array",
    "Added clear validation feedback for missing required attributes",
    "Enhanced settings navigation with dedicated Settings menu item"
  ],
  fixes: [],
  docs: [
    "Added Rule 6: Entity Attribute System to DEVELOPMENT_RULES.md",
    "Updated design system with AttributeEditor component showcase",
    "Documented attribute validation requirements and patterns"
  ],
  tests: [
    "Added comprehensive tests for validateRequiredAttributes function",
    "Created AttributeEditor component tests with user interaction coverage",
    "Added edge case tests for attribute validation scenarios"
  ],
  maintenance: [
    "Updated EntitySchema and MongoEntitySchema with attributes field",
    "Enhanced dataStorageService with default attribute management",
    "Extended entityService with attribute CRUD operations"
  ]
}, {
  version: "0.8.1",
  date: "2025-09-30",
  features: [],
  improvements: [
    "Enhanced migration system with detailed loading screens showing progress phases",
    "Added comprehensive error recovery UI with backup restore, retry, and continue options",
    "Improved data validation to properly separate valid and invalid items",
    "Added progress tracking with real-time validation statistics during migrations",
    "Enhanced user feedback with phase-based progress indicators (Backup → Migration → Validation → Complete)"
  ],
  fixes: [
    "Fixed validation logic to correctly mark items as invalid when required fields are missing",
    "Fixed date validation to handle invalid date strings, null values, and malformed Date objects",
    "Fixed migration system to prevent app initialization on migration errors"
  ],
  docs: [
    "Added comprehensive migration progress and error handling documentation",
    "Added section 5.5 to DEVELOPMENT_RULES.md covering progress callbacks, validation failures, loading patterns, and error recovery"
  ],
  tests: [
    "Added comprehensive tests for migration progress callbacks",
    "Added tests for validation with invalid and fixable data",
    "Added tests for migration failure scenarios and automatic rollback",
    "Added extensive date validation edge case tests",
    "Added tests for separating valid and invalid entities during validation"
  ],
  maintenance: [
    "Added 0.8.0 marker migration to registry documenting migration system implementation",
    "Created MigrationLoadingScreen component for consistent progress display",
    "Created MigrationErrorScreen component for enhanced error recovery UX"
  ]
}, {
  version: "0.8.0",
  date: "2025-09-30",
  features: [
    "Implemented comprehensive data migration system with automatic schema versioning",
    "Added automatic field population for missing data fields",
    "Implemented migration rollback and backup/restore capabilities",
    "Added migration logging and monitoring infrastructure",
    "Created Migration History page to view migration logs and schema version"
  ],
  improvements: [
    "Enhanced data validation with automatic fixes for missing fields",
    "Improved app initialization with detailed migration feedback",
    "Added comprehensive console logging for debugging migrations"
  ],
  fixes: [],
  docs: [
    "Added comprehensive migration documentation to DEVELOPMENT_RULES.md",
    "Added Rule 5: Data Migration & Schema Versioning guidelines",
    "Documented migration testing requirements"
  ],
  maintenance: [
    "Created schema version tracking service",
    "Created schema validation service with automatic field filling",
    "Refactored migration service to use registry pattern",
    "Added comprehensive test coverage for migrations",
    "Consolidated all existing migrations into registry"
  ]
}, {
  version: "0.7.0",
  date: "2025-09-30",
  features: [
    "Added rich text markdown support for entity descriptions",
    "Entity descriptions now support bold, italic, links, lists, headings, and code blocks",
    "Added MarkdownDisplay component for consistent rich text rendering"
  ],
  improvements: [
    "Entity relationships section now always visible for better UX",
    "Enhanced entity description formatting with better spacing and wrapping",
    "Improved relationship section layout with clear heading and icon"
  ],
  fixes: [
    "Fixed linked entities to display bidirectionally (if A links to B, both see the link)",
    "Corrected version numbering from 1.2.0 to 0.6.0 for proper semantic versioning"
  ],
  docs: [
    "Updated design system with markdown formatting examples",
    "Documented proper semantic versioning guidelines in development rules"
  ],
  maintenance: [
    "Added react-markdown and remark-gfm dependencies",
    "Created reusable MarkdownDisplay component"
  ]
}, {
  version: "0.6.0",
  date: "2025-09-30",
  features: [
    "Added Player Characters, Races, Religions, Quests, and Enemies entity types",
    "Added entity hierarchy system (parent entities) for organizing entities",
    "Added entity linking system for non-hierarchical relationships between entities",
    "Added distinct icons for each entity type (UserCheck for PCs, Footprints for Races, Church for Religions, ScrollText for Quests, Skull for Enemies)",
    "Enhanced type inference patterns for automatic entity categorization"
  ],
  improvements: [
    "Improved entity categorization with expanded type inference patterns",
    "Enhanced entity service with relationship management methods",
    "Added visual distinction between entity types with unique color schemes"
  ],
  fixes: [],
  docs: [],
  refactor: ["Renamed 'Character' type to 'NPC' for clarity and consistency"],
  maintenance: [
    "Created entity migration system for backward compatibility",
    "Updated MongoDB schemas to support new entity types and relationships",
    "Added relationship management methods to entity service (addParentEntity, addLinkedEntity, etc.)",
    "Updated all UI components to support new entity types"
  ]
}, {
  version: "0.5.0",
  date: "2025-09-29",
  features: ["Added data export functionality to download campaign data as JSON backup files", "Implemented user-friendly export dialog with confirmation and success feedback"],
  improvements: ["Enhanced user dropdown menu with data export option", "Added comprehensive data cleaning for export (removes internal sync fields)", "Improved data backup capabilities for offline storage"],
  fixes: [],
  docs: ["Updated design system documentation with export functionality patterns"],
  maintenance: ["Created dedicated dataExportService following clean code principles", "Added proper TypeScript interfaces for export data structure"]
},
{
  version: "0.4.0",
  date: "2025-09-29",
  features: ["Implemented client-side leaked password protection using HaveIBeenPwned API with k-anonymity model", "Added real-time password security assessment during registration", "Enhanced password strength indicators with breach detection status"],
  improvements: ["Improved signup security by preventing the use of passwords found in known data breaches", "Enhanced user experience with live password security feedback", "Added privacy-preserving password breach checking (only first 5 hash characters sent to API)"],
  fixes: [],
  docs: [],
  maintenance: []
}, {
  version: "0.3.0",
  date: "2025-09-29",
  features: ["Added comprehensive Privacy Policy page with data collection transparency", "Created Terms of Service page with user rights and responsibilities", "Implemented Cookie Controls page with granular privacy settings", "Made changelog and design system pages publicly accessible without authentication"],
  improvements: ["Enhanced footer with conditional authentication-aware content", "Reorganized footer layout with proper legal and resource links", "Added footer to authentication page for better user experience", "Improved policy page navigation and accessibility"],
  fixes: ["CRITICAL: Fixed registration security code public exposure vulnerability", "CRITICAL: Fixed customer email addresses public exposure vulnerability", "Secured app_config table with admin-only access policies", "Implemented role-based access control with proper RLS policies"],
  docs: ["Updated design system documentation with new footer patterns", "Added policy page documentation and legal compliance features"],
  maintenance: ["Restructured footer component with responsive three-column layout", "Updated AppLayout to support both authenticated and public pages", "Enhanced routing configuration for public accessibility", "Created secure edge function for access code validation", "Implemented secure database functions for profile data access", "Added comprehensive user roles system with admin/user/moderator support"]
}, {
  version: "0.2.1",
  date: "2025-09-29",
  features: [],
  improvements: [],
  fixes: ["Fixed Content Security Policy to allow Supabase domains for authentication"],
  docs: [],
  maintenance: []
}, {
  version: "0.2.0",
  date: "2025-09-29",
  features: ["Enhanced authentication flow with improved access code validation", "Added case-insensitive access code handling", "Implemented username-based login support"],
  improvements: ["Normalized access code validation to handle case sensitivity and whitespace", "Enhanced error handling with better debugging capabilities", "Improved user feedback for authentication failures"],
  fixes: ["Fixed 'Unable to validate access code' error during signup", "Resolved username login functionality", "Fixed profile creation trigger to include email"],
  docs: ["Updated authentication documentation with new features"],
  maintenance: ["Added email column to profiles table", "Updated authentication context with robust error handling", "Improved database migration for user profile management"]
}, {
  version: "0.1.0",
  date: "2025-09-29",
  features: ["Enhanced entity tags with type-specific icons in thought list", "Clickable entity tags with navigation to entity details page"],
  improvements: ["Added visual feedback with hover effects on entity tags", "Improved entity type recognition using smart inference patterns"],
  fixes: [],
  docs: ["Added comprehensive Rule 4: Testing Standards & Integrity to development guidelines", "Established strict no-spoofed-tests policy with real testing requirements"],
  maintenance: ["Major tech debt refactoring - removed all debug logging from production code", "Fixed TypeScript type safety issues (removed 'any' types)", "Standardized error handling patterns across all services", "Updated version consistency between AppFooter and ChangelogPage", "Optimized function lengths and improved code clarity", "Enhanced DesignSystemPage documentation with entity tag improvements"],
  tests: ["Added comprehensive testing infrastructure with Vitest and React Testing Library", "Created unit tests for entityUtils with 100% coverage of core functions", "Implemented formatter utility tests with real-time mocking", "Added integration tests for businessLogicService with proper mocking patterns", "Created hook tests for useEntities with async behavior validation", "Established test setup with localStorage and DOM mocking", "Configured testing environment with proper TypeScript support"]
}, {
  version: "0.0.1",
  date: "2024-12-29",
  features: ["Entity registry with comprehensive card and table views", "Entity details page with full management capabilities", "Advanced sorting options (alphabetical, mentions, creation/update dates)", "Thought management system with entity linking and suggestions", "Real-time data synchronization between thoughts and entities", "Responsive design system with D&D fantasy theme", "Entity type system (Player, NPC, Location, Item, Organization)", "Search and filtering capabilities across entities", "Uncategorized entity detection and categorization", "Keyboard shortcuts for improved productivity"],
  improvements: ["Simplified card layouts with intuitive iconography", "Consistent entity type color coding throughout the app", "Enhanced hover states and interaction feedback", "Streamlined date display using icons for created/updated timestamps", "Improved mention tracking with clear visual indicators", "Responsive grid layouts for optimal viewing on all devices"],
  fixes: ["Proper text truncation in entity cards to prevent overflow", "Consistent date formatting across all components", "Fixed entity metrics calculation for accurate mention counts", "Resolved navigation issues between entity pages", "Corrected entity type badge styling inconsistencies"],
  docs: ["Added comprehensive design system documentation", "Created changelog with conventional commit standards", "Documented all UI components with examples"]
}];

const getCommitIcon = (type: string) => {
  switch (type) {
    case 'features':
      return <Sparkles className="h-4 w-4" />;
    case 'improvements':
      return <Palette className="h-4 w-4" />;
    case 'fixes':
      return <Bug className="h-4 w-4" />;
    case 'docs':
      return <FileText className="h-4 w-4" />;
    case 'refactor':
      return <Wrench className="h-4 w-4" />;
    case 'tests':
      return <TestTube className="h-4 w-4" />;
    default:
      return <GitBranch className="h-4 w-4" />;
  }
};

const getCommitColor = (type: string) => {
  switch (type) {
    case 'features':
      return 'bg-green-50 border-green-200 text-green-700';
    case 'improvements':
      return 'bg-blue-50 border-blue-200 text-blue-700';
    case 'fixes':
      return 'bg-red-50 border-red-200 text-red-700';
    case 'docs':
      return 'bg-purple-50 border-purple-200 text-purple-700';
    case 'refactor':
      return 'bg-amber-50 border-amber-200 text-amber-700';
    case 'tests':
      return 'bg-teal-50 border-teal-200 text-teal-700';
    default:
      return 'bg-gray-50 border-gray-200 text-gray-700';
  }
};

const getCommitLabel = (type: string) => {
  switch (type) {
    case 'features':
      return 'Features';
    case 'improvements':
      return 'Improvements';
    case 'fixes':
      return 'Bug Fixes';
    case 'docs':
      return 'Documentation';
    case 'refactor':
      return 'Refactoring';
    case 'tests':
      return 'Tests';
    case 'chores':
      return 'Chores';
    default:
      return 'Other';
  }
};

const CommitSection = ({
  type,
  items
}: {
  type: string;
  items: string[];
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className={`flex items-center gap-1 px-2 py-1 rounded-sm border text-xs font-medium ${getCommitColor(type)}`}>
          {getCommitIcon(type)}
          {getCommitLabel(type)}
        </div>
        <Badge variant="outline" className="text-xs">
          {items.length}
        </Badge>
      </div>
      <ul className="space-y-2 ml-4">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 text-xs">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function ChangelogPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track all updates, improvements, and changes to D&D Chronicle following conventional commit standards.
          </p>
        </div>

        {/* Changelog Entries */}
        <Accordion type="single" collapsible defaultValue="item-0" className="space-y-4">
          {changelog.map((entry, index) => (
            <AccordionItem key={entry.version} value={`item-${index}`} className="border rounded-lg">
              <Card className={index === 0 ? "border-primary" : ""}>
                <AccordionTrigger className="hover:no-underline p-0">
                  <CardHeader className="w-full">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-2xl">
                          v{entry.version}
                          {index === 0 && <Badge className="ml-2 text-xs">Current</Badge>}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </CardHeader>
                </AccordionTrigger>
                <AccordionContent>
                  <CardContent className="space-y-6 pt-0">
                    <CommitSection type="features" items={entry.features} />
                    
                    {entry.improvements && entry.improvements.length > 0 && (
                      <>
                        <Separator />
                        <CommitSection type="improvements" items={entry.improvements} />
                      </>
                    )}
                    
                    {entry.fixes && entry.fixes.length > 0 && (
                      <>
                        <Separator />
                        <CommitSection type="fixes" items={entry.fixes} />
                      </>
                    )}
                    
                    {entry.docs && entry.docs.length > 0 && (
                      <>
                        <Separator />
                        <CommitSection type="docs" items={entry.docs} />
                      </>
                    )}
                    
                    {entry.refactor && entry.refactor.length > 0 && (
                      <>
                        <Separator />
                        <CommitSection type="refactor" items={entry.refactor} />
                      </>
                    )}
                    
                    {entry.tests && entry.tests.length > 0 && (
                      <>
                        <Separator />
                        <CommitSection type="tests" items={entry.tests} />
                      </>
                    )}
                    
                    {entry.chores && entry.chores.length > 0 && (
                      <>
                        <Separator />
                        <CommitSection type="chores" items={entry.chores} />
                      </>
                    )}
                    
                    {entry.maintenance && entry.maintenance.length > 0 && (
                      <>
                        <Separator />
                        <CommitSection type="maintenance" items={entry.maintenance} />
                      </>
                    )}
                  </CardContent>
                </AccordionContent>
              </Card>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
