import type {
  Appointment,
  AppointmentStatus,
  PendingApproval,
  ApprovalType,
  ActivityLogItem,
  ActivityType,
  DashboardSummary,
  ScheduleGap,
} from '../types/dashboard';

// Mock Data using real salon stylists (Aman, Rohit) and services (Haircut, Facial, Hair Spa, Beard Trim)
export const initialAppointments: Appointment[] = [
  {
    id: 'apt-1',
    time: '09:30 AM',
    customerName: 'Priya Sharma',
    customerPhone: '+91 98765 43210',
    service: 'Haircut',
    stylist: 'Aman',
    status: 'completed',
    date: 'today',
  },
  {
    id: 'apt-2',
    time: '11:00 AM',
    customerName: 'Amit Patel',
    customerPhone: '+91 98111 22334',
    service: 'Beard Trim',
    stylist: 'Rohit',
    status: 'in_progress',
    date: 'today',
  },
  {
    id: 'apt-3',
    time: '02:00 PM',
    customerName: 'Sneha Verma',
    customerPhone: '+91 98222 33445',
    service: 'Hair Spa',
    stylist: 'Aman',
    status: 'confirmed',
    date: 'today',
  },
  {
    id: 'apt-4',
    time: '04:30 PM',
    customerName: 'Rohan Gupta',
    customerPhone: '+91 98333 44556',
    service: 'Haircut',
    stylist: 'Rohit',
    status: 'confirmed',
    date: 'today',
  },
  {
    id: 'apt-5',
    time: '06:00 PM',
    customerName: 'Ananya Roy',
    customerPhone: '+91 98444 55667',
    service: 'Facial',
    stylist: 'Aman',
    status: 'confirmed',
    date: 'today',
  },
  // Tomorrow's appointments
  {
    id: 'apt-6',
    time: '10:00 AM',
    customerName: 'Vikram Malhotra',
    customerPhone: '+91 98555 66778',
    service: 'Haircut',
    stylist: 'Rohit',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-7',
    time: '12:30 PM',
    customerName: 'Deepika Sen',
    customerPhone: '+91 98666 77889',
    service: 'Hair Spa',
    stylist: 'Aman',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-8',
    time: '03:30 PM',
    customerName: 'Manish Joshi',
    customerPhone: '+91 98777 88990',
    service: 'Facial',
    stylist: 'Rohit',
    status: 'confirmed',
    date: 'tomorrow',
  },
  {
    id: 'apt-9',
    time: '05:00 PM',
    customerName: 'Tanvi Mehra',
    customerPhone: '+91 98888 99001',
    service: 'Beard Trim',
    stylist: 'Aman',
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
    details: 'Requests moving 3:00 PM Hair Spa appointment to 7:00 PM tonight. Stylist Rohit available.',
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
    details: 'First-time customer asking for 20% inaugural discount on Hair Spa package (Rs. 1,200).',
    time: 'For Saturday booking',
    createdAt: '2 hours ago',
    status: 'pending',
  },
  {
    id: 'appr-5',
    type: 'Unclear customer request',
    customerName: 'Anonymous Caller (WhatsApp)',
    details: 'AI Agent flagged message: "Need haircut and facial tomorrow evening whenever free". Needs manual slot confirmation.',
    time: 'Tomorrow evening',
    createdAt: '3 hours ago',
    status: 'pending',
  },
];

export const initialScheduleGaps: ScheduleGap[] = [
  {
    id: 'gap-1',
    date: 'today',
    startTime: '12:00 PM',
    endTime: '02:00 PM',
    stylist: 'Aman & Rohit',
    suggestedAction: 'Send automated flash discount nudge to nearby clients',
  },
  {
    id: 'gap-2',
    date: 'today',
    startTime: '03:00 PM',
    endTime: '04:30 PM',
    stylist: 'Rohit',
    suggestedAction: 'Chair open for quick beard trim or haircut walk-ins',
  },
  {
    id: 'gap-3',
    date: 'tomorrow',
    startTime: '01:30 PM',
    endTime: '03:30 PM',
    stylist: 'Aman',
    suggestedAction: 'Candidate slot for rebooking inactive customers',
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
    detail: 'AI assistant auto-confirmed slot for Amit Patel with Stylist Rohit',
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
    detail: 'Owner approved complimentary beard oil add-on for Vikram M.',
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
 * Integrates directly with real backend API contract on http://localhost:5000.
 */
class DashboardService {
  private appointments: Appointment[] = [...initialAppointments];
  private pendingApprovals: PendingApproval[] = [...initialPendingApprovals];
  private scheduleGaps: ScheduleGap[] = [...initialScheduleGaps];
  private activityLogs: ActivityLogItem[] = [...initialActivityLogs];

  private apiUrl: string = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Helper to map backend booking entity to Dashboard Appointment model
   */
  private mapBookingToAppointment(b: any, scope: 'today' | 'tomorrow'): Appointment {
    let timeStr = '';
    if (b.startIST && typeof b.startIST === 'string') {
      const parts = b.startIST.split(',');
      timeStr = (parts[1] || parts[0]).trim();
    } else if (b.start) {
      try {
        timeStr = new Date(b.start).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        timeStr = b.start;
      }
    }

    return {
      id: b.id,
      time: timeStr || 'Scheduled',
      customerName: b.customerName || 'Walk-in',
      customerPhone: b.customerPhone || '',
      service: b.service || 'Service',
      stylist: b.stylist || 'Aman',
      status: (['confirmed', 'in_progress', 'completed', 'cancelled'].includes(b.status)
        ? b.status
        : 'confirmed') as AppointmentStatus,
      date: scope,
      start: b.start,
      end: b.end,
      startIST: b.startIST,
      endIST: b.endIST,
    };
  }

  /**
   * Helper to map backend approval entity to Dashboard PendingApproval model
   */
  private mapApprovalToPendingApproval(item: any): PendingApproval {
    let displayType: ApprovalType = 'Unclear customer request';
    const rawType = (item.type || '').toLowerCase();
    if (rawType.includes('discount')) {
      displayType = 'Discount request';
    } else if (rawType.includes('outside') || rawType.includes('hours')) {
      displayType = 'Outside-hours request';
    } else if (rawType.includes('cancel')) {
      displayType = 'Late cancellation';
    } else if (rawType.includes('reschedule')) {
      displayType = 'Reschedule';
    } else if (rawType === 'unclear' || rawType.includes('intent')) {
      displayType = 'Unclear customer request';
    }

    const payload = item.payload || {};
    const customerName =
      payload.customerName ||
      payload.name ||
      payload.customerPhone ||
      (item.customer_id ? `Customer (${item.customer_id.slice(0, 6)})` : 'Customer');

    const details =
      payload.message ||
      payload.details ||
      payload.parsedIntent?.clarificationQuestion ||
      `Request requires owner review for ${displayType}`;

    let timeDisplay = 'Pending review';
    if (payload.parsedIntent?.time) {
      timeDisplay = `Requested: ${payload.parsedIntent.time}`;
    } else if (item.created_at) {
      try {
        timeDisplay = new Date(item.created_at).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        timeDisplay = 'Pending';
      }
    }

    let createdAtDisplay = 'Just now';
    if (item.created_at) {
      const diffMs = Date.now() - new Date(item.created_at).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) {
        createdAtDisplay = 'Just now';
      } else if (diffMins < 60) {
        createdAtDisplay = `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
      } else {
        const diffHours = Math.floor(diffMins / 60);
        createdAtDisplay = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
      }
    }

    return {
      id: item.id,
      type: displayType,
      customerName,
      details,
      time: timeDisplay,
      createdAt: createdAtDisplay,
      status: item.status || 'pending',
      payload: item.payload,
    };
  }

  /**
   * Helper to map backend activity log entity to ActivityLogItem
   */
  private mapBackendActivityToLogItem(item: any): ActivityLogItem {
    const rawAction = (item.action || '').toLowerCase();
    const actor = (item.actor || 'system').toLowerCase();
    const meta = item.metadata || {};

    let type: ActivityType = 'agent_suggestion';
    let title = item.action || 'Activity recorded';

    if (rawAction.includes('approve')) {
      type = 'owner_approved';
      title = 'Owner approved request';
    } else if (rawAction.includes('reject')) {
      type = 'owner_rejected';
      title = 'Owner rejected request';
    } else if (rawAction.includes('booking') || rawAction.includes('confirm')) {
      type = 'booking_confirmed';
      title = 'Booking confirmed';
    } else if (rawAction.includes('reminder')) {
      type = 'reminder_queued';
      title = 'Reminder queued';
    } else if (rawAction.includes('status')) {
      type = 'status_changed';
      title = 'Status changed';
    } else if (rawAction.includes('chat') || rawAction.includes('suggest')) {
      type = 'agent_suggestion';
      title = 'Agent suggested slot';
    }

    let detail = '';
    if (meta.message) {
      detail = meta.message;
    } else if (meta.customerName) {
      detail = `${actor === 'owner' ? 'Owner' : 'AI Agent'} processed booking for ${meta.customerName}${meta.service ? ` (${meta.service})` : ''}`;
    } else if (meta.action && meta.approvalId) {
      detail = `Owner ${meta.action === 'approve' ? 'approved' : 'rejected'} approval request #${meta.approvalId.slice(0, 8)}`;
    } else if (meta.intent) {
      detail = `AI Agent processed intent: ${meta.intent}`;
    } else {
      detail = `${item.actor ? item.actor.toUpperCase() : 'System'}: ${item.action || 'Event logged'}`;
    }

    let timestamp = 'Just now';
    if (item.created_at) {
      try {
        timestamp = new Date(item.created_at).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        });
      } catch {
        timestamp = 'Recently';
      }
    }

    return {
      id: item.id || `log-${Date.now()}-${Math.random()}`,
      timestamp,
      title,
      detail,
      type,
    };
  }

  /**
   * GET /api/dashboard/summary
   */
  async getDashboardSummary(): Promise<DashboardSummary> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/dashboard/summary`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            return {
              todayAppointments: Number(json.data.todayAppointments) || 0,
              tomorrowAppointments: Number(json.data.tomorrowAppointments) || 0,
              pendingApprovals: Number(json.data.pendingApprovals) || 0,
              openSlots: Number(json.data.openSlots) || 0,
              scheduleGaps: Number(json.data.openSlots) || 0,
            };
          }
        }
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }

    const todayCount = this.appointments.filter((a) => a.date === 'today' && a.status !== 'cancelled').length;
    const tomorrowCount = this.appointments.filter((a) => a.date === 'tomorrow' && a.status !== 'cancelled').length;
    const pendingCount = this.pendingApprovals.filter((a) => a.status === 'pending').length;
    const gapsCount = this.scheduleGaps.filter((g) => g.date === 'today').length;

    return {
      todayAppointments: todayCount,
      tomorrowAppointments: tomorrowCount,
      pendingApprovals: pendingCount,
      openSlots: gapsCount,
      scheduleGaps: gapsCount,
    };
  }

  /**
   * GET /api/dashboard/bookings?scope=today | tomorrow
   */
  async getAppointments(date?: 'today' | 'tomorrow'): Promise<Appointment[]> {
    if (this.apiUrl) {
      try {
        if (date) {
          const res = await fetch(`${this.apiUrl}/api/dashboard/bookings?scope=${date}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
              return json.data.map((b: any) => this.mapBookingToAppointment(b, date));
            }
          }
        } else {
          const [todayRes, tomorrowRes] = await Promise.all([
            fetch(`${this.apiUrl}/api/dashboard/bookings?scope=today`),
            fetch(`${this.apiUrl}/api/dashboard/bookings?scope=tomorrow`),
          ]);
          if (todayRes.ok && tomorrowRes.ok) {
            const [todayJson, tomorrowJson] = await Promise.all([
              todayRes.json(),
              tomorrowRes.json(),
            ]);
            const todayApts = (todayJson.data || []).map((b: any) =>
              this.mapBookingToAppointment(b, 'today')
            );
            const tomorrowApts = (tomorrowJson.data || []).map((b: any) =>
              this.mapBookingToAppointment(b, 'tomorrow')
            );
            return [...todayApts, ...tomorrowApts];
          }
        }
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }

    if (!date) return [...this.appointments];
    return this.appointments.filter((a) => a.date === date);
  }

  /**
   * GET /api/bookings?date=YYYY-MM-DD
   */
  async getBookingsByDate(dateStr: string): Promise<Appointment[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/bookings?date=${dateStr}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data.map((b: any) => this.mapBookingToAppointment(b, 'today'));
          }
        }
      } catch (e) {
        console.warn('Backend unavailable for getBookingsByDate', e);
      }
    }
    return this.appointments;
  }

  /**
   * Update appointment status client-side.
   * Note: There is NO backend endpoint PATCH /api/owner/appointments/:id/status.
   * State is managed cleanly without calling non-existent routes.
   */
  async updateAppointmentStatus(
    id: string,
    newStatus: AppointmentStatus
  ): Promise<{ success: boolean; appointment: Appointment; log: ActivityLogItem }> {
    const apt = this.appointments.find((a) => a.id === id);
    const oldStatus = apt ? apt.status : 'confirmed';
    if (apt) {
      apt.status = newStatus;
    }

    const logItem: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      title: 'Status changed',
      detail: `Owner updated ${apt ? apt.customerName : 'appointment'}'s status from ${oldStatus} to ${newStatus}`,
      type: 'status_changed',
    };

    this.activityLogs.unshift(logItem);
    return {
      success: true,
      appointment: apt
        ? { ...apt }
        : {
            id,
            time: 'Scheduled',
            customerName: 'Customer',
            service: 'Haircut',
            stylist: 'Aman',
            status: newStatus,
            date: 'today',
          },
      log: logItem,
    };
  }

  /**
   * GET /api/approvals?status=pending
   */
  async getPendingApprovals(status: string = 'pending'): Promise<PendingApproval[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/approvals?status=${status}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data.map((item: any) => this.mapApprovalToPendingApproval(item));
          }
        }
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }
    return this.pendingApprovals.filter((a) => a.status === 'pending');
  }

  /**
   * PATCH /api/approvals/:id
   * Body: { "action": "approve" | "reject" }
   */
  async resolveApproval(
    id: string,
    action: 'approve' | 'reject',
    comment?: string
  ): Promise<{ success: boolean; log: ActivityLogItem; data?: any }> {
    let responseData: any = null;
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/approvals/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        });
        if (res.ok) {
          responseData = await res.json();
        } else {
          console.warn(`Approval update returned status ${res.status}`);
        }
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock resolution', e);
      }
    }

    const item = this.pendingApprovals.find((a) => a.id === id);
    if (item) {
      item.status = action === 'approve' ? 'approved' : 'rejected';
    }

    const actionText = action === 'approve' ? 'approved' : 'rejected';
    const logItem: ActivityLogItem = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }),
      title: action === 'approve' ? 'Owner approved request' : 'Owner rejected request',
      detail: item
        ? `Owner ${actionText} ${item.type} for ${item.customerName}${comment ? ` • Note: "${comment}"` : ''}`
        : `Owner ${actionText} request #${id.slice(0, 8)}${comment ? ` • Note: "${comment}"` : ''}`,
      type: action === 'approve' ? 'owner_approved' : 'owner_rejected',
    };

    this.activityLogs.unshift(logItem);
    return { success: true, log: logItem, data: responseData };
  }

  /**
   * Return schedule gaps for the given date.
   */
  async getScheduleGaps(date?: 'today' | 'tomorrow'): Promise<ScheduleGap[]> {
    if (!date) return [...this.scheduleGaps];
    return this.scheduleGaps.filter((g) => g.date === date);
  }

  /**
   * GET /api/activity?limit=20
   */
  async getActivityLogs(limit: number = 20): Promise<ActivityLogItem[]> {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/activity?limit=${limit}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            return json.data.map((item: any) => this.mapBackendActivityToLogItem(item));
          }
        }
      } catch (e) {
        console.warn('Backend unavailable, falling back to mock data', e);
      }
    }
    return [...this.activityLogs];
  }

  /**
   * Automation helper: GET /api/automation/reminders?window=day_before | two_hours
   */
  async getAutomationReminders(window: 'day_before' | 'two_hours' = 'day_before') {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/automation/reminders?window=${window}`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable for reminders', e);
      }
    }
    return { success: false, data: [] };
  }

  /**
   * Automation helper: GET /api/automation/tomorrow-summary
   */
  async getTomorrowSummary() {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/automation/tomorrow-summary`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable for tomorrow summary', e);
      }
    }
    return null;
  }

  /**
   * Automation helper: GET /api/automation/rebooking-candidates
   */
  async getRebookingCandidates() {
    if (this.apiUrl) {
      try {
        const res = await fetch(`${this.apiUrl}/api/automation/rebooking-candidates`);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend unavailable for rebooking candidates', e);
      }
    }
    return { success: false, data: [] };
  }
}

export const dashboardService = new DashboardService();
