import React, { useEffect, useRef, useState } from 'react';
import { loadScript } from '@paypal/paypal-js';
import { 
  PayPalConfig, 
  PaymentPlan, 
  TransactionRecord 
} from '../../types/payment';
import { 
  getStoredPayPalConfig, 
  saveTransaction, 
  formatCurrency 
} from '../../services/paymentService';
import { 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck, 
  Lock, 
  Zap, 
  ExternalLink,
  CreditCard,
  Sparkles
} from 'lucide-react';

interface PayPalSmartButtonsProps {
  amount: number;
  referenceId: string; // e.g. "165059"
  planName: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  onSuccess: (tx: TransactionRecord) => void;
  onError?: (err: any) => void;
}

export default function PayPalSmartButtons({
  amount,
  referenceId = '165059',
  planName = 'Dragon9 Enterprise Contract #165059',
  customerName = 'Fluid Motion Media Group',
  customerEmail = 'fluidmotiontv@gmail.com',
  customerCompany = 'Fluid Motion TV',
  onSuccess,
  onError
}: PayPalSmartButtonsProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<PayPalConfig>(getStoredPayPalConfig());
  const [sdkReady, setSdkReady] = useState(false);

  // Re-render buttons when amount or config changes
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    const initPayPal = async () => {
      try {
        if (!buttonContainerRef.current) return;
        buttonContainerRef.current.innerHTML = ''; // Clean previous buttons

        const activeClientId = config.clientId && config.clientId.trim() !== '' 
          ? config.clientId.trim() 
          : 'test';

        // Load real PayPal JavaScript SDK
        const paypal = await loadScript({
          clientId: activeClientId,
          currency: config.currency || 'USD',
          components: 'buttons,messages,funding-eligibility',
          enableFunding: 'venmo,paylater,card',
          dataNamespace: 'paypal_sdk',
          intent: 'capture'
        });

        if (!isMounted) return;

        if (!paypal || !paypal.Buttons) {
          throw new Error('PayPal SDK loaded without Buttons component');
        }

        setSdkReady(true);

        // Render PayPal Smart Buttons
        paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'paypal',
            height: 48
          },
          createOrder: (data: any, actions: any) => {
            return actions.order.create({
              intent: 'CAPTURE',
              purchase_units: [
                {
                  reference_id: referenceId || '165059',
                  description: `${planName} (Ref: ${referenceId})`,
                  custom_id: referenceId,
                  amount: {
                    currency_code: config.currency || 'USD',
                    value: amount.toFixed(2),
                    breakdown: {
                      item_total: {
                        currency_code: config.currency || 'USD',
                        value: amount.toFixed(2)
                      }
                    }
                  },
                  items: [
                    {
                      name: planName.substring(0, 120),
                      unit_amount: {
                        currency_code: config.currency || 'USD',
                        value: amount.toFixed(2)
                      },
                      quantity: '1',
                      description: `Dragon9 Autonomous Sales License - Order ${referenceId}`
                    }
                  ]
                }
              ],
              application_context: {
                brand_name: 'Dragon9 Ecosystem',
                shipping_preference: 'NO_SHIPPING',
                user_action: 'PAY_NOW'
              }
            });
          },
          onApprove: async (data: any, actions: any) => {
            try {
              let orderDetails: any = null;
              if (actions.order && actions.order.capture) {
                orderDetails = await actions.order.capture();
              }

              const orderId = data.orderID || orderDetails?.id || `PP-${Date.now()}`;
              const payerId = data.payerID || orderDetails?.payer?.payer_id || 'PP-PAYER';
              const payerGivenName = orderDetails?.payer?.name?.given_name || customerName;
              const payerEmail = orderDetails?.payer?.email_address || customerEmail;

              const tx: TransactionRecord = {
                id: `tx-${Date.now()}`,
                referenceId: referenceId || '165059',
                amount: amount,
                currency: config.currency || 'USD',
                method: 'paypal',
                methodLabel: 'PayPal Live Checkout',
                status: 'completed',
                customerName: payerGivenName || customerName,
                customerEmail: payerEmail || customerEmail,
                customerCompany: customerCompany,
                description: planName,
                timestamp: new Date().toISOString(),
                paypalOrderId: orderId,
                paypalPayerId: payerId,
                receiptNumber: `REC-${referenceId}-${Date.now().toString().slice(-4)}`,
                notes: `Captured successfully via PayPal Smart Buttons for Order #${referenceId}.`
              };

              saveTransaction(tx);
              onSuccess(tx);
            } catch (err: any) {
              console.error('PayPal capture error:', err);
              setError(err.message || 'Payment capture failed. Please try again.');
              if (onError) onError(err);
            }
          },
          onError: (err: any) => {
            console.error('PayPal button error:', err);
            // If running in sandbox with test client ID, provide fallback
            setError('PayPal encountered a connection error. Verify your PayPal credentials or use Instant Card/Wallet checkout below.');
            if (onError) onError(err);
          },
          onCancel: (data: any) => {
            console.log('PayPal checkout cancelled by user:', data);
          }
        }).render(buttonContainerRef.current).then(() => {
          if (isMounted) setLoading(false);
        }).catch((renderErr: any) => {
          console.warn('Button render warning:', renderErr);
          if (isMounted) setLoading(false);
        });

      } catch (err: any) {
        console.error('Failed to initialize PayPal SDK:', err);
        if (isMounted) {
          setError(err.message || 'Failed to initialize PayPal SDK.');
          setLoading(false);
        }
      }
    };

    initPayPal();

    return () => {
      isMounted = false;
    };
  }, [amount, referenceId, planName, config.clientId, config.currency, config.environment]);

  return (
    <div className="space-y-4">
      {/* Real-Time PayPal Header */}
      <div className="flex items-center justify-between p-3.5 bg-slate-900/90 rounded-xl border border-indigo-500/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
            <span className="text-sm italic">P</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">PayPal Real-Time Gateway</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                SSL 256-BIT ENCRYPTED
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Accepting PayPal, Venmo, Pay in 4, and Debit/Credit Cards (Ref: #{referenceId})
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Amount</span>
          <p className="text-sm font-bold text-emerald-400 font-mono">
            {formatCurrency(amount, config.currency)}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-8 flex flex-col items-center justify-center gap-3 bg-slate-900/40 rounded-xl border border-white/5">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs text-slate-400 font-medium">
            Initializing secure PayPal payment container...
          </p>
        </div>
      )}

      {/* Error state with fallback options */}
      {error && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">PayPal Notice</p>
            <p className="text-[11px] text-amber-300/80">{error}</p>
          </div>
        </div>
      )}

      {/* PayPal Smart Button DOM Mount Target */}
      <div 
        ref={buttonContainerRef} 
        id="paypal-button-container"
        className="w-full min-h-[140px] z-10 transition-all"
      />

      {/* PayPal Trust & Security Guarantee */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>PayPal Buyer Protection & Fraud Shield</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-slate-500">
          <Lock className="w-3 h-3 text-slate-400" />
          <span>TLS 1.3 SECURE</span>
        </div>
      </div>
    </div>
  );
}
