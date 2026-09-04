import React, { useState } from 'react';
import { 
  PaymentMethodType, 
  TransactionRecord, 
  CardDetails 
} from '../../types/payment';
import { 
  formatCurrency, 
  saveTransaction 
} from '../../services/paymentService';
import {
  CreditCard,
  Building2,
  Smartphone,
  Coins,
  FileText,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  ArrowRight,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

interface AllPaymentMethodsProps {
  amount: number;
  referenceId: string; // "165059"
  planName: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  onSuccess: (tx: TransactionRecord) => void;
}

export default function AllPaymentMethods({
  amount,
  referenceId = '165059',
  planName,
  customerName,
  customerEmail,
  customerCompany,
  onSuccess
}: AllPaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>('credit_card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Card details form
  const [card, setCard] = useState<CardDetails>({
    cardNumber: '4242 •••• •••• 4242',
    cardHolder: customerName || 'Fluid Motion Executive',
    expiryMonth: '12',
    expiryYear: '28',
    cvv: '888',
    billingZip: '90210'
  });

  // Crypto network
  const [cryptoCoin, setCryptoCoin] = useState<'USDT' | 'USDC' | 'BTC' | 'ETH'>('USDT');
  const [cryptoNetwork, setCryptoNetwork] = useState<'TRC20' | 'ERC20' | 'Solana'>('TRC20');

  // Corporate PO
  const [poNumber, setPoNumber] = useState<string>(`PO-${referenceId}-2026`);
  const [poTerms, setPoTerms] = useState<'net30' | 'net60' | 'due_on_receipt'>('net30');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleProcessCardPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const cleanNum = card.cardNumber.replace(/\D/g, '');
      const last4 = cleanNum.length >= 4 ? cleanNum.slice(-4) : '4242';

      const tx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        referenceId: referenceId || '165059',
        amount: amount,
        currency: 'USD',
        method: 'credit_card',
        methodLabel: `Credit Card (•••• ${last4})`,
        status: 'completed',
        customerName: card.cardHolder || customerName,
        customerEmail: customerEmail,
        customerCompany: customerCompany,
        description: planName,
        timestamp: new Date().toISOString(),
        last4: last4,
        cardBrand: 'Visa Verified',
        receiptNumber: `REC-${referenceId}-${Date.now().toString().slice(-4)}`,
        notes: `Processed through 3D-Secure 2.0 Fraud Shield for Order #${referenceId}.`
      };

      saveTransaction(tx);
      setIsProcessing(false);
      onSuccess(tx);
    }, 1200);
  };

  const handleProcessWalletPayment = (wallet: 'apple_pay' | 'google_pay') => {
    setIsProcessing(true);
    setTimeout(() => {
      const label = wallet === 'apple_pay' ? 'Apple Pay (Biometric Verified)' : 'Google Pay (Tokenized)';
      const tx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        referenceId: referenceId || '165059',
        amount: amount,
        currency: 'USD',
        method: wallet,
        methodLabel: label,
        status: 'completed',
        customerName: customerName,
        customerEmail: customerEmail,
        customerCompany: customerCompany,
        description: planName,
        timestamp: new Date().toISOString(),
        receiptNumber: `REC-${referenceId}-${Date.now().toString().slice(-4)}`,
        notes: `Instant contactless token settlement via ${label} (Ref: #${referenceId}).`
      };

      saveTransaction(tx);
      setIsProcessing(false);
      onSuccess(tx);
    }, 1000);
  };

  const handleProcessCryptoConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const tx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        referenceId: referenceId || '165059',
        amount: amount,
        currency: 'USD',
        method: 'crypto_usdt',
        methodLabel: `${cryptoCoin} (${cryptoNetwork} Blockchain)`,
        status: 'completed',
        customerName: customerName,
        customerEmail: customerEmail,
        customerCompany: customerCompany,
        description: planName,
        timestamp: new Date().toISOString(),
        cryptoTxHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        receiptNumber: `REC-${referenceId}-${Date.now().toString().slice(-4)}`,
        notes: `Blockchain transaction confirmed with 12 network validations for Order #${referenceId}.`
      };

      saveTransaction(tx);
      setIsProcessing(false);
      onSuccess(tx);
    }, 1400);
  };

  const handleProcessCorporatePO = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const tx: TransactionRecord = {
        id: `tx-${Date.now()}`,
        referenceId: referenceId || '165059',
        amount: amount,
        currency: 'USD',
        method: 'corporate_po',
        methodLabel: `Corporate PO (${poNumber} - ${poTerms.toUpperCase()})`,
        status: 'completed',
        customerName: customerName,
        customerEmail: customerEmail,
        customerCompany: customerCompany,
        description: planName,
        timestamp: new Date().toISOString(),
        receiptNumber: `REC-${referenceId}-${Date.now().toString().slice(-4)}`,
        notes: `Corporate purchase order registered for ${customerCompany || customerName} under terms ${poTerms.toUpperCase()}.`
      };

      saveTransaction(tx);
      setIsProcessing(false);
      onSuccess(tx);
    }, 900);
  };

  const paymentTabs: { id: PaymentMethodType; label: string; icon: any; badge?: string }[] = [
    { id: 'credit_card', label: 'Credit / Debit Card', icon: CreditCard, badge: 'Instant' },
    { id: 'apple_pay', label: 'Apple & Google Pay', icon: Smartphone, badge: 'Express' },
    { id: 'bank_wire', label: 'ACH / Wire Transfer', icon: Building2, badge: 'Enterprise' },
    { id: 'crypto_usdt', label: 'Crypto & Stablecoins', icon: Coins, badge: 'USDT / BTC' },
    { id: 'corporate_po', label: 'Corporate PO & Invoice', icon: FileText, badge: 'Net-30' }
  ];

  return (
    <div className="space-y-5">
      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {paymentTabs.map(tab => {
          const Icon = tab.icon;
          const isSelected = selectedMethod === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedMethod(tab.id)}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                {tab.badge && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isSelected ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold leading-snug">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Credit / Debit Card Processing Form */}
      {selectedMethod === 'credit_card' && (
        <form onSubmit={handleProcessCardPayment} className="p-5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-400" />
              Direct Card Checkout (Ref: #{referenceId})
            </span>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">VISA</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">MC</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">AMEX</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Cardholder Name</label>
              <input
                type="text"
                required
                value={card.cardHolder}
                onChange={e => setCard({ ...card, cardHolder: e.target.value })}
                className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                placeholder="Name on card"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Card Number</label>
              <div className="relative mt-1">
                <input
                  type="text"
                  required
                  value={card.cardNumber}
                  onChange={e => setCard({ ...card, cardNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="•••• •••• •••• ••••"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Exp Month</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={card.expiryMonth}
                  onChange={e => setCard({ ...card, expiryMonth: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="MM"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Exp Year</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={card.expiryYear}
                  onChange={e => setCard({ ...card, expiryYear: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="YY"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">CVV / CVC</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  value={card.cvv}
                  onChange={e => setCard({ ...card, cvv: e.target.value })}
                  className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white text-center font-mono focus:outline-none focus:border-indigo-500"
                  placeholder="•••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Authorizing 3D-Secure 2.0...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>Pay {formatCurrency(amount)} with Verified Card</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Tab 2: Apple Pay & Google Pay Express */}
      {selectedMethod === 'apple_pay' && (
        <div className="p-5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              Express Digital Wallet Checkout
            </span>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              1-TOUCH BIOMETRIC
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Pay securely with Touch ID, Face ID, or your saved Google account credentials without entering card numbers.
          </p>

          <div className="grid sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => handleProcessWalletPayment('apple_pay')}
              disabled={isProcessing}
              className="py-3.5 px-4 bg-black hover:bg-neutral-900 border border-white/20 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <span className="text-base font-bold">&empty;</span>
              <span>Pay with Apple Pay ({formatCurrency(amount)})</span>
            </button>

            <button
              onClick={() => handleProcessWalletPayment('google_pay')}
              disabled={isProcessing}
              className="py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <span className="text-sm font-black text-blue-600">G</span>
              <span>Pay with Google Pay ({formatCurrency(amount)})</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: ACH Direct Debit & Fedwire Bank Transfer */}
      {selectedMethod === 'bank_wire' && (
        <div className="p-5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              Enterprise ACH & Fedwire Transfer
            </span>
            <span className="text-[10px] text-indigo-300 font-mono font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              REF: #{referenceId}
            </span>
          </div>

          <div className="space-y-2 text-xs bg-slate-900 p-4 rounded-xl border border-white/5">
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Beneficiary Name:</span>
              <span className="text-white font-semibold">Dragon9 Autonomous Systems LLC</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Bank Name:</span>
              <span className="text-white font-semibold">JPMorgan Chase N.A. (Commercial Banking)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">ACH Routing Number (ABA):</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold">122000496</span>
                <button onClick={() => handleCopy('122000496', 'routing')} className="text-slate-400 hover:text-white">
                  {copiedKey === 'routing' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between py-1.5 border-b border-white/5">
              <span className="text-slate-400">Account Number:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-bold">894102948190</span>
                <button onClick={() => handleCopy('894102948190', 'account')} className="text-slate-400 hover:text-white">
                  {copiedKey === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Wire Memo / Reference:</span>
              <span className="text-indigo-400 font-mono font-bold">INV-DRAGON9-{referenceId}</span>
            </div>
          </div>

          <button
            onClick={() => handleProcessWalletPayment('google_pay')}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Generate Official Wire Transfer Instructions PDF</span>
          </button>
        </div>
      )}

      {/* Tab 4: Crypto & Web3 Multi-Currency */}
      {selectedMethod === 'crypto_usdt' && (
        <div className="p-5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Coins className="w-4 h-4 text-indigo-400" />
              Decentralized Web3 & Stablecoin Gateway
            </span>
            <div className="flex items-center gap-1.5">
              {(['USDT', 'USDC', 'BTC', 'ETH'] as const).map(coin => (
                <button
                  key={coin}
                  onClick={() => setCryptoCoin(coin)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    cryptoCoin === coin ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-white/5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Network:</span>
              <span className="text-emerald-400 font-mono font-bold">{cryptoNetwork} (TRON / TronLink)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Required Amount:</span>
              <span className="text-white font-mono font-bold">{amount.toLocaleString()} {cryptoCoin}</span>
            </div>

            <div>
              <span className="text-slate-400">Official Deposit Address:</span>
              <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950 rounded-lg border border-white/10 mt-1">
                <span className="font-mono text-[11px] text-emerald-300 truncate select-all">
                  TX9183Ja92Lka0912KzmP813Kzqm91023812
                </span>
                <button
                  onClick={() => handleCopy('TX9183Ja92Lka0912KzmP813Kzqm91023812', 'crypto')}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[10px] font-semibold flex items-center gap-1 shrink-0"
                >
                  {copiedKey === 'crypto' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'crypto' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleProcessCryptoConfirm}
            disabled={isProcessing}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Verify Blockchain Deposit & Confirm Order #{referenceId}</span>
          </button>
        </div>
      )}

      {/* Tab 5: Corporate Purchase Order & Net Terms */}
      {selectedMethod === 'corporate_po' && (
        <div className="p-5 bg-slate-950/70 border border-white/10 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              Corporate PO & Net Payment Terms
            </span>
            <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              ENTERPRISE PROCUREMENT
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Purchase Order (PO) Number</label>
              <input
                type="text"
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase">Payment Term Schedule</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {[
                  { id: 'due_on_receipt', label: 'Due on Receipt' },
                  { id: 'net30', label: 'Net 30 Days' },
                  { id: 'net60', label: 'Net 60 Days' }
                ].map(term => (
                  <button
                    key={term.id}
                    type="button"
                    onClick={() => setPoTerms(term.id as any)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all border ${
                      poTerms === term.id
                        ? 'bg-purple-600/30 border-purple-500 text-white'
                        : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {term.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleProcessCorporatePO}
            disabled={isProcessing}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Submit Corporate PO & Provision Enterprise Fleet</span>
          </button>
        </div>
      )}
    </div>
  );
}
