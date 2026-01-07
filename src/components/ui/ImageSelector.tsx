import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Image as ImageIcon, Check, Upload, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface ImageSelectorProps {
  banquetName: string;
  city: string;
  onImagesSelected: (images: string[], isGalleryOnly?: boolean) => void;
  isGeneratingPDF?: boolean;
  onBack?: () => void;
}

// Google Custom Search API configuration
const GOOGLE_API_KEY = "AIzaSyCdsHJvJ2ijLbuDGOvIpj5aJ9c9KEsmvIE";
const GOOGLE_CX = "a721f5831654d4106";

// Fallback curated banquet images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1519167758481-83f29ba5fe4e?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop&auto=format"
];

export const ImageSelector = ({ banquetName, city, onImagesSelected, isGeneratingPDF = false, onBack }: ImageSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState(`${banquetName} ${city} banquet`);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const { toast } = useToast();

  const searchImages = async () => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(searchQuery)}&searchType=image&num=10`
      );
      const data = await response.json();
      
      if (data.items) {
        const imageUrls = data.items.map((item: any) => item.link);
        setSearchResults(imageUrls);
        toast({
          title: "Images loaded",
          description: `Found ${imageUrls.length} images via Google Search.`,
          variant: "default"
        });
      } else if (data.error) {
        // API error - fall back to curated images
        console.log('Google API error, using fallback images:', data.error.message);
        setSearchResults(FALLBACK_IMAGES);
        toast({
          title: "Using curated images",
          description: "Google API not available. Showing quality banquet images.",
          variant: "default"
        });
      } else {
        setSearchResults([]);
        toast({
          title: "No images found",
          description: "Try a different search term.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Search error, using fallback:', error);
      // Network error - fall back to curated images
      setSearchResults(FALLBACK_IMAGES);
      toast({
        title: "Using curated images",
        description: "Search service unavailable. Showing quality banquet images.",
        variant: "default"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter(img => img !== imageUrl));
    } else if (selectedImages.length < 10) {
      setSelectedImages([...selectedImages, imageUrl]);
    } else {
      toast({
        title: "Maximum limit reached",
        description: "You can select up to 10 images only.",
        variant: "destructive"
      });
    }
  };

  const handleUploadedImages = (images: string[]) => {
    setUploadedImages(images);
    // Auto-select all uploaded images
    const allImages = [...selectedImages.filter(img => !uploadedImages.includes(img)), ...images];
    if (allImages.length <= 10) {
      setSelectedImages(allImages);
    } else {
      setSelectedImages(allImages.slice(0, 10));
      toast({
        title: "Some images not selected",
        description: "Only the first 10 images were selected due to the limit.",
        variant: "default"
      });
    }
  };

  const getAllAvailableImages = () => {
    return [...searchResults, ...uploadedImages];
  };

  return (
    <Card className="p-8 bg-card border border-border shadow-elegant animate-slide-up">
      {onBack && (
        <div className="mb-6">
          <Button 
            onClick={onBack}
            variant="ghost" 
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quote Form
          </Button>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Images</h2>
        <p className="text-muted-foreground">Choose up to 10 images for your quotation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Images
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Images
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="imageSearch" className="flex items-center text-foreground mb-2">
                <ImageIcon className="h-4 w-4 mr-2" />
                Search Images
              </Label>
              <Input
                id="imageSearch"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for banquet images..."
                className="h-12 text-lg border-border focus:ring-primary"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={searchImages}
                disabled={isSearching}
                className="h-12 px-8 bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Search className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "Search Images"}
              </Button>
            </div>
          </div>

          {searchResults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Search Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImages.includes(imageUrl)
                        ? "border-primary shadow-glow scale-105"
                        : "border-border hover:border-primary/50 hover:scale-105"
                    }`}
                    onClick={() => toggleImageSelection(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Search result ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {selectedImages.includes(imageUrl) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <ImageUploader onImagesUploaded={handleUploadedImages} maxImages={10} />
          
          {uploadedImages.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Uploaded Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {uploadedImages.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      selectedImages.includes(imageUrl)
                        ? "border-primary shadow-glow scale-105"
                        : "border-border hover:border-primary/50 hover:scale-105"
                    }`}
                    onClick={() => toggleImageSelection(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Uploaded image ${index + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    {selectedImages.includes(imageUrl) && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <Check className="h-4 w-4" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedImages.length > 0 && (
        <div className="bg-accent/50 p-4 rounded-lg">
          <p className="text-foreground font-medium mb-2">
            Selected Images ({selectedImages.length}/10)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <img
                  src={imageUrl}
                  alt={`Selected ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border-2 border-primary"
                />
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4 flex-wrap">
        <Button 
          onClick={() => onImagesSelected(selectedImages)}
          disabled={isGeneratingPDF}
          className="flex-1 h-14 text-lg bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50"
        >
          {isGeneratingPDF ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generating & Saving...
            </>
          ) : (
            `Generate Quotation PDF (${selectedImages.length} images selected)`
          )}
        </Button>
        
        {selectedImages.length > 0 && (
          <Button 
            onClick={() => {
              // Create a standalone gallery PDF with just the selected images
              onImagesSelected(selectedImages, true); // Pass true to indicate gallery-only PDF
            }}
            disabled={isGeneratingPDF}
            variant="outline"
            className="h-14 px-6 text-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 disabled:opacity-50"
          >
            {isGeneratingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mr-2"></div>
                Generating...
              </>
            ) : (
              'Generate Gallery PDF'
            )}
          </Button>
        )}
      </div>
    </Card>
  );
};
