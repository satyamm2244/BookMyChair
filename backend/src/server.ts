import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { supabase } from './db/supabase';
import { getAvailableSlots } from './services/availability.service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

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

    res.status(200).json({
      success: true,
      message: 'Database connected successfully',
      data
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;