import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Image as ImageIcon, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageSelectorProps {
  banquetName: string;
  city: string;
  onImagesSelected: (images: string[]) => void;
}

// Google Custom Search API configuration
const GOOGLE_API_KEY = "AIzaSyCdsHJvJ2ijLbuDGOvIpj5aJ9c9KEsmvIE";
const GOOGLE_CX = "a721f5831654d4106";

export const ImageSelector = ({ banquetName, city, onImagesSelected }: ImageSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState(`${banquetName} ${city} banquet`);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
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
      } else {
        setSearchResults([]);
        toast({
          title: "No images found",
          description: "Try a different search term.",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again later.",
        variant: "destructive"
      });
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const toggleImageSelection = (imageUrl: string) => {
    if (selectedImages.includes(imageUrl)) {
      setSelectedImages(selectedImages.filter(img => img !== imageUrl));
    } else if (selectedImages.length < 4) {
      setSelectedImages([...selectedImages, imageUrl]);
    } else {
      toast({
        title: "Maximum limit reached",
        description: "You can select up to 4 images only.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-8 bg-card border border-border shadow-elegant animate-slide-up">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Select Images</h2>
        <p className="text-muted-foreground">Choose up to 4 images for your quotation</p>
      </div>

      <div className="space-y-6">
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

        {selectedImages.length > 0 && (
          <div className="bg-accent/50 p-4 rounded-lg">
            <p className="text-foreground font-medium mb-2">
              Selected Images ({selectedImages.length}/4)
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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

        <Button 
          onClick={() => onImagesSelected(selectedImages)}
          disabled={selectedImages.length === 0}
          className="w-full h-14 text-lg bg-gradient-primary hover:shadow-glow transition-all duration-300 disabled:opacity-50"
        >
          Generate Quotation PDF ({selectedImages.length}/4 images selected)
        </Button>
      </div>
    </Card>
  );
};
