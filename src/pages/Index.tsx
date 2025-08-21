import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BanquetCard } from "@/components/ui/BanquetCard";
import { QuoteForm } from "@/components/ui/QuoteForm";
import { ImageSelector } from "@/components/ui/ImageSelector";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import { Search, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/shaadi-platform-logo.png";

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

const BANQUETS: Banquet[] = [
  { id: "1", name: "Royal Palace Banquet", city: "Delhi", capacity: 300, basePrice: 1200 },
  { id: "2", name: "Emerald Hall", city: "Mumbai", capacity: 250, basePrice: 1400 },
  { id: "3", name: "Grand Orchid", city: "Jaipur", capacity: 400, basePrice: 1500 },
  { id: "4", name: "Imperial Gardens", city: "Bangalore", capacity: 350, basePrice: 1300 },
  { id: "5", name: "Majestic Manor", city: "Chennai", capacity: 280, basePrice: 1250 },
  { id: "6", name: "Golden Palace", city: "Hyderabad", capacity: 320, basePrice: 1350 }
];

type Step = 'search' | 'form' | 'images';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBanquet, setSelectedBanquet] = useState<Banquet | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const { toast } = useToast();

  const filteredBanquets = BANQUETS.filter(banquet =>
    banquet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    banquet.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBanquetSelect = (banquet: Banquet) => {
    setSelectedBanquet(banquet);
    setCurrentStep('form');
  };

  const handleFormSubmit = (data: QuoteData) => {
    setQuoteData(data);
    setCurrentStep('images');
  };

  const handleGeneratePDF = async (selectedImages: string[]) => {
    if (selectedBanquet && quoteData) {
      try {
        await generateQuotationPDF(selectedBanquet, quoteData, selectedImages);
        toast({
          title: "PDF Generated Successfully!",
          description: "Your quotation has been downloaded.",
        });
      } catch (error) {
        toast({
          title: "Error generating PDF",
          description: "Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const resetToSearch = () => {
    setCurrentStep('search');
    setSelectedBanquet(null);
    setQuoteData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/20">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground shadow-elegant">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={logo} alt="Shaadi Platform Logo" className="h-8 w-8" />
              <h1 className="text-2xl md:text-3xl font-bold">Banquet Quotation Maker</h1>
            </div>
            {currentStep !== 'search' && (
              <Button 
                variant="secondary"
                onClick={resetToSearch}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search Step */}
        {currentStep === 'search' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Find Your Perfect Banquet Venue
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Search from our curated selection of premium banquet halls and create professional quotations in minutes.
              </p>
            </div>

            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  placeholder="Search banquets by name or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-16 text-lg border-border focus:ring-primary shadow-elegant"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanquets.map((banquet) => (
                <div key={banquet.id} className="animate-slide-up">
                  <BanquetCard
                    banquet={banquet}
                    onSelect={handleBanquetSelect}
                  />
                </div>
              ))}
            </div>

            {filteredBanquets.length === 0 && searchQuery && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">
                  No banquets found matching "{searchQuery}"
                </p>
                <p className="text-muted-foreground mt-2">
                  Try searching with different keywords
                </p>
              </div>
            )}
          </div>
        )}

        {/* Form Step */}
        {currentStep === 'form' && selectedBanquet && (
          <div className="max-w-4xl mx-auto">
            <QuoteForm
              banquet={selectedBanquet}
              onNext={handleFormSubmit}
            />
          </div>
        )}

        {/* Images Step */}
        {currentStep === 'images' && selectedBanquet && (
          <div className="max-w-4xl mx-auto">
            <ImageSelector
              banquetName={selectedBanquet.name}
              city={selectedBanquet.city}
              onImagesSelected={handleGeneratePDF}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted text-muted-foreground py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Banquet Quotation Maker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
