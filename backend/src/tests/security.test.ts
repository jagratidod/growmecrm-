import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { PlatformSetting } from '../models/PlatformSetting';
import { AuditLog } from '../models/AuditLog';
import {
  MissingEncryptionKeyError, decryptSecret, encryptSecret, hasEncryptionKey, isEncryptedSecret, open, seal,
} from '../utils/secrets';
import { readPlatformSecret } from '../utils/platformState';
import { verifyHandshake } from '../controllers/webhookController';
import { encryptLegacySecrets, getPlatformSettings, updatePlatformSettings } from '../controllers/superAdminController';
import type { AuthenticatedRequest } from '../types';

const KEY = randomBytes(32).toString('base64');
const savedEnv = { ...process.env };

beforeEach(() => { process.env.GROWME_CONNECTION_KEY = KEY; });
afterEach(() => {
  for (const name of Object.keys(process.env)) if (!(name in savedEnv)) delete process.env[name];
  Object.assign(process.env, savedEnv);
});

// ---------- helpers -------------------------------------------------------------------------

function fakeRes() {
  const res = { statusCode: 200, body: undefined as any, sent: undefined as any, headers: {} as Record<string, string> } as any;
  res.status = (code: number) => { res.statusCode = code; return res; };
  res.json = (body: unknown) => { res.body = body; return res; };
  res.type = (value: string) => { res.headers.type = value; return res; };
  res.send = (body: unknown) => { res.sent = body; return res; };
  return res as Response & { statusCode: number; body: any; sent: any; headers: Record<string, string> };
}

const handshakeReq = (query: Record<string, unknown>) => ({ query }) as unknown as Request;

/** A stand-in for a Mongoose PlatformSetting document that records writes. */
function fakeSettingsDoc(initial: Record<string, unknown> = {}) {
  const data: Record<string, unknown> = {
    platformName: 'GrowMe CRM', maintenanceMode: false, allowNewRegistrations: true, defaultTrialDays: 14,
    razorpayKeyId: '', razorpayKeySecret: '', razorpayWebhookSecret: '', stripeSecretKey: '', smtpPassword: '',
    ...initial,
  };
  const doc = {
    saves: 0,
    data,
    get: (key: string) => data[key],
    set(keyOrObject: string | Record<string, unknown>, value?: unknown) {
      if (typeof keyOrObject === 'string') data[keyOrObject] = value;
      else Object.assign(data, keyOrObject);
    },
    async save() { doc.saves += 1; return doc; },
    toObject: () => ({ ...data }),
  };
  return doc;
}

function stubSettings(doc: ReturnType<typeof fakeSettingsDoc> | null) {
  const query = {
    sort() { return query; },
    select() { return query; },
    lean: () => Promise.resolve(doc ? { ...doc.data } : null),
    then: (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) => Promise.resolve(doc).then(resolve, reject),
  };
  const model = PlatformSetting as any;
  const originals = { findOne: model.findOne, create: model.create };
  model.findOne = () => query;
  model.create = async () => doc;
  const audit = AuditLog as any;
  const originalAudit = audit.create;
  const auditEntries: unknown[] = [];
  audit.create = async (entry: unknown) => { auditEntries.push(entry); return entry; };
  return {
    auditEntries,
    restore() { model.findOne = originals.findOne; model.create = originals.create; audit.create = originalAudit; },
  };
}

const superAdminReq = (body: unknown) => ({
  body, user: { userId: '1', role: 'SUPER_ADMIN', email: 'root@example.com' }, ip: '203.0.113.9',
}) as unknown as AuthenticatedRequest;

// ---------- secrets encryption --------------------------------------------------------------

describe('secret encryption at rest', () => {
  it('round-trips a secret and never stores it in plaintext', () => {
    const stored = encryptSecret('rzp_live_supersecret');
    assert.ok(isEncryptedSecret(stored));
    assert.ok(!stored.includes('rzp_live_supersecret'));
    assert.equal(decryptSecret(stored), 'rzp_live_supersecret');
  });

  it('uses a fresh nonce so equal secrets produce different ciphertexts', () => {
    assert.notEqual(encryptSecret('same-value'), encryptSecret('same-value'));
  });

  it('keeps empty values empty', () => {
    assert.equal(encryptSecret(''), '');
    assert.equal(decryptSecret(''), '');
    assert.equal(decryptSecret(undefined), '');
  });

  it('rejects tampered ciphertext (GCM authentication)', () => {
    const sealed = seal('top-secret');
    const [iv, tag, data] = sealed.split('.');
    const flipped = Buffer.from(data, 'base64url');
    flipped[0] ^= 0xff;
    assert.throws(() => open([iv, tag, flipped.toString('base64url')].join('.')));
  });

  it('cannot be decrypted with a different key', () => {
    const stored = encryptSecret('top-secret');
    process.env.GROWME_CONNECTION_KEY = randomBytes(32).toString('base64');
    assert.throws(() => decryptSecret(stored));
  });

  it('fails clearly when the key is missing or the wrong size', () => {
    delete process.env.GROWME_CONNECTION_KEY;
    assert.equal(hasEncryptionKey(), false);
    assert.throws(() => encryptSecret('x'), MissingEncryptionKeyError);
    process.env.GROWME_CONNECTION_KEY = Buffer.from('too-short').toString('base64');
    assert.equal(hasEncryptionKey(), false);
    assert.throws(() => encryptSecret('x'), MissingEncryptionKeyError);
  });

  it('passes legacy plaintext values through so existing installs keep working', () => {
    assert.equal(decryptSecret('legacy-plaintext'), 'legacy-plaintext');
  });
});

describe('platform settings API', () => {
  it('encrypts secrets on save and never returns them', async () => {
    const doc = fakeSettingsDoc();
    const stub = stubSettings(doc);
    try {
      const res = fakeRes();
      await updatePlatformSettings(superAdminReq({
        platformName: 'Acme', razorpayKeySecret: 'rzp_secret_123', smtpPassword: 'smtp-pass-456',
      }), res);

      assert.equal(res.statusCode, 200);
      // Stored encrypted, decryptable, not plaintext.
      for (const [field, plain] of [['razorpayKeySecret', 'rzp_secret_123'], ['smtpPassword', 'smtp-pass-456']] as const) {
        const stored = doc.data[field] as string;
        assert.ok(isEncryptedSecret(stored), `${field} should be encrypted`);
        assert.ok(!stored.includes(plain));
        assert.equal(decryptSecret(stored), plain);
      }
      // Response never contains the secrets or their ciphertext, only presence flags.
      const json = JSON.stringify(res.body);
      assert.ok(!json.includes('rzp_secret_123') && !json.includes('smtp-pass-456') && !json.includes('enc:v1:'));
      assert.equal(res.body.settings.secretsSet.razorpayKeySecret, true);
      assert.equal(res.body.settings.secretsSet.stripeSecretKey, false);
      assert.equal(res.body.settings.razorpayKeySecret, undefined);
      assert.equal(res.body.settings.platformName, 'Acme');
      // Secrets are not written to the audit trail either.
      assert.ok(!JSON.stringify(stub.auditEntries).includes('rzp_secret_123'));
    } finally { stub.restore(); }
  });

  it('keeps the stored secret when the field is left blank or omitted', async () => {
    const doc = fakeSettingsDoc({ razorpayKeySecret: encryptSecret('keep-me') });
    const before = doc.data.razorpayKeySecret;
    const stub = stubSettings(doc);
    try {
      const res = fakeRes();
      await updatePlatformSettings(superAdminReq({ razorpayKeySecret: '   ', platformName: 'Renamed' }), res);
      assert.equal(res.statusCode, 200);
      assert.equal(doc.data.razorpayKeySecret, before);
      assert.equal(decryptSecret(doc.data.razorpayKeySecret as string), 'keep-me');
    } finally { stub.restore(); }
  });

  it('refuses to store a secret when no encryption key is configured, instead of saving plaintext', async () => {
    delete process.env.GROWME_CONNECTION_KEY;
    const doc = fakeSettingsDoc();
    const stub = stubSettings(doc);
    try {
      const res = fakeRes();
      await updatePlatformSettings(superAdminReq({ stripeSecretKey: 'sk_live_abc' }), res);
      assert.equal(res.statusCode, 503);
      assert.equal(doc.data.stripeSecretKey, '');
      assert.equal(doc.saves, 0);
    } finally { stub.restore(); }
  });

  it('migrates legacy plaintext secrets to encrypted form when settings are read', async () => {
    const doc = fakeSettingsDoc({ stripeSecretKey: 'sk_live_legacy', razorpayKeySecret: encryptSecret('already-sealed') });
    const stub = stubSettings(doc);
    try {
      const res = fakeRes();
      await getPlatformSettings(superAdminReq(undefined), res);
      assert.equal(res.statusCode, 200);
      assert.ok(isEncryptedSecret(doc.data.stripeSecretKey));
      assert.equal(decryptSecret(doc.data.stripeSecretKey as string), 'sk_live_legacy');
      assert.equal(decryptSecret(doc.data.razorpayKeySecret as string), 'already-sealed'); // not double-encrypted
      assert.equal(doc.saves, 1);
      assert.ok(!JSON.stringify(res.body).includes('sk_live_legacy'));
      assert.equal(res.body.settings.secretsSet.stripeSecretKey, true);
    } finally { stub.restore(); }
  });

  it('does not rewrite settings on read when nothing needs migrating', async () => {
    const doc = fakeSettingsDoc({ stripeSecretKey: encryptSecret('sealed') });
    const stub = stubSettings(doc);
    try {
      await getPlatformSettings(superAdminReq(undefined), fakeRes());
      assert.equal(doc.saves, 0);
    } finally { stub.restore(); }
  });

  it('migration works on a real Mongoose document and is idempotent', async () => {
    const doc = new PlatformSetting({ stripeSecretKey: 'sk_live_legacy', smtpPassword: 'mail-pass', platformName: 'Keep' });
    let saves = 0;
    (doc as any).save = async () => { saves += 1; return doc; };

    await encryptLegacySecrets(doc);
    assert.equal(saves, 1);
    assert.ok(isEncryptedSecret(doc.stripeSecretKey) && isEncryptedSecret(doc.smtpPassword));
    assert.equal(decryptSecret(doc.stripeSecretKey), 'sk_live_legacy');
    assert.equal(decryptSecret(doc.smtpPassword), 'mail-pass');
    assert.equal(doc.platformName, 'Keep'); // non-secret data untouched
    assert.equal(doc.razorpayKeySecret, ''); // empty secrets stay empty

    const first = doc.stripeSecretKey;
    await encryptLegacySecrets(doc);
    assert.equal(saves, 1); // second pass writes nothing
    assert.equal(doc.stripeSecretKey, first); // and does not re-encrypt
  });

  it('migration is skipped (data left untouched) when no encryption key is configured', async () => {
    delete process.env.GROWME_CONNECTION_KEY;
    const doc = new PlatformSetting({ stripeSecretKey: 'sk_live_legacy' });
    let saves = 0;
    (doc as any).save = async () => { saves += 1; return doc; };
    await encryptLegacySecrets(doc);
    assert.equal(saves, 0);
    assert.equal(doc.stripeSecretKey, 'sk_live_legacy');
  });

  it('readPlatformSecret returns the decrypted value for server-side use only', async () => {
    const doc = fakeSettingsDoc({ smtpPassword: encryptSecret('mail-pass'), stripeSecretKey: 'legacy-plain' });
    const stub = stubSettings(doc);
    try {
      assert.equal(await readPlatformSecret('smtpPassword'), 'mail-pass');
      assert.equal(await readPlatformSecret('stripeSecretKey'), 'legacy-plain');
      assert.equal(await readPlatformSecret('razorpayWebhookSecret'), '');
    } finally { stub.restore(); }
  });
});

// ---------- webhook verification tokens -----------------------------------------------------

describe('webhook handshake', () => {
  const TOKEN = 'a-long-random-verify-token-123';
  const query = (overrides: Record<string, unknown> = {}) => ({
    'hub.mode': 'subscribe', 'hub.verify_token': TOKEN, 'hub.challenge': '1158201444', ...overrides,
  });

  it('echoes the challenge when the token matches', () => {
    process.env.META_VERIFY_TOKEN = TOKEN;
    const res = fakeRes();
    verifyHandshake('META_VERIFY_TOKEN', 'Meta', handshakeReq(query()), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.sent, '1158201444');
    assert.equal(res.headers.type, 'text/plain');
  });

  it('fails closed when the server has no token configured', () => {
    delete process.env.META_VERIFY_TOKEN;
    const res = fakeRes();
    verifyHandshake('META_VERIFY_TOKEN', 'Meta', handshakeReq(query({ 'hub.verify_token': '' })), res);
    assert.equal(res.statusCode, 403);
    assert.equal(res.sent, undefined);
  });

  it('no longer accepts the old hard-coded default token', () => {
    delete process.env.META_VERIFY_TOKEN;
    delete process.env.WHATSAPP_VERIFY_TOKEN;
    for (const [env, label] of [['META_VERIFY_TOKEN', 'Meta'], ['WHATSAPP_VERIFY_TOKEN', 'WhatsApp']]) {
      const res = fakeRes();
      verifyHandshake(env, label, handshakeReq(query({ 'hub.verify_token': 'growme_crm_verify_token' })), res);
      assert.equal(res.statusCode, 403, `${label} must reject the legacy default`);
    }
  });

  it('rejects a configured token that is too short to be safe', () => {
    process.env.META_VERIFY_TOKEN = 'short';
    const res = fakeRes();
    verifyHandshake('META_VERIFY_TOKEN', 'Meta', handshakeReq(query({ 'hub.verify_token': 'short' })), res);
    assert.equal(res.statusCode, 403);
  });

  it('rejects wrong, missing, differently-sized and non-string tokens without throwing', () => {
    process.env.META_VERIFY_TOKEN = TOKEN;
    for (const bad of ['wrong-token-of-same-len-12', TOKEN + 'x', TOKEN.slice(1), '', undefined, ['a', 'b'], { a: 1 }]) {
      const res = fakeRes();
      verifyHandshake('META_VERIFY_TOKEN', 'Meta', handshakeReq(query({ 'hub.verify_token': bad })), res);
      assert.equal(res.statusCode, 403, `should reject ${JSON.stringify(bad)}`);
      assert.equal(res.sent, undefined);
    }
  });

  it('requires hub.mode=subscribe and a challenge', () => {
    process.env.META_VERIFY_TOKEN = TOKEN;
    let res = fakeRes();
    verifyHandshake('META_VERIFY_TOKEN', 'Meta', handshakeReq(query({ 'hub.mode': 'unsubscribe' })), res);
    assert.equal(res.statusCode, 403);
    res = fakeRes();
    verifyHandshake('META_VERIFY_TOKEN', 'Meta', handshakeReq(query({ 'hub.challenge': undefined })), res);
    assert.equal(res.statusCode, 403);
  });

  it('keeps Meta and WhatsApp tokens independent', () => {
    process.env.META_VERIFY_TOKEN = TOKEN;
    process.env.WHATSAPP_VERIFY_TOKEN = 'different-whatsapp-token-99';
    const res = fakeRes();
    verifyHandshake('WHATSAPP_VERIFY_TOKEN', 'WhatsApp', handshakeReq(query()), res); // Meta's token on WhatsApp
    assert.equal(res.statusCode, 403);
  });
});
