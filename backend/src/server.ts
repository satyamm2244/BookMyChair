import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { supabase } from './db/supabase';
import { getAvailableSlots } from './services/availability.service';
import { createBooking } from './services/booking.service';
import { parseCustomerMessage, getCurrentISTDate, addDaysToDate } from './services/ai.service';
import { handleChatMessage } from './services/chat.service';
import { getApprovals, updateApproval } from './services/approval.service';
import {
  getBookingsByDate,
  getDashboardSummary,
  getActivityLogs
} from './services/dashboard.service';
import {
  bookingRequestSchema,
  chatRequestSchema,
  patchApprovalSchema
} from './schemas';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Health & Utility Endpoints
// ----------------------------------------------------

app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'BookMyChair API is running'
  });
});

app.get('/api/health/db', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id, name, duration_minutes, price')
      .limit(5);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Database connected successfully',
      data
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// ----------------------------------------------------
// Availability & Booking Endpoints
// ----------------------------------------------------

app.get('/api/test/availability', async (req: Request, res: Response) => {
  try {
    const serviceId = req.query.serviceId as string | undefined;
    const date = req.query.date as string | undefined;
    const stylistId = req.query.stylistId as string | undefined;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'serviceId and date are required'
      });
    }

    const slots = await getAvailableSlots({
      serviceId,
      date,
      stylistId
    });

    return res.status(200).json({
      success: true,
      count: slots.length,
      data: slots
    });
  } catch (error) {
    console.error('Availability error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to calculate availability'
    });
  }
});

app.post('/api/bookings', async (req: Request, res: Response) => {
  try {
    const parseResult = bookingRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const booking = await createBooking(parseResult.data);

    return res.status(201).json({
      success: true,
      message: 'Booking confirmed',
      booking
    });
  } catch (error) {
    console.error('Booking error:', error);

    if (
      error instanceof Error &&
      error.message === 'SLOT_UNAVAILABLE'
    ) {
      return res.status(409).json({
        success: false,
        message: 'That slot is no longer available'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Failed to create booking'
    });
  }
});

// ----------------------------------------------------
// AI & Chat Endpoints
// ----------------------------------------------------

app.post('/api/test/parse-message', async (req: Request, res: Response) => {
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message request',
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const structuredIntent = await parseCustomerMessage(parseResult.data.message);

    return res.status(200).json(structuredIntent);
  } catch (error) {
    console.error('Parse message error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to parse message'
    });
  }
});

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const parseResult = chatRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        type: 'error',
        message: 'Invalid chat request',
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const response = await handleChatMessage(parseResult.data);

    return res.status(200).json(response);
  } catch (error) {
    console.error('Chat error:', error);

    return res.status(500).json({
      type: 'error',
      message: 'Failed to process chat message'
    });
  }
});

// ----------------------------------------------------
// Owner Approvals Endpoints
// ----------------------------------------------------

app.get('/api/approvals', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const approvals = await getApprovals(status);

    return res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals
    });
  } catch (error) {
    console.error('Get approvals error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve approvals'
    });
  }
});

app.patch('/api/approvals/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : (req.params.id as string);
    const parseResult = patchApprovalSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: parseResult.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      });
    }

    const updated = await updateApproval(id, parseResult.data.action);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Approval not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: `Approval ${parseResult.data.action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: updated
    });
  } catch (error) {
    console.error('Update approval error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update approval'
    });
  }
});

// ----------------------------------------------------
// Bookings by Date Endpoint
// ----------------------------------------------------

app.get('/api/bookings', async (req: Request, res: Response) => {
  try {
    const requestedDate = (req.query.date as string) || getCurrentISTDate().dateString;

    // Validate simple YYYY-MM-DD pattern
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.'
      });
    }

    const bookings = await getBookingsByDate(requestedDate);

    return res.status(200).json({
      success: true,
      date: requestedDate,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Get bookings error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve bookings'
    });
  }
});

// ----------------------------------------------------
// Dashboard Summary & Activity Log Endpoints
// ----------------------------------------------------

app.get('/api/dashboard/summary', async (_req: Request, res: Response) => {
  try {
    const summary = await getDashboardSummary();

    return res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to generate dashboard summary'
    });
  }
});

app.get('/api/dashboard/bookings', async (req: Request, res: Response) => {
  try {
    const scope = (req.query.scope as string) || 'today';
    const { dateString: todayStr } = getCurrentISTDate();

    const targetDate = scope === 'tomorrow' ? addDaysToDate(todayStr, 1) : todayStr;
    const bookings = await getBookingsByDate(targetDate);

    return res.status(200).json({
      success: true,
      scope,
      date: targetDate,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error('Dashboard bookings error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard bookings'
    });
  }
});

app.get('/api/activity', async (req: Request, res: Response) => {
  try {
    const limitParam = parseInt(req.query.limit as string, 10);
    const limit = Number.isNaN(limitParam) ? 20 : limitParam;

    const activities = await getActivityLogs(limit);

    return res.status(200).json({
      success: true,
      count: activities.length,
      data: activities
    });
  } catch (error) {
    console.error('Get activity error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity log'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;