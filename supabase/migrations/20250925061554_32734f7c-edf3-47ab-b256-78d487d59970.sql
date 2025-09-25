-- Add destination_wedding column to existing bookings table
ALTER TABLE public.bookings 
ADD COLUMN destination_wedding BOOLEAN DEFAULT FALSE;

-- Add end_date column to support date ranges
ALTER TABLE public.bookings 
ADD COLUMN end_date DATE;

-- Update existing bookings to have end_date same as booking_date for backward compatibility
UPDATE public.bookings SET end_date = booking_date WHERE end_date IS NULL;