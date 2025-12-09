import jsPDF from 'jspdf';

export interface Banquet {
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
  excludeGst: boolean;
}

export type BrandType = 'shaadi' | 'nosh';

export interface QuoteData {
  clientName: string;
  venueName: string;
  location: string;
  startDate: string;
  endDate: string;
  services: Service[];
  notes: string;
  gstIncluded: boolean;
  gstPercentage: number;
  // new optional fields
  invoiceNumber?: string;
  issueDate?: string;
  discountAmount?: number;
  brandType: BrandType;
}

// Brand constants
const BRANDS = {
  shaadi: {
    name: 'Shaadi Platform',
    tagline: 'By Nosh N Shots',
    email: 'info@shaadiplatform.com',
    phone: '+91-9990837771',
  },
  nosh: {
    name: 'Nosh N Shots',
    tagline: '',
    email: 'info@shaadiplatform.com',
    phone: '+91-9990837771',
  }
};

// Template URL for quotation background
const QUOTATION_TEMPLATE_URL = '/templates/shaadi_quotation_a4.png';

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return `Rs ${amount.toLocaleString('en-IN')}`;
};

// Utility function to load image with CORS handling and fallbacks
const loadImageWithFallback = async (url: string): Promise<string> => {
  // Method 1: Try direct fetch first
  try {
    const response = await fetch(url);
    if (response.ok) {
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.log(`Direct fetch failed for ${url}, trying alternative method:`, error);
  }

  // Method 2: Try using Image element with crossOrigin and canvas conversion
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get canvas context');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      } catch (canvasError) {
        console.log(`Canvas conversion failed for ${url}:`, canvasError);
        // Method 3: Try CORS proxy as last resort
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
        loadImageDirect(proxyUrl).then(resolve).catch(() => {
          // Final fallback: generate a placeholder
          resolve(generatePlaceholderImage());
        });
      }
    };
    
    img.onerror = () => {
      console.log(`Image load failed for ${url}, trying CORS proxy`);
      // Method 3: Try CORS proxy
      const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
      loadImageDirect(proxyUrl).then(resolve).catch(() => {
        // Final fallback: generate a placeholder
        resolve(generatePlaceholderImage());
      });
    };
    
    img.src = url;
  });
};

// Direct image loading for proxy URLs
const loadImageDirect = async (url: string): Promise<string> => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(blob);
  });
};

// Generate a placeholder image when all methods fail
const generatePlaceholderImage = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  canvas.width = 400;
  canvas.height = 300;
  
  // Draw a simple placeholder
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, 400, 300);
  
  ctx.fillStyle = '#999';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Banquet Image', 200, 140);
  ctx.fillText('Could not load', 200, 170);
  
  // Add a simple border
  ctx.strokeStyle = '#ccc';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, 398, 298);
  
  return canvas.toDataURL('image/jpeg', 0.8);
};

// Utility function to load image with error handling (keeping for backwards compatibility)
const loadImage = async (url: string): Promise<string> => {
  return loadImageWithFallback(url);
};
// Utility function to sanitize filename
const sanitizeFileName = (name: string): string => {
  return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};

export const generateQuotationPDF = async (
  banquet: Banquet,
  quoteData: QuoteData,
  selectedImages: string[] = []
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 1) Background template (floral layout with T&C)
    const templateDataUrl = await loadImageWithFallback(QUOTATION_TEMPLATE_URL);
    pdf.addImage(templateDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);

    pdf.setTextColor('#000000');
    pdf.setFont('helvetica', 'normal');

    // Get brand info based on selection
    const brand = BRANDS[quoteData.brandType || 'shaadi'];

    // ---------- HEADER: LEFT SIDE ----------
    let y = 30;

    pdf.setTextColor('#611221');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setCharSpace(0.5);
    pdf.text(brand.name, 20, y);
    pdf.setCharSpace(0);
    pdf.setTextColor('#000000');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    y += 7;
    if (brand.tagline) {
      pdf.text(brand.tagline, 20, y);
      y += 5;
    }
    pdf.text(brand.email, 20, y);
    y += 5;
    pdf.text(brand.phone, 20, y);

    // ---------- HEADER: RIGHT SIDE ----------
    const headerRightX = pageWidth - 20;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('PROFORMA INVOICE', headerRightX, 30, { align: 'right' });

    const issueDate = quoteData.issueDate
      ? new Date(quoteData.issueDate).toLocaleDateString('en-IN')
      : new Date().toLocaleDateString('en-IN');

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Date: ${issueDate}`, headerRightX, 38, { align: 'right' });

    // ---------- CLIENT INFORMATION ----------
    y = 70;

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Client Information', 20, y);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    y += 7;
    pdf.text(`Client Name: ${quoteData.clientName}`, 20, y);

    const startDateFormatted = new Date(quoteData.startDate).toLocaleDateString('en-IN');
    const endDateFormatted = new Date(quoteData.endDate).toLocaleDateString('en-IN');

    y += 6;
    pdf.text(`Event Date: ${startDateFormatted} - ${endDateFormatted}`, 20, y);

    y += 6;
    pdf.text(`Venue: ${quoteData.venueName}`, 20, y);

    // ---------- BIFURCATION HEADING ----------
    y += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Event Details', 20, y);

    // ---------- TABLE HEADER ----------
    y += 10;
    pdf.setFontSize(10);

    const colNoX = 20;
    const colServiceX = 32;
    const colPaxX = 85;
    const colPriceX = 115;
    const colAmountX = 150;
    const colGstX = 188;

    pdf.text('NO', colNoX, y);
    pdf.text('DESCRIPTION', colServiceX, y);
    pdf.text('PAX', colPaxX, y, { align: 'right' });
    pdf.text('PRICE', colPriceX, y, { align: 'right' });
    pdf.text('AMOUNT', colAmountX, y, { align: 'right' });
    pdf.text('GST', colGstX, y, { align: 'right' });

    // ---------- TABLE ROWS ----------
    y += 8;
    pdf.setFont('helvetica', 'normal');

    let subtotal = 0;
    const rowHeight = 7;
    const bottomMargin = 90;

    quoteData.services.forEach((service, index) => {
      // simple page break handling
      if (y > pageHeight - bottomMargin) {
        pdf.addPage();
        pdf.addImage(templateDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
        y = 40;
      }

      const serviceTotal = service.pax * service.price;
      subtotal += serviceTotal;

      // Calculate GST for this service
      const serviceGst = (!service.excludeGst && quoteData.gstIncluded && quoteData.gstPercentage > 0)
        ? (serviceTotal * quoteData.gstPercentage) / 100
        : 0;

      pdf.text(String(index + 1), colNoX, y);
      pdf.text(service.description, colServiceX, y, { maxWidth: colPaxX - colServiceX - 5 });
      pdf.text(service.pax.toLocaleString('en-IN'), colPaxX, y, { align: 'right' });
      pdf.text(formatCurrency(service.price), colPriceX, y, { align: 'right' });
      pdf.text(formatCurrency(serviceTotal), colAmountX, y, { align: 'right' });
      pdf.text(formatCurrency(serviceGst), colGstX, y, { align: 'right' });

      y += rowHeight;
    });

    // ---------- TOTALS BLOCK ----------
    const minTotalsY = 190;
    y = Math.max(y + 15, minTotalsY);

    const totalsLabelX = 120;
    const totalsValueX = 188;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);

    pdf.setLineWidth(0.4);
    pdf.line(totalsLabelX, y - 6, totalsValueX, y - 6);

    // Subtotal
    pdf.text('Subtotal:', totalsLabelX, y);
    pdf.text(formatCurrency(subtotal), totalsValueX, y, { align: 'right' });

    // GST - only on services that don't exclude GST
    let gstAmount = 0;
    if (quoteData.gstIncluded && quoteData.gstPercentage > 0) {
      const gstEligibleSubtotal = quoteData.services
        .filter(service => !service.excludeGst)
        .reduce((sum, service) => sum + (service.pax * service.price), 0);
      gstAmount = (gstEligibleSubtotal * quoteData.gstPercentage) / 100;
      y += 7;
      pdf.text(`GST (${quoteData.gstPercentage}%):`, totalsLabelX, y);
      pdf.text(formatCurrency(gstAmount), totalsValueX, y, { align: 'right' });
    }

    // Discount
    const discountAmount = quoteData.discountAmount ?? 0;
    y += 7;
    pdf.text('Discount:', totalsLabelX, y);
    pdf.text(
      discountAmount > 0 ? formatCurrency(discountAmount) : '-',
      totalsValueX,
      y,
      { align: 'right' }
    );

    // line before final total
    y += 5;
    pdf.line(totalsLabelX, y, totalsValueX, y);
    y += 8;

    // Total
    const total = subtotal + gstAmount - discountAmount;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Total Amount:', totalsLabelX, y);
    pdf.text(formatCurrency(total), totalsValueX, y, { align: 'right' });

    // ---------- NOTES ----------
    if (quoteData.notes) {
      const notesY = y + 15;
      if (notesY < pageHeight - 40) {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(9);
        const notesLines = pdf.splitTextToSize(quoteData.notes, pageWidth - 40);
        pdf.text(notesLines, 20, notesY);
      }
    }

    const fileName = `${sanitizeFileName(quoteData.venueName)}_quotation_${Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating quotation PDF:', error);
    throw new Error('Failed to generate quotation PDF');
  }
};

export const generateGalleryPDF = async (
  banquetName: string, 
  city: string, 
  selectedImages: string[]
): Promise<void> => {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const primaryColor = '#601220';
    const secondaryColor = '#8D2B3E';
    const textColor = '#2D2D2D';
    const borderColor = '#DDDDDD';

    // Header
    pdf.setFillColor(primaryColor);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor('#FFFFFF');
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BANQUET GALLERY', pageWidth / 2, 25, { align: 'center' });

    let yPosition = 50;

    // Venue info
    pdf.setTextColor(textColor);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(banquetName, 20, yPosition);
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Location: ${city}`, 20, yPosition);
    yPosition += 15;

    // Add images to the gallery
    const imgWidth = pageWidth - 40; // Full width with margins
    const margin = 20;
    let successfulImages = 0;
    
    console.log(`Starting to process ${selectedImages.length} images for PDF gallery`);
    
    for (let i = 0; i < selectedImages.length; i++) {
      const imageUrl = selectedImages[i];
      console.log(`Processing image ${i + 1}: ${imageUrl}`);
      
      try {
        const dataUrl = await loadImageWithFallback(imageUrl);
        console.log(`Successfully loaded image ${i + 1}`);
        
        // Check if we need a new page
        if (yPosition > pageHeight - 150) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Create a temporary image to get dimensions
        const tempImg = document.createElement('img');
        tempImg.src = dataUrl;
        
        await new Promise((resolve, reject) => {
          tempImg.onload = () => {
            try {
              const aspectRatio = tempImg.width / tempImg.height;
              let imgHeight = imgWidth / aspectRatio;
              
              // Limit image height to prevent overflow
              const maxHeight = pageHeight - yPosition - 50;
              if (imgHeight > maxHeight) {
                imgHeight = maxHeight;
              }
              
              // Add image to PDF
              pdf.addImage(dataUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
              yPosition += imgHeight + 15;
              
              // Add a caption
              pdf.setFontSize(10);
              pdf.setTextColor('#666666');
              pdf.text(`Image ${i + 1} of ${selectedImages.length}`, pageWidth / 2, yPosition - 5, { align: 'center' });
              
              successfulImages++;
              console.log(`Successfully added image ${i + 1} to PDF`);
              resolve(true);
            } catch (pdfError) {
              console.error(`Error adding image ${i + 1} to PDF:`, pdfError);
              reject(pdfError);
            }
          };
          
          tempImg.onerror = () => {
            console.error(`Failed to load temp image ${i + 1}`);
            reject(new Error('Failed to load image'));
          };
        });
        
      } catch (error) {
        console.error(`Failed to process image ${i + 1} (${imageUrl}):`, error);
        
        // Add placeholder for failed image
        pdf.setFontSize(12);
        pdf.setTextColor('#999999');
        pdf.rect(margin, yPosition, imgWidth, 100, 'S');
        pdf.text(`Image ${i + 1}`, pageWidth / 2, yPosition + 45, { align: 'center' });
        pdf.text(`Unable to load`, pageWidth / 2, yPosition + 60, { align: 'center' });
        yPosition += 115;
        pdf.setTextColor(textColor);
      }
    }
    
    console.log(`Successfully processed ${successfulImages} out of ${selectedImages.length} images`);

    // Footer
    pdf.setDrawColor(borderColor);
    pdf.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    pdf.setTextColor('#666666');
    pdf.setFontSize(9);
    pdf.text(`• Generated on: ${new Date().toLocaleDateString('en-IN')}`, 
             pageWidth / 2, pageHeight - 15, { align: 'center' });

    const fileName = `${sanitizeFileName(banquetName)}_gallery_${Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating gallery PDF:', error);
    throw new Error('Failed to generate gallery PDF');
  }
};
