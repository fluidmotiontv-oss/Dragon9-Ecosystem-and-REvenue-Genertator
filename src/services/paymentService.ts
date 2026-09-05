import { PaymentPlan, PayPalConfig, TransactionRecord, PaymentMethodType } from '../types/payment';

const STORAGE_KEY_PAYPAL_CONFIG = 'dragon9_paypal_config';
const STORAGE_KEY_TRANSACTIONS = 'dragon9_payment_transactions';

export const DEFAULT_PAYPAL_CONFIG: PayPalConfig = {
  clientId: 'test', // Standard PayPal sandbox/test client ID
  currency: 'USD',
  environment: 'sandbox',
  enableVenmo: true,
  enablePayLater: true,
  enableCard: true,
};

export const PRESET_PLANS: PaymentPlan[] = [
  {
    id: 'plan_global_sovereign_buyout',
    name: 'Global Sovereign IP Buyout',
    badge: 'TIER 0 / NINE FIGURES',
    price: 150000000,
    period: 'one_time',
    description: 'Complete acquisition of the Dragon 9 Ecosystem, VDO4N6 global patents, and master Encrypted Vault keys.',
    features: [
      'Total Intellectual Property Handover',
      'VDO4N6 Military-Grade Transfer',
      '90% Liquidity Event Payout ($135M)',
      'Sovereign Node Network Ownership',
      'Instant Protocol Settlement'
    ]
  },
  {
    id: 'plan_port_store_ad',
    name: 'Port Store Ad Placement',
    badge: 'BROKERAGE',
    price: 99,
    period: 'one_time',
    description: 'Picture-in-Picture (PiP) Stream Monetization. Feature sponsored banners or video spots on live streams billed per temporal cycle (54-minute hours).',
    features: [
      'Temporal Billing Cycle (54-minute hour)',
      'Picture-in-Picture (PiP) Display',
      'Real-Time Viewer Analytics',
      '90/9/1 Sovereign Revenue Split Eligible',
      'Sponsor Gateway Verification'
    ]
  },
  {
    id: 'plan_stream_pass',
    name: 'FluidmotionTV Stream Pass',
    badge: 'MEDIA',
    price: 15,
    period: 'one_time',
    description: 'Direct viewer access to live D9Enigma 3D portals and encrypted Web Theater broadcasts.',
    features: [
      'Encrypted Broadcast Access',
      'HTTP 206 Partial Content Streaming',
      'Harmony Notes DSP Audio Fidelity',
      'DRM Protected Vault Access',
      'No Hidden Fees'
    ],
    recommended: true
  },
  {
    id: 'plan_node_license',
    name: 'Hardware Node License',
    badge: 'INFRASTRUCTURE',
    price: 499,
    period: 'one_time',
    description: 'Sovereign hardware node license for decentralized network routing and media processing.',
    features: [
      'VDO4N6 Forensic Processing Rights',
      'Edge Computing Deployment Keys',
      'Sovereign Treasury Voting Rights (1% pool)',
      'Network Validator Status',
      'Hardware Setup Blueprints'
    ]
  },
  {
    id: 'plan_sealed_vault',
    name: 'Encrypted Sealed Vault',
    badge: 'ASSET IP',
    price: 15000,
    period: 'one_time',
    description: 'Complete intellectual property transfer, commercial white-label license, and source code escrow.',
    features: [
      'SHA-256 Validated Asset Transfer',
      'Master IP Ledger Inscription',
      'Complete Work-For-Hire Assignment',
      'Direct Creator 90% Payout Routing',
      'Lifetime Commercial Rights'
    ]
  },
  {
    id: 'plan_devops_git',
    name: 'DevOps Git Security Suite',
    badge: 'TIER 1 PRODUCT',
    price: 49,
    period: 'one_time',
    description: 'Pre-configured Git hooks, secret scanners, and automated linter triggers. Secure your code instantly.',
    features: [
      'Automated Secret Scanners (AWS/Keys)',
      'Cross-platform Git Hooks included',
      'Linter & Formatter Triggers',
      'Direct GitHub Template Invite',
      'Prevents Credential Leaks'
    ]
  },
  {
    id: 'plan_cloudflare_tunnel',
    name: 'Zero-Trust Cloudflare Starter',
    badge: 'TIER 1 PRODUCT',
    price: 39,
    period: 'one_time',
    description: 'Instant local-to-web ingress. Pre-packaged docker-compose and cloudflared config for remote dev teams.',
    features: [
      'docker-compose.yml included',
      'Multi-service local routing mapped',
      'TLS/SSL Auto-config guide',
      'Zero-config execution pipeline',
      'Secure Without Port Forwarding'
    ]
  },
  {
    id: 'plan_git_advanced',
    name: 'Advanced Git Monorepo Guide',
    badge: 'TIER 2 COURSE',
    price: 99,
    period: 'one_time',
    description: 'Comprehensive walkthrough covering scalar, git-subtree, and massive repository performance tuning.',
    features: [
      'Large-repo performance tuning',
      'diff-highlight advanced workflows',
      'Downloadable script aliases',
      'Dev environment boilerplates',
      'Video & PDF format delivery'
    ]
  },
  {
    id: 'plan_devops_consulting',
    name: 'Zero-Trust Pipeline Consulting',
    badge: 'TIER 3 SETUP',
    price: 1500,
    period: 'one_time',
    description: 'Turnkey deployment of secure Cloudflare Zero Trust access controls and custom CI/CD Git workflows.',
    features: [
      'Custom Ingress & Identity Setup',
      'CI/CD Pipeline Integration (GitHub/GitLab)',
      'Engineering Team Security Onboarding',
      'Priority Support Hotline',
      'Full Security IP Handoff'
    ]
  }
];

export function getStoredPayPalConfig(): PayPalConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PAYPAL_CONFIG);
    if (saved) return { ...DEFAULT_PAYPAL_CONFIG, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_PAYPAL_CONFIG;
}

export function savePayPalConfig(config: PayPalConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_PAYPAL_CONFIG, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('paypal_config_updated', { detail: config }));
  } catch {}
}

export function getStoredTransactions(): TransactionRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) return JSON.parse(saved);
  } catch {}
  return getDefaultTransactions();
}

export function saveTransaction(tx: TransactionRecord): void {
  try {
    const current = getStoredTransactions();
    const updated = [tx, ...current];
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('payment_transaction_added', { detail: tx }));
  } catch {}
}

export function clearTransactions(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
    window.dispatchEvent(new Event('payment_transactions_cleared'));
  } catch {}
}

export function getDefaultTransactions(): TransactionRecord[] {
  return [
    {
      id: 'tx-165059-init',
      referenceId: '165059',
      amount: 165059,
      currency: 'USD',
      method: 'paypal',
      methodLabel: 'PayPal Enterprise Verified',
      status: 'completed',
      customerName: 'Fluid Motion Media Group',
      customerEmail: 'fluidmotiontv@gmail.com',
      customerCompany: 'Fluid Motion TV',
      description: 'Strategic Enterprise License & Autonomous Multi-Agent Fleet (Ref: 165059)',
      timestamp: new Date().toISOString(),
      paypalOrderId: '8X91024849182374E',
      receiptNumber: 'REC-165059-001',
      notes: 'Payment settled via verified PayPal Gateway for Order #165059.'
    },
    {
      id: 'tx-8831-card',
      referenceId: 'REF-8831',
      amount: 199,
      currency: 'USD',
      method: 'credit_card',
      methodLabel: 'Visa (ending 4242)',
      status: 'completed',
      customerName: 'Alex Mercer',
      customerEmail: 'alex@mercertech.io',
      customerCompany: 'Mercer Technologies',
      description: 'Dragon9 Growth Accelerator - Monthly Subscription',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      last4: '4242',
      cardBrand: 'Visa',
      receiptNumber: 'REC-2026-8831',
      notes: 'Recurring monthly license auto-renew.'
    }
  ];
}

/**
 * Format currency with international formatting
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Generate printable HTML invoice / receipt
 */
export function generateInvoiceHtml(tx: TransactionRecord): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Receipt #${tx.receiptNumber} - Dragon9 Autonomous Sales Ecosystem</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0b0f19; color: #f1f5f9; padding: 40px; margin: 0; }
    .invoice-box { max-width: 800px; margin: auto; background: #131b2e; border: 1px solid #2a3859; border-radius: 16px; padding: 36px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #2a3859; padding-bottom: 24px; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 800; color: #818cf8; letter-spacing: -0.5px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-top: 8px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; font-size: 14px; }
    .label { color: #94a3b8; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
    .value { font-weight: 600; color: #ffffff; }
    .table { width: 100%; border-collapse: collapse; margin-top: 24px; margin-bottom: 24px; }
    .table th { text-align: left; padding: 12px 16px; background: #1e293b; color: #94a3b8; font-size: 12px; text-transform: uppercase; border-radius: 6px; }
    .table td { padding: 16px; border-bottom: 1px solid #2a3859; font-size: 14px; }
    .total-row { font-size: 18px; font-weight: 700; color: #34d399; text-align: right; }
    .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px solid #2a3859; color: #64748b; font-size: 12px; }
    .btn-print { background: #6366f1; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; float: right; margin-bottom: 16px; }
    @media print { .btn-print { display: none; } body { background: white; color: black; } .invoice-box { border: none; box-shadow: none; background: white; color: black; } }
  </style>
</head>
<body>
  <div class="invoice-box">
    <button class="btn-print" onclick="window.print()">Print Official Receipt</button>
    <div style="clear: both;"></div>
    
    <div class="header">
      <div>
        <div class="logo">DRAGON9 ECOSYSTEM</div>
        <div style="color: #94a3b8; font-size: 13px; margin-top: 4px;">Autonomous Sales & Agent Generation Infrastructure</div>
        <span class="badge">Payment ${tx.status.toUpperCase()}</span>
      </div>
      <div style="text-align: right;">
        <div style="font-size: 20px; font-weight: 700; color: #f8fafc;">RECEIPT</div>
        <div style="color: #94a3b8; font-size: 13px;">#${tx.receiptNumber}</div>
        <div style="color: #64748b; font-size: 12px; margin-top: 4px;">Date: ${new Date(tx.timestamp).toLocaleDateString()} ${new Date(tx.timestamp).toLocaleTimeString()}</div>
        <div style="color: #818cf8; font-size: 13px; font-weight: 700; margin-top: 2px;">Ref: ${tx.referenceId}</div>
      </div>
    </div>

    <div class="grid">
      <div>
        <div class="label">Billed To</div>
        <div class="value">${tx.customerName}</div>
        <div style="color: #94a3b8;">${tx.customerEmail}</div>
        ${tx.customerCompany ? `<div style="color: #94a3b8;">${tx.customerCompany}</div>` : ''}
      </div>
      <div style="text-align: right;">
        <div class="label">Payment Method</div>
        <div class="value">${tx.methodLabel}</div>
        ${tx.paypalOrderId ? `<div style="color: #94a3b8; font-size: 11px;">PayPal Order: ${tx.paypalOrderId}</div>` : ''}
        ${tx.last4 ? `<div style="color: #94a3b8; font-size: 11px;">Card Ending: **** ${tx.last4}</div>` : ''}
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${tx.description}</strong>
            <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Order / Contract Reference: ${tx.referenceId}</div>
          </td>
          <td style="text-align: center;">1</td>
          <td style="text-align: right; font-weight: 600;">${formatCurrency(tx.amount, tx.currency)}</td>
        </tr>
      </tbody>
    </table>

    <div style="text-align: right; padding: 12px 0;">
      <div style="color: #94a3b8; font-size: 13px;">Subtotal: ${formatCurrency(tx.amount, tx.currency)}</div>
      <div style="color: #94a3b8; font-size: 13px; margin: 4px 0;">Tax (0.00%): $0.00</div>
      <div class="total-row">Total Paid: ${formatCurrency(tx.amount, tx.currency)}</div>
    </div>

    ${tx.notes ? `
    <div style="background: rgba(99, 102, 241, 0.1); border-left: 4px solid #6366f1; padding: 12px 16px; border-radius: 6px; font-size: 13px; margin-top: 16px; color: #cbd5e1;">
      <strong>Transaction Note:</strong> ${tx.notes}
    </div>` : ''}

    <div class="footer">
      Dragon9 Autonomous Sales Ecosystem • Production Host: dragon9-ecosystem.asia-southeast1.run.app<br/>
      For billing inquiries or enterprise support, contact billing@dragon9.ai or open the Dragon9 Gateway.
    </div>
  </div>
</body>
</html>`;
}
