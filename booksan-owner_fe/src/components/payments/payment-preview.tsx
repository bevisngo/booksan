'use client';

import * as React from 'react';
import { Copy, QrCode } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { PAYMENT_METHODS, type PaymentMethod, type PaymentPreviewData } from '@/types/payment';

interface PaymentPreviewConfig {
  preferredMethods: PaymentMethod[];
  bankName?: string;
  bankAccountName?: string;
  bankAccountNumber?: string;
  transferNoteTemplate: string;
  instructionsText?: string;
  qrImageUrl?: string;
}

interface PaymentPreviewProps {
  config: PaymentPreviewConfig;
  sampleBooking: PaymentPreviewData;
}

export function PaymentPreview({ config, sampleBooking }: PaymentPreviewProps) {
  const { toast } = useToast();

  const generateTransferNote = (template: string, booking: PaymentPreviewData): string => {
    return template
      .replace('{bookingCode}', booking.bookingCode)
      .replace('{date}', booking.date)
      .replace('{courtName}', booking.courtName)
      .replace('{startTime}', booking.startTime)
      .replace('{amount}', formatCurrency(booking.amount));
  };

  const transferNote = generateTransferNote(config.transferNoteTemplate, sampleBooking);

  const copyText = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
      });
    }
  };

  const copyPaymentInstructions = async () => {
    let instructions = '';
    
    // Add payment methods
    if (config.preferredMethods.length > 0) {
      const methodLabels = config.preferredMethods.map(method => 
        PAYMENT_METHODS.find(m => m.value === method)?.label
      ).filter(Boolean);
      instructions += `Payment Methods: ${methodLabels.join(', ')}\n\n`;
    }

    // Add bank info if available
    if (config.bankName || config.bankAccountName || config.bankAccountNumber) {
      instructions += 'Bank Details:\n';
      if (config.bankName) instructions += `Bank: ${config.bankName}\n`;
      if (config.bankAccountName) instructions += `Account Name: ${config.bankAccountName}\n`;
      if (config.bankAccountNumber) instructions += `Account Number: ${config.bankAccountNumber}\n`;
      instructions += '\n';
    }

    // Add transfer note
    if (transferNote) {
      instructions += `Transfer Note: ${transferNote}\n\n`;
    }

    // Add instructions text
    if (config.instructionsText) {
      instructions += `Instructions:\n${config.instructionsText}`;
    }

    await copyText(instructions, 'Payment instructions copied');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Live Preview
          <Button
            variant="outline"
            size="sm"
            onClick={copyPaymentInstructions}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
        </CardTitle>
        <CardDescription>
          Preview how payment instructions will appear to customers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sample Booking Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Sample Booking</h4>
          <div className="text-sm space-y-1">
            <p><strong>Booking Code:</strong> {sampleBooking.bookingCode}</p>
            <p><strong>Court:</strong> {sampleBooking.courtName}</p>
            <p><strong>Date & Time:</strong> {sampleBooking.date} at {sampleBooking.startTime}</p>
            <p><strong>Amount:</strong> {formatCurrency(sampleBooking.amount)}</p>
          </div>
        </div>

        {/* Payment Methods */}
        {config.preferredMethods.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Accepted Payment Methods</h4>
            <div className="flex flex-wrap gap-2">
              {config.preferredMethods.map((method) => {
                const methodInfo = PAYMENT_METHODS.find(m => m.value === method);
                return (
                  <Badge key={method} variant="outline">
                    {methodInfo?.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Bank Information */}
        {(config.bankName || config.bankAccountName || config.bankAccountNumber) && (
          <div>
            <h4 className="font-medium mb-3">Bank Details</h4>
            <div className="space-y-2 text-sm">
              {config.bankName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bank:</span>
                  <span>{config.bankName}</span>
                </div>
              )}
              {config.bankAccountName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Name:</span>
                  <span>{config.bankAccountName}</span>
                </div>
              )}
              {config.bankAccountNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Number:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">{config.bankAccountNumber}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyText(config.bankAccountNumber!, 'Account number copied')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* QR Code */}
        {config.qrImageUrl && (
          <div>
            <h4 className="font-medium mb-3 flex items-center">
              <QrCode className="h-4 w-4 mr-2" />
              Payment QR Code
            </h4>
            <div className="flex justify-center">
              <img
                src={config.qrImageUrl}
                alt="Payment QR Code"
                className="w-48 h-48 object-contain border rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Transfer Note */}
        {transferNote && (
          <div>
            <h4 className="font-medium mb-3">Transfer Note</h4>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-start">
                <p className="text-sm flex-1 mr-2">{transferNote}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(transferNote, 'Transfer note copied')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {config.instructionsText && (
          <div>
            <h4 className="font-medium mb-3">Instructions</h4>
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex justify-between items-start">
                <p className="text-sm flex-1 mr-2 whitespace-pre-wrap">
                  {config.instructionsText}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyText(config.instructionsText!, 'Instructions copied')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {config.preferredMethods.length === 0 && !config.bankName && !transferNote && !config.instructionsText && (
          <div className="text-center py-8 text-muted-foreground">
            <p>Configure your payment settings to see the preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
