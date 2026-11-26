# GrowMe Workspace

GrowMe is the shared dashboard for client CRM, custom website content, and GrowMe subscriptions. Client websites are separate deployments. They render GrowMe content in their own layouts and own their checkout integration.

## Run locally

1. Install dependencies with `npm ci --prefix backend` and `npm ci --prefix frontend`.
2. Copy `backend/.env.example` to `backend/.env` and configure the GrowMe control database and JWT secret. Set `GROWME_CONNECTION_KEY` to a stable base64 key generated with `openssl rand -base64 32` before saving client service credentials.
3. For a local MongoDB on port 27018, run `mkdir -p backend/.local-mongo`, then `mongod --dbpath backend/.local-mongo --bind_ip 127.0.0.1 --port 27018`. Use `mongodb://127.0.0.1:27018/growme` for `MONGODB_URI`. Keep the same directory and JWT secret across restarts.
4. Run `npm run dev:backend` and `npm run dev` in separate terminals.
5. Create the initial platform administrator with `npm run create:super-admin --prefix backend`, supplying `GROWME_ADMIN_EMAIL` and `GROWME_ADMIN_PASSWORD` in that command's environment. Sign in through the normal login page.

For a separate frontend deployment, set `VITE_API_BASE_URL` to the GrowMe API origin plus `/api` and `FRONTEND_URL` on the backend to the frontend origin.

## Public landing and sign-in

The GrowMe homepage at `/` uses the marketing site sourced from `growme1-main`. Its integrated source lives in `frontend/src/features/marketing`. The landing page, login, signup and workspace use the same origin. Returning visitors with a verified session go directly to their workspace or the Super Admin client directory.

Set `VITE_MARKETING_CONTACT_EMAIL` to publish the GrowMe contact address. Set `VITE_MARKETING_API_BASE_URL` to enable the contact form when that service handles `POST /contact`.

## Onboard a client

In Super Admin, create the client, select the subscription plan, and assign any extra modules. In **Connections**, test and activate the client's MongoDB Atlas and Cloudinary accounts before creating website records. Managed website images must use the assigned Cloudinary account. Existing websites require a content migration to change database targets. The GrowMe database stores accounts, CRM, subscriptions, and website connection metadata. Website drafts, published sections, hosted page content, and bio links require a client-owned MongoDB cluster. The GrowMe cluster cannot be assigned as a website database.

In **Billing**, use a checkout link from GrowMe's own merchant account. Record a confirmed payment reference and the paid-through date after verifying payment in the bank or payment provider dashboard. Access expires after that date, and published content remains available. Payment confirmation is manual. Client website checkout runs independently using the client's own gateway.

## Connect a custom website

Register its domain and editable section slugs in **Super Admin → Clients → Websites**. Save the generated site ID and server-side form key. The site ID is public. The form key is displayed once and can be rotated.

| Website operation | API |
|---|---|
| Read published content | `GET /api/public/websites/:siteId` |
| Send an enquiry from the website server | `POST /api/public/websites/:siteId/enquiries` with the `x-growme-site-key` header and a JSON body containing `name`, `phone`, and optional `email`, `destination`, `package`, and `message` |
| Read a draft preview | `GET /api/public/websites/:siteId/preview` with the preview token as an Authorization bearer |

The site's frontend maps each slug to its UI. Each section contains `title`, `body`, `image`, and optional ordered `entries`. Each entry has a `slug`, `title`, `body`, and `image`. Render text safely. Read published content when a page loads or revalidate any cache configured by the website. The API cache lasts 30 seconds with a 60-second stale-while-revalidate window.

To preview the actual layout, recognize the `growme-preview` value in the browser URL fragment, fetch the preview endpoint, and render its content separately from normal public traffic. Clear the fragment after reading the token. Preview tokens expire after 10 minutes. Keep preview responses out of shared caches. GrowMe's built-in editor preview works independently of this site-side integration.
