-- Makes only marketplace product images public. Product model buckets stay private.

update storage.buckets
set public = true
where id = 'product-images';

drop policy if exists "Published product images can be signed" on storage.objects;
