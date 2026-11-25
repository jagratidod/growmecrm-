import { createHmac, timingSafeEqual } from 'node:crypto';
import { Request, Response } from 'express';
import { Lead } from '../models/Lead';
import { Organization } from '../models/Organization';

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

    const leadName = (name && String(name).trim()) || 'Online Enquiry';
    const leadPhone = (phone && String(phone).trim()) || 'Not provided';
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

    const newLead = await Lead.create({
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
      temperature: temperature || 'Warm',
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
    });

    res.status(201).json({
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
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'growme_crm_verify_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[Meta Webhook Verified]');
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
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

export const handleMetaWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;


    // Acknowledge Meta immediately to avoid retries
    res.status(200).send('EVENT_RECEIVED');

    if (body.object === 'page' || body.object === 'instagram') {
      const org = await providerOrganization(req);
      if (!org) return;

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'leadgen') {
            const leadgenId = change.value?.leadgen_id;
            const formId = change.value?.form_id;
            const pageId = change.value?.page_id;
            const isInstagram = body.object === 'instagram' || Boolean(change.value?.ad_id && String(change.value?.ad_id).includes('ig'));

            // Ingest only events that include the contact details required by the CRM.
            const name = change.value?.full_name || change.value?.name;
            const phone = change.value?.phone_number || change.value?.phone;
            const destination = change.value?.destination;
            if (typeof name !== 'string' || !name.trim() || typeof phone !== 'string' || !phone.trim() ||
                typeof destination !== 'string' || !destination.trim()) continue;
            await Lead.create({
              organizationId: org._id,
              name: name.trim(),
              phone: phone.trim(),
              email: change.value?.email || undefined,
              source: isInstagram ? 'Instagram' : 'Facebook',
              status: 'New',
              customerType: 'B2C',
              destination: destination.trim(),
              travelers: 1,
              budget: 0,
              currency: 'INR',
              assignedTo: 'Unassigned',
              temperature: 'Warm',
              tags: [isInstagram ? 'instagram' : 'facebook', 'ad-lead'],
              notes: `Meta Leadgen ID: ${leadgenId}. Form ID: ${formId}, Page ID: ${pageId}`,
              activities: [
                {
                  type: 'created',
                  description: `Captured from ${isInstagram ? 'Instagram' : 'Facebook'} Instant Form (ID: ${leadgenId})`,
                  timestamp: new Date(),
                  author: 'Meta Ads',
                },
              ],
            });
          }
        }
      }
    }
  } catch (error: any) {
    console.error('[Meta Webhook Error]:', error);
  }
};

/**
 * 3. WHATSAPP CLOUD API / PARTNER WEBHOOK
 * Endpoints:
 * GET  /api/webhooks/whatsapp (Verification handshake)
 * POST /api/webhooks/whatsapp (Incoming message)
 */
export const verifyWhatsAppWebhook = (req: Request, res: Response): void => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'growme_crm_verify_token';

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp Webhook Verified]');
    res.status(200).send(challenge);
  } else {
    res.status(403).json({ error: 'Verification failed' });
  }
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
