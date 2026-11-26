import 'dotenv/config';
import express, { ErrorRequestHandler } from 'express';
import { authenticate } from './middleware/authMiddleware';
import { Module, requireModule } from './platform/access';
import { platformAdmin, workspaceRouter, publicWebsites } from './platform/routes';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import packageRoutes from './routes/packageRoutes';
import teamRoutes from './routes/teamRoutes';
import organizationRoutes from './routes/organizationRoutes';
import bookingRoutes from './routes/bookingRoutes';
import hotelRoutes from './routes/hotelRoutes';
import followUpRoutes from './routes/followUpRoutes';
import sightseeingRoutes from './routes/sightseeingRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import hostPageRoutes from './routes/hostPageRoutes';
import botFlowRoutes from './routes/botFlowRoutes';
import billRoutes from './routes/billRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import callLogRoutes from './routes/callLogRoutes';
import calendarRoutes from './routes/calendarRoutes';
import itineraryRoutes from './routes/itineraryRoutes';
import inboxRoutes from './routes/inboxRoutes';
import campaignRoutes from './routes/campaignRoutes';
import linkTreeRoutes from './routes/linkTreeRoutes';
import settingsRoutes from './routes/settingsRoutes';
import webhookRoutes from './routes/webhookRoutes';
import superAdminRoutes from './routes/superAdminRoutes';
import uploadRoutes from './routes/uploadRoutes';



const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      // Check explicit allowed origins or any vercel.app deployment preview
      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app');

      callback(null, isAllowed);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb', verify: (req, _res, buffer) => {
  if (req.url?.startsWith('/api/webhooks/')) (req as typeof req & { rawBody?: Buffer }).rawBody = buffer;
} }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const gate = (name: Module) => [authenticate, requireModule(name)];
app.use('/api/platform', platformAdmin);
app.use('/api/workspace', workspaceRouter);
app.use('/api/public/websites', cors({ origin: '*' }), publicWebsites);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', ...gate('leads'), leadRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/team', ...gate('team'), teamRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/bookings', ...gate('bookings'), bookingRoutes);
app.use('/api/hotels', ...gate('catalog'), hotelRoutes);
app.use('/api/follow-ups', ...gate('leads'), followUpRoutes);
app.use('/api/sightseeing', ...gate('catalog'), sightseeingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/host-page', hostPageRoutes);
app.use('/api/bot-flows', ...gate('communications'), botFlowRoutes);
app.use('/api/bills', ...gate('finance'), billRoutes);
app.use('/api/invoices', ...gate('finance'), invoiceRoutes);
app.use('/api/call-logs', ...gate('communications'), callLogRoutes);
app.use('/api/calendar/events', ...gate('calendar'), calendarRoutes);
app.use('/api/itineraries', ...gate('catalog'), itineraryRoutes);
app.use('/api/inbox', ...gate('communications'), inboxRoutes);
app.use('/api/campaigns', ...gate('communications'), campaignRoutes);
app.use('/api/linktree', linkTreeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/upload', uploadRoutes);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'GrowMe CRM Multi-Tenant API' });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) return next(error);
  const knownStatus = error?.status;
  if (knownStatus === 400 || error?.name === 'CastError') {
    res.status(400).json({ error: 'Invalid request.' });
  } else if (knownStatus === 409) {
    res.status(409).json({ error: error.message });
  } else if (knownStatus === 502) {
    res.status(502).json({ error: error.message });
  } else if (error?.code === 11000) {
    res.status(409).json({ error: 'A record with this value already exists.' });
  } else if (error?.code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({ error: 'Choose an image under 8 MB.' });
  } else {
    console.error('[GrowMe API]', error?.name || 'Error');
    res.status(500).json({ error: 'GrowMe could not complete the request.' });
  }
};
app.use(errorHandler);

// Start Server and Connect Database
const start = async () => {
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[GrowMe CRM Backend] Server running at http://localhost:${PORT}`);
  });
};

start();
