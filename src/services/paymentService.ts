import { PaymentStatus, PaymentMethod } from '../types/booking';

export interface PaymentSimulationResult {
  success: boolean;
  transactionId: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  amountInr: number;
  timestamp: string;
  message: string;
  isMockPayment: boolean;
}

export interface PriceBreakdown {
  basePriceInr: number;
  travelersCount: number;
  subtotalInr: number;
  gstRatePercent: number;
  gstAmountInr: number;
  platformFeeInr: number;
  totalAmountInr: number;
}

/**
 * PaymentService
 *
 * Implements the payment abstraction requested in Module 5:
 * - Replaceable payment provider interface
 * - Mock development checkout (UPI, NetBanking, Card, Pay at Venue)
 * - Zero raw card storage
 * - Clear demo warning indicators
 * - Refund calculation & eligibility rules
 */
export class PaymentService {
  public static readonly IS_LIVE_GATEWAY_CONNECTED = false; // Live payment gateway placeholder

  public static calculatePrice(basePricePerPersonInr: number, travelersCount: number): PriceBreakdown {
    const subtotalInr = Math.max(0, basePricePerPersonInr * travelersCount);
    // 5% GST for tourism and cultural experiences in India
    const gstRatePercent = 5;
    const gstAmountInr = Math.round((subtotalInr * gstRatePercent) / 100);
    // Platform sustainability & cultural conservation fee (₹0 if free activity)
    const platformFeeInr = subtotalInr > 0 ? 30 : 0;
    const totalAmountInr = subtotalInr + gstAmountInr + platformFeeInr;

    return {
      basePriceInr: basePricePerPersonInr,
      travelersCount,
      subtotalInr,
      gstRatePercent,
      gstAmountInr,
      platformFeeInr,
      totalAmountInr,
    };
  }

  /**
   * Process Mock Payment Checkout
   * Safely simulates bank transaction without requiring external credentials
   */
  public static async processMockPayment(
    amountInr: number,
    method: PaymentMethod,
    metadata?: Record<string, unknown>
  ): Promise<PaymentSimulationResult> {
    // Artificial 600ms latency to simulate real network roundtrip
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (method === 'Pay at Venue / Cash' || amountInr === 0) {
      return {
        success: true,
        transactionId: `TXN-VENUE-${Date.now().toString(36).toUpperCase()}`,
        paymentStatus: 'Paid',
        paymentMethod: method,
        amountInr,
        timestamp: new Date().toISOString(),
        message: 'Payment registered to be settled directly with the verified host at the venue.',
        isMockPayment: true,
      };
    }

    // Generate compliant transaction reference
    const txnRef = `TXN-DEMO-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    return {
      success: true,
      transactionId: txnRef,
      paymentStatus: 'Paid',
      paymentMethod: method,
      amountInr,
      timestamp: new Date().toISOString(),
      message: 'Demo transaction completed successfully in testing sandbox.',
      isMockPayment: true,
    };
  }

  /**
   * Evaluates refund eligibility based on standard cultural experience cancellation window
   */
  public static checkRefundEligibility(bookingDateStr: string, totalPaidInr: number): {
    isEligible: boolean;
    refundPercent: number;
    eligibleAmountInr: number;
    reason: string;
  } {
    if (totalPaidInr <= 0) {
      return {
        isEligible: true,
        refundPercent: 100,
        eligibleAmountInr: 0,
        reason: 'Free reservation cancelled without fees.',
      };
    }

    try {
      const activityTime = new Date(bookingDateStr).getTime();
      const now = Date.now();
      const hoursRemaining = (activityTime - now) / (1000 * 60 * 60);

      if (hoursRemaining >= 48) {
        return {
          isEligible: true,
          refundPercent: 100,
          eligibleAmountInr: totalPaidInr,
          reason: 'Eligible for 100% full refund (cancelled more than 48 hours prior).',
        };
      } else if (hoursRemaining >= 24) {
        const eligibleAmountInr = Math.round(totalPaidInr * 0.5);
        return {
          isEligible: true,
          refundPercent: 50,
          eligibleAmountInr,
          reason: 'Eligible for 50% partial refund (cancelled between 24 and 48 hours prior).',
        };
      } else {
        return {
          isEligible: false,
          refundPercent: 0,
          eligibleAmountInr: 0,
          reason: 'Non-refundable (cancelled within 24 hours of scheduled experience slot).',
        };
      }
    } catch {
      return {
        isEligible: true,
        refundPercent: 100,
        eligibleAmountInr: totalPaidInr,
        reason: 'Standard review refund applied.',
      };
    }
  }
}
