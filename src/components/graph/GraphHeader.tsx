import { Button } from '@/components/ui/button';
import { Campaign } from '@/types/campaigns';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GraphHeaderProps {
  campaign: Campaign | null;
}

export const GraphHeader = ({ campaign }: GraphHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur border-b border-border">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/entities')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit Graph View
          </Button>
          
          {campaign && (
            <div className="text-sm">
              <span className="text-muted-foreground">Campaign:</span>
              <span className="ml-2 font-medium">{campaign.name}</span>
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/settings')}
        >
          Settings
        </Button>
      </div>
    </header>
  );
};
