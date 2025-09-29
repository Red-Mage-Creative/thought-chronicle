import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface EntitySearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

export const EntitySearch = ({ 
  searchTerm, 
  onSearchChange, 
  placeholder = "Search entities..." 
}: EntitySearchProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};