import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar, User, Users, Home, IndianRupee } from "lucide-react";

interface Banquet {
  id: string;
  name: string;
  city: string;
  capacity: number;
  basePrice: number;
}

interface QuoteData {
  clientName: string;
  eventDate: string;
  pricePerPlate: number;
  guests: number;
  rooms: number;
  notes: string;
}

interface QuoteFormProps {
  banquet: Banquet;
  onNext: (data: QuoteData) => void;
}

export const QuoteForm = ({ banquet, onNext }: QuoteFormProps) => {
  const [formData, setFormData] = useState<QuoteData>({
    clientName: "",
    eventDate: "",
    pricePerPlate: banquet.basePrice,
    guests: 100,
    rooms: 1,
    notes: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientName && formData.eventDate && formData.pricePerPlate && formData.guests) {
      onNext(formData);
    }
  };

  const total = formData.pricePerPlate * formData.guests;

  return (
    <Card className="p-8 bg-card border border-border shadow-elegant animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Create Quotation</h2>
        <p className="text-muted-foreground">for {banquet.name}, {banquet.city}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="flex items-center text-foreground">
              <User className="h-4 w-4 mr-2" />
              Client Name *
            </Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Enter client name"
              required
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventDate" className="flex items-center text-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Event Date *
            </Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              required
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pricePerPlate" className="flex items-center text-foreground">
              <IndianRupee className="h-4 w-4 mr-2" />
              Price per Plate *
            </Label>
            <Input
              id="pricePerPlate"
              type="number"
              value={formData.pricePerPlate}
              onChange={(e) => setFormData({ ...formData, pricePerPlate: parseInt(e.target.value) || 0 })}
              min="1"
              required
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center text-foreground">
              <Users className="h-4 w-4 mr-2" />
              Number of Guests *
            </Label>
            <Input
              id="guests"
              type="number"
              value={formData.guests}
              onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 0 })}
              min="1"
              max={banquet.capacity}
              required
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rooms" className="flex items-center text-foreground">
              <Home className="h-4 w-4 mr-2" />
              Rooms Required
            </Label>
            <Input
              id="rooms"
              type="number"
              value={formData.rooms}
              onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) || 0 })}
              min="0"
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-foreground">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Any special requirements or notes..."
            className="min-h-[100px] border-border focus:ring-primary"
          />
        </div>

        <div className="bg-accent/50 p-4 rounded-lg">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-foreground">Estimated Total:</span>
            <span className="font-bold text-primary text-2xl">₹{total.toLocaleString()}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {formData.guests} guests × ₹{formData.pricePerPlate} per plate
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full h-14 text-lg bg-gradient-primary hover:shadow-glow transition-all duration-300"
        >
          Continue to Image Selection
        </Button>
      </form>
    </Card>
  );
};