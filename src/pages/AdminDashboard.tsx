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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { LogOut, Calendar as CalendarIcon, Users } from "lucide-react";

interface Booking {
  id: string;
  booking_date: string;
  client_name: string;
  description: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [clientName, setClientName] = useState("");
  const [description, setDescription] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadBookings();
  }, []);

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
      setBookedDates(
        (data || []).map((booking) => new Date(booking.booking_date))
      );
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate || !clientName.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a date and enter client name.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .insert({
          booking_date: format(selectedDate, "yyyy-MM-dd"),
          client_name: clientName.trim(),
          description: description.trim() || null,
        });

      if (error) {
        if (error.code === "23505") { // Unique constraint violation
          toast({
            title: "Date already booked",
            description: "This date is already booked for another marriage.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Booking created",
        description: `Marriage booking for ${format(selectedDate, "PPP")} has been added.`,
      });

      // Reset form
      setSelectedDate(undefined);
      setClientName("");
      setDescription("");
      
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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Calendar Booking
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <Users className="w-4 h-4 mr-2" />
              All Bookings ({bookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                  <CardDescription>
                    Choose a date for the marriage booking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    modifiers={{
                      booked: bookedDates,
                    }}
                    modifiersStyles={{
                      booked: { 
                        backgroundColor: "hsl(var(--destructive))",
                        color: "hsl(var(--destructive-foreground))",
                      },
                    }}
                  />
                  <div className="mt-4 text-sm text-muted-foreground">
                    <Badge variant="destructive" className="mr-2">●</Badge>
                    Already booked dates
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>
                    {selectedDate 
                      ? `Creating booking for ${format(selectedDate, "PPP")}`
                      : "Select a date to create a booking"
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
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional: Add any additional details"
                        rows={3}
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={!selectedDate || !clientName.trim() || isLoading}
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
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{booking.client_name}</h3>
                            <Badge variant="secondary">
                              {format(new Date(booking.booking_date), "PPP")}
                            </Badge>
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;