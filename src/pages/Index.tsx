import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BanquetCard } from "@/components/ui/BanquetCard";
import { QuoteForm } from "@/components/ui/QuoteForm";
import { ImageSelector } from "@/components/ui/ImageSelector";
import { generateQuotationPDF, generateGalleryPDF } from "@/utils/pdfGenerator";
import { Search, ArrowLeft, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Banquet {
  id: string;
  name: string;
  city: string;

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
{ id: "72", name: "The Grand Taj Banquet & Conventions", city: "Sector 64, Sohna Road", },
{ id: "73", name: "V Club", city: "Sector 48, Sohna Road", },
{ id: "74", name: "Casabella Banquet", city: "Sector 48, Sohna Road & Sector 33", },
{ id: "75", name: "Kosmos Banquet Hall", city: "Sector 64", },
{ id: "76", name: "The Leela Ambience Gurugram", city: "DLF Phase 3", },
{ id: "77", name: "Royal Swan Banquet", city: "Sector 33", },
{ id: "78", name: "The Riviera by FNP Venues", city: "DLF Phase 3", },
{ id: "79", name: "Green Orchid Farms", city: "Basai", },
{ id: "80", name: "Leolarch Farms", city: "Bawana", },
{ id: "81", name: "Wedlock Farm", city: "Sector 72", },
{ id: "82", name: "Rangmanch Farms", city: "Sachaunra Village", },
{ id: "83", name: "Shubh Banquets & Convention Centre", city: "Sector 39", },
{ id: "84", name: "The City Club", city: "Sohna Road, DLF Phase 4", },
{ id: "85", name: "The Riviera by FNP Venues", city: "DLF Phase 3", },
{ id: "86", name: "Leolarch Farms", city: "Badshahpur", },
{ id: "87", name: "Wedlock Farm", city: "Sector 72", },
{ id: "88", name: "Rangmanch Farms", city: "Sachaunra Village", },
{ id: "89", name: "Shubh Banquets & Convention Centre", city: "Sector 39", },
{ id: "90", name: "Radha Krishna Garden", city: "Sector 33", },
{ id: "91", name: "Devam Green by WSG", city: "Baliawas", },
{ id: "92", name: "The Grand Taj Banquet & Conventions", city: "Sector 64, Sohna Road", },
{ id: "93", name: "The Ritz by FNP Venues", city: "DLF City Phase 3", },
{ id: "94", name: "The Rivets by FNP Venues", city: "DLF Phase 3", },
{ id: "95", name: "The Westin Sohna Resort & Spa", city: "Sohna Road", },
{ id: "96", name: "Karma Lakelands", city: "Sector 80", },
{ id: "97", name: "GNH Convention", city: "Sohna Road", },
{ id: "98", name: "Walsingham Farms", city: "Sohna Road", },
{ id: "99", name: "Mallu Farms", city: "MG Road", },
{ id: "100", name: "Jain Farms", city: "Sohna", },
{ id: "101", name: "The City Club", city: "Sohna Road, DLF Phase 4", },
{ id: "102", name: "Karma Lakelands", city: "Sector 80, Naurangpur", },
{ id: "103", name: "The Riviera by FNP Venues", city: "DLF Phase 3", },
{ id: "104", name: "GNH Convention", city: "Sohna Road", },
{ id: "105", name: "Walsingham Farms", city: "Sohna Road", },
{ id: "106", name: "Mallu Farms", city: "MG Road", },
{ id: "107", name: "Jain Farms", city: "Sohna Road", },
{ id: "108", name: "The Ritz by FNP Venues", city: "DLF City Phase 3", },
{ id: "109", name: "The Kesar Bagh", city: "Manesar", },
{ id: "110", name: "Radha Krishna Garden", city: "Sector 37", },
{ id: "111", name: "Wedlock Farm", city: "Sector 72", },
{ id: "112", name: "Bliss Premiere", city: "Sector 83", },
{ id: "113", name: "Royal Farm", city: "Sector 57", },
{ id: "114", name: "Tasya Farms", city: "Manesar", },
{ id: "115", name: "Karma Lakelands", city: "Sector 80", },
{ id: "116", name: "Botanix Nature Resort", city: "Sohna Road", },
{ id: "117", name: "A Dot by GNH", city: "N/A", },
{ id: "118", name: "The Kesar Bagh", city: "Manesar", },
{ id: "119", name: "GNH Convention", city: "Sohna Road", },
{ id: "120", name: "The Ritz by FNP Venues", city: "DLF City Phase 3", },
{ id: "121", name: "The Riviera by FNP Venues", city: "DLF City Phase 3", },
{ id: "122", name: "Limón Hotel and Banquet Hall", city: "B-101 South City 1, Sector 30, Gurgaon", },
{ id: "123", name: "Hudson", city: "Arjun Nagar", },
{ id: "124", name: "Aurum", city: "Sector 66, Gurugram", },
{ id: "125", name: "Araya Bagh", city: "Gitorni", },
{ id: "126", name: "Vivaan by SK", city: "Ambliam, Gurgaon, opp. airforce station, gurugram", },
{ id: "127", name: "Royal Swan Banquet", city: "Sector 33, Gurgaon", },
{ id: "128", name: "Shubh Banquets & Convention Centre", city: "At Kalarai rangar sector 13 gurugram", },
{ id: "129", name: "Prism Ballroom Banquet", city: "Sector 2 Faridabad gurugram", },
{ id: "130", name: "Limaro", city: "Sukhrauli enclave sector 17A, gurugram", },
{ id: "131", name: "Bliss Premiere", city: "Palson Village, Gurgaon", },
{ id: "132", name: "Taj Damdama", city: "Gurgaon, Sohna Rd, Damdama, Gurgaon", },
{ id: "133", name: "Tivoli Indian Sona", city: "Vatika Complex, MG Road, Gurgaon", },
{ id: "134", name: "Taj Surajkund Resort", city: "Shooting Range Road, Block-C, Surajkund, Faridabad", },

{ id: "135", name: "The Solluna Resort", city: "Marchula, Jim Corbett National Park", },
{ id: "136", name: "Taj Corbett Resort & Spa", city: "Zero Garjia, Dhikuli", },
{ id: "137", name: "Namah Resort", city: "Dhikuli Road, Ramnagar", },
{ id: "138", name: "The Den Corbett Resort & Spa", city: "Ranikhet Road, Kumariya", },
{ id: "139", name: "Jim’s Jungle Retreat", city: "Village & PO Dhela, Ramnagar", },
{ id: "140", name: "The Riverview Retreat", city: "Zero Garjia, Ramnagar", },
{ id: "141", name: "The Hridayesh Spa Wilderness Resort", city: "Near Bijrani Safari Gate", },
{ id: "142", name: "Aahana The Corbett Wilderness", city: "Village Semal Khalia, Ramnagar", },
{ id: "143", name: "Lemon Tree Premier", city: "Near Corbett National Park", },
{ id: "144", name: "Amantrum Gateway Resorts", city: "Village: Motipur Negi, Dhela Road", },
{ id: "145", name: "Tiarara Hotels & Resorts", city: "Ramnagar, Nainital", },
{ id: "146", name: "Lohagarh Corbett Resort (Lawn 1)", city: "Jim Corbett", },
{ id: "147", name: "The Golden Tusk (Buzz)", city: "Jim Corbett", },
{ id: "148", name: "Atulya Resort (Hall)", city: "Jim Corbett", },
{ id: "149", name: "Nadiya Parao Resort (Hall)", city: "Jim Corbett", },
{ id: "150", name: "Le Roi Corbett Resort", city: "Jim Corbett", },
{ id: "151", name: "The Tiger Groove (Banquet Hall)", city: "Jim Corbett", },
{ id: "152", name: "Saraca Resort & Spa Corbett", city: "Jim Corbett", },
{ id: "153", name: "Fortune Walkway Mall", city: "Haldwani, Jim Corbett", },
{ id: "154", name: "Corbett Fun Resort", city: "Jim Corbett", },
{ id: "155", name: "StayVista Villa at Amaltas Ramnagar", city: "Ramnagar", },
{ id: "156", name: "Taarini Corbett Camp", city: "Marchula, Jim Corbett", },
{ id: "157", name: "The Den Corbett Resort & Spa", city: "Jim Corbett", },
{ id: "158", name: "Winsome Resorts and Spa", city: "Jim Corbett", },
{ id: "159", name: "Taj Corbett Resort & Spa, Uttarakhand (Board Room)", city: "Jim Corbett", },
{ id: "160", name: "Taj Corbett Resort & Spa, Uttarakhand (Woods)", city: "Jim Corbett", },
{ id: "161", name: "The Tattwaa Corbett Spa & Resort (ARK)", city: "Ramnagar", },
{ id: "162", name: "Tarangi Hotels & Resorts", city: "Ramnagar, Nainital", },
{ id: "163", name: "The Baakhli Corbett", city: "Choi, Ramnagar", },
{ id: "164", name: "Lohagarh Corbett Resort", city: "Jim Corbett", },
{ id: "165", name: "The Golden Tusk", city: "Jim Corbett", },
{ id: "166", name: "Atulya Resort", city: "Jim Corbett", },
{ id: "167", name: "Nadiya Parao Resort", city: "Jim Corbett", },
{ id: "168", name: "Le Roi Corbett Resort", city: "Jim Corbett", },
{ id: "169", name: "The Tiger Groove", city: "Jim Corbett", },
{ id: "170", name: "Corbett View Resort", city: "Village Dhela, Ramnagar", },
{ id: "171", name: "Taj Corbett Resort & Spa", city: "Zero Garjia, Dhikuli", },
{ id: "172", name: "The Tattwaa Corbett Spa & Resort", city: "Himmatpur Dotiyal, Jhirna Road, Ramnagar, Uttarakhand", },

{ id: "173", name: "Taj Rishikesh Resort & Spa", city: "Village Singthali, Tehri Garhwal", },
{ id: "174", name: "Aloha on the Ganges", city: "National Highway 7, 58, Rishikesh, Tapovan", },
{ id: "175", name: "Ganga Kinare - A Riverside Boutique Hotel", city: "237 Virbhadra Rd, Rishikesh", },
{ id: "176", name: "The Divine Resort & Spa", city: "Tapovan Laxman Jhula, Rishikesh", },
{ id: "177", name: "The Westin Resort & Spa", city: "Village Gaurd Chatti, Rishikesh", },
{ id: "178", name: "Namami Ganges Resort & SPA", city: "Shyampur, Badrinath Road, Rishikesh", },
{ id: "179", name: "Shaantam Resort & Spa", city: "Neelkanth Mandir Road, Rishikesh", },
{ id: "180", name: "The Palms Resort", city: "Haridwar - Rishikesh Road, NH 58, Raiwala", },
{ id: "181", name: "Summit By The Ganges Resort & Spa", city: "Village Singthali, Rishikesh", },
{ id: "182", name: "The Roseate Ganges", city: "Syali, Shyampur, Badrinath Road, Rishikesh", },
{ id: "183", name: "The Forest View Hotel", city: "Dehradun Road, near BSNL Office, Rishikesh", },
{ id: "184", name: "Camp Brook by CampingAie", city: "Village Ghatghat, Neelkanth Road, Rishikesh", },
{ id: "185", name: "Zana by The Ganges", city: "Syali, Shyampur, Badrinath Road, Rishikesh", },
{ id: "186", name: "The Grand Shiva Resort & Spa", city: "Tapovan, Badrinath Road, Rishikesh", },
{ id: "187", name: "The Bhandari Palace", city: "Khand Gaon Laal Pani, Near New Arto Office, Bypass Road, Rishikesh", },
{ id: "188", name: "Neelkanth Wedding Point", city: "Gunwaliam, Shyampur, Rishikesh", },
{ id: "189", name: "Sai Garden", city: "Raiwala, Haripur Kalan, Haridwar Road, Rishikesh", },
{ id: "190", name: "The Narayana Palace by Salvus", city: "Near Bajari, Rishikesh", },
{ id: "191", name: "Hotel Natraj", city: "Dehradun Road, Natraj Chowk, Rishikesh", },
{ id: "192", name: "Samsara River Resort", city: "Haridwar Highway, Ghatghat, Rishikesh", },
{ id: "193", name: "Midway Resort", city: "Haridwar-Rishikesh Road, Raiwala", },
{ id: "194", name: "Raj Resort", city: "Badrinath Road, Near Laxman Jhula, Tapovan", },
{ id: "195", name: "Him River Resort", city: "Near Phoolchatti Ashram, Neelkanth Mandir Road", },
{ id: "196", name: "Royale Rainbow Resort", city: "Palliayl Gaon, Neelkanth Mandir Road", },
{ id: "197", name: "Antaram Resort", city: "Ghattughat, Badrinath Road, Rishikesh", },
{ id: "198", name: "Simply Heaven Rishikesh", city: "Neelkanth Temple Road, Maral, Near Phoolchatti Ashram", },
{ id: "199", name: "The Neeraj Naturecure", city: "Village, Tapovan, Rishikesh", },
{ id: "200", name: "juSTA Rasa", city: "Syali, Shyampur, Badrinath Road, Rishikesh", },
{ id: "201", name: "Mahayana Resort", city: "Ratapani, Neelkanth Road, Rishikesh", },
{ id: "202", name: "Hotel Shivganga Retreat", city: "Virbhadra, Near All India Radio, Rishikesh", },
{ id: "203", name: "The Grand Shiva Resort & Spa", city: "Badrinath Road, Rishikesh", },
{ id: "204", name: "Creek Forest - Riverside Boutique Resort", city: "Ghattu Ghat, Neelkanth Temple Rd, Rishikesh, Uttarakhand", },

{ id: "205", name: "The Riviera by FNP Venues", city: "Ambience Island, Gurugram (NCR)", },
{ id: "206", name: "The Kundan Farms", city: "Kapashera Estate Road, New Delhi", },
{ id: "207", name: "Shagun Farm", city: "Gadaipur Bandh Road, Chattarpur, New Delhi", },
{ id: "208", name: "The Manor Farmhouse", city: "Friends Colony, New Delhi", },
{ id: "209", name: "GNH Convention", city: "Sohna Road, Gurugram (NCR)", },
{ id: "210", name: "Vilas by Ferns N Petals", city: "Kapashera Estate Road, New Delhi", },
{ id: "211", name: "Green Leaf Farms", city: "Chattarpur Farm, New Delhi", },
{ id: "212", name: "H M Farm", city: "7JWC5J+FP, Dera Mandi, New Delhi, Delhi 110074", },
{ id: "213", name: "Divine Farms", city: "Near Shanni Dham, Chattarpur, New Delhi", },
{ id: "214", name: "Rangmanch Farms", city: "Sidhrawal, Manesar, Gurugram (NCR)", },
{ id: "215", name: "Pradham Farm & Resort", city: "Ansal Aravali Retreat, Raisina, Gurugram (NCR)", },
{ id: "216", name: "The Vintage - Aarone Farms", city: "Chattarpur, New Delhi", },
{ id: "217", name: "The Ocean Pearl Gardenia", city: "Chattarpur Mandir Road, New Delhi", },
{ id: "218", name: "The Nikunj", city: "NH-8, Near IGI Airport, New Delhi", },
{ id: "219", name: "Amanata Farms", city: "Bijwasan Road, Kapashera, New Delhi", },
{ id: "220", name: "Themis Farm House", city: "North Delhi", },
{ id: "221", name: "Gumber Farms", city: "Asola, New Delhi", },
{ id: "222", name: "Sukoon Farm Stay", city: "Asola, New Delhi", },
{ id: "223", name: "Dera Greens", city: "N/A", },
{ id: "224", name: "The Palms Town & Country Club", city: "Sushant Lok Phase I, Sector 43, Gurugram", },
{ id: "225", name: "Spara Boutique Resort", city: "Bijwasan, Delhi", },
{ id: "226", name: "The Ritz by FNP Venues", city: "DLF Phase 3, Gurugram", },
{ id: "227", name: "Araya Bagh", city: "Ghitorni, New Delhi", },
{ id: "228", name: "Mallu Farms", city: "Chattarpur, New Delhi", },
{ id: "229", name: "Grand Mantram", city: "Bandhwari, Gurugram", },
{ id: "230", name: "The Riyan Farm", city: "Kapashera, New Delhi", },
{ id: "231", name: "Fortune Park Orange", city: "Manesar, Gurugram", },
{ id: "232", name: "The Ocean Pearl Gardenia", city: "Chattarpur Mandir Road, New Delhi", },
{ id: "233", name: "The Nikunj", city: "NH-8, Near IGI Airport, New Delhi", },
{ id: "234", name: "Amanata Farms", city: "Bijwasan Road, Kapashera, New Delhi", },
{ id: "235", name: "Themis Farm House", city: "North Delhi", },
{ id: "236", name: "Gumber Farms", city: "Asola, New Delhi", },
{ id: "237", name: "Sukoon Farm Stay", city: "Asola, New Delhi", },
{ id: "238", name: "Dera Greens", city: "N/A", },
];


type Step = 'search' | 'form' | 'images';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBanquet, setSelectedBanquet] = useState<Banquet | null>(null);
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>('search');
  const [selectedImagesForGallery, setSelectedImagesForGallery] = useState<string[]>([]);
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

  const handleImagesSelectedForQuote = (images: string[]) => {
    setSelectedImagesForGallery(images); // Update state with selected images
    if (selectedBanquet && quoteData) {
      try {
        generateQuotationPDF(selectedBanquet, quoteData, images);
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

  const handleGenerateGalleryPDF = async (banquetName: string, city: string) => {
    console.log("Generating Gallery PDF with images:", selectedImagesForGallery);
    try {
      await generateGalleryPDF(banquetName, city, selectedImagesForGallery);
      toast({
        title: "Gallery PDF Generated Successfully!",
        description: "The restaurant gallery PDF has been downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error generating Gallery PDF",
        description: "Please try again.",
        variant: "destructive"
      });
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
              <img src="/Logo.png" alt="Logo" className="h-24 w-24" />
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#601220' }}>Banquet Quotation Maker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/admin/login">
                <Button 
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Login
                </Button>
              </Link>
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
              onImagesSelected={handleImagesSelectedForQuote} // Pass the new handler
            />
            <div className="flex justify-center space-x-4 mt-8">
              <Button onClick={() => handleGenerateGalleryPDF(selectedBanquet.name, selectedBanquet.city)} className="bg-blue-500 hover:bg-blue-600 text-white">
                Generate Restaurant Gallery PDF
              </Button>
            </div>
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
