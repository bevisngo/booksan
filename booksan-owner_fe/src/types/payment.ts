export type PaymentMethod = 'BANK_TRANSFER' | 'CASH_ON_ARRIVAL' | 'E_WALLET_NOTE';

export interface PaymentConfig {
  id: string;
  ownerId: string;
  preferredMethods: PaymentMethod[];
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  qrImageUrl?: string;
  transferNoteTemplate: string;
  instructionsText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdatePaymentConfigData {
  preferredMethods: PaymentMethod[];
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  bankBranch?: string;
  transferNoteTemplate: string;
  instructionsText?: string;
}

export interface PaymentPreviewData {
  bookingCode: string;
  date: string;
  courtName: string;
  startTime: string;
  amount: number;
}

export const PAYMENT_METHODS = [
  {
    value: 'BANK_TRANSFER' as PaymentMethod,
    label: 'Bank Transfer',
    description: 'Customers transfer money directly to your bank account',
  },
  {
    value: 'CASH_ON_ARRIVAL' as PaymentMethod,
    label: 'Cash on Arrival',
    description: 'Customers pay in cash when they arrive',
  },
  {
    value: 'E_WALLET_NOTE' as PaymentMethod,
    label: 'E-Wallet with Note',
    description: 'Customers use e-wallets (MoMo, ZaloPay) with transfer note',
  },
] as const;

export const DEFAULT_TRANSFER_NOTE_TEMPLATE = 
  'Payment for booking {bookingCode} - {courtName} on {date} at {startTime}. Amount: {amount} VND';

export const DEFAULT_INSTRUCTIONS_TEXT = 
  'Please complete your payment within 24 hours to confirm your booking. Include the booking code in your transfer note for faster processing.';
