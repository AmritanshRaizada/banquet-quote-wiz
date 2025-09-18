import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, User, Plus, Trash2, IndianRupee } from "lucide-react";

interface Banquet {
  id: string;
  name: string;
  city: string;
  capacity: number;
  basePrice: number;
}

interface Service {
  description: string;
  pax: number;
  price: number;
}

interface QuoteData {
  clientName: string;
  venueName: string;
  eventDate: string;
  services: Service[];
  notes: string;
  gstIncluded: boolean;
  gstPercentage: number;
}

interface QuoteFormProps {
  banquet: Banquet;
  onNext: (data: QuoteData) => void;
}

export const QuoteForm = ({ banquet, onNext }: QuoteFormProps) => {
  const [formData, setFormData] = useState<QuoteData>({
    clientName: "",
    venueName: "",
    eventDate: "",
    services: [
      {
        description: "Banquet per plate",
        pax: 100,
        price: banquet.basePrice
      }
    ],
    notes: "",
    gstIncluded: false,
    gstPercentage: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientName && formData.venueName && formData.eventDate && formData.services.length > 0) {
      const hasValidServices = formData.services.every(service => 
        service.description.trim() && service.pax > 0 && service.price > 0
      );
      if (hasValidServices) {
        onNext(formData);
      }
    }
  };

  const addService = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { description: "", pax: 1, price: 0 }
      ]
    });
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData({
        ...formData,
        services: formData.services.filter((_, i) => i !== index)
      });
    }
  };

  const updateService = (index: number, field: keyof Service, value: string | number) => {
    const updatedServices = formData.services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setFormData({ ...formData, services: updatedServices });
  };

  const subtotal = formData.services.reduce((sum, service) => sum + (service.pax * service.price), 0);
  const gstAmount = formData.gstIncluded ? (subtotal * formData.gstPercentage) / 100 : 0;
  const total = subtotal + gstAmount;

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
            <Label htmlFor="venueName" className="flex items-center text-foreground">
              <User className="h-4 w-4 mr-2" />
              Venue Name *
            </Label>
            <Input
              id="venueName"
              value={formData.venueName}
              onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              placeholder="Enter venue name"
              required
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>
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

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-foreground font-semibold">Services & Pricing</Label>
            <Button 
              type="button" 
              onClick={addService}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>

          {formData.services.map((service, index) => (
            <Card key={index} className="p-4 bg-accent/30">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-2 space-y-2">
                  <Label>Description of Service *</Label>
                  <Input
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    placeholder="e.g., Banquet per plate, Photography, Decoration"
                    required
                    className="border-border focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Number of PAX *</Label>
                  <Input
                    type="number"
                    value={service.pax}
                    onChange={(e) => updateService(index, 'pax', parseInt(e.target.value) || 0)}
                    min="1"
                    required
                    className="border-border focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Price *</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={service.price}
                      onChange={(e) => updateService(index, 'price', parseInt(e.target.value) || 0)}
                      min="0"
                      required
                      className="border-border focus:ring-primary"
                    />
                    {formData.services.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeService(index)}
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-right">
                <span className="text-sm text-muted-foreground">
                  Subtotal: ₹{(service.pax * service.price).toLocaleString()}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="gstIncluded"
            checked={formData.gstIncluded}
            onCheckedChange={(checked) => setFormData({ ...formData, gstIncluded: !!checked })}
          />
          <Label htmlFor="gstIncluded" className="text-foreground">GST% INCLUDED</Label>
        </div>

        {formData.gstIncluded && (
          <div className="space-y-2 mb-4">
            <Label htmlFor="gstPercentage" className="text-foreground">GST Percentage</Label>
            <Input
              id="gstPercentage"
              type="number"
              value={formData.gstPercentage}
              onChange={(e) => setFormData({ ...formData, gstPercentage: parseFloat(e.target.value) || 0 })}
              min="0"
              max="100"
              placeholder="Enter GST percentage"
              className="border-border focus:ring-primary"
            />
          </div>
        )}

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
          <div className="text-sm text-muted-foreground mt-2 space-y-1">
            {formData.services.map((service, index) => (
              <div key={index} className="flex justify-between">
                <span>{service.description || `Service ${index + 1}`}:</span>
                <span>{service.pax} × ₹{service.price} = ₹{(service.pax * service.price).toLocaleString()}</span>
              </div>
            ))}
            {formData.gstIncluded && (
              <div className="flex justify-between font-medium text-foreground">
                <span>GST ({formData.gstPercentage}%):</span>
                <span>₹{gstAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
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
