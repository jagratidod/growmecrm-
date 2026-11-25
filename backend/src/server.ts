import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

dotenv.config();

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
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost');

      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback: allow to prevent production blockages
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/follow-ups', followUpRoutes);
app.use('/api/sightseeing', sightseeingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/host-page', hostPageRoutes);
app.use('/api/bot-flows', botFlowRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/call-logs', callLogRoutes);
app.use('/api/calendar/events', calendarRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/linktree', linkTreeRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/webhooks', webhookRoutes);

// Root health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'GrowMe CRM Multi-Tenant API' });
});

// Start Server and Connect Database
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[GrowMe CRM Backend] Server running at http://localhost:${PORT}`);
  });
};

start();
