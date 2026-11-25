# Automated Leads Ingestion Blueprint

This document explains the architecture, webhook endpoints, and credential setup required to automatically receive leads from **WhatsApp**, **Instagram**, **Facebook Ads**, and **Website Enquiry Forms** into your CRM.

---

## 1. Webhook Endpoints in CRM Backend

| Platform | Webhook Endpoint | Method | Purpose |
| :--- | :--- | :---: | :--- |
| **Universal (Website, Zapier, Pabbly)** | `/api/webhooks/lead` | `POST` | Ingests leads with JSON payload from forms or automation tools. |
| **Meta (Facebook & Instagram Lead Ads)** | `/api/webhooks/meta` | `GET` / `POST` | Meta handshake verification & instant leadgen capture. |
| **WhatsApp Cloud API** | `/api/webhooks/whatsapp` | `GET` / `POST` | Meta WhatsApp Cloud API verification & incoming messages. |

---

## 2. Platform Setup Guides & Credentials

### A. Website Enquiry Form (Direct Integration)
* **What you need:** Access to your website's contact form HTML/JS code or WordPress form builder (Elementor / Contact Form 7 / Gravity Forms).
* **Code to add on form submission:**
```javascript
const submitLeadToCRM = async (formData) => {
  await fetch('http://localhost:5000/api/webhooks/lead', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,            // e.g. "Rohan Sharma"
      phone: formData.phone,          // e.g. "+91 98765 43210"
      email: formData.email,          // e.g. "rohan@gmail.com"
      source: 'Website',              // Auto-assigned badge
      destination: formData.destination || 'Kerala 4N/5D',
      travelers: formData.travelers || 2,
      budget: formData.budget || 45000,
      notes: formData.message || 'Submitted from website contact form'
    })
  });
};
```

---

### B. Facebook & Instagram Ads (Meta Lead Ads)
You can connect this using **Pabbly Connect / Zapier** (simplest) or **Meta Developer App**:

#### Method 1: Using Pabbly Connect / Zapier (Recommended)
1. **Trigger**: Select **Facebook Lead Ads**.
2. Connect your Facebook account and choose your Page & Lead Form.
3. **Action**: Choose **Webhook / Custom API Request**.
4. Set URL to: `http://localhost:5000/api/webhooks/lead`
5. Map fields:
   * `name` -> Full Name from Lead Ad
   * `phone` -> Phone Number
   * `email` -> Email
   * `source` -> `Facebook` (or `Instagram`)
   * `destination` -> Destination question (if in form)

#### Method 2: Direct Meta Webhook
1. Go to [developers.facebook.com](https://developers.facebook.com/).
2. In your App -> **Webhooks** -> select **Page / Leadgen**.
3. **Callback URL**: `https://your-domain.com/api/webhooks/meta`
4. **Verify Token**: `growme_crm_verify_token`
5. When users submit an instant form on FB or IG, Meta sends the lead to your CRM.

---

### C. WhatsApp Inbound Messages
#### Option 1: Using Third-Party Provider (Wati, AiSensy, Interakt, Twilio)
1. In your provider's dashboard, go to **Webhooks / API Integrations**.
2. Add Webhook URL: `http://localhost:5000/api/webhooks/lead`
3. Whenever a customer sends a message on WhatsApp, it triggers the webhook and creates a new lead with `source: 'WhatsApp'` in the CRM.

#### Option 2: Meta WhatsApp Cloud API
1. In Meta App Dashboard -> **WhatsApp** -> **Configuration**.
2. **Callback URL**: `https://your-domain.com/api/webhooks/whatsapp`
3. **Verify Token**: `growme_crm_verify_token`
4. Subscribe to the `messages` event.

---

## 3. UI Features Added in CRM

1. **Leads Table (`/leads`)**:
   * Shows a **Source Badge** with icons for each lead:
     * 🟢 **WhatsApp**
     * 🟣 **Instagram**
     * 🔵 **Facebook**
     * 🌐 **Website**
     * 🟡 **Google**
     * 🤝 **Referral**
     * ✍️ **Manual**
2. **Advanced Filters**:
   * Filter leads by source (e.g. view only WhatsApp leads or only Facebook leads).
3. **Channels Settings (`/channels`)**:
   * Live Webhook Ingestion URL box with a 1-click **Copy URL** button.
   * **1-Click Test Buttons**: Simulate an instant inbound lead from Website, WhatsApp, Facebook, or Instagram to verify the CRM live!
   * Copy-pasteable code snippets for developers.
