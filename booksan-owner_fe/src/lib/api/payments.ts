import { apiClient } from '@/lib/api';
import type { PaymentConfig, UpdatePaymentConfigData } from '@/types/payment';

export class PaymentApi {
  static async getPaymentConfig(): Promise<PaymentConfig> {
    return apiClient.get<PaymentConfig>('/payments/config');
  }

  static async updatePaymentConfig(data: UpdatePaymentConfigData): Promise<PaymentConfig> {
    return apiClient.put<PaymentConfig>('/payments/config', data);
  }

  static async uploadPaymentQR(file: File): Promise<{ url: string }> {
    return apiClient.uploadFile('/payments/config/qr', file);
  }

  static async deletePaymentQR(): Promise<void> {
    return apiClient.delete('/payments/config/qr');
  }
}

export const paymentApi = PaymentApi;
