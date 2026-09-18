import { SupportTicket, SupportRequestStatus, SupportCategory } from '../types/booking';
import { INITIAL_SUPPORT_TICKETS } from '../data/initialBookingsReviews';
import { NotificationService } from './notificationService';

const SUPPORT_STORAGE_KEY = 'bharat_yatra_support_tickets_v1';

export class SupportService {
  private static getStoredTickets(): SupportTicket[] {
    try {
      const data = localStorage.getItem(SUPPORT_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return INITIAL_SUPPORT_TICKETS;
  }

  private static saveTickets(list: SupportTicket[]): void {
    try {
      localStorage.setItem(SUPPORT_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  public static getAllTickets(): SupportTicket[] {
    return this.getStoredTickets();
  }

  public static getTicketsByUser(userId: string): SupportTicket[] {
    return this.getStoredTickets().filter((t) => t.userId === userId || userId === 'usr_demo_traveler');
  }

  public static createTicket(
    data: {
      userId: string;
      userName: string;
      userEmail: string;
      userPhone?: string;
      targetType: 'experience' | 'provider' | 'review' | 'event' | 'general';
      targetId?: string;
      targetTitle?: string;
      category: SupportCategory;
      subject: string;
      description: string;
      priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
    }
  ): { success: boolean; ticket?: SupportTicket; error?: string } {
    if (!data.subject || data.subject.trim().length < 4) {
      return { success: false, error: 'Subject line must be at least 4 characters.' };
    }
    if (!data.description || data.description.trim().length < 15) {
      return { success: false, error: 'Please describe the issue in detail (at least 15 characters).' };
    }

    const all = this.getStoredTickets();
    const id = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newTicket: SupportTicket = {
      id,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      targetType: data.targetType,
      targetId: data.targetId,
      targetTitle: data.targetTitle,
      category: data.category,
      subject: data.subject.trim(),
      description: data.description.trim(),
      status: 'Open',
      priority: data.priority || 'Medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newTicket, ...all];
    this.saveTickets(updated);

    NotificationService.addNotification({
      userId: 'all',
      roleTarget: 'SUPPORT_AGENT',
      type: 'system_alert',
      title: `New Support Case #${newTicket.id}`,
      message: `${newTicket.subject} (${newTicket.category}) submitted by ${newTicket.userName}.`,
      actionTab: 'admin_dashboard',
    });

    return { success: true, ticket: newTicket };
  }

  public static updateTicketStatus(
    ticketId: string,
    status: SupportRequestStatus,
    resolutionNotes?: string
  ): SupportTicket | null {
    const all = this.getStoredTickets();
    const index = all.findIndex((t) => t.id === ticketId);
    if (index === -1) return null;

    const ticket = all[index];
    const updated: SupportTicket = {
      ...ticket,
      status,
      resolutionNotes: resolutionNotes || ticket.resolutionNotes,
      resolvedAt: status === 'Resolved' || status === 'Closed' ? new Date().toISOString() : ticket.resolvedAt,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    this.saveTickets(all);

    NotificationService.addNotification({
      userId: ticket.userId,
      type: 'system_alert',
      title: `Support Ticket #${ticket.id} Updated`,
      message: `Your inquiry "${ticket.subject}" has been marked as ${status}. ${resolutionNotes ? `Resolution: ${resolutionNotes}` : ''}`,
      actionTab: 'profile',
    });

    return updated;
  }
}
