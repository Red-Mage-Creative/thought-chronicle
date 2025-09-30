import { Button } from '@/components/ui/button';

interface FormControlsProps {
  onSave: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isSaveDisabled: boolean;
  saveLabel: string;
  hasUnsavedChanges?: boolean;
  variant?: 'default' | 'compact';
}

export const FormControls = ({
  onSave,
  onCancel,
  isSubmitting,
  isSaveDisabled,
  saveLabel,
  hasUnsavedChanges = false,
  variant = 'default'
}: FormControlsProps) => {
  const isCompact = variant === 'compact';

  return (
    <div className={`flex gap-2 items-center ${isCompact ? 'justify-end' : 'justify-between'}`}>
      {!isCompact && (
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Press <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-muted rounded">Ctrl+S</kbd> to save
          </p>
          {hasUnsavedChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-600 dark:bg-amber-400 animate-pulse" />
              Unsaved changes
            </span>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" onClick={onSave} disabled={isSaveDisabled || isSubmitting}>
          {isSubmitting ? `${saveLabel.split(' ')[0]}ing...` : saveLabel}
        </Button>
      </div>
    </div>
  );
};
