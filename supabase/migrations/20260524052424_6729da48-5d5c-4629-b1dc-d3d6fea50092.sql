
-- 1) Remove broad SELECT on subscribers; reads should go through server functions using the service role
DROP POLICY IF EXISTS "Authenticated users can view subscribers" ON public.subscribers;

-- 2) Restrict storage uploads on destination-images bucket to the user's own folder
DROP POLICY IF EXISTS "Authenticated users can upload destination images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload destination images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated can upload to destination-images" ON storage.objects;
DROP POLICY IF EXISTS "destination-images insert" ON storage.objects;
DROP POLICY IF EXISTS "Anyone authenticated can upload destination images" ON storage.objects;

CREATE POLICY "Users can upload to their own folder in destination-images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'destination-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own files in destination-images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'destination-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files in destination-images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'destination-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
