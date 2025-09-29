import { Card, CardContent } from "@/components/ui/card";
import { Brain, Users, Calendar } from "lucide-react";

import { LocalThought } from '@/types/thoughts';

interface StatsCardProps {
  thoughts: LocalThought[];
}

export const StatsCard = ({ thoughts }: StatsCardProps) => {
  const totalThoughts = thoughts.length;
  const uniqueEntities = new Set(thoughts.flatMap(t => t.relatedEntities)).size;
  const recentThoughts = thoughts.filter(
    t => Date.now() - t.timestamp.getTime() < 24 * 60 * 60 * 1000
  ).length;

  return (
    <Card className="mb-6 bg-card/50 border-border/50">
      <CardContent className="p-6 pt-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xl font-semibold text-foreground">{totalThoughts}</div>
              <div className="text-xs text-muted-foreground">Total Thoughts</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xl font-semibold text-foreground">{uniqueEntities}</div>
              <div className="text-xs text-muted-foreground">Unique Entities</div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <div className="text-xl font-semibold text-foreground">{recentThoughts}</div>
              <div className="text-xs text-muted-foreground">Last 24h</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};