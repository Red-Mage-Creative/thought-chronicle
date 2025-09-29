import React, { useState } from 'react';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { ENTITY_TYPES } from '@/utils/constants';
import { getEntityIcon } from '@/utils/entityUtils';
import { EntityType } from '@/types/entities';
import { capitalize } from '@/utils/formatters';

interface EntityCategorizeProps {
  entityName: string;
  currentType: EntityType;
  onCategorize: (newType: EntityType) => void;
  size?: 'sm' | 'default';
}

export const EntityCategorize = ({ 
  entityName, 
  currentType, 
  onCategorize, 
  size = 'sm' 
}: EntityCategorizeProps) => {
  const [selectedType, setSelectedType] = useState<EntityType>(currentType);
  const [isOpen, setIsOpen] = useState(false);

  const availableTypes = Object.values(ENTITY_TYPES).filter(type => type !== 'uncategorized');

  const handleCategorize = () => {
    if (selectedType && selectedType !== currentType) {
      onCategorize(selectedType);
      setIsOpen(false);
    }
  };

  if (currentType !== 'uncategorized') {
    return null;
  }

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={() => setIsOpen(true)}
        className="text-orange-600 border-orange-300 hover:bg-orange-50"
      >
        Categorize
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedType} onValueChange={(value) => setSelectedType(value as EntityType)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Choose type" />
        </SelectTrigger>
        <SelectContent>
          {availableTypes.map((type) => {
            const Icon = getEntityIcon(type);
            return (
              <SelectItem key={type} value={type}>
                <div className="flex items-center gap-2">
                  <Icon className="h-3 w-3" />
                  {capitalize(type)}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <Button size={size} onClick={handleCategorize} disabled={!selectedType || selectedType === currentType}>
        Save
      </Button>
      <Button variant="outline" size={size} onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
    </div>
  );
};