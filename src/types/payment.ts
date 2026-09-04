export type PaymentMethodType = 
  | 'paypal'
  | 'paypal_paylater'
  | 'venmo'
  | 'credit_card'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_wire'
  | 'ach_debit'
  | 'crypto_usdt'
  | 'crypto_btc'
  | 'corporate_po';

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

export interface PaymentPlan {
  id: string;
  name: string;
  badge?: string;
  price: number;
  period: 'month' | 'year' | 'one_time';
  description: string;
  features: string[];
  recommended?: boolean;
}

export interface TransactionRecord {
  id: string;
  referenceId: string; // e.g. "165059"
  amount: number;
  currency: string;
  method: PaymentMethodType;
  methodLabel: string;
  status: PaymentStatus;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  description: string;
  timestamp: string;
  paypalOrderId?: string;
  paypalPayerId?: string;
  last4?: string;
  cardBrand?: string;
  cryptoTxHash?: string;
  receiptNumber: string;
  notes?: string;
}

export interface PayPalConfig {
  clientId: string;
  currency: string;
  environment: 'sandbox' | 'production';
  enableVenmo: boolean;
  enablePayLater: boolean;
  enableCard: boolean;
}

export interface CardDetails {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  billingZip: string;
  cardType?: string;
}
