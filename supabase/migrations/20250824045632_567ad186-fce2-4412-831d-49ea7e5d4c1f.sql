-- Add hotel_name column and remove unique constraint on booking_date
ALTER TABLE public.bookings DROP CONSTRAINT bookings_booking_date_key;
ALTER TABLE public.bookings ADD COLUMN hotel_name TEXT NOT NULL DEFAULT '';