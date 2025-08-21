import jsPDF from 'jspdf';

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

// Utility function to format currency
const formatCurrency = (amount: number): string => {
  return `Rs ${amount.toLocaleString('en-IN')}`;
};

// Utility function to load image with error handling
const loadImage = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to load image: ${url}`, error);
    throw error;
  }
};
const addWatermark = async (pdf: jsPDF, pageWidth: number, pageHeight: number): Promise<void> => {
  try {
    const watermarkDataUrl = await loadImage('/public/Logo.png'); // your watermark image

    const wmWidth = pageWidth * 0.5;   // watermark covers ~50% page width
    const wmHeight = wmWidth;          // make it square
    const x = (pageWidth - wmWidth) / 2;
    const y = (pageHeight - wmHeight) / 2;

    // Set transparency for watermark
    (pdf as any).setGState(new (pdf as any).GState({ opacity: 0.1 }));

    pdf.addImage(watermarkDataUrl, 'PNG', x, y, wmWidth, wmHeight);

    // Reset transparency back to normal
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
    pdf.text(`Venue: ${banquet.name}`, col1, yPosition + 7);
    pdf.text(`Location: ${banquet.city}`, col1, yPosition + 14);
    pdf.text(`Capacity: Up to ${banquet.capacity.toLocaleString('en-IN')} guests`, col1, yPosition + 21);
    pdf.text(`Base Price: ${formatCurrency(banquet.basePrice)} per plate`, col1, yPosition + 28);

    // Client Information
    pdf.setFont('helvetica', 'bold');
    pdf.text('Client Information', col2, yPosition);
    
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Client Name: ${quoteData.clientName}`, col2, yPosition + 7);
    pdf.text(`Event Date: ${new Date(quoteData.eventDate).toLocaleDateString('en-IN')}`, col2, yPosition + 14);
    pdf.text(`Guests: ${quoteData.guests.toLocaleString('en-IN')}`, col2, yPosition + 21);
    pdf.text(`Rooms: ${quoteData.rooms}`, col2, yPosition + 28);
    
    yPosition += 40;

    // Pricing Details
    pdf.setFillColor(secondaryColor);
    pdf.rect(20, yPosition, pageWidth - 40, 15, 'F');
    pdf.setTextColor('#FFFFFF');
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRICING BREAKDOWN', pageWidth / 2, yPosition + 10, { align: 'center' });
    
    yPosition += 20;
    
    // Table header
    pdf.setFillColor(lightGray);
    pdf.rect(20, yPosition, pageWidth - 40, 10, 'F');
    pdf.setTextColor(textColor);
    
    pdf.text('Description', 25, yPosition + 7);
    pdf.text('Quantity', 100, yPosition + 7);
    pdf.text('Rate', 130, yPosition + 7);
    pdf.text('Amount', 160, yPosition + 7);
    
    yPosition += 15;
    
    // Table content
    pdf.setFont('helvetica', 'normal');
    const total = quoteData.pricePerPlate * quoteData.guests;
    
    pdf.text('Banquet per plate', 25, yPosition);
    pdf.text(quoteData.guests.toLocaleString('en-IN'), 100, yPosition);
    pdf.text(formatCurrency(quoteData.pricePerPlate), 130, yPosition);
    pdf.text(formatCurrency(total), 160, yPosition);
    
    yPosition += 20;
    
    // Total
    pdf.setDrawColor(borderColor);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    
    yPosition += 10;
    pdf.setFont('helvetica', 'bold');
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

    // Terms and conditions
    if (yPosition < pageHeight - 60) {
      pdf.setDrawColor(borderColor);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      
      yPosition += 10;
      pdf.setFontSize(9);
      pdf.setTextColor('#666666');
      pdf.setFont('helvetica', 'normal');
      const terms = [
        '• This quotation is valid for 30 days from the date of issue.',
        '• Prices are subject to change based on market conditions.',
        '• Advance booking amount is required to confirm the reservation.',
        '• Cancellation policy: 50% refund if cancelled 30 days prior to the event.'
      ];
      
      terms.forEach(term => {
        if (yPosition < pageHeight - 20) {
          pdf.text(term, 20, yPosition, { maxWidth: pageWidth - 40 });
          yPosition += 5;
        }
      });
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
    const fileName = `${sanitizeFileName(banquet.name)}_quotation_${Date.now()}.pdf`;
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
    
    for (let i = 0; i < selectedImages.length; i++) {
      const imageUrl = selectedImages[i];
      
      try {
        const dataUrl = await loadImage(imageUrl);
        
        // Check if we need a new page
        if (yPosition > pageHeight - 150) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Get image dimensions to maintain aspect ratio
        const img = new Image();
        img.src = dataUrl;
        await new Promise(resolve => {
          img.onload = resolve;
        });
        
        const aspectRatio = img.width / img.height;
        const imgHeight = imgWidth / aspectRatio;
        
        // Add image to PDF
        pdf.addImage(dataUrl, 'JPEG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
        
        // Add a caption if there's space
        if (yPosition < pageHeight - 15) {
          pdf.setFontSize(9);
          pdf.setTextColor('#666666');
          pdf.text(`Image ${i + 1} of ${selectedImages.length}`, pageWidth / 2, yPosition, { align: 'center' });
          yPosition += 7;
        }
        
      } catch (error) {
        console.error(`Failed to add image ${imageUrl}:`, error);
        // Add error message instead of image
        pdf.setFontSize(10);
        pdf.setTextColor('#FF0000');
        pdf.text(`Failed to load image ${i + 1}`, margin, yPosition);
        yPosition += 10;
        pdf.setTextColor(textColor);
      }
    }

    // Footer
    pdf.setDrawColor(borderColor);
    pdf.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30);
    
    pdf.setTextColor('#666666');
    pdf.setFontSize(9);
    pdf.text(`Copyright © ${new Date().getFullYear()} Shaadiplatform Pvt Ltd. • Generated on: ${new Date().toLocaleDateString('en-IN')}`, 
             pageWidth / 2, pageHeight - 15, { align: 'center' });

    const fileName = `${sanitizeFileName(banquetName)}_gallery_${Date.now()}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating gallery PDF:', error);
    throw new Error('Failed to generate gallery PDF');
  }
};