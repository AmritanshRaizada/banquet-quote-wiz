import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users } from "lucide-react";

interface Banquet {
  id: string;
  name: string;
  city: string;
  capacity: number;
  basePrice: number;
}

interface BanquetCardProps {
  banquet: Banquet;
  onSelect: (banquet: Banquet) => void;
}

export const BanquetCard = ({ banquet, onSelect }: BanquetCardProps) => {
  return (
    <Card className="p-6 hover:shadow-elegant transition-all duration-300 hover:scale-[1.02] bg-card border border-border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-2">{banquet.name}</h3>
          <div className="flex items-center text-muted-foreground mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{banquet.city}</span>
          </div>
         
        </div>
       
      </div>
      <Button 
        onClick={() => onSelect(banquet)}
        className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
      >
        Select This Venue
      </Button>
    </Card>
  );
};