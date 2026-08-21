import { put, del } from '@vercel/blob';

export function blobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export function isBlobUrl(url: string): boolean {
  return (
    url.startsWith('https://') &&
    (url.includes('.vercel-storage.com') || url.includes('blob.vercel-storage.com'))
  );
}

export async function uploadToBlob(
  file: File,
  prefix = 'cottages'
): Promise<string | null> {
  if (!blobEnabled()) return null;
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_');
  const blob = await put(`${prefix}/${safeName}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  return blob.url;
}

export async function deleteBlob(url: string): Promise<void> {
  if (!blobEnabled() || !isBlobUrl(url)) return;
  try {
    await del(url);
  } catch {
    // non bloquant — l'image est déjà supprimée de la DB
  }
}