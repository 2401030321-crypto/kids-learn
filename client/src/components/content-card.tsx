import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";
import type { Content } from "@shared/schema";

interface ContentCardProps {
  item: Content;
  onClick?: () => void;
}

export function ContentCard({ item, onClick }: ContentCardProps) {
  return (
    <Card 
      className="overflow-hidden kids-card-hover cursor-pointer border-2 border-muted" 
      onClick={onClick}
      data-testid={`card-content-${item.id}`}
    >
      <div className="relative aspect-video">
        <img 
          src={item.thumbnailUrl} 
          alt={item.title}
          className="object-cover w-full h-full"
        />
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="fill-primary text-primary w-6 h-6 ml-1" />
          </div>
        </div>
        <Badge className="absolute top-2 right-2 capitalize" variant="secondary">
          {item.type}
        </Badge>
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg line-clamp-1" data-testid={`text-title-${item.id}`}>{item.title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.description}</p>
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0 flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground">
          {item.likes?.toLocaleString()} likes
        </span>
      </CardFooter>
    </Card>
  );
}
