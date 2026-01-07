import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, addDays, eachDayOfInterval, isWithinInterval, isSameDay } from "date-fns";
import { LogOut, Calendar as CalendarIcon, Users, FileText, Edit, Trash2 } from "lucide-react";

interface Booking {
  id: string;
  booking_date: string;
  end_date?: string;
  client_name: string;
  hotel_name: string;
  description: string | null;
  destination_wedding?: boolean;
  created_at: string;
  updated_at: string;
}

interface Service {
  description: string;
  remarks: string;
  pax: number;
  price: number;
  gstPercentage: number;
  excludeGst: boolean;
}

interface SavedQuotation {
  id: string;
  created_at: string;
  updated_at: string;
  banquet_id: string;
  banquet_name: string;
  banquet_city: string;
  client_name: string;
  venue_name: string;
  location: string;
  start_date: string;
  end_date: string;
  services: Service[];
  notes: string | null;
  non_inclusive_items: string | null;
  discount_amount: number | null;
  brand_type: string;
  subtotal: number | null;
  total_gst: number | null;
  total: number | null;
}

const AdminDashboard = () => {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dateSelectionMode, setDateSelectionMode] = useState<'start' | 'end'>('start');
  const [clientName, setClientName] = useState("");
  const [hotelName, setHotelName] = useState("");
  const [description, setDescription] = useState("");
  const [isDestinationWedding, setIsDestinationWedding] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [fullyBookedDates, setFullyBookedDates] = useState<Date[]>([]);
  const [destinationWeddingDates, setDestinationWeddingDates] = useState<Date[]>([]);
  const [blockedDates, setBlockedDates] = useState<Date[]>([]);
  const [savedQuotations, setSavedQuotations] = useState<SavedQuotation[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadBookings();
    loadSavedQuotations();
  }, []);

  const loadSavedQuotations = async () => {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching quotations:', error);
      return;
    }
    
    const parsed = (data || []).map(q => ({
      ...q,
      services: Array.isArray(q.services) ? q.services as unknown as Service[] : []
    }));
    setSavedQuotations(parsed);
  };

  const handleDeleteQuotation = async (id: string) => {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({
        title: "Error deleting quotation",
        description: error.message,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Quotation Deleted",
      description: "The quotation has been removed.",
    });
    
    loadSavedQuotations();
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
    }
  };

  const loadBookings = async () => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("booking_date", { ascending: true });

      if (error) throw error;

      setBookings(data || []);
      
      // Group bookings by date to determine booking status
      const bookingsByDate = (data || []).reduce((acc, booking) => {
        // Handle date ranges for each booking
        const startBookingDate = new Date(booking.booking_date);
        const endBookingDate = booking.end_date ? new Date(booking.end_date) : startBookingDate;
        
        const bookingDates = eachDayOfInterval({ start: startBookingDate, end: endBookingDate });
        
        bookingDates.forEach(date => {
          const dateString = format(date, 'yyyy-MM-dd');
          acc[dateString] = (acc[dateString] || 0) + 1;
        });
        
        return acc;
      }, {} as Record<string, number>);

      // Set dates with any bookings (1 or 2)
      const datesWithBookings = Object.keys(bookingsByDate).map(date => new Date(date));
      setBookedDates(datesWithBookings);

      // Set dates with 2 bookings (fully booked)
      const fullyBooked = Object.entries(bookingsByDate)
        .filter(([_, count]) => count >= 2)
        .map(([date, _]) => new Date(date));
      setFullyBookedDates(fullyBooked);

      // Set destination wedding dates (for blue highlighting)
      const destinationDates: Date[] = [];
      const blockedDates: Date[] = [];
      
      (data || []).forEach(booking => {
        const startBookingDate = new Date(booking.booking_date);
        const endBookingDate = booking.end_date ? new Date(booking.end_date) : startBookingDate;
        const bookingDates = eachDayOfInterval({ start: startBookingDate, end: endBookingDate });
        
        if (booking.destination_wedding) {
          destinationDates.push(...bookingDates);
          // Destination wedding dates are also blocked for regular bookings
          blockedDates.push(...bookingDates);
        }
      });
      
      setDestinationWeddingDates(destinationDates);
      setBlockedDates(blockedDates);
    } catch (error: any) {
      toast({
        title: "Error loading bookings",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    if (dateSelectionMode === 'start') {
      setStartDate(date);
      setEndDate(undefined);
      setDateSelectionMode('end');
      toast({
        title: "Start date selected",
        description: `Selected ${format(date, "PPP")}. Now select an end date.`,
      });
    } else {
      if (startDate && date >= startDate) {
        setEndDate(date);
        setDateSelectionMode('start');
        toast({
          title: "Date range selected",
          description: `Selected ${format(startDate, "PPP")} to ${format(date, "PPP")}`,
        });
      } else {
        toast({
          title: "Invalid date selection",
          description: "End date must be after start date. Please select a valid end date.",
          variant: "destructive",
        });
      }
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !clientName.trim() || !hotelName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select start and end dates, and enter client name and hotel/banquet name.",
        variant: "destructive",
      });
      return;
    }

    // Check for destination wedding conflicts first
    const selectedDates = eachDayOfInterval({ start: startDate, end: endDate });
    const conflictingDestinationDates: string[] = [];
    const conflictingRegularDates: string[] = [];
    
    selectedDates.forEach(date => {
      const dateString = format(date, "yyyy-MM-dd");
      
      // Check for destination wedding conflicts
      const destinationWeddingsForDate = bookings.filter(booking => {
        if (!booking.destination_wedding) return false;
        
        const bookingStart = new Date(booking.booking_date);
        const bookingEnd = booking.end_date ? new Date(booking.end_date) : bookingStart;
        const bookingDates = eachDayOfInterval({ start: bookingStart, end: bookingEnd });
        return bookingDates.some(bookingDate => format(bookingDate, "yyyy-MM-dd") === dateString);
      });
      
      // If there's a destination wedding and this is not a destination wedding, block it
      if (destinationWeddingsForDate.length > 0 && !isDestinationWedding) {
        conflictingDestinationDates.push(format(date, "PPP"));
        return;
      }
      
      // If this is a destination wedding and there are any other bookings, block it
      if (isDestinationWedding) {
        const anyBookingsForDate = bookings.filter(booking => {
          const bookingStart = new Date(booking.booking_date);
          const bookingEnd = booking.end_date ? new Date(booking.end_date) : bookingStart;
          const bookingDates = eachDayOfInterval({ start: bookingStart, end: bookingEnd });
          return bookingDates.some(bookingDate => format(bookingDate, "yyyy-MM-dd") === dateString);
        });
        
        if (anyBookingsForDate.length > 0) {
          conflictingDestinationDates.push(format(date, "PPP"));
          return;
        }
      }
      
      // Check regular booking limits (2 per day) for non-destination weddings
      if (!isDestinationWedding) {
        const existingBookingsForDate = bookings.filter(booking => {
          const bookingStart = new Date(booking.booking_date);
          const bookingEnd = booking.end_date ? new Date(booking.end_date) : bookingStart;
          const bookingDates = eachDayOfInterval({ start: bookingStart, end: bookingEnd });
          return bookingDates.some(bookingDate => format(bookingDate, "yyyy-MM-dd") === dateString);
        });
        
        if (existingBookingsForDate.length >= 2) {
          conflictingRegularDates.push(format(date, "PPP"));
        }
      }
    });

    if (conflictingDestinationDates.length > 0) {
      toast({
        title: "Destination Wedding Conflict",
        description: isDestinationWedding 
          ? `Cannot book destination wedding - these dates have existing bookings: ${conflictingDestinationDates.join(", ")}`
          : `Cannot book during destination wedding dates: ${conflictingDestinationDates.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    if (conflictingRegularDates.length > 0) {
      toast({
        title: "Date range conflicts",
        description: `These dates are fully booked: ${conflictingRegularDates.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .insert({
          booking_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
          client_name: clientName.trim(),
          hotel_name: hotelName.trim(),
          description: description.trim() || null,
          destination_wedding: isDestinationWedding,
        });

      if (error) throw error;

      toast({
        title: "Booking created",
        description: `Marriage booking from ${format(startDate, "PPP")} to ${format(endDate, "PPP")} has been added.`,
      });

      // Reset form
      setStartDate(undefined);
      setEndDate(undefined);
      setDateSelectionMode('start');
      setClientName("");
      setHotelName("");
      setDescription("");
      setIsDestinationWedding(false);
      
      // Reload bookings
      loadBookings();
    } catch (error: any) {
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Booking deleted",
        description: "The booking has been removed successfully.",
      });
      
      loadBookings();
    } catch (error: any) {
      toast({
        title: "Error deleting booking",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar Booking
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Users className="w-4 h-4 mr-2" />
              Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="quotations">
              <FileText className="w-4 h-4 mr-2" />
              Quotations ({savedQuotations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date Range</CardTitle>
                  <CardDescription>
                    Choose start and end dates for the marriage booking
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(startDate || endDate) && (
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="text-sm">
                        {startDate && !endDate && (
                          <span>Start: <strong>{format(startDate, "PPP")}</strong> - Select end date</span>
                        )}
                        {startDate && endDate && (
                          <span>Range: <strong>{format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}</strong></span>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setStartDate(undefined);
                          setEndDate(undefined);
                          setDateSelectionMode('start');
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                  <Calendar
                    mode="single"
                    selected={dateSelectionMode === 'start' ? startDate : endDate}
                    onSelect={handleDateSelect}
                    className="rounded-md border"
                    modifiers={{
                      partiallyBooked: bookedDates.filter(date => 
                        !fullyBookedDates.some(fullDate => 
                          fullDate.toDateString() === date.toDateString()
                        ) && !destinationWeddingDates.some(destDate =>
                          destDate.toDateString() === date.toDateString()
                        ) && !blockedDates.some(blockedDate =>
                          blockedDate.toDateString() === date.toDateString()
                        )
                      ),
                      fullyBooked: fullyBookedDates.filter(date =>
                        !destinationWeddingDates.some(destDate =>
                          destDate.toDateString() === date.toDateString()
                        )
                      ),
                      destinationWedding: destinationWeddingDates,
                      blocked: blockedDates.filter(date => 
                        !destinationWeddingDates.some(destDate =>
                          destDate.toDateString() === date.toDateString()
                        )
                      ),
                      startDate: startDate ? [startDate] : [],
                      endDate: endDate ? [endDate] : [],
                      rangeMiddle: startDate && endDate ? 
                        eachDayOfInterval({ start: startDate, end: endDate })
                          .filter(date => !isSameDay(date, startDate) && !isSameDay(date, endDate))
                        : [],
                    }}
                    modifiersStyles={{
                      partiallyBooked: { 
                        backgroundColor: "hsl(var(--warning))",
                        color: "hsl(var(--warning-foreground))",
                      },
                      fullyBooked: { 
                        backgroundColor: "hsl(var(--destructive))",
                        color: "hsl(var(--destructive-foreground))",
                      },
                      destinationWedding: {
                        backgroundColor: "hsl(220 91% 56%)", // Blue color
                        color: "white",
                        fontWeight: "bold",
                      },
                      blocked: {
                        backgroundColor: "hsl(var(--muted))",
                        color: "hsl(var(--muted-foreground))",
                        textDecoration: "line-through",
                        opacity: "0.5",
                        cursor: "not-allowed",
                      },
                      startDate: {
                        backgroundColor: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        fontWeight: "bold",
                        border: "2px solid hsl(var(--primary))",
                      },
                      endDate: {
                        backgroundColor: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        fontWeight: "bold",
                        border: "2px solid hsl(var(--primary))",
                      },
                      rangeMiddle: {
                        backgroundColor: "hsl(var(--primary) / 0.2)",
                        color: "hsl(var(--foreground))",
                      },
                    }}
                    disabled={(date) => 
                      blockedDates.some(blockedDate => 
                        blockedDate.toDateString() === date.toDateString() && 
                        !destinationWeddingDates.some(destDate =>
                          destDate.toDateString() === date.toDateString()
                        )
                      ) && !isDestinationWedding
                    }
                  />
                  <div className="mt-4 text-sm text-muted-foreground space-y-1">
                    <div className="text-sm font-medium text-foreground mb-2">
                      {dateSelectionMode === 'start' ? 'Click to select START date' : 'Click to select END date'}
                      {!isDestinationWedding && (
                        <span className="block text-xs text-orange-600 mt-1">
                          Note: Dates during destination weddings are unavailable for regular bookings
                        </span>
                      )}
                    </div>
                    <div>
                      <Badge variant="secondary" className="mr-2 bg-green-500 text-white">●</Badge>
                      1 booking (1 slot available)
                    </div>
                    <div>
                      <Badge variant="destructive" className="mr-2">●</Badge>
                      2 bookings (fully booked)
                    </div>
                    <div>
                      <Badge className="mr-2 bg-blue-500 text-white">●</Badge>
                      Destination Wedding
                    </div>
                    <div>
                      <Badge variant="outline" className="mr-2 bg-gray-300 text-gray-600">●</Badge>
                      Blocked (destination wedding period)
                    </div>
                    {startDate && endDate && (
                      <div className="pt-2 border-t">
                        <div className="text-sm font-medium text-foreground">
                          Selected Range: {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>
                    {startDate && endDate
                      ? `Creating booking from ${format(startDate, "PPP")} to ${format(endDate, "PPP")}`
                      : startDate 
                      ? `Start date selected: ${format(startDate, "PPP")}. Select end date.`
                      : "Select start date first, then end date to create a booking"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="clientName">Client Name *</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        placeholder="Enter client name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hotelName">Hotel/Banquet Name *</Label>
                      <Input
                        id="hotelName"
                        value={hotelName}
                        onChange={(e) => setHotelName(e.target.value)}
                        placeholder="Enter hotel or banquet name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional: Add any additional details"
                        rows={3}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="destinationWedding"
                        checked={isDestinationWedding}
                        onCheckedChange={(checked) => setIsDestinationWedding(checked === true)}
                      />
                      <Label htmlFor="destinationWedding">Destination Wedding</Label>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={!startDate || !endDate || !clientName.trim() || !hotelName.trim() || isLoading}
                    >
                      {isLoading ? "Creating Booking..." : "Create Booking"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Marriage Bookings</CardTitle>
                <CardDescription>
                  Manage all scheduled marriage bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings found. Create your first booking using the calendar tab.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">{booking.client_name}</h3>
                            <Badge variant="secondary">
                              {booking.end_date && booking.end_date !== booking.booking_date
                                ? `${format(new Date(booking.booking_date), "MMM d")} - ${format(new Date(booking.end_date), "MMM d, yyyy")}`
                                : format(new Date(booking.booking_date), "PPP")
                              }
                            </Badge>
                            <Badge variant="outline">
                              {booking.hotel_name}
                            </Badge>
                            {booking.destination_wedding && (
                              <Badge className="bg-blue-500 text-white">
                                Destination Wedding
                              </Badge>
                            )}
                          </div>
                          {booking.description && (
                            <p className="text-sm text-muted-foreground">
                              {booking.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Created: {format(new Date(booking.created_at), "PPp")}
                          </p>
                        </div>
                        <Button
                          onClick={() => deleteBooking(booking.id)}
                          variant="destructive"
                          size="sm"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Saved Quotations</CardTitle>
                <CardDescription>
                  All quotations saved from the quotation maker
                </CardDescription>
              </CardHeader>
              <CardContent>
                {savedQuotations.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No saved quotations yet.</p>
                    <p className="text-sm">Quotations saved from the main page will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {savedQuotations.map((quotation) => (
                      <div
                        key={quotation.id}
                        className="flex items-start justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-lg">{quotation.client_name}</h3>
                            <Badge variant="outline">{quotation.brand_type}</Badge>
                          </div>
                          <p className="text-muted-foreground">{quotation.venue_name}</p>
                          <p className="text-sm text-muted-foreground">{quotation.banquet_name}, {quotation.banquet_city}</p>
                          <div className="flex gap-4 text-sm">
                            <span>📅 {format(new Date(quotation.start_date), "MMM d")} - {format(new Date(quotation.end_date), "MMM d, yyyy")}</span>
                            <span className="font-medium text-primary">₹{(quotation.total || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <p>Subtotal: ₹{(quotation.subtotal || 0).toLocaleString('en-IN')} | GST: ₹{(quotation.total_gst || 0).toLocaleString('en-IN')}</p>
                            <p>Updated: {format(new Date(quotation.updated_at), "PPp")}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteQuotation(quotation.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
