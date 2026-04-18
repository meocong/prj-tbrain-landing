import { Storage, type Bucket } from "@google-cloud/storage";

let _bucket: Bucket | null = null;

export function gcsBucket(): Bucket {
  if (_bucket) return _bucket;

  const bucketName = process.env.GCS_BUCKET_NAME ?? process.env.GCS_BUCKET;
  if (!bucketName) throw new Error("Missing GCS_BUCKET_NAME env");

  const projectId = process.env.GCS_PROJECT_ID;
  const clientEmail = process.env.GCS_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GCS_PRIVATE_KEY;
  const jsonRaw = process.env.GCS_SERVICE_ACCOUNT_JSON;

  let storage: Storage;
  if (clientEmail && privateKeyRaw) {
    // Unescape literal \n sequences that survive .env parsing.
    const privateKey = privateKeyRaw.replace(/\\n/g, "\n");
    storage = new Storage({
      projectId,
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  } else if (jsonRaw) {
    const credentials = JSON.parse(jsonRaw);
    storage = new Storage({ credentials, projectId: credentials.project_id });
  } else {
    storage = new Storage();
  }

  _bucket = storage.bucket(bucketName);
  return _bucket;
}

/**
 * Sign a short-lived V4 download URL. Callers use this for per-sample and
 * per-batch ZIP downloads — the browser streams directly from GCS.
 */
export async function signDownloadUrl(objectPath: string, ttlSeconds = 300): Promise<string> {
  const [url] = await gcsBucket()
    .file(objectPath)
    .getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + ttlSeconds * 1000,
    });
  return url;
}

export async function uploadBuffer(
  objectPath: string,
  data: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await gcsBucket().file(objectPath).save(data as Buffer, {
    resumable: false,
    metadata: { contentType },
  });
}

export async function downloadBuffer(objectPath: string): Promise<Buffer> {
  const [buf] = await gcsBucket().file(objectPath).download();
  return buf;
}

export function sampleZipObject(batchSlug: string, sampleSlug: string): string {
  return `samples/${batchSlug}/${sampleSlug}.zip`;
}

export function batchZipObject(batchSlug: string): string {
  return `batches/${batchSlug}.zip`;
}

export function fileObject(sampleId: string, path: string): string {
  return `files/${sampleId}/${path.replace(/^\/+/, "")}`;
}
