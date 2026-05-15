/**
 * Centralized storage utilities for the landing platform.
 *
 * Path conventions:
 *   - Terminal Bench:  samples/{batchSlug}/{sampleSlug}.zip
 *                      batches/{batchSlug}.zip
 *                      files/{sampleId}/{path}
 *   - CMS assets:      cms/{year}/{month}/{uuid}_{filename}
 *   - Avatars:         avatars/{userId}_{filename}
 *
 * All paths are relative to GCS_BUCKET_NAME.
 */

import { gcsBucket, signDownloadUrl, uploadBuffer } from "./terminal-bench/gcs";

export { signDownloadUrl } from "./terminal-bench/gcs";

/**
 * Build a GCS path for a CMS asset upload.
 */
export function cmsAssetPath(filename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const uuid = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `cms/${year}/${month}/${uuid}_${safe}`;
}

/**
 * Upload a CMS asset (image, document) to GCS and return the path.
 */
export async function uploadCmsAsset(
  filename: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<{ gcsObject: string; publicUrl: string }> {
  const gcsObject = cmsAssetPath(filename);
  await uploadBuffer(gcsObject, data, contentType);
  const publicUrl = await signDownloadUrl(gcsObject, 86400); // 24h URL
  return { gcsObject, publicUrl };
}

/**
 * Create a resumable upload session for large file uploads from the browser.
 */
export async function createResumableUpload(
  gcsPath: string,
  contentType: string,
  origin: string
): Promise<string> {
  const [sessionUri] = await gcsBucket()
    .file(gcsPath)
    .createResumableUpload({
      metadata: { contentType },
      origin, // CRITICAL: include origin for CORS
    });
  return sessionUri;
}
