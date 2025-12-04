-- Create a public storage bucket for scrapbook media
insert into storage.buckets (id, name, public)
values ('scrapbook-media', 'scrapbook-media', true);

-- Policy: Allow authenticated users to upload files
create policy "Authenticated users can upload scrapbook media"
on storage.objects for insert
with check ( bucket_id = 'scrapbook-media' and auth.role() = 'authenticated' );

-- Policy: Allow public to view files (since bucket is public)
create policy "Public can view scrapbook media"
on storage.objects for select
using ( bucket_id = 'scrapbook-media' );

-- Policy: Users can delete their own files
create policy "Users can delete their own scrapbook media"
on storage.objects for delete
using ( bucket_id = 'scrapbook-media' and auth.uid() = owner );
