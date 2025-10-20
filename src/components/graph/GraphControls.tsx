import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, Download } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onReset: () => void;
  onExportPNG?: () => void;
  disabled?: boolean;
}

export const GraphControls = ({ onZoomIn, onZoomOut, onFitView, onReset, onExportPNG, disabled = false }: GraphControlsProps) => {
  return (
    <TooltipProvider>
      <Card className="absolute bottom-6 right-4 z-20 bg-card/95 backdrop-blur-sm shadow-lg">
        <div className="flex flex-col gap-1 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={onZoomIn} disabled={disabled}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {disabled ? 'Graph loading...' : 'Zoom In'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={onZoomOut} disabled={disabled}>
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {disabled ? 'Graph loading...' : 'Zoom Out'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={onFitView} disabled={disabled}>
                <Maximize className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {disabled ? 'Graph loading...' : 'Fit View'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={onReset} disabled={disabled}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {disabled ? 'Graph loading...' : 'Reset View'}
            </TooltipContent>
          </Tooltip>

          {onExportPNG && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10" onClick={onExportPNG} disabled={disabled}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                {disabled ? 'Graph loading...' : 'Export as PNG'}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
};
