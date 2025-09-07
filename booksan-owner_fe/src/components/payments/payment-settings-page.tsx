'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Copy, Upload, X, Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PaymentPreview } from '@/components/payments/payment-preview';
import { formatCurrency } from '@/lib/utils';
import { paymentApi } from '@/lib/api/payments';
import { 
  PAYMENT_METHODS, 
  DEFAULT_TRANSFER_NOTE_TEMPLATE, 
  DEFAULT_INSTRUCTIONS_TEXT,
  type PaymentMethod,
  type PaymentConfig,
  type UpdatePaymentConfigData 
} from '@/types/payment';

const paymentConfigSchema = z.object({
  preferredMethods: z.array(z.string()).min(1, 'At least one payment method is required'),
  bankName: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankBranch: z.string().optional(),
  transferNoteTemplate: z.string().min(1, 'Transfer note template is required'),
  instructionsText: z.string().optional(),
});

type PaymentConfigFormData = z.infer<typeof paymentConfigSchema>;

export function PaymentSettingsPage() {
  const { toast } = useToast();
  const [config, setConfig] = React.useState<PaymentConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingQR, setUploadingQR] = React.useState(false);
  const [showBankAccount, setShowBankAccount] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PaymentConfigFormData>({
    resolver: zodResolver(paymentConfigSchema),
    defaultValues: {
      preferredMethods: [],
      transferNoteTemplate: DEFAULT_TRANSFER_NOTE_TEMPLATE,
      instructionsText: DEFAULT_INSTRUCTIONS_TEXT,
    },
  });

  const watchedMethods = watch('preferredMethods');
  const watchedTemplate = watch('transferNoteTemplate');
  const watchedInstructions = watch('instructionsText');
  const watchedBankName = watch('bankName');
  const watchedBankAccountName = watch('bankAccountName');
  const watchedBankAccountNumber = watch('bankAccountNumber');

  // Load config
  React.useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await paymentApi.getPaymentConfig();
        setConfig(data);
        reset({
          preferredMethods: data.preferredMethods,
          bankName: data.bankName || '',
          bankAccountName: data.bankAccountName || '',
          bankAccountNumber: data.bankAccountNumber || '',
          bankBranch: data.bankBranch || '',
          transferNoteTemplate: data.transferNoteTemplate,
          instructionsText: data.instructionsText || '',
        });
      } catch (error: any) {
        if (error.status === 404) {
          // No config yet, use defaults
          reset();
        } else {
          toast({
            variant: 'destructive',
            title: 'Failed to load payment settings',
            description: error.message || 'Please try again',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [reset, toast]);

  const onSubmit = async (data: PaymentConfigFormData) => {
    try {
      setSaving(true);
      const updateData: UpdatePaymentConfigData = {
        preferredMethods: data.preferredMethods as PaymentMethod[],
        bankName: data.bankName || undefined,
        bankAccountName: data.bankAccountName || undefined,
        bankAccountNumber: data.bankAccountNumber || undefined,
        bankBranch: data.bankBranch || undefined,
        transferNoteTemplate: data.transferNoteTemplate,
        instructionsText: data.instructionsText || undefined,
      };

      const updatedConfig = await paymentApi.updatePaymentConfig(updateData);
      setConfig(updatedConfig);
      
      toast({
        title: 'Payment settings saved',
        description: 'Your payment configuration has been updated successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to save payment settings',
        description: error.message || 'Please try again',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMethodChange = (method: string, checked: boolean) => {
    const currentMethods = watchedMethods || [];
    if (checked) {
      setValue('preferredMethods', [...currentMethods, method]);
    } else {
      setValue('preferredMethods', currentMethods.filter(m => m !== method));
    }
  };

  const handleQRUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid file type',
        description: 'Please upload an image file',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB',
      });
      return;
    }

    try {
      setUploadingQR(true);
      const result = await paymentApi.uploadPaymentQR(file);
      setConfig(prev => prev ? { ...prev, qrImageUrl: result.url } : null);
      toast({
        title: 'QR code uploaded',
        description: 'Your payment QR code has been updated',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to upload QR code',
        description: error.message || 'Please try again',
      });
    } finally {
      setUploadingQR(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteQR = async () => {
    if (!confirm('Are you sure you want to delete the QR code?')) return;

    try {
      await paymentApi.deletePaymentQR();
      setConfig(prev => prev ? { ...prev, qrImageUrl: undefined } : null);
      toast({
        title: 'QR code deleted',
        description: 'Your payment QR code has been removed',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete QR code',
        description: error.message || 'Please try again',
      });
    }
  };

  const copyInstructions = async () => {
    try {
      await navigator.clipboard.writeText(watchedInstructions || '');
      toast({
        title: 'Instructions copied',
        description: 'Payment instructions copied to clipboard',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to copy',
        description: 'Could not copy to clipboard',
      });
    }
  };

  const maskBankAccount = (accountNumber: string) => {
    if (!accountNumber || accountNumber.length < 4) return accountNumber;
    return accountNumber.slice(0, 2) + '*'.repeat(accountNumber.length - 4) + accountNumber.slice(-2);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
          <p className="text-muted-foreground">
            Configure your payment methods and instructions
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-10 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Settings</h1>
        <p className="text-muted-foreground">
          Configure your payment methods and instructions for customers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Select the payment methods you accept
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {PAYMENT_METHODS.map((method) => (
                  <div key={method.value} className="flex items-start space-x-3">
                    <Checkbox
                      id={method.value}
                      checked={watchedMethods?.includes(method.value) || false}
                      onCheckedChange={(checked) => 
                        handleMethodChange(method.value, checked as boolean)
                      }
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor={method.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {method.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {method.description}
                      </p>
                    </div>
                  </div>
                ))}
                {errors.preferredMethods && (
                  <p className="text-sm text-destructive">{errors.preferredMethods.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Bank Information */}
            {(watchedMethods?.includes('BANK_TRANSFER') || watchedMethods?.includes('E_WALLET_NOTE')) && (
              <Card>
                <CardHeader>
                  <CardTitle>Bank Information</CardTitle>
                  <CardDescription>
                    Bank details for transfers and e-wallet payments
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        placeholder="e.g., Vietcombank"
                        {...register('bankName')}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bankBranch">Branch</Label>
                      <Input
                        id="bankBranch"
                        placeholder="e.g., District 1 Branch"
                        {...register('bankBranch')}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountName">Account Holder Name</Label>
                    <Input
                      id="bankAccountName"
                      placeholder="Full name as per bank records"
                      {...register('bankAccountName')}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bankAccountNumber">Account Number</Label>
                    <div className="relative">
                      <Input
                        id="bankAccountNumber"
                        type={showBankAccount ? 'text' : 'password'}
                        placeholder="Bank account number"
                        {...register('bankAccountNumber')}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2"
                        onClick={() => setShowBankAccount(!showBankAccount)}
                      >
                        {showBankAccount ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* QR Code Upload */}
                  <div className="space-y-2">
                    <Label>Payment QR Code (Optional)</Label>
                    <div className="flex items-center gap-4">
                      {config?.qrImageUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={config.qrImageUrl}
                            alt="Payment QR Code"
                            className="w-16 h-16 object-cover rounded border"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleDeleteQR}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleQRUpload}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploadingQR}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {uploadingQR ? 'Uploading...' : 'Upload QR Code'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transfer Note Template */}
            <Card>
              <CardHeader>
                <CardTitle>Transfer Note Template</CardTitle>
                <CardDescription>
                  Template for payment transfer notes. Use variables: {'{bookingCode}, {date}, {courtName}, {startTime}, {amount}'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter transfer note template..."
                  rows={3}
                  {...register('transferNoteTemplate')}
                />
                {errors.transferNoteTemplate && (
                  <p className="text-sm text-destructive mt-2">{errors.transferNoteTemplate.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Instructions</CardTitle>
                <CardDescription>
                  Additional instructions shown to customers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Enter payment instructions..."
                  rows={4}
                  {...register('instructionsText')}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyInstructions}
                  disabled={!watchedInstructions}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Instructions
                </Button>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button type="submit" disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save Payment Settings'}
            </Button>
          </form>
        </div>

        {/* Live Preview */}
        <div className="space-y-6">
          <PaymentPreview
            config={{
              preferredMethods: watchedMethods as PaymentMethod[] || [],
              bankName: watchedBankName,
              bankAccountName: watchedBankAccountName,
              bankAccountNumber: watchedBankAccountNumber ? maskBankAccount(watchedBankAccountNumber) : undefined,
              transferNoteTemplate: watchedTemplate || '',
              instructionsText: watchedInstructions,
              qrImageUrl: config?.qrImageUrl,
            }}
            sampleBooking={{
              bookingCode: 'BKN-2024-001',
              date: '15/01/2024',
              courtName: 'Tennis Court 1',
              startTime: '14:00',
              amount: 200000,
            }}
          />
        </div>
      </div>
    </div>
  );
}
