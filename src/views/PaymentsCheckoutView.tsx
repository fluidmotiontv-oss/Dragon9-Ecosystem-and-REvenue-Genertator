import React, { useState, useEffect } from 'react';
import { useEcosystem } from '../store';
import { 
  PaymentPlan, 
  PayPalConfig, 
  TransactionRecord 
} from '../types/payment';
import { 
  PRESET_PLANS, 
  getStoredPayPalConfig, 
  savePayPalConfig, 
  getStoredTransactions, 
  formatCurrency, 
  clearTransactions,
  generateInvoiceHtml
} from '../services/paymentService';
import PayPalSmartButtons from '../components/payments/PayPalSmartButtons';
import AllPaymentMethods from '../components/payments/AllPaymentMethods';
import TransactionReceiptModal from '../components/payments/TransactionReceiptModal';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Settings,
  Sliders,
  DollarSign,
  FileText,
  Clock,
  Printer,
  Trash2,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  Bot,
  Building,
  Hash
} from 'lucide-react';

export default function PaymentsCheckoutView() {
  const { setActiveView } = useEcosystem();
  const [plans] = useState<PaymentPlan[]>(PRESET_PLANS);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan>(PRESET_PLANS[3]); // Default to #165059 Enterprise plan
  
  // Custom amount and reference state
  const [isCustomAmount, setIsCustomAmount] = useState<boolean>(false);
  const [customAmountInput, setCustomAmountInput] = useState<string>('165059');
  const [referenceId, setReferenceId] = useState<string>('165059');

  // Customer information
  const [customerName, setCustomerName] = useState<string>('Fluid Motion Media Group');
  const [customerEmail, setCustomerEmail] = useState<string>('fluidmotiontv@gmail.com');
  const [customerCompany, setCustomerCompany] = useState<string>('Fluid Motion TV');

  // PayPal Configuration Drawer
  const [paypalConfigOpen, setPaypalConfigOpen] = useState<boolean>(false);
  const [paypalConfig, setPaypalConfig] = useState<PayPalConfig>(getStoredPayPalConfig());

  // Transactions ledger
  const [transactions, setTransactions] = useState<TransactionRecord[]>(getStoredTransactions());
  const [activeReceipt, setActiveReceipt] = useState<TransactionRecord | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState<boolean>(false);

  // Active payment gateway tab
  const [activeGatewayTab, setActiveGatewayTab] = useState<'paypal' | 'all_methods'>('paypal');

  useEffect(() => {
    const handleTxAdded = () => setTransactions(getStoredTransactions());
    const handleTxCleared = () => setTransactions([]);
    const handleConfigUpdated = (e: any) => setPaypalConfig(e.detail);

    window.addEventListener('payment_transaction_added', handleTxAdded);
    window.addEventListener('payment_transactions_cleared', handleTxCleared);
    window.addEventListener('paypal_config_updated', handleConfigUpdated);

    return () => {
      window.removeEventListener('payment_transaction_added', handleTxAdded);
      window.removeEventListener('payment_transactions_cleared', handleTxCleared);
      window.removeEventListener('paypal_config_updated', handleConfigUpdated);
    };
  }, []);

  const activeAmount = isCustomAmount ? (parseFloat(customAmountInput) || 0) : selectedPlan.price;

  const handlePaymentSuccess = (tx: TransactionRecord) => {
    setActiveReceipt(tx);
    setReceiptModalOpen(true);
    setTransactions(getStoredTransactions());
  };

  const handleSavePayPalConfig = (e: React.FormEvent) => {
    e.preventDefault();
    savePayPalConfig(paypalConfig);
    setPaypalConfigOpen(false);
  };

  const handlePrintPastReceipt = (tx: TransactionRecord) => {
    const html = generateInvoiceHtml(tx);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-16 pt-6 px-4">
      
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Real PayPal & Universal Payment Gateway
              </span>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold font-mono border border-indigo-500/30">
                ACTIVE REF: #{referenceId}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Enterprise Checkout & Billing Hub
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Accept all payment methods globally: Real PayPal One-Touch, PayPal Credit / Pay in 4, Venmo, Debit & Credit Cards, Apple Pay, Google Pay, Fedwire / ACH Direct Debit, Crypto USDT/BTC, and Corporate Invoicing for Order <span className="font-mono font-bold text-indigo-300">#{referenceId}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setPaypalConfigOpen(!paypalConfigOpen)}
              className="px-4 py-2.5 bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-lg"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span>{paypalConfigOpen ? 'Hide PayPal Settings' : 'PayPal Gateway Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional PayPal Gateway Configuration Panel */}
      {paypalConfigOpen && (
        <form onSubmit={handleSavePayPalConfig} className="p-6 bg-slate-900/95 border border-indigo-500/30 rounded-2xl shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              PayPal Live & Sandbox Integration Parameters
            </span>
            <span className="text-xs text-slate-400">Settings persist in local secure store</span>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300">PayPal Client ID</label>
              <input
                type="text"
                value={paypalConfig.clientId}
                onChange={e => setPaypalConfig({ ...paypalConfig, clientId: e.target.value })}
                placeholder="Enter live or sandbox PayPal Client ID (default: test)"
                className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Use your official PayPal Developer REST App Client ID. If left as `test`, it operates in sandbox preview mode.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Environment</label>
              <select
                value={paypalConfig.environment}
                onChange={e => setPaypalConfig({ ...paypalConfig, environment: e.target.value as any })}
                className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="sandbox">Sandbox (Testing & Verification)</option>
                <option value="production">Production (Live Real Money)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setPaypalConfigOpen(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Plan / Amount Selection & Checkout Terminal */}
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8">
        
        {/* Left Column: Plan & Custom Reference Selection */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400" />
              1. Select Licensing Plan or Enter Custom Order Reference
            </h2>
          </div>

          {/* Pricing Tiers Grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {plans.map(plan => {
              const isSelected = !isCustomAmount && selectedPlan.id === plan.id;
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlan(plan);
                    setIsCustomAmount(false);
                    if (plan.id === 'plan_custom_165059') {
                      setReferenceId('165059');
                    }
                  }}
                  className={`relative p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-4 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xl shadow-indigo-950/50'
                      : 'bg-slate-900/60 hover:bg-slate-800/80 border-white/5'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {plan.badge}
                    </span>
                  )}

                  <div className="space-y-1">
                    <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{plan.description}</p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-black text-white font-mono">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-xs text-slate-400 ml-1">
                        /{plan.period === 'one_time' ? 'contract' : plan.period}
                      </span>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'bg-indigo-600 border-indigo-500 text-white' : 'border-white/20'
                    }`}>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Amount / Reference Toggle Card */}
          <div className="p-5 bg-slate-900/70 border border-white/10 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Hash className="w-4 h-4 text-indigo-400" />
                Custom Amount & Invoice Reference Override
              </label>
              <button
                onClick={() => setIsCustomAmount(!isCustomAmount)}
                className={`text-xs px-3 py-1 rounded-lg font-semibold transition-all border ${
                  isCustomAmount 
                    ? 'bg-indigo-600 text-white border-indigo-500' 
                    : 'bg-slate-800 text-slate-300 border-white/10 hover:bg-slate-700'
                }`}
              >
                {isCustomAmount ? 'Custom Mode Active' : 'Enable Custom Amount'}
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Order / Invoice Reference ID</label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={e => setReferenceId(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 165059"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Settlement Amount (USD)</label>
                <input
                  type="number"
                  disabled={!isCustomAmount}
                  value={isCustomAmount ? customAmountInput : selectedPlan.price}
                  onChange={e => setCustomAmountInput(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-75"
                  placeholder="165059"
                />
              </div>
            </div>
          </div>

          {/* Customer & Organization Billing Info */}
          <div className="p-5 bg-slate-900/70 border border-white/10 rounded-2xl space-y-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-400" />
              Customer & Account Billing Information
            </span>

            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Account Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Billing Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Company / Organization</label>
                <input
                  type="text"
                  value={customerCompany}
                  onChange={e => setCustomerCompany(e.target.value)}
                  className="w-full mt-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Payment Channels (PayPal + All Methods) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              2. Complete Payment & Instant Settlement
            </h2>
          </div>

          {/* Gateway Switcher Tabs */}
          <div className="flex p-1 bg-slate-900 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveGatewayTab('paypal')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeGatewayTab === 'paypal'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="italic font-black text-sm">P</span>
              <span>PayPal Real-Time Gateway</span>
            </button>

            <button
              onClick={() => setActiveGatewayTab('all_methods')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeGatewayTab === 'all_methods'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>All Payment Methods</span>
            </button>
          </div>

          {/* Order Summary Receipt Preview */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-indigo-500/20 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span>Item / Plan:</span>
              <span className="font-semibold text-white truncate max-w-[220px]">
                {isCustomAmount ? `Custom Contract Ref #${referenceId}` : selectedPlan.name}
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span>Order Reference:</span>
              <span className="font-mono font-bold text-indigo-400">#{referenceId}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/10">
              <span className="font-bold text-white text-sm">Total Due:</span>
              <span className="font-mono font-black text-emerald-400 text-xl">
                {formatCurrency(activeAmount)}
              </span>
            </div>
          </div>

          {/* Gateway Content */}
          <div className="p-6 bg-slate-900/70 border border-white/10 rounded-3xl shadow-2xl">
            {activeGatewayTab === 'paypal' ? (
              <PayPalSmartButtons
                amount={activeAmount}
                referenceId={referenceId}
                planName={isCustomAmount ? `Enterprise Custom #${referenceId}` : selectedPlan.name}
                customerName={customerName}
                customerEmail={customerEmail}
                customerCompany={customerCompany}
                onSuccess={handlePaymentSuccess}
              />
            ) : (
              <AllPaymentMethods
                amount={activeAmount}
                referenceId={referenceId}
                planName={isCustomAmount ? `Enterprise Custom #${referenceId}` : selectedPlan.name}
                customerName={customerName}
                customerEmail={customerEmail}
                customerCompany={customerCompany}
                onSuccess={handlePaymentSuccess}
              />
            )}
          </div>

          {/* Sovereign Revenue Split: 90/9/1 Framework */}
          <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950/40 rounded-2xl border border-indigo-500/20 shadow-xl overflow-hidden relative">
            <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Sovereign Revenue Distribution (90/9/1)</h4>
            </div>
            
            <div className="flex w-full h-3 rounded-full overflow-hidden bg-slate-900 border border-white/10 mb-4 shadow-inner">
              <div className="h-full bg-emerald-500" style={{ width: '90%' }}></div>
              <div className="h-full bg-indigo-500 border-l border-white/20" style={{ width: '9%' }}></div>
              <div className="h-full bg-amber-500 border-l border-white/20" style={{ width: '1%' }}></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Creator / IP Owner
                </div>
                <div className="text-lg font-black text-white font-mono">{formatCurrency(activeAmount * 0.90)} <span className="text-xs text-slate-500">90%</span></div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Network / Protocol
                </div>
                <div className="text-lg font-black text-white font-mono">{formatCurrency(activeAmount * 0.09)} <span className="text-xs text-slate-500">9%</span></div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  Burn / Treasury
                </div>
                <div className="text-lg font-black text-white font-mono">{formatCurrency(activeAmount * 0.01)} <span className="text-xs text-slate-500">1%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Settlement Ledger */}
      <div className="space-y-4 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Verified Transaction & Settlement Ledger</h3>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={clearTransactions}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 border border-rose-500/20"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-white/5 text-xs text-slate-500">
            No transactions recorded yet. Complete a checkout above to generate live verified receipts.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-white/10 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Receipt #</th>
                  <th className="p-3.5">Ref ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Channel</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3.5 font-mono text-slate-300 font-medium">{tx.receiptNumber}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold text-[11px] border border-indigo-500/30">
                        #{tx.referenceId}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-white">{tx.customerName}</div>
                      <div className="text-[11px] text-slate-400">{tx.customerEmail}</div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {formatCurrency(tx.amount, tx.currency)}
                    </td>
                    <td className="p-3.5 text-slate-300">{tx.methodLabel}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handlePrintPastReceipt(tx)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors border border-white/10"
                        title="Print / View Official Invoice"
                      >
                        <Printer className="w-3 h-3 text-indigo-400" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={receiptModalOpen}
        transaction={activeReceipt}
        onClose={() => setReceiptModalOpen(false)}
      />
    </div>
  );
}
