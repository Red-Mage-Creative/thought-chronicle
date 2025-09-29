import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  version: "1.1.0",
  date: "2025-09-29",
  features: ["Enhanced entity tags with type-specific icons in thought list", "Clickable entity tags with navigation to entity details page"],
  improvements: ["Added visual feedback with hover effects on entity tags", "Improved entity type recognition using smart inference patterns"],
  fixes: [],
  docs: ["Added comprehensive Rule 4: Testing Standards & Integrity to development guidelines", "Established strict no-spoofed-tests policy with real testing requirements"],
  maintenance: ["Major tech debt refactoring - removed all debug logging from production code", "Fixed TypeScript type safety issues (removed 'any' types)", "Standardized error handling patterns across all services", "Updated version consistency between AppFooter and ChangelogPage", "Optimized function lengths and improved code clarity", "Enhanced DesignSystemPage documentation with entity tag improvements"],
  tests: ["Added comprehensive testing infrastructure with Vitest and React Testing Library", "Created unit tests for entityUtils with 100% coverage of core functions", "Implemented formatter utility tests with real-time mocking", "Added integration tests for businessLogicService with proper mocking patterns", "Created hook tests for useEntities with async behavior validation", "Established test setup with localStorage and DOM mocking", "Configured testing environment with proper TypeScript support"]
}, {
  version: "1.0.0",
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
  return <div className="space-y-3">
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
        {items.map((item, index) => <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
            <span className="text-muted-foreground mt-1.5 text-xs">•</span>
            <span>{item}</span>
          </li>)}
      </ul>
    </div>;
};
export default function ChangelogPage() {
  return <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Changelog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track all updates, improvements, and changes to D&D Chronicle following conventional commit standards.
          </p>
        </div>

        {/* Changelog Entries */}
        <div className="space-y-8">
          {changelog.map((entry, index) => <Card key={entry.version} className={index === 0 ? "border-primary" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
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
              <CardContent className="space-y-6">
                <CommitSection type="features" items={entry.features} />
                
                {entry.improvements && entry.improvements.length > 0 && <>
                    <Separator />
                    <CommitSection type="improvements" items={entry.improvements} />
                  </>}
                
                {entry.fixes && entry.fixes.length > 0 && <>
                    <Separator />
                    <CommitSection type="fixes" items={entry.fixes} />
                  </>}
                
                {entry.docs && entry.docs.length > 0 && <>
                    <Separator />
                    <CommitSection type="docs" items={entry.docs} />
                  </>}
                
                {entry.refactor && entry.refactor.length > 0 && <>
                    <Separator />
                    <CommitSection type="refactor" items={entry.refactor} />
                  </>}
                
                {entry.tests && entry.tests.length > 0 && <>
                    <Separator />
                    <CommitSection type="tests" items={entry.tests} />
                  </>}
                
                {entry.chores && entry.chores.length > 0 && <>
                    <Separator />
                    <CommitSection type="chores" items={entry.chores} />
                  </>}
              </CardContent>
            </Card>)}
        </div>

        {/* Footer Note */}
        
      </div>
    </div>;
}