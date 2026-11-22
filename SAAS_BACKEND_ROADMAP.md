# SaaS Travel CRM - Backend Architecture & Implementation Roadmap

A comprehensive guide for transforming the **GrowMe / Treki Travel CRM** frontend into a fully featured, production-ready, multi-tenant B2B SaaS platform.

---

## 1. Frontend Audit & System Overview

### 1.1 Tech Stack Summary
* **Core Framework**: React 19 + TypeScript + Vite
* **Styling**: Tailwind CSS v4
* **Icons & UI**: Lucide React
* **State Management**: React Context (`LeadsContext`, `BookingsContext`, `PackagesContext`, `HotelsContext`, `SightseeingContext`, `BillsContext`, `TeamContext`, `SettingsContext`, `InboxContext`, `CalendarContext`, `CallLogContext`, etc.)
* **Current Storage**: Simulated network latency with `localStorage` & `sessionStorage` mock data
* **API Bridge**: `src/services/api.ts` configured with `request<T>()` and JWT bearer token header injection

### 1.2 Core Modules Identified
1. **Lead Management & Pipeline**: Stages (`New` → `Contacted` → `Qualified` → `Proposal sent` → `Negotiation` → `Won` → `Lost`), temperature tags (`Hot`, `Warm`, `Cold`), traveler counts, budget, destination, customer type (`B2C`/`B2B`), and activity timelines.
2. **Travel & Tourism Catalog**:
   * **Packages Builder**: Multi-step wizard (Basics, Day-by-Day Itinerary, Logistics, Policies, Pricing options, Brochure design).
   * **Hotels**: Rating, room types, pricing, amenities, location.
   * **Sightseeing**: Day tours, ticket inclusions, operational timings.
   * **Itineraries**: Custom quotations and day plans.
3. **Operations & Finance**:
   * **Bookings**: Reservation status, departure/return dates, total amount vs. amount paid.
   * **Bills & Invoices**: Vendor payables (hotels, transport) and customer invoices.
4. **Communications & Automation**:
   * **Omnichannel Inbox**: WhatsApp, Web, and Email chat threads.
   * **Bot Flows & Automation**: Trigger conditions and auto-replies.
   * **Call Logs & Calendar**: Call durations, recordings, follow-up deadlines, and departure schedules.
5. **Branding & Public Microsites**:
   * **Organization Settings**: Agency name, logo URL, brand accent colors.
   * **Team & Invites**: Member roles (`Admin`, `Manager`, `Agent`) and secure invitation links.
   * **Host Page & LinkTree**: Public-facing landing pages to showcase travel packages and capture inbound leads.

---

## 2. Multi-Tenant SaaS Architecture Principles

Because this CRM will be offered as a SaaS product to multiple travel agencies, you must observe these non-negotiable rules:

### 2.1 Multi-Tenancy & Strict Isolation
* **Tenant Definition**: Each travel agency is an `Organization` (Tenant).
* **Tenant Isolation**: Every database table (except global system tables) **must** contain an `organizationId` foreign key.
* **Zero Leakage Rule**: No query should ever execute without `where: { organizationId: req.user.organizationId }`. Agency A must never see data belonging to Agency B.

### 2.2 JWT & Session Strategy
Every issued JWT token must include tenant metadata:
```json
{
  "userId": "usr_c4889f89",
  "organizationId": "org_9821a7bc",
  "role": "Admin",
  "email": "owner@travelagency.com"
}
```

### 2.3 Role-Based Access Control (RBAC)
| Role | Capabilities |
|---|---|
| **Owner** | Full workspace control, subscription & billing management, agency deletion. |
| **Admin** | Manage agency branding, invite/remove team members, full access to all leads, packages, bookings, bills. |
| **Manager** | View & assign leads, manage bookings & catalog items, view team productivity reports. |
| **Agent** | View & edit assigned leads, create itineraries, record call logs, chat with assigned customers. |

### 2.4 Tiering & Subscription Gating (Stripe / Razorpay)
| Plan Tier | Example Limits & Gating |
|---|---|
| **Starter** | 2 Team Seats, 500 Active Leads, Basic Brochure Templates |
| **Pro** | 10 Team Seats, Unlimited Leads, WhatsApp Bot Automation, Custom Branding |
| **Enterprise** | Unlimited Seats, AI Agent Integration, Custom Domain / White-label, Priority SLA |

---

## 3. Recommended Backend Architecture

```
                   +----------------------------------+
                   |          React Frontend          |
                   |      (Vite + React Context)      |
                   +-----------------+----------------+
                                     |
                                     | REST / HTTPS & WSS
                                     v
                   +-----------------+----------------+
                   |       API Gateway / Router       |
                   |      (Express.js / NestJS)       |
                   +-----------------+----------------+
                                     |
         +---------------------------+---------------------------+
         |                           |                           |
         v                           v                           v
+------------------+       +-------------------+       +-------------------+
|  Auth & Tenant   |       |    Core Modules   |       |  Third-Party Hub  |
|    Middleware    |       |  Leads, Bookings, |       | Stripe / Razorpay |
|  JWT Validation  |       |  Packages, Bills  |       | WhatsApp Cloud API|
+--------+---------+       +---------+---------+       +---------+---------+
         |                           |                           |
         +---------------------------+---------------------------+
                                     |
                                     v
                   +-----------------+----------------+
                   |     ORM Layer (Prisma ORM)       |
                   +-----------------+----------------+
                                     |
                                     v
                   +-----------------+----------------+
                   |      PostgreSQL Database         |
                   |   (Row-Level Isolation by Org)   |
                   +----------------------------------+
```

* **Runtime**: Node.js with TypeScript
* **Framework**: Express.js or NestJS
* **Database**: PostgreSQL (Managed on Supabase, Neon, or AWS RDS)
* **ORM**: Prisma (Type-safe queries matching frontend interfaces)
* **File Storage**: Cloudinary or AWS S3 (for package banners, hotel photos, logo uploads)
* **Realtime**: Socket.io (for omnichannel chat and live lead alerts)

---

## 4. Prisma Database Schema (`schema.prisma`)

Below is the complete database schema tailored to your frontend data structures:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// -------------------------------------------------------------
// Multi-Tenant Core: Organization & Subscriptions
// -------------------------------------------------------------
model Organization {
  id              String         @id @default(uuid())
  name            String
  slug            String         @unique
  logoUrl         String?
  primaryColor    String?        @default("#4F46E5")
  secondaryColor  String?        @default("#0D9488")
  
  // Subscription Details
  plan            String         @default("STARTER") // STARTER, PRO, ENTERPRISE
  subscriptionId  String?
  billingStatus   String         @default("ACTIVE")  // ACTIVE, PAST_DUE, CANCELLED
  maxLeads        Int            @default(500)
  maxSeats        Int            @default(2)

  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  users           User[]
  teamInvites     TeamInvite[]
  leads           Lead[]
  bookings        Booking[]
  packages        TravelPackage[]
  hotels          Hotel[]
  sightseeing     SightseeingActivity[]
  bills           Bill[]
  invoices        Invoice[]
  conversations   Conversation[]
}

// -------------------------------------------------------------
// User Management & RBAC
// -------------------------------------------------------------
enum TeamRole {
  OWNER
  ADMIN
  MANAGER
  AGENT
}

model User {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  name            String
  username        String?
  email           String        @unique
  passwordHash    String
  role            TeamRole      @default(AGENT)
  avatarUrl       String?
  status          String        @default("Active") // Active, Inactive
  lastActive      DateTime?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  assignedLeads   Lead[]        @relation("AssignedLeads")
  assignedBookings Booking[]    @relation("AssignedBookings")
  activities      LeadActivity[]

  @@index([organizationId])
}

model TeamInvite {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  email           String
  role            TeamRole
  token           String        @unique
  expiresAt       DateTime
  status          String        @default("Invited") // Invited, Accepted, Expired
  invitedAt       DateTime      @default(now())

  @@index([organizationId])
}

// -------------------------------------------------------------
// Lead Management
// -------------------------------------------------------------
enum LeadStage {
  New
  Contacted
  Qualified
  Proposal_sent
  Negotiation
  Won
  Lost
}

enum LeadTemperature {
  Hot
  Warm
  Cold
  Won
  Lost
}

model Lead {
  id                String          @id @default(uuid())
  organizationId    String
  organization      Organization    @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name              String
  email             String?
  phone             String
  source            String          @default("Website")
  status            LeadStage       @default(New)
  temperature       LeadTemperature @default(Warm)
  customerType      String          @default("B2C") // B2C, B2B
  interestedPackage String?
  destination       String
  travelDate        DateTime?
  travelers         Int             @default(1)
  budget            Float           @default(0)
  currency          String          @default("INR")
  tags              String[]        @default([])
  notes             String?

  assignedToId      String?
  assignedTo        User?           @relation("AssignedLeads", fields: [assignedToId], references: [id])

  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  activities        LeadActivity[]

  @@index([organizationId])
  @@index([status])
}

model LeadActivity {
  id              String        @id @default(uuid())
  leadId          String
  lead            Lead          @relation(fields: [leadId], references: [id], onDelete: Cascade)
  userId          String?
  user            User?         @relation(fields: [userId], references: [id])

  type            String        // created, stage_changed, assigned, note_added, call, email, whatsapp
  description     String
  author          String
  timestamp       DateTime      @default(now())

  @@index([leadId])
}

// -------------------------------------------------------------
// Bookings & Finances
// -------------------------------------------------------------
model Booking {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  customerName    String
  email           String?
  phone           String?
  destination     String
  status          String        @default("Pending") // Pending, Confirmed, Ongoing, Completed, Cancelled
  departure       DateTime
  returnDate      DateTime?
  travellers      Int           @default(1)
  totalAmount     Float
  amountPaid      Float         @default(0)
  currency        String        @default("INR")
  package         String?
  notes           String?

  assignedToId    String?
  assignedTo      User?         @relation("AssignedBookings", fields: [assignedToId], references: [id])

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([organizationId])
}

model Bill {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  vendorName      String
  category        String        // Hotel, Transport, Flight, Activity
  amount          Float
  currency        String        @default("INR")
  status          String        @default("Unpaid") // Paid, Unpaid, Partial
  dueDate         DateTime
  paidDate        DateTime?
  referenceNumber String?
  notes           String?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([organizationId])
}

model Invoice {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  invoiceNumber   String
  customerName    String
  customerEmail   String?
  items           Json          // Array of line items
  subtotal        Float
  tax             Float         @default(0)
  total           Float
  currency        String        @default("INR")
  status          String        @default("Draft") // Draft, Sent, Paid, Overdue
  dueDate         DateTime

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([organizationId])
}

// -------------------------------------------------------------
// Travel Inventory: Packages, Hotels, Sightseeing
// -------------------------------------------------------------
model TravelPackage {
  id                  String        @id @default(uuid())
  organizationId      String
  organization        Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name                String
  code                String?
  status              String        @default("DRAFT") // DRAFT, PUBLISHED, ARCHIVED
  brochureDesign      String        @default("Signature")
  categories          String[]      @default([])
  slug                String
  nights              Int           @default(1)
  days                Int           @default(2)
  destination         String
  price               Float
  originalPrice       Float?
  currency            String        @default("INR")
  bannerImage         String?
  description         String?

  pricingOptions      Json?         // [{ id, label, price, isPeakSeason }]
  itineraryDays       Json?         // [{ dayNumber, title, dayPlan, stay, meals, photos }]
  inclusions          String?
  exclusions          String?
  cancellationPolicy  String?

  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  @@unique([organizationId, slug])
  @@index([organizationId])
}

model Hotel {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  name            String
  destination     String
  rating          Int           @default(3)
  address         String?
  pricePerNight   Float
  currency        String        @default("INR")
  amenities       String[]      @default([])
  images          String[]      @default([])

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([organizationId])
}

model SightseeingActivity {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  title           String
  destination     String
  duration        String
  price           Float
  currency        String        @default("INR")
  description     String?
  inclusions      String[]      @default([])

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([organizationId])
}

// -------------------------------------------------------------
// Omnichannel Inbox & Communications
// -------------------------------------------------------------
model Conversation {
  id              String        @id @default(uuid())
  organizationId  String
  organization    Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  channel         String        // whatsapp, web, email
  contactName     String
  contactPhone    String?
  contactEmail    String?
  lastMessage     String?
  unreadCount     Int           @default(0)
  messages        Json          // [{ sender, text, timestamp, status }]

  updatedAt       DateTime      @updatedAt
  createdAt       DateTime      @default(now())

  @@index([organizationId])
}
```

---

## 5. Core API Endpoints Specification

### 5.1 Authentication & Multi-Tenancy
* `POST /api/auth/register-agency`: Registers Agency + Owner User in a single transaction; returns JWT token.
* `POST /api/auth/login`: Validates credentials; returns JWT token with `userId`, `organizationId`, and `role`.
* `GET /api/auth/me`: Validates session and returns current authenticated user + organization branding.
* `POST /api/team/invite`: Generates invite link with secure token.
* `POST /api/team/accept-invite`: Validates invite token, registers member into the organization.

### 5.2 Organization Settings
* `GET /api/organization`: Fetches organization branding (Name, Logo, Colors).
* `PUT /api/organization`: Updates branding and workspace details (Admin/Owner only).

### 5.3 Leads
* `GET /api/leads`: Paginated list filtered by stage, temperature, destination, and assignment.
* `POST /api/leads`: Creates a new lead (enforcing tenant plan limits).
* `PUT /api/leads/:id`: Updates lead details.
* `PATCH /api/leads/:id/stage`: Changes stage and automatically appends to `LeadActivity`.
* `POST /api/leads/:id/activities`: Adds notes, logs call, or records interaction.
* `POST /api/leads/import`: Bulk CSV import of leads.
* `DELETE /api/leads/:id`: Deletes a lead.

### 5.4 Inventory & Catalog
* `GET /api/packages`: Lists packages for the CRM dashboard.
* `POST /api/packages`: Creates/publishes travel packages with day-by-day itineraries.
* `GET /api/public/:agencySlug/packages/:packageSlug`: **Public endpoint** for the agency's Host Page / LinkTree.
* `GET /api/hotels`, `POST /api/hotels`: Hotel inventory CRUD.
* `GET /api/sightseeing`, `POST /api/sightseeing`: Activity inventory CRUD.

### 5.5 Bookings & Invoicing
* `GET /api/bookings`, `POST /api/bookings`: Booking lifecycle management.
* `PATCH /api/bookings/:id/payment`: Records partial or full payment.
* `GET /api/bills`, `POST /api/bills`: Vendor payable tracking.
* `GET /api/invoices`, `POST /api/invoices`: Customer invoice generation.

---

## 6. Implementation Action Plan (Step-by-Step)

### Phase 1: Backend Initialization
1. Create a `backend/` folder in the project root.
2. Initialize Node.js & TypeScript:
   ```bash
   mkdir backend
   cd backend
   npm init -y
   npm install express cors dotenv jsonwebtoken bcryptjs @prisma/client
   npm install -D typescript ts-node @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs prisma
   npx tsc --init
   npx prisma init
   ```
3. Copy the schema above into `backend/prisma/schema.prisma`.
4. Configure `.env` with a PostgreSQL connection string and run:
   ```bash
   npx prisma migrate dev --name init
   ```

### Phase 2: Auth Middleware & Tenant Context
Create `backend/src/middleware/auth.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    organizationId: string;
    role: string;
  };
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
```

### Phase 3: Wire Frontend to Backend
1. In `frontend/src/services/`:
   * Update `api.ts` to point to `http://localhost:5000/api`.
   * Create `leadsService.ts`, `packagesService.ts`, `bookingsService.ts`.
2. In `frontend/src/context/LeadsContext.tsx`:
   * Replace `localStorage.getItem(STORAGE_KEY)` with an asynchronous `useEffect` that calls `leadsService.getAll()`.
   * Replace local state mutations with API requests, updating state upon response.
3. In `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_USE_MOCK=false
   ```

### Phase 4: Public Endpoints & Growth
1. Create public tenant routes (e.g., `GET /api/public/:agencySlug/packages`).
2. Connect your frontend's `HostPage` and `LinkTreePage` to consume public endpoints without requiring an authorization header.
3. Build a simple embedded lead generation widget for your clients' websites.

### Phase 5: Billing & SaaS Subscriptions
1. Integrate Stripe Checkout or Razorpay Subscriptions.
2. Set up a webhook handler (`POST /api/webhooks/billing`) to automatically activate or freeze an organization's workspace based on payment status.
3. Add quota checks before `POST /api/leads` and `POST /api/team/invite`.

---

## 7. Next Immediate Action
Start by executing **Phase 1**: initialize the `backend/` directory, configure your PostgreSQL database, and run your initial Prisma migration.
