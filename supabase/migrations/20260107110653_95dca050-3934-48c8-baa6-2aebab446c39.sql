-- Create quotations table to store saved quotations
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Banquet info
  banquet_id TEXT NOT NULL,
  banquet_name TEXT NOT NULL,
  banquet_city TEXT NOT NULL,
  
  -- Quote data
  client_name TEXT NOT NULL,
  venue_name TEXT NOT NULL,
  location TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  non_inclusive_items TEXT,
  discount_amount NUMERIC DEFAULT 0,
  brand_type TEXT NOT NULL DEFAULT 'shaadi',
  
  -- Totals for quick display
  subtotal NUMERIC DEFAULT 0,
  total_gst NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (since this is an internal tool without auth)
CREATE POLICY "Allow all operations for quotations"
ON public.quotations
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();