import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { EntityAttribute, DefaultEntityAttribute } from '@/types/entities';

interface AttributeEditorProps {
  attributes: EntityAttribute[];
  onChange: (attributes: EntityAttribute[]) => void;
  defaultAttributes?: DefaultEntityAttribute[];
  disabled?: boolean;
}

export const AttributeEditor = ({ 
  attributes, 
  onChange, 
  defaultAttributes = [], 
  disabled = false 
}: AttributeEditorProps) => {
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleAdd = () => {
    if (!newKey.trim()) return;
    
    const newAttribute: EntityAttribute = {
      key: newKey.trim(),
      value: newValue.trim()
    };
    
    onChange([...attributes, newAttribute]);
    setNewKey('');
    setNewValue('');
  };

  const handleRemove = (index: number) => {
    onChange(attributes.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...attributes];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const isRequired = (key: string) => {
    return defaultAttributes.some(
      attr => attr.key.toLowerCase() === key.toLowerCase() && attr.required
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Attributes</Label>
        
        {/* Existing attributes */}
        {attributes.length > 0 && (
          <div className="space-y-2">
            {attributes.map((attr, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Input
                      value={attr.key}
                      onChange={(e) => handleUpdate(index, 'key', e.target.value)}
                      placeholder="Key"
                      disabled={disabled}
                      className="h-9"
                    />
                    {isRequired(attr.key) && (
                      <Badge variant="secondary" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <Input
                    value={attr.value}
                    onChange={(e) => handleUpdate(index, 'value', e.target.value)}
                    placeholder="Value"
                    disabled={disabled}
                    className="h-9"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="h-9 w-9 shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Add new attribute */}
        <div className="flex items-end gap-2 pt-2">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-attr-key" className="text-xs text-muted-foreground">
                Key
              </Label>
              <Input
                id="new-attr-key"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g., Height"
                disabled={disabled}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-attr-value" className="text-xs text-muted-foreground">
                Value
              </Label>
              <Input
                id="new-attr-value"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g., 6'0"
                disabled={disabled}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd();
                  }
                }}
              />
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAdd}
            disabled={disabled || !newKey.trim()}
            className="h-9 w-9 shrink-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Show required attributes hint */}
        {defaultAttributes.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {defaultAttributes.filter(a => a.required).length > 0 ? (
              <>Required attributes: {defaultAttributes.filter(a => a.required).map(a => a.key).join(', ')}</>
            ) : (
              <>No required attributes for this entity type</>
            )}
          </p>
        )}
      </div>
    </div>
  );
};
