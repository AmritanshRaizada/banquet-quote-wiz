-- Create storage bucket for banquet gallery images
INSERT INTO storage.buckets (id, name, public) VALUES ('banquet-gallery', 'banquet-gallery', true);

-- Create RLS policies for banquet gallery bucket
CREATE POLICY "Anyone can view banquet gallery images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'banquet-gallery');

CREATE POLICY "Anyone can upload banquet gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'banquet-gallery');

CREATE POLICY "Anyone can update banquet gallery images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'banquet-gallery');

CREATE POLICY "Anyone can delete banquet gallery images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'banquet-gallery');