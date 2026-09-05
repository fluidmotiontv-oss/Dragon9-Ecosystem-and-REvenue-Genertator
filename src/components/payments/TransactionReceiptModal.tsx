import React, { useState } from 'react';
import { TransactionRecord } from '../../types/payment';
import { formatCurrency, generateInvoiceHtml } from '../../services/paymentService';
import { 
  CheckCircle2, 
  Download, 
  Printer, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface TransactionReceiptModalProps {
  transaction: TransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TransactionReceiptModal({
  transaction,
  isOpen,
  onClose
}: TransactionReceiptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !transaction) return null;

  const handleCopyRef = () => {
    navigator.clipboard.writeText(transaction.referenceId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintReceipt = () => {
    const html = generateInvoiceHtml(transaction);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.focus();
    }
  };

  const handleDownloadReceipt = () => {
    const html = generateInvoiceHtml(transaction);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${transaction.receiptNumber}_Ref_${transaction.referenceId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/50 space-y-6 overflow-hidden">
        
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon & Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Payment Settled & Verified!
          </h2>
          <p className="text-xs text-slate-400">
            Official Receipt #{transaction.receiptNumber} generated and archived in local CRM.
          </p>
        </div>

        {/* Transaction Summary Box */}
        <div className="p-4 bg-slate-950/80 rounded-2xl border border-white/10 space-y-3 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-slate-400">Order / Contract Reference:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-indigo-400 text-sm">#{transaction.referenceId}</span>
              <button 
                onClick={handleCopyRef} 
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Copy reference ID"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Total Amount Settled:</span>
            <span className="font-mono font-bold text-emerald-400 text-base">
              {formatCurrency(transaction.amount, transaction.currency)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Payment Channel:</span>
            <span className="font-semibold text-white">{transaction.methodLabel}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-white/5">
            <span className="text-slate-400">Customer Account:</span>
            <span className="font-medium text-slate-200">{transaction.customerEmail}</span>
          </div>

          {transaction.paypalOrderId && (
            <div className="flex items-center justify-between py-1 border-b border-white/5">
              <span className="text-slate-400">PayPal Order ID:</span>
              <span className="font-mono text-[11px] text-indigo-300">{transaction.paypalOrderId}</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Timestamp:</span>
            <span className="text-slate-300 text-[11px]">
              {new Date(transaction.timestamp).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Encrypted Sealed Vault Access */}
        <div className="p-4 bg-gradient-to-r from-indigo-950/50 to-slate-900 border border-indigo-500/30 rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                Encrypted Vault Unlocked
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </h4>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                Settlement confirmed. Your secure digital assets (Ref #{transaction.referenceId}) have been decrypted and provisioned. The 90/9/1 revenue distribution has been executed via smart ledger.
              </p>
            </div>
          </div>
          
          <a href="#" onClick={(e) => { e.preventDefault(); onClose(); }} className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 border border-indigo-400">
            <span>Access Sovereign Asset Vault</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={handlePrintReceipt}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-white/10"
          >
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Print Receipt</span>
          </button>

          <button
            onClick={handleDownloadReceipt}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Download className="w-4 h-4" />
            <span>Download HTML</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 font-semibold rounded-xl text-xs transition-colors border border-indigo-500/30"
        >
          Return to Ecosystem Dashboard
        </button>
      </div>
    </div>
  );
}
