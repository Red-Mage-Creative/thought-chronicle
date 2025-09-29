import { Alert, AlertDescription } from './alert';
import { HelpCircle, Info } from 'lucide-react';

interface UncategorizedNoticeProps {
  count: number;
  className?: string;
}

export const UncategorizedNotice = ({ count, className }: UncategorizedNoticeProps) => {
  if (count === 0) return null;

  return (
    <Alert className={`border-orange-200 bg-orange-50 ${className}`}>
      <Info className="h-4 w-4 text-orange-600" />
      <AlertDescription className="text-orange-700">
        You have <strong>{count}</strong> uncategorized entit{count === 1 ? 'y' : 'ies'}. 
        These won't sync to your archive until categorized. Use the "Categorize" button to assign proper types.
      </AlertDescription>
    </Alert>
  );
};