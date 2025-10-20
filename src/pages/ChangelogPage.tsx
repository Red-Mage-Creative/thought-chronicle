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
  version: "1.6.13",
  date: "2025-10-20",
  features: [],
  improvements: [
    "Simplified graph tooltips to 'Click to view details' instead of showing descriptions",
    "Graph now has minimum 100vh height with sticky controls for better navigation"
  ],
  fixes: [
    "Fixed icon rendering errors by using React.createElement instead of function calls"
  ],
  docs: [],
  refactor: [],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.6.12",
  date: "2025-10-20",
  features: [],
  improvements: [],
  fixes: [
    "Prevented graph data recomputation and validation on hover by memoizing actualData",
    "Prevented camera from recentering on hover using one-time centering guard",
    "Eliminated repeated connected-node calculations when hovering same node"
  ],
  docs: [],
  refactor: [],
  tests: [],
  chores: [],
  maintenance: [
    "Optimized handleNodeHover to only recalculate connections when node changes",
    "Added hasCenteredRef to control camera centering behavior"
  ]
}, {
  version: "1.6.11",
  date: "2025-10-20",
  features: [],
  improvements: [],
  fixes: [
    "Fixed graph re-rendering on every hover by using stable ref for graph links",
    "Restored design-system compliant white tooltip card for graph node hover"
  ],
  docs: [],
  refactor: [
    "Removed canvas-drawn labels on hover in favor of cleaner DOM-based tooltip"
  ],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.6.10",
  date: "2025-10-20",
  features: [],
  improvements: [],
  fixes: [
    "Fixed graph hover error by removing invalid refresh() method call that doesn't exist in react-force-graph-2d API"
  ],
  docs: [],
  refactor: [],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.6.9",
  date: "2025-10-20",
  features: [],
  improvements: [
    "Removed redundant exit button and campaign badge from graph view (header provides navigation)",
    "Added robust error handling for thought timestamp formatting with helpful fallback labels"
  ],
  fixes: [
    "Fixed graph hover crash when thoughts have invalid or missing timestamps"
  ],
  docs: [],
  refactor: [],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.6.8",
  date: "2025-01-20",
  features: [],
  improvements: [
    "Graph view now fits perfectly between header and footer with dynamic height",
    "All graph controls positioned relative to graph container for better accessibility"
  ],
  fixes: [
    "Graph controls no longer blocked by header or footer elements",
    "Navigation in graph view now uses React Router (no page reloads)"
  ],
  docs: [],
  refactor: [
    "Added 'graph' variant to AppLayout for specialized graph rendering",
    "Changed graph component positioning from fixed to absolute",
    "Updated GraphViewPage to use dynamic height calculation"
  ],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.6.7",
  date: "2025-01-20",
  features: [],
  improvements: [
    "Simplified UI with floating controls for cleaner graph view",
    "Better mobile responsiveness for graph view with optimized layouts"
  ],
  fixes: [
    "Removed graph hover tooltip crashes - now using stable canvas labels",
    "Removed duplicate graph on entity detail page",
    "Graph controls now hidden in entity-specific graph view",
    "Full viewport layout with no header/footer overlap"
  ],
  docs: [],
  refactor: [
    "Simplified GraphTooltip to return null (canvas-only labels)",
    "Enhanced canvas label rendering with type badges and backgrounds",
    "Conditional rendering of graph controls based on mode"
  ],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.6.6",
  date: "2025-01-19",
  features: [],
  improvements: [
    "Full-viewport graph layout - graph now fills entire screen cleanly on all devices",
    "Campaign/entity-centered graphs - pinned center nodes with radial layout",
    "Improved mobile responsiveness - touch-friendly controls and adaptive layout",
    "Auto-centering camera - graph automatically centers on main node on load"
  ],
  fixes: [
    "Fixed graph crash when hovering entities with missing attributes",
    "Fixed tooltip coordinate system causing positioning errors",
    "Fixed graph elements being cut off by header/screen edges",
    "Fixed viewport overflow issues with proper flexbox layout"
  ],
  docs: [],
  refactor: [
    "Simplified GraphViewPage layout using fixed inset-0 and flexbox",
    "Added fx/fy properties to GraphNode for node pinning",
    "Enhanced tooltip error handling with try-catch blocks",
    "Updated graph controls with responsive sizing"
  ],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.6.5",
  date: "2025-01-19",
  features: [
    "Canvas-native icon rendering - Lucide React icons rendered directly in canvas for perfect synchronization",
    "Full-viewport graph mode - immersive graph experience without duplicate header/footer",
    "Interactive hover tooltips - rich entity and thought details appear on hover",
    "Advanced filtering system - filter by entity types, relationship types, and search",
    "Node selection panel - detailed information slides in when clicking nodes",
    "Right-click context menu - quick actions on entities and thoughts",
    "Connected node highlighting - hover over nodes to see their relationships glow",
    "Dynamic node sizing - node sizes reflect connection importance automatically",
    "Animated link particles - thought-entity connections show flowing particles"
  ],
  improvements: [
    "Eliminated icon/node sync lag by rendering icons directly in canvas",
    "Full-screen graph layout with minimal header for immersive experience",
    "Smart tooltip positioning to avoid screen edges",
    "Collapsible filter panel with entity type counts",
    "Selection panel shows attributes, description, and connected entities",
    "Graph controls positioned for optimal ergonomics",
    "Performance optimized with icon caching and memoization",
    "Node sizes dynamically calculated based on connection count",
    "Relationship type filtering (parent, linked, mention)"
  ],
  fixes: [
    "Fixed icon synchronization - icons move as one unified layer with nodes",
    "Fixed layout duplication - graph view now has dedicated full-viewport mode",
    "Fixed React rendering in icon cache using proper DOM API",
    "Fixed entity description field usage in selection panel"
  ],
  docs: [],
  refactor: [
    "Created graphIconCache utility for converting React icons to canvas images",
    "Created GraphHeader component for minimal graph-specific header",
    "Created GraphTooltip component for rich hover information",
    "Created GraphFilterPanel component with comprehensive filtering",
    "Created GraphSelectionPanel component for node details",
    "Created GraphContextMenu component for right-click actions",
    "Removed GraphNodeOverlay (replaced by canvas-native icons)",
    "Added calculateNodeMetrics utility for dynamic sizing",
    "Added getConnectedNodes utility for relationship highlighting",
    "Refactored ForceGraph2DWrapper with full interactivity system",
    "Refactored GraphViewPage to full-viewport layout without AppLayout"
  ],
  tests: [],
  chores: [],
  maintenance: [
    "Updated graph type definitions with enhanced interactivity support",
    "Improved graph data transformation pipeline with filtering",
    "Enhanced error handling in icon cache creation"
  ]
}, {
  version: "1.6.4",
  date: "2025-01-18",
  features: [
    "Design system Lucide icons render in graph nodes using HTML overlay",
    "Thought nodes display creation date instead of truncated content"
  ],
  improvements: [
    "Graph page margins align with header and footer using AppLayout",
    "Legend and controls positioned to prevent overlap (both on right side)",
    "Settings panel moved to bottom-left for better layout balance"
  ],
  fixes: [
    "Eliminated graph re-rendering jitter on hover using ref-based state",
    "Graph settings and legend no longer overlap each other",
    "Proper z-indexing for all graph overlay elements"
  ],
  docs: [],
  refactor: [
    "Removed emoji icon rendering in favor of React component icons",
    "Replaced useState with useRef for hover tracking to prevent re-renders",
    "Created GraphNodeOverlay component for icon positioning",
    "GraphViewPage now uses AppLayout for consistent margins"
  ],
  tests: [],
  chores: []
}, {
  version: "1.6.3",
  date: "2025-10-18",
  features: [
    "Hover-to-view text labels - node labels only appear on hover for cleaner graph view",
    "Full entity names displayed without truncation when hovering",
    "Thought nodes show creation date (MMM d, yyyy) instead of content preview",
    "Collapsible legend - starts collapsed by default, expands on click with chevron indicator",
    "Lucide React icons in legend for all entity types"
  ],
  improvements: [
    "Design system conformance - all spacing uses 6-unit (1.5rem) increments",
    "Graph controls positioned at bottom-6 right-6 to respect design margins",
    "Legend positioned at top-6 left-6 with proper z-index to prevent overlap",
    "Graph View page uses proper container structure (max-w-7xl mx-auto p-6)",
    "Entity Details graph section adjusted to h-[400px] with muted background",
    "Enhanced hover states with clear visual feedback",
    "Better visual hierarchy with consistent spacing across all graph elements"
  ],
  fixes: [
    "Fixed legend blocking graph controls - proper positioning and z-index",
    "Fixed text truncation - full names now visible on hover",
    "Fixed thought preview showing content instead of useful date information"
  ],
  docs: [],
  refactor: [
    "Added hoveredNode state to ForceGraph2DWrapper for hover tracking",
    "Enhanced nodeCanvasObject to conditionally render text only on hover",
    "Updated GraphLegend with Collapsible component and defaultOpen={false}",
    "Improved graph container structure with proper card and border styling"
  ],
  tests: [],
  chores: [],
  maintenance: [
    "Imported date-fns format function for thought date formatting",
    "Updated all graph component positioning to use design system spacing"
  ]
}, {
  version: "1.6.2",
  date: "2025-10-17",
  features: [
    "Entity-centered graph view on entity detail pages - see immediate connections",
    "Custom node rendering with entity type icons and colors",
    "Visual relationship differentiation - solid violet for parent, dashed cyan for linked, gray for thoughts",
    "Directional arrows on parent relationships to show hierarchy",
    "Entity icons rendered as emoji glyphs inside colored circles",
    "Color-matched nodes using design system colors from entity badges"
  ],
  improvements: [
    "Enhanced graph legend showing relationship types (parent, linked, mention)",
    "Node sizing: center entity (largest) > related entities > thoughts (smallest)",
    "Scale-dependent labels - labels appear when zoomed in for clarity",
    "Improved click-to-navigate - works for both campaign and entity views",
    "Better visual hierarchy with relationship-specific link styles",
    "Entity detail page now includes embedded relationship graph"
  ],
  fixes: [
    "Fixed color inconsistency between graph nodes and entity badges",
    "Fixed relationship visualization - now clearly distinguishable"
  ],
  docs: [],
  refactor: [
    "Added relationshipType to GraphEdge and ForceGraphLink interfaces",
    "Created transformToEntityCenteredGraph() for focused entity views",
    "Created getIconGlyph() utility for node icon mapping",
    "Updated getNodeColor() to use design system colors",
    "Enhanced ForceGraph2DWrapper with mode prop (campaign|entity)",
    "Added nodeCanvasObject for custom node rendering with icons"
  ],
  tests: [],
  chores: [],
  maintenance: [
    "Updated GraphLegend with relationship type documentation",
    "Added lazy-loaded ForceGraph2DWrapper to EntityDetailsPage"
  ]
}, {
  version: "1.6.0",
  date: "2025-10-16",
  features: [
    "Migrated from reagraph to react-force-graph for stable, crash-free graph rendering",
    "Added sample data generator - view example campaign data when no entities/thoughts exist",
    "Export graph as PNG - save visual snapshots of your campaign relationships",
    "Interactive node navigation - click entities/thoughts to view their details",
    "Automatic sample data mode - try sample data with one click from empty campaigns"
  ],
  improvements: [
    "100% elimination of 'can't access property S' WebGL crashes",
    "Smoother force-directed graph layout with better performance",
    "Enhanced tooltips showing entity/thought details on hover",
    "Better zoom and pan controls with smooth animations",
    "Improved error recovery with 'Try Sample Data' and 'Switch to List View' options",
    "Reduced animation in Safe Mode for lower-end devices"
  ],
  fixes: [
    "Fixed persistent reagraph crashes by replacing with stable library",
    "Fixed empty graph crashes - now shows helpful prompts",
    "Fixed WebGL initialization errors",
    "Fixed graph controls not working on initialization"
  ],
  docs: [],
  refactor: [
    "Created ForceGraph2DWrapper component replacing EntityGraph",
    "Added transformToForceGraphData utility for react-force-graph compatibility",
    "Created graphSampleData utility for generating realistic test data",
    "Enhanced GraphControls with PNG export functionality",
    "Updated GraphErrorBoundary with better recovery options"
  ],
  tests: [],
  chores: [
    "Added react-force-graph dependency",
    "Removed reagraph dependency (scheduled for cleanup)"
  ],
  maintenance: [
    "Updated GraphViewPage with sample data integration",
    "Enhanced error boundary with fallback options",
    "Improved graph data transformation pipeline"
  ]
}, {
  version: "1.5.1",
  date: "2025-10-13",
  features: [
    "Safe Mode toggle - disable labels and animations for simpler graph rendering",
    "Mock Data injector - test with minimal 2-node graph for deterministic debugging",
    "WebGL detection with automatic fallback to Simple List view when unavailable",
    "Simple Graph List fallback - non-WebGL view showing all nodes and relationships"
  ],
  improvements: [
    "Container size validation logging to detect zero-size rendering issues",
    "Graph diagnostics panel showing node counts and WebGL availability",
    "Enhanced error boundary with Safe Mode suggestion",
    "Debug controls for graph troubleshooting (top-left of Graph View)"
  ],
  fixes: [
    "Reduced crash surface by making labels and animations optional",
    "Added WebGL feature detection to prevent crashes on unsupported browsers",
    "Better error messages directing users to Safe Mode for recovery"
  ],
  docs: [],
  refactor: [
    "Created webgl.ts utility for feature detection",
    "Created SimpleGraphList.tsx fallback component",
    "Enhanced EntityGraph with safeMode and mockData props"
  ],
  tests: [],
  chores: [],
  maintenance: [
    "Added container dimension logging for debugging",
    "Enhanced GraphViewPage with rendering options UI"
  ]
}, {
  version: "1.5.0",
  date: "2025-10-12",
  features: [
    "Comprehensive graph data validation before rendering",
    "Enhanced error boundary with debug info export and retry functionality"
  ],
  improvements: [
    "Removed progressive node rendering for stable reagraph initialization",
    "All nodes now render immediately to prevent WebGL state corruption",
    "Better loading states distinguishing data fetch vs graph render",
    "Graph controls gracefully disable when graph not ready",
    "Detailed validation logging for debugging graph issues"
  ],
  fixes: [
    "Fixed 'Cannot read properties of undefined' reagraph crash",
    "Fixed graph controls calling methods on null ref",
    "Fixed missing data validation causing corrupt data to reach GraphCanvas"
  ],
  docs: [],
  refactor: [
    "Simplified EntityGraph component by removing progressive rendering logic",
    "Added validateGraphData utility for pre-render validation"
  ],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.4.3",
  date: "2025-10-12",
  features: [],
  improvements: [
    "Retained progressive node pop-in animation for graph view (Obsidian-style)",
    "Enhanced graph diagnostics with layout and interpolation logging"
  ],
  fixes: [
    "Fixed reagraph crash by removing unsupported edgeInterpolation and layoutType props",
    "Added fallback data preview in error screens for better debugging"
  ],
  docs: [],
  refactor: [],
  tests: [],
  chores: [],
  maintenance: []
}, {
  version: "1.4.2",
  date: "2025-10-10",
  features: [
    "Plot Thread entities now support 'Active' attribute for tracking active/inactive storylines",
    "Plot Threads page defaults to showing Active threads only for better focus"
  ],
  improvements: [
    "Consistent Card-based layout for Plot Threads page matching other pages",
    "'New Plot Thread' button navigates to entity creation with type pre-selected",
    "Removed redundant stats card from Plot Threads page",
    "Enhanced plot thread filtering with attribute-based active status"
  ],
  fixes: [
    "Fixed visual inconsistency between Plot Threads page and other pages"
  ],
  docs: [],
  refactor: [
    "Updated plotThreadUtils to check 'Active' attribute with backward compatibility"
  ],
  tests: [],
  maintenance: []
}, {
  version: "1.4.1",
  date: "2025-10-09",
  features: [],
  improvements: [],
  fixes: [
    "Fixed reagraph WebGL color rendering - converted CSS variables to concrete hex colors",
    "Fixed potential empty node IDs causing graph rendering errors",
    "Fixed dangling edge references by validating both source and target nodes exist",
    "Added defensive validation for all entity relationships before edge creation"
  ],
  docs: [],
  refactor: [
    "Enhanced graph data transformation with comprehensive node/edge validation",
    "Added validNodeIds Set to prevent invalid edge references",
    "Added console warnings for filtered entities/thoughts with missing IDs"
  ],
  tests: [],
  maintenance: [
    "Updated graphDataTransform with concrete hex color palette for WebGL compatibility",
    "Improved graph reliability with defensive edge creation checks"
  ],
  chores: []
}, {
  version: "1.4.0",
  date: "2025-10-07",
  features: [
    "Plot Threads page - dedicated page for tracking campaign storylines by plot thread entities",
    "Graph View foundation - campaign-centric visualization showing all entities, thoughts, and relationships",
    "WebGL-powered graph rendering with reagraph for high performance with 100+ nodes",
    "Plot thread categorization - thoughts grouped by associated plot thread entities",
    "Interactive graph controls - zoom, pan, fit view, and reset functionality",
    "Campaign-centered graph layout - campaign at center, entities as nodes, thoughts as connections",
    "Graph legend system - color-coded entity types and relationship indicators"
  ],
  improvements: [
    "Added Plot Threads to main navigation for easy access",
    "Enhanced relationship visualization with force-directed graph layout",
    "Added active/dormant filtering for plot threads (active = mentioned in last 30 days)",
    "Added search functionality across plot threads and thought content",
    "Collapsible accordion UI for plot thread groups with metrics",
    "Color-coded entity types in graph view for better visual distinction",
    "Node sizing based on thought count for importance indication"
  ],
  fixes: [],
  docs: [
    "Updated DEVELOPMENT_RULES.md with graph visualization patterns and conventions",
    "Documented graph data transformation utilities and structure",
    "Added documentation for plot thread utilities and grouping logic"
  ],
  refactor: [
    "Created graph component architecture in src/components/graph/",
    "Extracted plot thread logic into dedicated utility module",
    "Implemented visited Set pattern to prevent infinite loops in graph traversal"
  ],
  tests: [],
  maintenance: [
    "Added reagraph dependency for WebGL graph rendering",
    "Created GraphViewPage.tsx with full-app graph visualization",
    "Created PlotThreadsPage.tsx with categorized storyline tracking"
  ],
  chores: []
}, {
  version: "1.3.6",
  date: "2025-10-06",
  features: [],
  improvements: [],
  fixes: [],
  docs: [
    "Updated DEVELOPMENT_RULES.md with current version (1.3.5)",
    "Added comprehensive FormControls component documentation to Design System page",
    "Documented all FormControls variants (default, compact) with interactive examples",
    "Added FormControls usage patterns and best practices to Design System"
  ],
  refactor: [],
  tests: [],
  maintenance: []
}, {
  version: "1.3.5",
  date: "2025-10-03",
  features: [
    "Quick entity creation from relationship selector - creates entities immediately when adding relationships"
  ],
  improvements: [
    "Standardized card and button layout across all forms for consistency",
    "Enhanced entity relationship selector with inline entity creation",
    "Improved visual hierarchy with forms having internal card wrappers",
    "Better separation of form content and form controls"
  ],
  fixes: [
    "Fixed 'Add new entity' button to actually create entities in entity forms",
    "Fixed inconsistent card wrapper placement between entity and thought forms"
  ],
  docs: [],
  refactor: [
    "Moved card wrappers from pages into form components",
    "Removed ref forwarding from EntityForm and EntityEditForm (no longer needed)",
    "Replaced command popover with TagSelector in EntityRelationshipSelector for better UX"
  ],
  tests: [],
  maintenance: []
}, {
  version: "1.3.4",
  date: "2025-10-03",
  features: [],
  improvements: [
    "Clarified 'Create Entity' button label to 'Add new entity' for accuracy",
    "Enhanced unsaved changes indicators with multiple visual cues",
    "Added browser tab title indicator (* prefix) for unsaved changes",
    "Added amber border to edit page cards when changes are unsaved",
    "Made unsaved changes dot larger and more prominent (h-3 w-3)",
    "Show unsaved changes indicator in compact mode (top of edit pages)",
    "Added visual ring enhancement to Save button when changes are unsaved"
  ],
  fixes: [
    "Fixed 'Create Entity' button misleading label in tag selector"
  ],
  docs: [],
  refactor: [],
  tests: [],
  maintenance: []
}, {
  version: "1.3.3",
  date: "2025-10-02",
  features: [],
  improvements: [
    "Added visible 'Save Thought' button to thought form for better discoverability",
    "Button shows clear visual feedback during save operation"
  ],
  fixes: [],
  docs: [],
  refactor: [],
  tests: [],
  maintenance: [
    "Updated ThoughtForm component with submit button"
  ]
}, {
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
