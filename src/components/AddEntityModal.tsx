import { useState } from "react";
import { Users, MapPin, Package, Shield, Scroll, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { localStorageService } from "@/services/localStorageService";

interface AddEntityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEntityAdded: () => void;
}

const entityTypes = [
  { value: "character", label: "Character", icon: Users },
  { value: "npc", label: "NPC", icon: Users },
  { value: "location", label: "Location", icon: MapPin },
  { value: "item", label: "Item", icon: Package },
  { value: "organization", label: "Organization", icon: Shield },
  { value: "other", label: "Other", icon: Scroll },
];

export const AddEntityModal = ({ open, onOpenChange, onEntityAdded }: AddEntityModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !type) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check for duplicate entities (case-insensitive)
    const data = localStorageService.getData();
    const existingEntity = data.entities.find(entity => 
      entity.name.toLowerCase() === name.trim().toLowerCase()
    );
    
    if (existingEntity) {
      toast.error(`Entity "${name}" already exists in the registry`);
      return;
    }

    setIsSubmitting(true);
    try {
      const entityData = {
        name: name.trim(),
        type,
        description: description.trim() || undefined,
        lastMentioned: new Date(),
        count: 0
      };

      localStorageService.addEntity(entityData);
      toast.success(`${name} has been added to the Entity Registry`);
      
      // Reset form
      setName("");
      setType("");
      setDescription("");
      onEntityAdded();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to add entity");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setType("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5 text-primary" />
            <DialogTitle>Add New Entity</DialogTitle>
          </div>
          <DialogDescription>
            Create a new entity for your campaign. This will be added to your Entity Registry.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Entity Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Gandalf, Waterdeep, Sword of Power"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Entity Type *</Label>
            <Select value={type} onValueChange={setType} required>
              <SelectTrigger>
                <SelectValue placeholder="Select entity type" />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.map((entityType) => {
                  const Icon = entityType.icon;
                  return (
                    <SelectItem key={entityType.value} value={entityType.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {entityType.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this entity..."
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Entity"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};