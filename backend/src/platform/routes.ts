import { Router, Response, RequestHandler } from 'express';
import multer from 'multer';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { isValidObjectId } from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/superAdminAuth';
import { registerAgency } from '../controllers/authController';
import { Organization } from '../models/Organization';
import { SubscriptionPlan } from '../models/SubscriptionPlan';
import { AuditLog } from '../models/AuditLog';
import { Lead } from '../models/Lead';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { Module, modules, requireModule, workspaceAccess } from './access';
import { Workspace, Website } from './models';
import { seal, open, mediaCredentials, testCloudinary, validateMongoUri, withContent, withMongo } from './connections';

const sectionModules: Record<string, Module> = {
  homepage: 'websites', packages: 'websites', contact: 'websites', reviews: 'websites',
  pages: 'pages', blog: 'blog', seo: 'seo',
};
const safe = (handler: RequestHandler): RequestHandler => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};

const digest = (value: string) => createHash('sha256').update(value).digest('hex');

function sectionModule(section: string): Module | undefined {
  if (!/^[a-z][a-z0-9-]{0,47}$/.test(section)) return undefined;
  return Object.hasOwn(sectionModules, section) ? sectionModules[section] : 'pages';
}

export const platformAdmin = Router();
platformAdmin.use(authenticate, requireSuperAdmin);
platformAdmin.post('/clients', registerAgency);

platformAdmin.get('/clients/:id', safe(async (req, res) => {
  const id = String(req.params.id);
  if (!isValidObjectId(id)) return res.status(404).json({ error: 'Client not found.' });
  const [organization, settings, sites] = await Promise.all([
    Organization.findById(id).select('name plan status').lean(),
    Workspace.findOne({ organizationId: id }).lean(),
    Website.find({ organizationId: id }).lean(),
  ]);
  if (!organization) return res.status(404).json({ error: 'Client not found.' });
  res.json({ organization, sites, modules, addOns: settings?.addOns ?? [], billing: settings?.billing ?? {},
    connections: { mongo: Boolean(settings?.mongo), cloudinary: Boolean(settings?.cloudinary) } });
}));

async function audit(req: AuthenticatedRequest, organizationId: string, action: string, details: string) {
  await AuditLog.create({ actorEmail: req.user!.email, actorRole: req.user!.role, targetOrgId: organizationId, action, details });
}

platformAdmin.put('/clients/:id/plan', safe(async (req, res) => {
  const id = String(req.params.id);
  const { plan, addOns } = req.body;
  if (!['STARTER', 'PRO', 'ENTERPRISE', 'CUSTOM'].includes(plan) ||
      !Array.isArray(addOns) || addOns.some((item) => !modules.includes(item))) {
    return res.status(400).json({ error: 'Select a valid plan and modules.' });
  }
  const selectedPlan = await SubscriptionPlan.findOne({ code: plan }).lean();
  if (selectedPlan?.isActive === false) return res.status(400).json({ error: 'The plan is inactive.' });
  const client = await Organization.findByIdAndUpdate(id, { plan,
    ...(selectedPlan && { maxSeats: selectedPlan.maxSeats, maxLeads: selectedPlan.maxLeads }) });
  if (!client) return res.status(404).json({ error: 'Client not found.' });
  await Workspace.updateOne({ organizationId: id }, { $set: { addOns: [...new Set(addOns)] } }, { upsert: true });
  await audit(req, id, 'ASSIGN_PLAN', `Assigned ${plan} with ${addOns.length} add-ons.`);
  res.json({ ok: true });
}));

platformAdmin.put('/clients/:id/billing', safe(async (req, res) => {
  const id = String(req.params.id);
  const { checkoutUrl, paymentReference, paidThrough } = req.body;
  let url = '';
  try {
    if (checkoutUrl) {
      const candidate = new URL(checkoutUrl);
      if (candidate.protocol !== 'https:' || candidate.username || candidate.password) throw new Error();
      url = candidate.href;
    }
  } catch {
    return res.status(400).json({ error: 'Enter a valid HTTPS GrowMe checkout link.' });
  }
  if (!await Organization.exists({ _id: id })) return res.status(404).json({ error: 'Client not found.' });
  const changes: Record<string, unknown> = { 'billing.checkoutUrl': url };
  if (paidThrough || paymentReference) {
    const expiry = new Date(paidThrough);
    if (typeof paymentReference !== 'string' || !paymentReference.trim() || typeof paidThrough !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(paidThrough) || !Number.isFinite(expiry.getTime()) || expiry.toISOString().slice(0, 10) !== paidThrough) {
      return res.status(400).json({ error: 'Enter a payment reference and valid paid-through date.' });
    }
    changes['billing.paidThrough'] = expiry;
    changes['billing.paymentReference'] = paymentReference.trim().slice(0, 160);
  }
  await Workspace.updateOne({ organizationId: id }, { $set: changes }, { upsert: true });
  await audit(req, id, 'UPDATE_GROWME_BILLING', paidThrough ? 'Recorded a GrowMe subscription payment.' : 'Updated the GrowMe checkout link.');
  res.json({ ok: true });
}));

platformAdmin.post('/clients/:id/connections', safe(async (req, res) => {
  const id = String(req.params.id);
  const { provider, activate } = req.body;
  if (!await Organization.exists({ _id: id })) return res.status(404).json({ error: 'Client not found.' });
  let encrypted: string | undefined;
  try {
    if (provider === 'mongo') {
      const uri = validateMongoUri(String(req.body.uri || ''));
      if (activate && await Website.exists({ organizationId: id })) {
        const settings = await Workspace.findOne({ organizationId: id }).lean();
        const current = settings?.mongo && new URL(open(settings.mongo));
        const next = new URL(uri);
        if (!current || current.hostname !== next.hostname || current.pathname !== next.pathname) {
          return res.status(409).json({ error: 'Moving an existing website to another database requires a content migration.' });
        }
      }
      await withMongo(uri, async (connection) => {
        await connection.db!.command({ ping: 1 });
        const probes = connection.db!.collection('growme_connection_checks');
        const result = await probes.insertOne({ checkedAt: new Date() });
        await probes.deleteOne({ _id: result.insertedId });
      });
      if (activate) encrypted = seal(uri);
    } else if (provider === 'cloudinary') {
      const cloud = { cloudName: String(req.body.cloudName || ''), apiKey: String(req.body.apiKey || ''), apiSecret: String(req.body.apiSecret || '') };
      await testCloudinary(cloud);
      if (activate) encrypted = seal(JSON.stringify(cloud));
    } else {
      return res.status(400).json({ error: 'Select a supported connection.' });
    }
  } catch {
    return res.status(400).json({ error: 'Connection test failed. Check credentials, access permissions and server configuration.' });
  }
  if (encrypted) {
    await Workspace.updateOne({ organizationId: id }, { $set: { [provider]: encrypted } }, { upsert: true });
    await audit(req, id, 'ACTIVATE_CONNECTION', `Activated ${provider} for the client.`);
  }
  res.json({ verified: true, activated: Boolean(encrypted) });
}));

platformAdmin.post('/clients/:id/websites', safe(async (req, res) => {
  const id = String(req.params.id);
  const { name, sections } = req.body;
  const domain = String(req.body.domain || '').trim().toLowerCase();
  if (typeof name !== 'string' || !name.trim() || !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain) ||
      !Array.isArray(sections) || !sections.length || sections.length > 25 || sections.some((section) => !sectionModule(section))) {
    return res.status(400).json({ error: 'Enter a site name, domain, and up to 25 valid section slugs.' });
  }
  if (!await Organization.exists({ _id: id })) return res.status(404).json({ error: 'Client not found.' });
  if (await Website.exists({ domain })) return res.status(409).json({ error: 'This domain is already connected.' });
  const formKey = randomBytes(32).toString('hex');
  const site = await Website.create({ organizationId: id, name: name.trim(), domain, sections: [...new Set(sections)], formKeyHash: digest(formKey) });
  await audit(req, id, 'CONNECT_WEBSITE', `Connected ${domain}.`);
  res.status(201).json({ siteId: site.id, formKey });
}));

platformAdmin.post('/clients/:id/websites/:siteId/form-key', safe(async (req, res) => {
  const formKey = randomBytes(32).toString('hex');
  const site = await Website.findOneAndUpdate({ _id: req.params.siteId, organizationId: req.params.id }, { formKeyHash: digest(formKey) });
  if (!site) return res.status(404).json({ error: 'Website not found.' });
  await audit(req, String(req.params.id), 'ROTATE_SITE_FORM_KEY', `Rotated the form key for ${site.domain}.`);
  res.json({ siteId: site.id, formKey });
}));

export const workspaceRouter = Router();
workspaceRouter.use(authenticate);
workspaceRouter.get('/access', safe(async (req: AuthenticatedRequest, res) => {
  const access = req.user?.organizationId && await workspaceAccess(req.user.organizationId);
  if (!access) return res.status(403).json({ error: 'Workspace unavailable.' });
  res.json({ modules: access.enabled, plan: access.organization.plan,
    billing: { checkoutUrl: ['OWNER', 'ADMIN'].includes(req.user!.role) ? access.workspace?.billing?.checkoutUrl : undefined, paidThrough: access.workspace?.billing?.paidThrough } });
}));

workspaceRouter.use('/websites', requireModule('websites'));
workspaceRouter.get('/websites', safe(async (req: AuthenticatedRequest, res) => {
  const sites = await Website.find({ organizationId: req.user!.organizationId }).sort({ name: 1 }).lean();
  res.json({ sites });
}));

async function editorSite(req: AuthenticatedRequest, res: Response) {
  if (!isValidObjectId(req.params.siteId)) {
    res.status(404).json({ error: 'Website not found.' });
    return null;
  }
  const organizationId = req.user!.organizationId!;
  const [site, access] = await Promise.all([
    Website.findOne({ _id: req.params.siteId, organizationId }),
    workspaceAccess(organizationId),
  ]);
  if (!site || !access) {
    res.status(404).json({ error: 'Website not found.' });
    return null;
  }
  const sections = site.sections.filter((section) => access.enabled.includes(sectionModule(section)!));
  return { site, access, sections };
}

workspaceRouter.get('/websites/:siteId', safe(async (req, res) => {
  const result = await editorSite(req, res);
  if (!result) return;
  const { site, access, sections } = result;
  const content = await withContent(access.workspace, (collection) => collection.findOne({ _id: site._id }));
  res.json({ site: { ...site.toObject(), sections },
    draft: Object.fromEntries(sections.filter((section) => content?.draft?.[section]).map((section) => [section, content!.draft[section]])),
    publishedAt: content?.publishedAt });
}));

workspaceRouter.put('/websites/:siteId/sections/:section', authorizeRoles('OWNER', 'ADMIN', 'MANAGER'), safe(async (req, res) => {
  const result = await editorSite(req, res);
  if (!result) return;
  const section = String(req.params.section);
  if (!result.sections.includes(section)) return res.status(403).json({ error: 'This section is unavailable.' });
  const { title, body, image, entries = [] } = req.body;
  if (typeof title !== 'string' || title.length > 180 || typeof body !== 'string' || body.length > 40000 ||
      typeof image !== 'string' || image.length > 2048 || (image && !/^https:\/\//i.test(image))) {
    return res.status(400).json({ error: 'Enter valid content and an HTTPS image URL.' });
  }
  if (!Array.isArray(entries) || entries.length > 100 || entries.some((entry) =>
    !entry || typeof entry.slug !== 'string' || !sectionModule(entry.slug) ||
    typeof entry.title !== 'string' || entry.title.length > 180 || typeof entry.body !== 'string' || entry.body.length > 10000 ||
    typeof entry.image !== 'string' || entry.image.length > 2048 || (entry.image && !/^https:\/\//i.test(entry.image))
  ) || new Set(entries.map((entry) => entry.slug)).size !== entries.length) {
    return res.status(400).json({ error: 'Entries need unique URL slugs and valid content.' });
  }
  const orderedEntries = entries.map(({ slug, title, body, image }) => ({ slug, title, body, image }));
  if (Buffer.byteLength(JSON.stringify({ title, body, image, entries: orderedEntries })) > 200000) {
    return res.status(400).json({ error: 'This section exceeds the content size limit.' });
  }
  await withContent(result.access.workspace, (collection) => collection.updateOne({ _id: result.site._id }, {
    $set: { [`draft.${section}`]: { title, body, image, entries: orderedEntries } }, $setOnInsert: { published: {} },
  }, { upsert: true }));
  res.json({ ok: true });
}));

workspaceRouter.post('/websites/:siteId/preview', authorizeRoles('OWNER', 'ADMIN', 'MANAGER'), safe(async (req: AuthenticatedRequest, res) => {
  const result = await editorSite(req, res);
  if (!result) return;
  const token = jwt.sign({ siteId: result.site.id, organizationId: req.user!.organizationId, userId: req.user!.userId },
    process.env.JWT_SECRET!, { expiresIn: '10m', audience: 'growme-site-preview' });
  res.set('Cache-Control', 'no-store');
  res.json({ url: `https://${result.site.domain}/#growme-preview=${token}` });
}));

workspaceRouter.post('/websites/:siteId/publish', authorizeRoles('OWNER', 'ADMIN'), safe(async (req, res) => {
  const result = await editorSite(req, res);
  if (!result) return;
  const updates = Object.fromEntries(result.sections.map((section) => [
    `published.${section}`, { $ifNull: [`$draft.${section}`, `$published.${section}`] },
  ]));
  const published = await withContent(result.access.workspace, (collection) => collection.updateOne(
    { _id: result.site._id, draft: { $ne: {} } }, [{ $set: { ...updates, publishedAt: '$$NOW' } }],
  ));
  if (!published.matchedCount) return res.status(400).json({ error: 'Save a draft before publishing.' });
  res.json({ ok: true });
}));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
workspaceRouter.post('/websites/:siteId/media', requireModule('media'), authorizeRoles('OWNER', 'ADMIN', 'MANAGER'), upload.single('file'), safe(async (req, res) => {
  const result = await editorSite(req, res);
  if (!result) return;
  const file = req.file;
  if (!file || !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(file.mimetype)) {
    return res.status(400).json({ error: 'Choose a JPEG, PNG, WebP, GIF or AVIF image.' });
  }
  const { cloudName, apiKey, apiSecret } = mediaCredentials(result.access.workspace);
  const folder = `growme/${result.site.id}`;
  const timestamp = Math.floor(Date.now() / 1000);
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }), file.originalname);
  form.set('folder', folder);
  form.set('timestamp', String(timestamp));
  form.set('api_key', apiKey);
  form.set('signature', cloudinary.utils.api_sign_request({ folder, timestamp }, apiSecret));
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: form, signal: AbortSignal.timeout(20000) });
  if (!response.ok) return res.status(502).json({ error: 'Cloudinary could not upload the image.' });
  const media = await response.json() as { secure_url: string };
  res.json({ url: media.secure_url });
}));

export const publicWebsites = Router();
publicWebsites.get('/:siteId/preview', safe(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  let claims: jwt.JwtPayload;
  try {
    const bearer = req.get('Authorization') || '';
    if (!bearer.startsWith('Bearer ')) throw new Error();
    const verified = jwt.verify(bearer.slice(7), process.env.JWT_SECRET!, { audience: 'growme-site-preview' });
    if (typeof verified !== 'object' || verified.siteId !== req.params.siteId) throw new Error();
    claims = verified;
  } catch {
    return res.status(401).json({ error: 'Preview link is invalid or expired.' });
  }
  const [site, access, editor] = await Promise.all([
    Website.findOne({ _id: claims.siteId, organizationId: claims.organizationId }),
    workspaceAccess(claims.organizationId),
    User.findOne({ _id: claims.userId, organizationId: claims.organizationId, status: 'Active', role: { $in: ['OWNER', 'ADMIN', 'MANAGER'] } }).lean(),
  ]);
  if (!site || !editor || !access?.enabled.includes('websites')) return res.status(403).json({ error: 'Preview is unavailable.' });
  const content = await withContent(access.workspace, (collection) => collection.findOne({ _id: site._id }));
  const sections = { ...content?.published };
  for (const section of site.sections) {
    if (access.enabled.includes(sectionModule(section)!) && content?.draft?.[section]) sections[section] = content.draft[section];
  }
  res.json({ name: site.name, domain: site.domain, sections, publishedAt: content?.publishedAt });
}));

publicWebsites.get('/:siteId', safe(async (req, res) => {
  const site = isValidObjectId(req.params.siteId) && await Website.findById(req.params.siteId);
  if (!site) return res.status(404).json({ error: 'Website not found.' });
  const settings = await Workspace.findOne({ organizationId: site.organizationId }).lean();
  const content = await withContent(settings, (collection) => collection.findOne({ _id: site._id, publishedAt: { $exists: true } }));
  if (!content) return res.status(404).json({ error: 'Website content has not been published.' });
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=60');
  res.json({ name: site.name, domain: site.domain, sections: content.published, publishedAt: content.publishedAt });
}));

publicWebsites.post('/:siteId/enquiries', safe(async (req, res) => {
  const key = req.get('x-growme-site-key');
  const site = key && isValidObjectId(req.params.siteId) && await Website.findById(req.params.siteId).select('+formKeyHash');
  if (!site || !key || site.formKeyHash.length !== 64 || !timingSafeEqual(Buffer.from(digest(key)), Buffer.from(site.formKeyHash))) {
    return res.status(401).json({ error: 'Invalid website connection.' });
  }
  const access = await workspaceAccess(String(site.organizationId));
  if (!access?.enabled.includes('leads')) return res.status(403).json({ error: 'Lead capture is unavailable.' });
  const field = (key: string, max: number) => typeof req.body[key] === 'string' ? req.body[key].trim().slice(0, max) : '';
  const name = field('name', 150);
  const phone = field('phone', 40);
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required.' });
  const lead = await Lead.create({
    organizationId: site.organizationId, websiteId: site._id, source: 'Website', name, phone,
    email: field('email', 150) || undefined, destination: field('destination', 180) || 'Website enquiry',
    interestedPackage: field('package', 180), notes: field('message', 3000),
    activities: [{ type: 'created', description: `Enquiry received from ${site.domain}.`, author: site.name }],
  });
  res.status(201).json({ id: lead.id });
}));
