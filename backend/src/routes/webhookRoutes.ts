import { Router } from 'express';
import {
  ingestLead,
  verifyMetaWebhook,
  handleMetaWebhook,
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
} from '../controllers/webhookController';

const router = Router();

// Universal Lead Ingestion Endpoint (Website, Pabbly, Zapier, Custom Forms)
router.post('/lead', ingestLead);
router.post('/ingest', ingestLead);

// Meta (Facebook & Instagram) Webhooks
router.get('/meta', verifyMetaWebhook);
router.post('/meta', handleMetaWebhook);

// WhatsApp Cloud API Webhooks
router.get('/whatsapp', verifyWhatsAppWebhook);
router.post('/whatsapp', handleWhatsAppWebhook);

export default router;
