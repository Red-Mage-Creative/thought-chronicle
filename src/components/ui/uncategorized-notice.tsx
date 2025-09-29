import { Alert, AlertDescription } from './alert';
import { Button } from './button';
import { Info } from 'lucide-react';

interface UncategorizedNoticeProps {
  count: number;
  className?: string;
  onShowUncategorized?: () => void;
}

export const UncategorizedNotice = ({ count, className, onShowUncategorized }: UncategorizedNoticeProps) => {
  if (count === 0) return null;

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <Info className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700 flex items-center justify-between">
        <span>
          You have <strong>{count}</strong> uncategorized entit{count === 1 ? 'y' : 'ies'}. 
          These won't sync to your archive until categorized.
        </span>
        {onShowUncategorized && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShowUncategorized}
            className="ml-4 text-orange-600 border-orange-300 hover:bg-orange-100"
          >
            Show Uncategorized Entries
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};