import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import mongoose, { Connection } from 'mongoose';
import { WorkspaceSettings, WebsiteContent } from './models';

export function seal(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const data = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map((part) => part.toString('base64url')).join('.');
}

export function open(value: string): string {
  const [iv, tag, data] = value.split('.').map((part) => Buffer.from(part, 'base64url'));
  const cipher = createDecipheriv('aes-256-gcm', encryptionKey(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString('utf8');
}

function encryptionKey(): Buffer {
  const key = Buffer.from(process.env.GROWME_CONNECTION_KEY ?? '', 'base64');
  if (key.length !== 32) throw new Error('Configure a 32-byte GROWME_CONNECTION_KEY on the server.');
  return key;
}

export function validateMongoUri(uri: string): string {
  const url = new URL(uri);
  const permittedQuery = new Set(['retryWrites', 'w', 'appName']);
  if (url.protocol !== 'mongodb+srv:' || !/^[a-z\d.-]+\.mongodb\.net$/i.test(url.hostname) ||
      !url.username || !url.password || url.port || !/^\/[\w-]+$/.test(url.pathname) || [...url.searchParams.keys()].some((key) => !permittedQuery.has(key)) || url.hash) {
    throw new Error('Use an Atlas mongodb+srv URI with credentials and a dedicated database name, with standard Atlas options.');
  }
  return url.href;
}

export async function withMongo<T>(uri: string, run: (connection: Connection) => Promise<T>) {
  const connection = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 3 });
  try {
    await connection.asPromise();
    return await run(connection);
  } finally {
    await connection.close();
  }
}

export async function withContent<T>(
  settings: Pick<WorkspaceSettings, 'mongo'> | null | undefined,
  run: (collection: ReturnType<typeof getContentCollection>) => Promise<T>,
) {
  if (!settings?.mongo) {
    throw Object.assign(new Error("Connect the client's MongoDB in Super Admin → Connections before managing website content."), { status: 400 });
  }
  return withMongo(open(settings.mongo), (connection) => run(getContentCollection(connection)));
}

function getContentCollection(connection: Connection) {
  return connection.db!.collection<WebsiteContent>('growme_website_content');
}

export interface CloudCredentials { cloudName: string; apiKey: string; apiSecret: string }

export async function testCloudinary({ cloudName, apiKey, apiSecret }: CloudCredentials) {
  if (!/^[a-z\d_-]+$/i.test(cloudName) || !apiKey || !apiSecret) throw new Error('Enter valid Cloudinary credentials.');
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/ping`, {
    headers: { Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')}` },
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error('Cloudinary credentials could not be verified.');
}

export function mediaCredentials(settings: WorkspaceSettings | null): CloudCredentials {
  if (settings?.cloudinary) return JSON.parse(open(settings.cloudinary)) as CloudCredentials;
  const { CLOUDINARY_CLOUD_NAME: cloudName, CLOUDINARY_API_KEY: apiKey, CLOUDINARY_API_SECRET: apiSecret } = process.env;
  if (!cloudName || !apiKey || !apiSecret) throw new Error('Cloudinary is not configured for this website.');
  return { cloudName, apiKey, apiSecret };
}
