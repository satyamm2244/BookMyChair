import type {
  Appointment,
  PendingApproval,
  ActivityLogItem,
  DashboardSummary,
} from '../types/dashboard';

// Mock Data
export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    time: '09:30 AM',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    service: 'Haircut & Blowdry',
    stylist: 'Rahul',
    status: 'completed',
    date: 'today',
  },
  {
    id: 'apt-2',
    time: '11:00 AM',
    customerName: 'Amit Patel',
    customerPhone: '+91 98111 22334',
    service: 'Beard Trim & Facial',
    stylist: 'Karan',
    status: 'in_progress',
    date: 'today',
  },
  {
    id: 'apt-3',
    time: '02:00 PM',
    customerName: 'Sneha Verma',
    customerPhone: '+91 98222 33445',
    service: 'Balayage & Hair Spa',
    stylist: 'Pooja',
    status: 'confirmed',
    date: 'today',
  },
  {
    id: 'apt-4',
    time: '04:30 PM',
    customerName: 'Rohan Gupta',
    customerPhone: '+91 98333 44556',
    service: 'Classic Men Haircut',
    stylist: 'Rahul',
    status: 'confirmed',
    date: 'today',
  },
  {
    id: 'apt-5',
    time: '06:00 PM',
    customerName: 'Ananya Roy',
    customerPhone: '+91 98444 55667',
    service: 'Keratin Treatment',
    stylist: 'Pooja',
    status: 'confirmed',
    date: 'today',
  },
  // Tomorrow's appointments
  {
    id: 'apt-6',
    time: '10:00 AM',
    customerName: 'Vikram Malhotra',
    customerPhone: '+91 98555 66778',
    service: 'Haircut + Styling',
    stylist: 'Rahul',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-7',
    time: '12:30 PM',
    customerName: 'Deepika Sen',
    customerPhone: '+91 98666 77889',
    service: 'Root Touch-up & Blowdry',
    stylist: 'Pooja',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-8',
    time: '03:30 PM',
    customerName: 'Manish Joshi',
    customerPhone: '+91 98777 88990',
    service: 'Detan Facial & Shave',
    stylist: 'Karan',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-9',
    time: '05:00 PM',
    customerName: 'Tanvi Mehra',
    customerPhone: '+91 98888 99001',
    service: 'Gel Nails & Manicure',
    stylist: 'Neha',
    status: 'confirmed',
    date: 'tomorrow',
  },
];

export const initialPendingApprovals: PendingApproval[] = [
  {
    id: 'appr-1',
    type: 'Late cancellation',
    customerName: 'Kunal Deshmukh',
    details: 'Wants to cancel 30 mins before 1:00 PM slot due to sudden flight delay. Standard policy requires 2 hr notice.',
    time: 'Today, 1:00 PM slot',
    createdAt: '10 mins ago',
    status: 'pending',
  },
  {
    id: 'appr-2',
    type: 'Reschedule',
    customerName: 'Meera Kapoor',
    details: 'Requests moving 3:00 PM Hair Color appointment to 7:00 PM tonight. Stylist Pooja available.',
    time: 'Requested: 7:00 PM Today',
    createdAt: '25 mins ago',
    status: 'pending',
  },
  {
    id: 'appr-3',
    type: 'Outside-hours request',
    customerName: 'Dr. Sameer Khan',
    details: 'Wants an early morning appointment at 8:15 AM tomorrow before salon opens at 9:00 AM.',
    time: 'Tomorrow, 8:15 AM',
    createdAt: '1 hour ago',
    status: 'pending',
  },
  {
    id: 'appr-4',
    type: 'Discount request',
    customerName: 'Shreya Bansal',
    details: 'First-time customer asking for 20% inaugural discount on Bridal Hair package (Rs. 4,500).',
    time: 'For Saturday booking',
    createdAt: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'appr-5',
    type: 'Unclear customer request',
    customerName: 'Anonymous Caller (WhatsApp)',
    details: 'AI Agent flagged message: "Need full body grooming and some coloring maybe tomorrow evening or whenever free". Needs manual slot confirmation.',
    time: 'Tomorrow evening',
    createdAt: '3 hours ago',
    status: 'pending',
  },
];

export const initialActivityLogs: ActivityLogItem[] = [
  {
    id: 'log-1',
    timestamp: '11:45 AM',
    title: 'Reminder queued',
    detail: 'Automated 2-hour reminder SMS queued for Sneha Verma (2:00 PM)',
    type: 'reminder_queued',
  },
  {
    id: 'log-2',
    timestamp: '11:15 AM',
    title: 'Booking confirmed',
    detail: 'AI assistant auto-confirmed slot for Amit Patel with Stylist Karan',
    type: 'booking_confirmed',
  },
  {
    id: 'log-3',
    timestamp: '10:30 AM',
    title: 'Agent suggested slot',
    detail: 'AI suggested 12:30 PM tomorrow to Deepika Sen based on open chair',
    type: 'agent_suggestion',
  },
  {
    id: 'log-4',
    timestamp: '09:40 AM',
    title: 'Owner approved request',
    detail: 'Owner Rishav approved complimentary beard oil add-on for Vikram M.',
    type: 'owner_approved',
  },
  {
    id: 'log-5',
    timestamp: '09:05 AM',
    title: 'Owner rejected request',
    detail: 'Owner rejected walk-in without deposit during peak rush hours',
    type: 'owner_rejected',
  },
];

/**
 * Service abstraction layer for the Owner Dashboard.
 * Satyam will provide backend API endpoints; these methods can then be switched
 * from in-memory/mock state to HTTP calls without changing UI components.
 */
class DashboardService {
  private appointments: Appointment[] = [...initialAppointments];
  private pendingApprovals: PendingApproval[] = [...initialPendingApprovals];
  private activityLogs: ActivityLogItem[] = [...initialActivityLogs];

  async getDashboardSummary(): Promise<DashboardSummary> {
    const todayCount = this.appointments.filter((a) => a.date === 'today' && a.status !== 'cancelled').length;
    const tomorrowCount = this.appointments.filter((a) => a.date === 'tomorrow' && a.status !== 'cancelled').length;
    const pendingCount = this.pendingApprovals.filter((a) => a.status === 'pending').length;

    // Schedule gaps estimate: gap slots identified between appointments
    const scheduleGaps = 2; // e.g. 12:00-2:00 PM and 3:00-4:30 PM

    return {
      todayAppointments: todayCount,
      tomorrowAppointments: tomorrowCount,
      pendingApprovals: pendingCount,
      scheduleGaps,
    };
  }

  async getAppointments(date?: 'today' | 'tomorrow'): Promise<Appointment[]> {
    if (!date) return [...this.appointments];
    return this.appointments.filter((a) => a.date === date);
  }

  async getPendingApprovals(): Promise<PendingApproval[]> {
    return this.pendingApprovals.filter((a) => a.status === 'pending');
  }

  async resolveApproval(
    id: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<{ success: boolean; log: ActivityLogItem }> {
    const item = this.pendingApprovals.find((a) => a.id === id);
    if (!item) {
      throw new Error(`Approval item ${id} not found`);
    }

    item.status = action === 'approve' ? 'approved' : 'rejected';

    const actionText = action === 'approve' ? 'approved' : 'rejected';
    const logItem: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: action === 'approve' ? 'Owner approved request' : 'Owner rejected request',
      detail: `Owner ${actionText} ${item.type} for ${item.customerName}${comment ? ` (${comment})` : ''}`,
      type: action === 'approve' ? 'owner_approved' : 'owner_rejected',
    };

    this.activityLogs.unshift(logItem);
    return { success: true, log: logItem };
  }

  async getActivityLogs(): Promise<ActivityLogItem[]> {
    return [...this.activityLogs];
  }
}

export const dashboardService = new DashboardService();
