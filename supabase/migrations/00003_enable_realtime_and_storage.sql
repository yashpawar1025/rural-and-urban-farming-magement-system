-- Enable Realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE crops;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE livestock;
ALTER PUBLICATION supabase_realtime ADD TABLE products;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE financial_records;

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-avdw5t0e8yrl-images', 'app-avdw5t0e8yrl-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for image uploads
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-avdw5t0e8yrl-images');

CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'app-avdw5t0e8yrl-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'app-avdw5t0e8yrl-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'app-avdw5t0e8yrl-images' 
  AND auth.role() = 'authenticated'
);