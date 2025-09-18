import jsPDF from 'jspdf';

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
  location: string;
  eventDate: string;
  services: Service[];
  notes: string;
  gstIncluded: boolean;
  gstPercentage: number;
}

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
const addWatermark = async (pdf: jsPDF, pageWidth: number, pageHeight: number): Promise<void> => {
  try {
    const watermarkDataUrl = await loadImage('/public/Logo.png'); // your watermark image

    const wmWidth = pageWidth * 0.5;   // watermark covers ~50% page width
    const wmHeight = wmWidth;          // make it square
    const x = (pageWidth - wmWidth) / 2;
    const y = (pageHeight - wmHeight) / 2;

    // Set transparency for watermark
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdf as any).setGState(new (pdf as any).GState({ opacity: 0.1 }));

    pdf.addImage(watermarkDataUrl, 'PNG', x, y, wmWidth, wmHeight);

    // Reset transparency back to normal
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdf as any).setGState(new (pdf as any).GState({ opacity: 1 }));
  } catch (error) {
    console.warn('Watermark not added:', error);
  }
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
    await addWatermark(pdf, pageWidth, pageHeight);
    // Colors matching our theme
    const primaryColor = '#601220';
    const secondaryColor = '#8D2B3E';
    const textColor = '#2D2D2D';
    const lightGray = '#F5F5F5';
    const borderColor = '#DDDDDD';

    let yPosition = 40;

    // Try to load and add logo
    try {
      const logoDataUrl = await loadImage('/public/B W Logo.png');
      pdf.addImage(logoDataUrl, 'PNG', 15, 10, 30, 30);
    } catch (error) {
      console.warn('Logo not found, proceeding without it');
    }

    // Header
    pdf.setFillColor(primaryColor);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    pdf.setTextColor('#FFFFFF');
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('BANQUET QUOTATION', pageWidth / 2, 30, { align: 'center' });

    // Company info
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    pdf.text('contact@banquetquotationmaker.com • +91 1234567890', pageWidth / 2, 45, { align: 'center' });

    // Quotation details header
    pdf.setFillColor(secondaryColor);
    pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
    pdf.setTextColor('#FFFFFF');
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text('QUOTATION DETAILS', pageWidth / 2, yPosition + 10, { align: 'center' });
    
    yPosition += 25;

    // Two column layout
    const col1 = 20;
    const col2 = pageWidth / 2 + 10;

    // Venue Information
    pdf.setTextColor(textColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Venue Details', col1, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Venue: ${quoteData.venueName}`, col1, yPosition + 7);
    const locationText = `Location: ${quoteData.location}`;
    const locationLines = pdf.splitTextToSize(locationText, 60); // Approx 25 chars width at font size 12
    let currentLocationY = yPosition + 14;
    locationLines.forEach((line: string) => {
      pdf.text(line, col1, currentLocationY);
      currentLocationY += 7; // Line height
    });
    // Adjust yPosition for the next element based on the number of lines
    yPosition += (locationLines.length - 1) * 7;

    // Client Information
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client Information', col2, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Client Name: ${quoteData.clientName}`, col2, yPosition + 7);
    pdf.text(`Event Date: ${new Date(quoteData.eventDate).toLocaleDateString('en-IN')}`, col2, yPosition + 14);
    
    yPosition += 40;

    // Pricing Details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdf as any).setGState(new (pdf as any).GState({ opacity: 0.89 }));
    pdf.setFillColor(secondaryColor);
    pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pdf as any).setGState(new (pdf as any).GState({ opacity: 1 }));
    pdf.setTextColor('#FFFFFF');
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRICING BREAKDOWN', pageWidth / 2, yPosition + 10, { align: 'center' });
    
    yPosition += 20;
    
    // Table header
    pdf.setFillColor(lightGray);
    pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
    pdf.setTextColor(textColor);
    
    pdf.text('SERVICES', 25, yPosition + 7);
    pdf.text('No. of PAX', 100, yPosition + 7);
    pdf.text('PRICE', 130, yPosition + 7);
    pdf.text('AMOUNT', 160, yPosition + 7);
    
    yPosition += 15;
    
    // Table content
    pdf.setFont('helvetica', 'normal');
    let subtotal = 0;
    
    quoteData.services.forEach((service, index) => {
      const serviceTotal = service.pax * service.price;
      subtotal += serviceTotal;
      
      pdf.text(service.description, 25, yPosition, { maxWidth: 70 });
      pdf.text(service.pax.toLocaleString('en-IN'), 100, yPosition);
      pdf.text(formatCurrency(service.price), 130, yPosition);
      pdf.text(formatCurrency(serviceTotal), 160, yPosition);
      
      yPosition += 10;
    });
    
    yPosition += 10;
    
    // Subtotal
    pdf.setDrawColor(borderColor);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Subtotal:', 120, yPosition);
    pdf.text(formatCurrency(subtotal), 160, yPosition);

    // GST
    let gstAmount = 0;
    if (quoteData.gstIncluded && quoteData.gstPercentage > 0) {
      gstAmount = (subtotal * quoteData.gstPercentage) / 100;
      yPosition += 7;
      pdf.text(`GST (${quoteData.gstPercentage}%):`, 120, yPosition);
      pdf.text(formatCurrency(gstAmount), 160, yPosition);
    }

    const total = subtotal + gstAmount;
    
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.text('Total Amount:', 120, yPosition);
    pdf.text(formatCurrency(total), 160, yPosition);
    
    yPosition += 15;
    
    // Notes if available
    if (quoteData.notes) {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'italic');
      pdf.text(`Notes: ${quoteData.notes}`, 20, yPosition, { maxWidth: pageWidth - 40 });
      yPosition += 10;
    }


    // Footer
    pdf.setDrawColor(borderColor);
    pdf.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    pdf.setTextColor('#666666');
    pdf.setFontSize(9);
    pdf.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
    pdf.text(`Copyright © ${new Date().getFullYear()} Shaadiplatform Pvt Ltd. • Generated on: ${new Date().toLocaleDateString('en-IN')}`, 
             pageWidth / 2, pageHeight - 15, { align: 'center' });

    // Save the PDF
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
    await addWatermark(pdf, pageWidth, pageHeight);
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
          await addWatermark(pdf, pageWidth, pageHeight);
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
