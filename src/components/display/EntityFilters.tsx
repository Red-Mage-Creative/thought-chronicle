import { Button } from '@/components/ui/button';
import { getEntityIcon } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';

interface EntityFiltersProps {
  selectedType: string;
  onTypeChange: (type: string) => void;
  entityCounts: Record<string, number>;
  totalCount: number;
}

export const EntityFilters = ({ 
  selectedType, 
  onTypeChange, 
  entityCounts, 
  totalCount 
}: EntityFiltersProps) => {
  const uniqueTypes = Object.keys(entityCounts);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedType === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onTypeChange("all")}
      >
        All ({totalCount})
      </Button>
      {uniqueTypes.map((type) => {
        const count = entityCounts[type];
        const Icon = getEntityIcon(type);
        const isUncategorized = type === 'uncategorized';
        return (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(type)}
            className={`capitalize ${isUncategorized ? 'text-orange-600 border-orange-300 hover:bg-orange-50' : ''}`}
          >
            <Icon className="h-3 w-3 mr-1" />
            {capitalize(type)} ({count})
          </Button>
        );
      })}
    </div>
  );
};