-- Create storage bucket for papers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'papers',
  'papers',
  true,
  52428800, -- 50MB limit
  ARRAY['application/pdf']::text[]
);

-- Storage policies for papers bucket
CREATE POLICY "Papers are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'papers');

CREATE POLICY "Authenticated users can upload papers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'papers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.foldername(name))[2] IN ('questions', 'solutions')
);

CREATE POLICY "Users can update their own papers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'papers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'papers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own papers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'papers' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
