import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useSearchParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "./components/ui/QuoteForm";
import { ImageSelector } from "./components/ui/ImageSelector";
import { generateQuotationPDF, QuoteData, Banquet } from "./utils/pdfGenerator";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SecureAccess from "./pages/SecureAccess";
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const checkSession = () => {
      const adminSession = localStorage.getItem("admin_login_session");
      if (adminSession) {
        setIsAuthenticated(true);
        setSessionTimeLeft(null);
        return true;
      }

      const userSessionStr = localStorage.getItem("user_passkey_session");
      if (userSessionStr) {
        try {
          const session = JSON.parse(userSessionStr);
          const now = Date.now();
          if (session.active && session.expiresAt > now) {
            setIsAuthenticated(true);
            setSessionTimeLeft(Math.floor((session.expiresAt - now) / 1000));
            return true;
          } else {
            localStorage.removeItem("user_passkey_session");
            return false;
          }
        } catch (e) {
          localStorage.removeItem("user_passkey_session");
        }
      }
      return false;
    };

    checkSession();

    const interval = setInterval(() => {
      const isValid = checkSession();
      if (!isValid && isAuthenticated) {
        setIsAuthenticated(false);
        toast({
          title: "Session Expired",
          description: "Please login again with a passkey.",
          variant: "destructive"
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, toast]);

  const handleLogout = () => {
    localStorage.removeItem("user_passkey_session");
    localStorage.removeItem("admin_login_session");
    setIsAuthenticated(false);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

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
    // Only load if we have an edit ID and it's different from current
    if (editId && editId !== editingQuotationId) {
      loadQuotationForEdit(editId);
    }
  }, [searchParams, editingQuotationId]);

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

  const saveQuotationToDb = async (data: QuoteData, quotationId?: string | null) => {
    const idToUse = quotationId ?? editingQuotationId;
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

    if (idToUse) {
      // Update existing quotation
      console.log('Updating quotation with ID:', idToUse);
      const result = await supabase
        .from('quotations')
        .update(quotationData as any)
        .eq('id', idToUse);
      error = result.error;
    } else {
      // Insert new quotation
      console.log('Inserting new quotation');
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
    // Capture the ID immediately before any async operations
    const currentEditId = editingQuotationId;
    if (!currentEditId) return;

    try {
      setIsSaving(true);
      setQuoteData(data);
      // Pass the captured ID explicitly to ensure it's used
      await saveQuotationToDb(data, currentEditId);
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

  if (!isAuthenticated) {
    return <SecureAccess onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      {/* Top Right Buttons & Timer */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
        {sessionTimeLeft !== null && (
          <div className="bg-white/95 backdrop-blur-sm border border-primary/20 px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 animate-pulse-subtle">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            <span className="text-xs font-bold text-primary font-mono lowercase">
              expires in: {Math.floor(sessionTimeLeft / 3600)}h {Math.floor((sessionTimeLeft % 3600) / 60)}m {sessionTimeLeft % 60}s
            </span>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/admin/dashboard?tab=quotations'}
          className="bg-background/80 backdrop-blur-sm hover:bg-primary/5 hover:text-primary border-primary/20"
        >
          Quotations
        </Button>
        {!localStorage.getItem("admin_login_session") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/admin/login'}
            className="bg-background/80 backdrop-blur-sm hover:bg-primary/5 hover:text-primary border-primary/20"
          >
            Admin
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-primary hover:bg-primary/10 hover:text-primary font-semibold"
        >
          Logout
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
