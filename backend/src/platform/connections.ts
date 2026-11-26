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
  rejectPlatformServer(url.href);
  return url.href;
}

function rejectPlatformServer(uri: string) {
  const platformUri = process.env.MONGODB_URI;
  if (platformUri && new URL(uri).hostname === new URL(platformUri).hostname) {
    throw new Error('Assign a client-owned MongoDB cluster separate from GrowMe.');
  }
}

let platformTopology: Promise<{ setName?: string; hosts?: string[] }> | undefined;

export async function withMongo<T>(uri: string, run: (connection: Connection) => Promise<T>) {
  rejectPlatformServer(uri);
  const connection = mongoose.createConnection(uri, { serverSelectionTimeoutMS: 5000, maxPoolSize: 3 });
  try {
    await connection.asPromise();
    platformTopology ??= mongoose.connection.db!.command({ hello: 1 }).catch((error) => {
      platformTopology = undefined;
      throw error;
    });
    const [platform, client] = await Promise.all([platformTopology, connection.db!.command({ hello: 1 })]);
    if ((platform.setName && platform.setName === client.setName) ||
        platform.hosts?.some((host) => client.hosts?.includes(host))) {
      throw new Error('Assign a client-owned MongoDB cluster separate from GrowMe.');
    }
    return await run(connection);
  } finally {
    await connection.close();
  }
}

export function withClientWebsiteDatabase<T>(
  settings: Pick<WorkspaceSettings, 'mongo'> | null | undefined,
  run: (connection: Connection) => Promise<T>,
) {
  if (!settings?.mongo) {
    throw Object.assign(new Error("Connect the client's MongoDB in Super Admin → Connections before managing website content."), { status: 409 });
  }
  return withMongo(open(settings.mongo), run);
}

export function withContent<T>(
  settings: Pick<WorkspaceSettings, 'mongo' | 'cloudinary'> | null | undefined,
  run: (collection: ReturnType<typeof getContentCollection>) => Promise<T>,
) {
  requireWebsiteServices(settings);
  return withClientWebsiteDatabase(settings, (connection) => run(getContentCollection(connection)));
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

export function requireWebsiteServices(settings?: Pick<WorkspaceSettings, 'mongo' | 'cloudinary'> | null) {
  if (!settings?.mongo || !settings.cloudinary) {
    throw Object.assign(new Error('Assign the client’s MongoDB and Cloudinary in Super Admin before managing this website.'), { status: 409 });
  }
}

export function assertClientCloudName(cloudName: string) {
  if (cloudName.trim().toLowerCase() === process.env.CLOUDINARY_CLOUD_NAME?.trim().toLowerCase()) {
    throw new Error('Assign the client’s own Cloudinary account.');
  }
}

export function mediaCredentials(settings: Pick<WorkspaceSettings, 'cloudinary'> | null): CloudCredentials {
  if (!settings?.cloudinary) {
    throw Object.assign(new Error('Assign the client’s Cloudinary account in Super Admin.'), { status: 409 });
  }
  const cloud = JSON.parse(open(settings.cloudinary)) as CloudCredentials;
  assertClientCloudName(cloud.cloudName);
  return cloud;
}

export function isClientImage(image: string, cloudName: string): boolean {
  if (!image) return true;
  try {
    const url = new URL(image);
    return url.protocol === 'https:' && url.host === 'res.cloudinary.com' &&
      !url.username && !url.password && url.pathname.startsWith(`/${cloudName}/image/upload/`);
  } catch {
    return false;
  }
}
