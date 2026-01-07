import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, User, Plus, Trash2, IndianRupee, Save } from "lucide-react";

export type BrandType = 'shaadi' | 'nosh';

interface Banquet {
  id: string;
  name: string;
  city: string;
  capacity: number;
  basePrice: number;
}

interface Service {
  description: string;
  remarks: string;
  pax: number;
  price: number;
  gstPercentage: number;   // 👈 per-service GST
  excludeGst: boolean;
}


interface QuoteData {
  clientName: string;
  venueName: string;
  location: string;
  startDate: string;
  endDate: string;
  services: Service[];
  notes: string;
  nonInclusiveItems: string;
  discountAmount?: number;
  brandType: BrandType;
}

interface QuoteFormProps {
  banquet: Banquet;
  onNext: (data: QuoteData) => void;
  onSave?: (data: QuoteData) => void;
  isSaving?: boolean;
  isEditing?: boolean;
  initialData?: QuoteData;
}

export const QuoteForm = ({ banquet, onNext, onSave, isSaving, isEditing, initialData }: QuoteFormProps) => {
  const [formData, setFormData] = useState<QuoteData>(initialData || {
    clientName: "",
    venueName: "",
    location: "",
    startDate: "",
    endDate: "",
    services: [
  {
    description: "Banquet per plate",
    remarks: "",
    pax: 100,
    price: banquet.basePrice,
    gstPercentage: 18, // default GST
    excludeGst: false
  }
],

    notes: "",
    nonInclusiveItems: `Dj and Decor Extra.
Liquor will be on actually.
Extra - PPL, IPRS, Novex and Liquor License , RMPL,
ISRA licenses & Special Venue charges Will be Extra as
per Government Policy.
VENUE TIME RESTRICTIONS- Should you have a
function at any outdoor venue music played
will have to be discontinued at 2230 hrs strictly.
SFX will Be Extra if Required.
Hi-Tea Chaat and Fruits Counter is Extra.
Any Kind of Artist or Entry Artist Will be Extra if required.
Makeup Artist and Photographer - Food, Stay and Travel
Expenses provided by Client.
Management fee will be applicable over and above the
package. The same will be discussed and finalized during
the meeting.`,
    discountAmount: 0,
    brandType: 'shaadi'
  });

  // Update form when initialData changes (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientName && formData.venueName && formData.location && formData.startDate && formData.endDate && formData.services.length > 0) {
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
        {
  description: "",
  remarks: "",
  pax: 1,
  price: 0,
  gstPercentage: 18,
  excludeGst: false
}
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

  const updateService = (index: number, field: keyof Service, value: string | number | boolean) => {
    const updatedServices = formData.services.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setFormData({ ...formData, services: updatedServices });
  };

 const serviceTotals = formData.services.map((service) => {
  const baseAmount = service.pax * service.price;
  const gstAmount = service.excludeGst
    ? 0
    : (baseAmount * service.gstPercentage) / 100;

  return { baseAmount, gstAmount };
});

const subtotal = serviceTotals.reduce((sum, s) => sum + s.baseAmount, 0);
const totalGst = serviceTotals.reduce((sum, s) => sum + s.gstAmount, 0);
const discountAmount = formData.discountAmount || 0;

const total = subtotal + totalGst - discountAmount;


  return (
    <div className="w-full flex justify-center px-4 py-8">
    <div className="w-full max-w-5xl">
    <Card className="p-8 bg-card border border-border shadow-elegant animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Create Quotation</h2>
        <p className="text-muted-foreground">for {banquet.name}, {banquet.city}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <Label className="text-foreground font-semibold">Brand for PDF</Label>
          <RadioGroup
            value={formData.brandType}
            onValueChange={(value: BrandType) => setFormData({ ...formData, brandType: value })}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="shaadi" id="brand-shaadi" />
              <Label htmlFor="brand-shaadi" className="cursor-pointer">
                Shaadi Platform <span className="text-muted-foreground text-sm">(By Nosh n Shots)</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="nosh" id="brand-nosh" />
              <Label htmlFor="brand-nosh" className="cursor-pointer">
                Nosh n Shots
              </Label>
            </div>
          </RadioGroup>
        </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center text-foreground">
              <User className="h-4 w-4 mr-2" />
              Location *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location/address"
              required
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startDate" className="flex items-center text-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              Start Date *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="endDate" className="flex items-center text-foreground">
              <Calendar className="h-4 w-4 mr-2" />
              End Date *
            </Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
              min={formData.startDate}
              className="h-12 text-lg border-border focus:ring-primary"
            />
          </div>
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <div className="md:col-span-2 space-y-2">
                  <Label>Description of Service *</Label>
                  <Input
                    value={service.description}
                    onChange={(e) => updateService(index, 'description', e.target.value)}
                    placeholder="e.g., Banquet per plate, Photography, Decoration"
                    required
                    className="border-border focus:ring-primary"
                  />
                  <Input
                    value={service.remarks}
                    onChange={(e) => updateService(index, 'remarks', e.target.value)}
                    placeholder="Remarks (optional)"
                    className="border-border focus:ring-primary mt-2"
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
                <div className="space-y-2">
  <Label>GST %</Label>
  <Input
    type="number"
    value={service.gstPercentage}
    onChange={(e) =>
      updateService(index, "gstPercentage", parseFloat(e.target.value) || 0)
    }
    min="0"
    max="100"
    className="border-border focus:ring-primary"
  />
</div>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`excludeGst-${index}`}
                    checked={service.excludeGst}
                    onCheckedChange={(checked) => updateService(index, 'excludeGst', !!checked)}
                  />
                  <Label htmlFor={`excludeGst-${index}`} className="text-sm text-muted-foreground">
                    Exclude GST
                  </Label>
                </div>
                <span className="text-sm text-muted-foreground">
                  Subtotal: ₹{(service.pax * service.price).toLocaleString()}
{!service.excludeGst && ` + GST`}
                </span>
              </div>
            </Card>
            
          ))}
        </div>

        

        

        <div className="space-y-2 mb-4">
          <Label htmlFor="discountAmount" className="flex items-center text-foreground">
            <IndianRupee className="h-4 w-4 mr-2" />
            Discount Amount
          </Label>
          <Input
            id="discountAmount"
            type="number"
            value={formData.discountAmount}
            onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
            min="0"
            placeholder="Enter discount amount"
            className="h-12 text-lg border-border focus:ring-primary"
          />
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

        <div className="space-y-2">
          <Label htmlFor="nonInclusiveItems" className="text-foreground">Non-Inclusive Items</Label>
          <Textarea
            id="nonInclusiveItems"
            value={formData.nonInclusiveItems}
            onChange={(e) => setFormData({ ...formData, nonInclusiveItems: e.target.value })}
            placeholder="Items not included in this quotation..."
            className="min-h-[100px] border-border focus:ring-primary"
          />
        </div>

        <div className="bg-accent/50 p-4 rounded-lg">
          <div className="flex justify-between items-center text-lg">
            <span className="font-medium text-foreground">Estimated Total:</span>
            <span className="font-bold text-primary text-2xl">₹{total.toLocaleString()}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-2 space-y-1">
           {formData.services.map((service, index) => {
  const base = service.pax * service.price;
  const gst = service.excludeGst ? 0 : (base * service.gstPercentage) / 100;

  return (
    <div key={index} className="flex justify-between">
      <span>{service.description || `Service ${index + 1}`}:</span>
      <span>
        ₹{base.toLocaleString()}
        {!service.excludeGst && ` + GST ₹${gst.toLocaleString()}`}
      </span>
    </div>
  );
})}
<div className="flex justify-between font-medium text-foreground">
  <span>Total GST:</span>
  <span>₹{totalGst.toLocaleString()}</span>
</div>

            
            {discountAmount > 0 && (
              <div className="flex justify-between font-medium text-foreground">
                <span>Discount:</span>
                <span>-₹{discountAmount.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-4">
          {onSave && (
            <Button 
              type="button"
              onClick={() => onSave(formData)}
              disabled={isSaving || !formData.clientName || !formData.venueName || !formData.location || !formData.startDate || !formData.endDate}
              variant="outline"
              className="flex-1 h-14 text-lg border-primary text-primary hover:bg-primary/10"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaving ? 'Saving...' : (isEditing ? 'Update Quotation' : 'Save to DB')}
            </Button>
          )}
          <Button 
            type="submit" 
            className="flex-1 h-14 text-lg bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            Continue to Image Selection
          </Button>
        </div>
      </form>
    </Card>
    </div>
    </div>
  );
};
