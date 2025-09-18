import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuoteForm } from "./components/ui/QuoteForm";
import { ImageSelector } from "./components/ui/ImageSelector";
import { generateQuotationPDF, QuoteData, Banquet } from "./utils/pdfGenerator"; // Import QuoteData and Banquet
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useToast } from "./hooks/use-toast";
import { useState } from "react"; // Keep useState for QuoteFlow

const queryClient = new QueryClient();

const QuoteFlow = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'form' | 'images'>('form');
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const defaultBanquet: Banquet = {
    id: "1",
    name: "Default Banquet",
    city: "Select your preferred location",
    capacity: 500,
    basePrice: 1000
  };

  const handleQuoteNext = (data: QuoteData) => {
    setQuoteData(data);
    setCurrentStep('images');
  };

  const handleImageNext = async (images: string[]) => {
    if (!quoteData) return;
    
    try {
      setIsGeneratingPDF(true);
      await generateQuotationPDF(defaultBanquet, quoteData, images);
      toast({
        title: "PDF Generated Successfully!",
        description: "Your quotation has been downloaded.",
      });
      // Reset to form step after successful PDF generation
      setCurrentStep('form');
      setQuoteData(null);
    } catch (error) {
      toast({
        title: "Error generating PDF",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {currentStep === 'form' ? (
        <QuoteForm 
          banquet={defaultBanquet}
          onNext={handleQuoteNext}
        />
      ) : (
        <ImageSelector 
          banquetName={defaultBanquet.name}
          city={defaultBanquet.city}
          onImagesSelected={handleImageNext}
          isGeneratingPDF={isGeneratingPDF}
          onBack={handleBackToForm}
        />
      )}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<QuoteFlow />} />
          <Route path="/banquets" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
