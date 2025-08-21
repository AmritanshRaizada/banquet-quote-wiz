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

export const generateQuotationPDF = async (
  banquet: Banquet,
  quoteData: QuoteData,
  selectedImages: string[]
) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Colors matching our theme
  const primaryColor = '#601220';
  const textColor = '#2D2D2D';
  const lightGray = '#F5F5F5';

  // Fetch and add logo
  const response = await fetch('/B W Logo.png');
  const blob = await response.blob();
  const reader = new FileReader();
  const dataUrl = await new Promise(resolve => {
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  // Header
  pdf.setFillColor(primaryColor);
  pdf.rect(0, 0, pageWidth, 30, 'F');

  pdf.addImage(dataUrl as string, 'PNG', 15, -5, 40, 40);
  
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('BANQUET QUOTATION', pageWidth / 2, 20, { align: 'center' });

  // Company name
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Banquet Quotation Maker', pageWidth - 20, 40, { align: 'right' });

  let yPosition = 60;

  // Venue Information
  pdf.setTextColor(textColor);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Venue Details', 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Venue: ${banquet.name}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Location: ${banquet.city}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Capacity: Up to ${banquet.capacity} guests`, 20, yPosition);
  
  yPosition += 20;

  // Client Information
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Client Information', 20, yPosition);
  
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Client Name: ${quoteData.clientName}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Event Date: ${new Date(quoteData.eventDate).toLocaleDateString('en-IN')}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Guests: ${quoteData.guests}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Rooms: ${quoteData.rooms}`, 20, yPosition);
  
  if (quoteData.notes) {
    yPosition += 7;
    pdf.text(`Notes: ${quoteData.notes}`, 20, yPosition);
  }

  yPosition += 20;

  // Pricing Details
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Pricing Details', 20, yPosition);
  
  yPosition += 15;
  
  // Table header
  pdf.setFillColor(lightGray);
  pdf.rect(20, yPosition - 5, pageWidth - 40, 10, 'F');
  
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', 25, yPosition);
  pdf.text('Quantity', 100, yPosition);
  pdf.text('Rate', 130, yPosition);
  pdf.text('Amount', 160, yPosition);
  
  yPosition += 15;
  
  // Table content
  pdf.setFont('helvetica', 'normal');
  const total = quoteData.pricePerPlate * quoteData.guests;
  
  pdf.text('Banquet per plate', 25, yPosition);
  pdf.text(quoteData.guests.toString(), 100, yPosition);
  pdf.text(`Rs ${quoteData.pricePerPlate}`, 130, yPosition);
  pdf.text(`Rs ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, 160, yPosition);
  
  yPosition += 15;
  
  // Total
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text('Total Amount:', 120, yPosition);
  pdf.text(`Rs ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, 156, yPosition);


  // Footer
  const footerY = pageHeight - 20;
  pdf.setTextColor('#666666');
  pdf.setFontSize(10);
  pdf.text('Copyright © 2025 Shaadiplatform Pvt Ltd.', pageWidth / 2, footerY, { align: 'center' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, footerY + 5, { align: 'center' });

  // Save the PDF
  const fileName = `${banquet.name.replace(/[^a-z0-9]/gi, '_')}_quotation_${Date.now()}.pdf`;
  pdf.save(fileName);
};

export const generateGalleryPDF = async (banquetName: string, city: string, selectedImages: string[]) => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const primaryColor = '#601220';
  const textColor = '#2D2D2D';

  // Header
  pdf.setFillColor(primaryColor);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor('#FFFFFF');
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('RESTAURANT GALLERY', pageWidth / 2, 20, { align: 'center' });

  let yPosition = 60;

  pdf.setTextColor(textColor);
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${banquetName} - Gallery`, 20, yPosition);
  yPosition += 10;
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Location: ${city}`, 20, yPosition);

  yPosition += 20;

  // Add images to the gallery
  for (const imageUrl of selectedImages) {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      const dataUrl = await new Promise(resolve => {
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });

      // Add image to PDF, adjust position and size as needed
      // For simplicity, let's add one image per page or arrange them in a grid
      // Here, I'll add them one by one, moving to a new page if necessary
      const imgWidth = 180; // mm
      const imgHeight = 120; // mm
      const margin = 20;

      if (yPosition + imgHeight + margin > pageHeight - 30) { // Check if image fits on current page
        pdf.addPage();
        yPosition = margin; // Reset yPosition for new page
      }

      // Determine image format from blob type
      let imgFormat = 'JPEG'; // Default
      if (blob.type.includes('png')) {
        imgFormat = 'PNG';
      } else if (blob.type.includes('jpeg')) {
        imgFormat = 'JPEG';
      } else if (blob.type.includes('webp')) {
        imgFormat = 'WEBP';
      }
      
      console.log(`Adding image: ${imageUrl}, Format: ${imgFormat}`);
      pdf.addImage(dataUrl as string, imgFormat, margin, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10; // Move yPosition down for next image
    } catch (error) {
      console.error(`Failed to load image ${imageUrl}:`, error);
      // Optionally add a placeholder or error message in the PDF
      pdf.setTextColor('#FF0000');
      pdf.setFontSize(10);
      pdf.text(`Failed to load image: ${imageUrl}`, 20, yPosition);
      yPosition += 10;
      pdf.setTextColor(textColor); // Reset color
    }
  }

  // Footer
  const footerY = pageHeight - 20;
  pdf.setTextColor('#666666');
  pdf.setFontSize(10);
  pdf.text('Copyright © 2025 Shaadiplatform Pvt Ltd.', pageWidth / 2, footerY, { align: 'center' });
  pdf.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, pageWidth / 2, footerY + 5, { align: 'center' });

  const fileName = `${banquetName.replace(/[^a-z0-9]/gi, '_')}_gallery_${Date.now()}.pdf`;
  pdf.save(fileName);
};
