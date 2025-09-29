import { Button } from '@/components/ui/button';
import { getEntityIcon } from '@/utils/entityUtils';
import { capitalize } from '@/utils/formatters';

interface EntityFiltersProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
  entityCounts: Record<string, number>;
}

export const EntityFilters = ({ 
  selectedType, 
  onTypeChange, 
  entityCounts
}: EntityFiltersProps) => {
  const uniqueTypes = Object.keys(entityCounts);
  const totalCount = Object.values(entityCounts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedType === null ? "default" : "outline"}
        size="sm"
        onClick={() => onTypeChange(null)}
      >
        All ({totalCount})
      </Button>
      {uniqueTypes.map((type) => {
        const count = entityCounts[type];
        const Icon = getEntityIcon(type);
        return (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(type)}
            className="capitalize"
          >
            <Icon className="h-3 w-3 mr-1" />
            {capitalize(type)} ({count})
          </Button>
        );
      })}
    </div>
  );
};