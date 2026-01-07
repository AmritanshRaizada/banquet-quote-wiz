import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "./components/ui/QuoteForm";
import { ImageSelector } from "./components/ui/ImageSelector";
import { generateQuotationPDF, QuoteData, Banquet } from "./utils/pdfGenerator";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { useToast } from "./hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

interface Service {
  description: string;
  remarks: string;
  pax: number;
  price: number;
  gstPercentage: number;
  excludeGst: boolean;
}

const QuoteFlow = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<'form' | 'images'>('form');
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [editingQuotationId, setEditingQuotationId] = useState<string | null>(null);

  const defaultBanquet: Banquet = {
    id: "1",
    name: "Default Banquet",
    city: "Select your preferred location",
    capacity: 500,
    basePrice: 1000
  };

  const calculateTotals = (services: Service[], discountAmount: number = 0) => {
    let subtotal = 0;
    let totalGst = 0;
    
    services.forEach(service => {
      const base = service.pax * service.price;
      const gst = service.excludeGst ? 0 : (base * service.gstPercentage) / 100;
      subtotal += base;
      totalGst += gst;
    });
    
    return {
      subtotal,
      totalGst,
      total: subtotal + totalGst - discountAmount
    };
  };

  // Load quotation for editing from URL param
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      loadQuotationForEdit(editId);
    }
  }, [searchParams]);

  const loadQuotationForEdit = async (id: string) => {
    console.log('Loading quotation for edit:', id);
    
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Error loading quotation:', error);
      toast({
        title: "Error loading quotation",
        description: "Could not find the quotation to edit.",
        variant: "destructive"
      });
      setSearchParams({});
      return;
    }
    
    console.log('Loaded quotation data:', data);
    
    // Parse services - ensure it's an array with correct structure
    const services = Array.isArray(data.services) 
      ? (data.services as unknown as Service[]).map(s => ({
          description: s.description || '',
          remarks: s.remarks || '',
          pax: Number(s.pax) || 0,
          price: Number(s.price) || 0,
          gstPercentage: Number(s.gstPercentage) || 18,
          excludeGst: Boolean(s.excludeGst)
        }))
      : [];
    
    const quoteDataToSet = {
      clientName: data.client_name || '',
      venueName: data.venue_name || '',
      location: data.location || '',
      startDate: data.start_date || '',
      endDate: data.end_date || '',
      services,
      notes: data.notes || '',
      nonInclusiveItems: data.non_inclusive_items || '',
      discountAmount: Number(data.discount_amount) || 0,
      brandType: (data.brand_type as 'shaadi' | 'nosh') || 'shaadi'
    };
    
    console.log('Setting quote data:', quoteDataToSet);
    
    // Clear search params first, then set data
    setSearchParams({});
    setEditingQuotationId(id);
    setQuoteData(quoteDataToSet);
    setCurrentStep('form');
  };

  const saveQuotationToDb = async (data: QuoteData) => {
    const totals = calculateTotals(data.services as Service[], data.discountAmount || 0);
    
    const quotationData = {
      banquet_id: defaultBanquet.id,
      banquet_name: data.venueName || defaultBanquet.name,
      banquet_city: data.location || defaultBanquet.city,
      client_name: data.clientName,
      venue_name: data.venueName,
      location: data.location,
      start_date: data.startDate,
      end_date: data.endDate,
      services: JSON.parse(JSON.stringify(data.services)),
      notes: data.notes || null,
      non_inclusive_items: data.nonInclusiveItems || null,
      discount_amount: data.discountAmount || 0,
      brand_type: data.brandType,
      subtotal: totals.subtotal,
      total_gst: totals.totalGst,
      total: totals.total
    };
    
    let error;
    
    if (editingQuotationId) {
      // Update existing quotation
      const result = await supabase
        .from('quotations')
        .update(quotationData as any)
        .eq('id', editingQuotationId);
      error = result.error;
    } else {
      // Insert new quotation
      const result = await supabase
        .from('quotations')
        .insert(quotationData as any);
      error = result.error;
    }
    
    if (error) {
      console.error('Error saving quotation:', error);
      throw error;
    }
    
    // Reset editing state after save
    setEditingQuotationId(null);
  };

  const handleQuoteNext = (data: QuoteData) => {
    setQuoteData(data);
    setCurrentStep('images');
  };

  const handleImageNext = async (images: string[], isGalleryOnly?: boolean) => {
    try {
      setIsGeneratingPDF(true);
      
      if (isGalleryOnly) {
        // Generate gallery PDF with just the images
        const { generateGalleryPDF } = await import("./utils/pdfGenerator");
        await generateGalleryPDF(quoteData?.venueName || defaultBanquet.name, quoteData?.location || defaultBanquet.city, images);
        toast({
          title: "Gallery PDF Generated Successfully!",
          description: "Your image gallery has been downloaded.",
        });
      } else {
        // Generate quotation PDF with quote data and images
        if (!quoteData) return;
        
        // Save to database automatically
        await saveQuotationToDb(quoteData);
        
        // Generate PDF
        await generateQuotationPDF(defaultBanquet, quoteData, images);
        toast({
          title: "PDF Generated & Saved!",
          description: "Your quotation has been saved and downloaded.",
        });
      }
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

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateQuotation = async (data: QuoteData) => {
    if (!editingQuotationId) return;
    
    try {
      setIsSaving(true);
      setQuoteData(data);
      await saveQuotationToDb(data);
      toast({
        title: "Quotation Updated!",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      toast({
        title: "Error updating quotation",
        description: "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {/* Admin Access Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/admin/login'}
          className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
        >
          Admin
        </Button>
      </div>
      
      {currentStep === 'form' ? (
        <QuoteForm 
          banquet={defaultBanquet}
          onNext={handleQuoteNext}
          onSave={editingQuotationId ? handleUpdateQuotation : undefined}
          isSaving={isSaving}
          isEditing={!!editingQuotationId}
          initialData={quoteData || undefined}
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
