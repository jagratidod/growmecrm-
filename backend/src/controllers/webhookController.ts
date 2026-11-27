import { createHmac, timingSafeEqual } from 'node:crypto';
import { Request, Response } from 'express';
import { Lead } from '../models/Lead';
import { Organization } from '../models/Organization';
import { workspaceAccess } from '../platform/access';
import { intakeKey, saveIncomingLead } from '../services/leadIntake';
import { leadsRemaining } from '../utils/quota';

/**
 * Provider verification handshake (GET ?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...).
 * Fails closed: with no token configured on the server nothing can pass, and there is no default token.
 */
export function verifyHandshake(envName: string, label: string, req: Request, res: Response): void {
  const expected = process.env[envName];
  const provided = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (!expected || expected.length < 16) {
    console.error(`[${label} Webhook] ${envName} is not configured (min 16 characters); rejecting verification.`);
    res.status(403).json({ error: 'Verification failed' });
    return;
  }

  const received = Buffer.from(typeof provided === 'string' ? provided : '');
  const wanted = Buffer.from(expected);
  const valid = req.query['hub.mode'] === 'subscribe' && typeof challenge === 'string' &&
    received.length === wanted.length && timingSafeEqual(received, wanted);

  if (!valid) {
    res.status(403).json({ error: 'Verification failed' });
    return;
  }
  res.status(200).type('text/plain').send(challenge);
}

// Helper to format Mongoose Lead doc for response
const formatLead = (doc: any) => {
  const obj = doc.toObject();
  return {
    ...obj,
    id: doc._id.toString(),
    _id: undefined,
  };
};

/**
 * 1. UNIVERSAL LEAD INGESTION WEBHOOK
 * Endpoint: POST /api/webhooks/lead
 * Can be called by:
 * - Website Enquiry Forms (JavaScript fetch)
 * - Pabbly Connect / Zapier / Make.com
 * - Custom Landing Pages (WordPress, Webflow, Wix, etc.)
 */
export const ingestLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const apiKey =
      (req.query.apiKey as string) ||
      (req.headers['x-api-key'] as string) ||
      req.body.apiKey;

    const org = typeof apiKey === 'string' && apiKey
      ? await Organization.findOne({ webhookApiKey: apiKey, status: { $in: ['ACTIVE', 'TRIAL'] } })
      : null;
    if (!org) {
      res.status(401).json({ success: false, error: 'A valid organization webhook key is required.' });
      return;
    }

    const access = await workspaceAccess(org.id);
    if (!access?.enabled.includes('leads')) {
      res.status(403).json({ success: false, error: 'Lead capture is unavailable.' });
      return;
    }

    if (await leadsRemaining(org._id) < 1) {
      res.status(403).json({ success: false, error: 'Lead limit reached for this workspace plan.' });
      return;
    }

    const {
      name,
      phone,
      email,
      source,
      destination,
      travelDate,
      travelers,
      budget,
      currency,
      interestedPackage,
      customerType,
      temperature,
      tags,
      notes,
    } = req.body;

    const leadName = typeof name === 'string' ? name.trim() : '';
    const leadPhone = typeof phone === 'string' ? phone.trim() : '';
    if (!leadName || leadPhone.replace(/\D/g, '').length < 7) {
      res.status(400).json({ error: 'Name and a valid phone are required.' }); return;
    }
    const suppliedEventId = req.get('Idempotency-Key') || (typeof req.body.eventId === 'string' ? req.body.eventId.trim() : '');
    if (suppliedEventId.length > 128) {
      res.status(400).json({ error: 'Event ID is too long.' }); return;
    }
    const leadDestination = (destination && String(destination).trim()) || 'General Enquiry';

    // Normalize Source
    let leadSource: 'Manual' | 'Website' | 'Facebook' | 'Instagram' | 'Google' | 'WhatsApp' | 'Referral' = 'Website';
    if (source) {
      const srcUpper = String(source).toLowerCase();
      if (srcUpper.includes('whats') || srcUpper.includes('wa')) leadSource = 'WhatsApp';
      else if (srcUpper.includes('insta')) leadSource = 'Instagram';
      else if (srcUpper.includes('face') || srcUpper.includes('fb')) leadSource = 'Facebook';
      else if (srcUpper.includes('goog')) leadSource = 'Google';
      else if (srcUpper.includes('ref')) leadSource = 'Referral';
      else if (srcUpper.includes('web')) leadSource = 'Website';
    }

    const rawTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim())
      : [];

    const { lead: newLead, created } = await saveIncomingLead({
      organizationId: org._id,
      name: leadName,
      email: email ? String(email).trim().toLowerCase() : undefined,
      phone: leadPhone,
      source: leadSource,
      status: 'New',
      customerType: customerType === 'B2B' ? 'B2B' : 'B2C',
      interestedPackage: interestedPackage ? String(interestedPackage).trim() : undefined,
      destination: leadDestination,
      travelDate: travelDate ? String(travelDate).trim() : undefined,
      travelers: Number(travelers) || 1,
      budget: Number(budget) || 0,
      currency: currency || 'INR',
      assignedTo: 'Unassigned',
      temperature: ['Hot', 'Cold'].includes(temperature) ? temperature : 'Warm',
      tags: [...rawTags, leadSource.toLowerCase()],
      notes: notes || `Lead automatically captured via ${leadSource} Webhook.`,
      activities: [
        {
          type: 'created',
          description: `Lead auto-captured from ${leadSource} at ${new Date().toLocaleString('en-IN')}`,
          timestamp: new Date(),
          author: `${leadSource} Bot`,
        },
      ],
    }, suppliedEventId ? intakeKey(`webhook:${leadSource}`, suppliedEventId) : undefined);

    res.status(created ? 201 : 200).json({
      success: true,
      message: `Lead successfully received and recorded from ${leadSource}`,
      lead: formatLead(newLead),
    });
  } catch (error: any) {
    console.error('[Webhook Ingest Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Error ingesting lead' });
  }
};

/**
 * 2. META (FACEBOOK & INSTAGRAM) WEBHOOK
 * Endpoints:
 * GET  /api/webhooks/meta (Verification handshake)
 * POST /api/webhooks/meta (Leadgen payload)
 */
export const verifyMetaWebhook = (req: Request, res: Response): void => {
  verifyHandshake('META_VERIFY_TOKEN', 'Meta', req, res);
};

async function providerOrganization(req: Request) {
  const appSecret = process.env.META_APP_SECRET;
  const webhookKey = req.query.apiKey;
  const signature = req.get('x-hub-signature-256');
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!appSecret || typeof webhookKey !== 'string' || !signature || !rawBody) return null;
  const expected = 'sha256=' + createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const received = Buffer.from(signature);
  const calculated = Buffer.from(expected);
  if (received.length !== calculated.length || !timingSafeEqual(received, calculated)) return null;
  return Organization.findOne({ webhookApiKey: webhookKey, status: 'ACTIVE' });
}

function metaPageToken(organizationId: string, pageId: string) {
  const tokens = JSON.parse(process.env.META_LEAD_PAGE_TOKENS || '{}') as Record<string, Record<string, string>>;
  return tokens[organizationId]?.[pageId];
}

export const handleMetaWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const org = await providerOrganization(req);
    if (!org) { res.status(401).json({ error: 'Invalid provider event.' }); return; }
    const access = await workspaceAccess(org.id);
    if (!access?.enabled.includes('leads')) { res.status(403).json({ error: 'Lead capture is unavailable.' }); return; }

    const body = req.body;
    if (!['page', 'instagram'].includes(body.object)) { res.send('EVENT_RECEIVED'); return; }
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field !== 'leadgen') continue;
        const data = change.value;
        const eventId = String(data?.leadgen_id ?? '');
        const pageId = String(data?.page_id ?? entry.id ?? '');
        if (!/^\d+$/.test(eventId) || !/^\d+$/.test(pageId)) continue;
        const key = intakeKey('meta', eventId);
        if (await Lead.exists({ organizationId: org._id, intakeKey: key })) continue;

        const version = process.env.META_GRAPH_VERSION;
        const token = metaPageToken(org.id, pageId);
        if (!version || !/^v\d+\.\d+$/.test(version) || !token) {
          res.status(503).json({ error: 'Lead retrieval is not configured for this page.' }); return;
        }
        const url = new URL(`https://graph.facebook.com/${version}/${eventId}`);
        url.searchParams.set('fields', 'field_data,platform,ad_id,form_id');
        const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(6_000) });
        if (!response.ok) { res.status(502).json({ error: 'Could not retrieve lead details.' }); return; }
        const details = await response.json() as { field_data?: { name: string; values?: string[] }[]; platform?: string };
        const fields = new Map((details.field_data || []).map(({ name, values }) => [name, values?.[0]?.trim() || '']));
        const name = fields.get('full_name') || [fields.get('first_name'), fields.get('last_name')].filter(Boolean).join(' ') || 'Meta enquiry';
        const phone = fields.get('phone_number') || fields.get('phone') || '';
        const email = fields.get('email') || '';
        if (!phone && !email) {
          res.status(422).json({ error: 'Configure a phone or email field in the lead form.' }); return;
        }
        const source = body.object === 'instagram' || ['ig', 'instagram'].includes(details.platform || '') ? 'Instagram' : 'Facebook';
        await saveIncomingLead({
          organizationId: org._id, name, phone, email,
          source, status: 'New', destination: fields.get('destination') || 'Meta enquiry',
          activities: [{ type: 'created', description: `Captured from ${source} Lead Ads.`, author: 'Meta Ads', timestamp: new Date() }],
        }, key);
      }
    }
    res.send('EVENT_RECEIVED');
  } catch (error) {
    console.error('[Meta lead retrieval]', error instanceof Error ? error.name : 'Unknown error');
    res.status(502).json({ error: 'Could not process provider event.' });
  }
};

/**
 * 3. WHATSAPP CLOUD API / PARTNER WEBHOOK
 * Endpoints:
 * GET  /api/webhooks/whatsapp (Verification handshake)
 * POST /api/webhooks/whatsapp (Incoming message)
 */
export const verifyWhatsAppWebhook = (req: Request, res: Response): void => {
  verifyHandshake('WHATSAPP_VERIFY_TOKEN', 'WhatsApp', req, res);
};

export const handleWhatsAppWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    // Fast 200 response to WhatsApp
    res.status(200).send('EVENT_RECEIVED');

    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) return;

    const fromPhone = message.from; // e.g. "919876543210"
    const senderName = contact?.profile?.name || `WhatsApp User ${fromPhone}`;
    const textBody = message.text?.body || message.type || 'New WhatsApp conversation started';

    const org = await providerOrganization(req);
    if (!org) return;

    // Check if lead already exists with this phone number
    const formattedPhone = fromPhone.startsWith('+') ? fromPhone : `+${fromPhone}`;
    let existingLead = await Lead.findOne({
      organizationId: org._id,
      phone: { $regex: fromPhone.slice(-10) },
    });

    if (existingLead) {
      existingLead.activities.push({
        type: 'whatsapp',
        description: `Incoming WhatsApp message: "${textBody}"`,
        timestamp: new Date(),
        author: senderName,
      });
      existingLead.notes = (existingLead.notes ? existingLead.notes + '\n' : '') + `[WhatsApp ${new Date().toLocaleTimeString()}]: ${textBody}`;
      await existingLead.save();
    } else {
      await Lead.create({
        organizationId: org._id,
        name: senderName,
        phone: formattedPhone,
        source: 'WhatsApp',
        status: 'New',
        customerType: 'B2C',
        destination: 'WhatsApp Enquiry',
        travelers: 1,
        budget: 0,
        currency: 'INR',
        assignedTo: 'Unassigned',
        temperature: 'Hot',
        tags: ['whatsapp', 'inbound'],
        notes: `Initial message: "${textBody}"`,
        activities: [
          {
            type: 'created',
            description: `Lead initiated from WhatsApp chat. Message: "${textBody}"`,
            timestamp: new Date(),
            author: 'WhatsApp Bot',
          },
        ],
      });
    }
  } catch (error: any) {
    console.error('[WhatsApp Webhook Error]:', error);
  }
};
