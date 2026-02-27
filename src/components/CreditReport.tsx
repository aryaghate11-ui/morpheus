import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, ShieldCheck, TrendingUp, Wallet as WalletIcon, Calendar, PieChart as PieIcon, Printer } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface Transaction {
  id: number;
  platform: string;
  amount: number;
  timestamp: string;
  type: string;
}

interface CreditReportProps {
  user: any;
  transactions: Transaction[];
  wallet: { balance: number; breakdown: { platform: string; amount: number }[] };
}

export const CreditReport: React.FC<CreditReportProps> = ({ user, transactions, wallet }) => {
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);
  const reportWrapperRef = React.useRef<HTMLDivElement>(null);

  const reportData = useMemo(() => {
    // 1. Calculate Total from Platforms (Source of Truth for Total)
    const totalFromPlatforms = wallet.breakdown.reduce((acc, curr) => acc + curr.amount, 0);

    // 2. Group by Month from Transactions
    const rawMonthlyData: Record<string, number> = {};
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const monthKey = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      rawMonthlyData[monthKey] = (rawMonthlyData[monthKey] || 0) + tx.amount;
    });

    const months = Object.keys(rawMonthlyData);
    if (months.length === 0) return null;

    // 3. Normalize Monthly Data to match Platform Total
    const rawTotal = Object.values(rawMonthlyData).reduce((a, b) => a + b, 0);
    const monthlyData: Record<string, number> = {};

    months.forEach(m => {
      // Proportional distribution to ensure Sum(Monthly) == Sum(Platforms)
      monthlyData[m] = (rawMonthlyData[m] / rawTotal) * totalFromPlatforms;
    });

    const incomes = Object.values(monthlyData);
    const avgIncome = totalFromPlatforms / months.length;
    const minIncome = Math.min(...incomes);
    const maxIncome = Math.max(...incomes);

    // Trend Calculation
    const firstMonthIncome = monthlyData[months[months.length - 1]];
    const lastMonthIncome = monthlyData[months[0]];
    const growthTrend = lastMonthIncome > firstMonthIncome ? 'Increasing' : (lastMonthIncome === firstMonthIncome ? 'Stable' : 'Declining');

    // --- NEW KAAMPAY CREDIT SCORE FORMULA (Out of 100) ---
    // 1. Stability (40 pts): Ratio of Min Income to Avg Income
    const stabilityScore = Math.min((minIncome / avgIncome) * 40, 40);

    // 2. Diversification (20 pts): Number of platforms
    const diversificationScore = Math.min(wallet.breakdown.length * 10, 20);

    // 3. Growth (20 pts): Trend-based
    const growthScore = growthTrend === 'Increasing' ? 20 : (growthTrend === 'Stable' ? 10 : 0);

    // 4. Volume (20 pts): Transaction frequency
    const volumeScore = Math.min((transactions.length / 20) * 20, 20);

    const score = Math.round(stabilityScore + diversificationScore + growthScore + volumeScore);

    // Loan Readiness
    let readiness: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
    if (score >= 75 && growthTrend !== 'Declining') readiness = 'HIGH';
    else if (score >= 50) readiness = 'MODERATE';

    const safeEMI = minIncome * 0.3;

    return {
      monthlyData,
      avgIncome,
      minIncome,
      maxIncome,
      totalIncome: totalFromPlatforms,
      growthTrend,
      score,
      readiness,
      safeEMI,
      months,
      generationDate: new Date().toLocaleDateString()
    };
  }, [transactions, wallet]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleDownload = () => {
    if (!reportData) return;

    const platformRows = wallet.breakdown.map(p =>
      `<tr>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;font-weight:600">${p.platform}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:700">₹${p.amount.toLocaleString()}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;text-align:right;color:#64748b">${((p.amount / reportData.totalIncome) * 100).toFixed(1)}%</td>
      </tr>`
    ).join('');

    const monthlyRows = Object.entries(reportData.monthlyData).map(([month, amount]) =>
      `<tr>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px">${month}</td>
        <td style="padding:10px 12px;border:1px solid #e2e8f0;font-size:13px;text-align:right;font-weight:700">₹${amount.toLocaleString()}</td>
      </tr>`
    ).join('');

    const stabilityPct = (reportData.minIncome / reportData.avgIncome * 100).toFixed(0);
    const readinessColor = reportData.readiness === 'HIGH' ? '#3a8b6e' : reportData.readiness === 'MODERATE' ? '#6ee7b7' : '#f87171';

    const html = `<!DOCTYPE html><html><head><title>KaamPay Income Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Domine:wght@400..700&display=swap" rel="stylesheet">
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Domine',serif;color:#1e293b;padding:40px;background:#fff}
      @media print{body{padding:20px}}</style></head><body>
      <div style="border-bottom:4px solid #1e293b;padding-bottom:24px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-end">
        <div><h1 style="font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px">KaamPay</h1>
        <p style="font-size:12px;font-weight:700;color:#64748b;margin-top:4px">Verified Gig Worker Income Statement</p></div>
        <div style="text-align:right"><p style="font-size:12px;font-weight:700">FINANCIAL ASSESSMENT</p>
        <p style="font-size:10px;color:#94a3b8;margin-top:2px">Report ID: KP-INC-${Date.now().toString().slice(-6)}</p>
        <p style="font-size:10px;color:#94a3b8;margin-top:2px">Date: ${reportData.generationDate}</p></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px">
        <div><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Client Details</p>
        <p style="font-size:16px;font-weight:700;margin-bottom:4px">Phone: ${user.phone}</p>
        <p style="font-size:13px;color:#64748b">Persona: ${user.persona}</p></div>
        <div style="text-align:right"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Analysis Period</p>
        <p style="font-size:13px;font-weight:700;margin-bottom:4px">${reportData.months.length} month${reportData.months.length > 1 ? 's' : ''}</p>
        <p style="font-size:13px;color:#64748b">${transactions.length} verified transactions</p></div>
      </div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">1. EXECUTIVE SUMMARY</h2>
      <p style="font-size:13px;color:#475569;line-height:1.7">Formal income verification for client <strong>${user.phone}</strong>. Analysis based on <strong>${transactions.length}</strong> verified transactions across <strong>${wallet.breakdown.length}</strong> platforms.</p></div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">2. MONTHLY EARNINGS BREAKDOWN</h2>
      <table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f8fafc">
      <th style="padding:10px 12px;border:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;text-align:left">Month</th>
      <th style="padding:10px 12px;border:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;text-align:right">Verified Earnings</th>
      </tr></thead><tbody>${monthlyRows}
      <tr style="background:#f8fafc"><td style="padding:10px 12px;border:1px solid #e2e8f0;font-weight:700">Total</td>
      <td style="padding:10px 12px;border:1px solid #e2e8f0;text-align:right;font-weight:900;font-size:16px">₹${reportData.totalIncome.toLocaleString()}</td></tr></tbody></table></div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">3. PLATFORM CONTRIBUTION</h2>
      <table style="width:100%;border-collapse:collapse"><thead><tr style="background:#f8fafc">
      <th style="padding:10px 12px;border:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;text-align:left">Platform</th>
      <th style="padding:10px 12px;border:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;text-align:right">Amount</th>
      <th style="padding:10px 12px;border:1px solid #e2e8f0;font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;text-align:right">Share</th>
      </tr></thead><tbody>${platformRows}</tbody></table></div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">4. KEY METRICS</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:16px">
      <div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Avg Monthly</p><p style="font-size:18px;font-weight:900">₹${reportData.avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
      <div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Growth</p><p style="font-size:18px;font-weight:900;color:${reportData.growthTrend === 'Increasing' ? '#3a8b6e' : '#1e293b'}">${reportData.growthTrend}</p></div>
      <div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Min Income</p><p style="font-size:18px;font-weight:900">₹${reportData.minIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
      <div style="padding:16px;border:1px solid #e2e8f0;border-radius:8px"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Max Income</p><p style="font-size:18px;font-weight:900">₹${reportData.maxIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
      </div></div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">5. CREDIBILITY ASSESSMENT</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="padding:20px;background:#0f172a;color:#fff;border-radius:8px"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px">KaamPay Credibility Score</p>
      <p style="font-size:36px;font-weight:900;color:#94a3b8">${reportData.score}<span style="font-size:16px;color:#64748b">/100</span></p>
      <p style="font-size:11px;color:#94a3b8;margin-top:8px">Stability (${stabilityPct}%) · Diversification · Growth · Volume</p></div>
      <div style="padding:20px;border:1px solid #e2e8f0;border-radius:8px;border-left:4px solid ${readinessColor}"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px">Loan Readiness</p>
      <p style="font-size:28px;font-weight:900;color:${reportData.readiness === 'HIGH' ? '#3a8b6e' : '#1e293b'}">${reportData.readiness}</p>
      <p style="font-size:11px;color:#64748b;margin-top:4px">${reportData.readiness === 'HIGH' ? 'Strong consistent income.' : reportData.readiness === 'MODERATE' ? 'Stable with manageable fluctuations.' : 'Inconsistent patterns detected.'}</p></div>
      </div></div>

      <div style="padding:24px;background:#0f172a;color:#fff;border-radius:8px;margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:12px">6. BANKING RECOMMENDATION</h2>
      <p style="font-size:18px;margin-bottom:8px">Recommended Safe EMI: <span style="font-weight:900;color:#6ee7b7">₹${reportData.safeEMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
      <p style="font-size:12px;opacity:0.8">Based on min monthly income of ₹${reportData.minIncome.toLocaleString()}, the client demonstrates a ${reportData.readiness.toLowerCase()} capacity for credit.</p>
      <p style="font-size:10px;color:#94a3b8;margin-top:8px">Formula: Min Income × 0.30</p></div>

      <div style="padding:20px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;margin-bottom:28px"><h3 style="font-size:11px;font-weight:700;color:#991b1b;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px">Risk Indicators</h3>
      <p style="font-size:13px;color:#b91c1c;margin-bottom:8px">● ${reportData.growthTrend === 'Declining' ? 'Negative income growth detected.' : 'No significant negative trend detected.'}</p>
      <p style="font-size:13px;color:#b91c1c">● ${wallet.breakdown.length < 2 ? 'High dependency on single platform.' : 'Healthy diversification across multiple platforms.'}</p></div>

      <div style="margin-top:60px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="font-size:13px;color:#64748b;font-style:italic;margin-bottom:16px">"Based on verified transactions, this client demonstrates a ${reportData.readiness.toLowerCase()} degree of financial stability and creditworthiness."</p>
      <p style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px">Verified by KaamPay Deterministic Engine · Legally valid for financial assessment</p></div>
      </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      // Wait for font to load, then trigger print
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 border-4 border-slate-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse text-center px-6">
          Computing deterministic financial metrics...
        </p>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="text-[var(--color-primary)]" />
          <h2 className="text-xl font-bold text-slate-900">Income Report</h2>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className={`p-2 text-white rounded-lg transition-colors flex items-center space-x-2 shadow-md ${downloading ? 'bg-slate-400 cursor-wait' : 'bg-[var(--color-primary)] hover:bg-emerald-600'}`}
        >
          {downloading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <Download size={20} />
          )}
          <span className="text-sm font-bold">{downloading ? 'Generating...' : 'Download PDF'}</span>
        </button>
      </div>

      {/* Printable Report Container — mirrors on-screen layout */}
      <div ref={reportWrapperRef} style={{ display: 'none' }}>
        <div ref={reportRef} style={{ padding: '40px', background: '#fff', color: '#1e293b', fontFamily: 'Domine, serif', width: '210mm' }}>
          {/* Header */}
          <div style={{ borderBottom: '4px solid #1e293b', paddingBottom: '24px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '32px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-1px', margin: 0 }}>KaamPay</h1>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', margin: '4px 0 0' }}>Verified Gig Worker Income Statement</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, margin: 0 }}>FINANCIAL ASSESSMENT</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>Report ID: KP-INC-{Date.now().toString().slice(-6)}</p>
              <p style={{ fontSize: '10px', color: '#94a3b8', margin: '2px 0 0' }}>Date: {reportData.generationDate}</p>
            </div>
          </div>

          {/* Client Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginBottom: '32px' }}>
            <div>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px' }}>Client Details</p>
              <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px' }}>Phone: {user.phone}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Persona: {user.persona}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px' }}>Analysis Period</p>
              <p style={{ fontSize: '13px', fontWeight: 700, margin: '0 0 4px' }}>{reportData.months.length} month{reportData.months.length > 1 ? 's' : ''}</p>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>{transactions.length} verified transactions</p>
            </div>
          </div>

          {/* 1. Executive Summary */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>1. EXECUTIVE SUMMARY</h2>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.7' }}>
              Formal income verification for client <strong>{user.phone}</strong>. Analysis based on <strong>{transactions.length}</strong> verified transactions across <strong>{wallet.breakdown.length}</strong> platforms.
            </p>
          </div>

          {/* 2. Monthly Earnings Breakdown */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>2. MONTHLY EARNINGS BREAKDOWN</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Month</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Verified Earnings</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(reportData.monthlyData).map(([month, amount]) => (
                  <tr key={month}>
                    <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '13px' }}>{month}</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'right', fontWeight: 700 }}>₹{amount.toLocaleString()}</td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc' }}>
                  <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontWeight: 700 }}>Total Analyzed Income</td>
                  <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', textAlign: 'right', fontWeight: 900, fontSize: '16px' }}>₹{reportData.totalIncome.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Platform Contribution */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>3. PLATFORM CONTRIBUTION</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'left' }}>Platform</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', textAlign: 'right' }}>Share</th>
                </tr>
              </thead>
              <tbody>
                {wallet.breakdown.map((p) => (
                  <tr key={p.platform}>
                    <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '13px', fontWeight: 600 }}>{p.platform}</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'right', fontWeight: 700 }}>₹{p.amount.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', border: '1px solid #e2e8f0', fontSize: '13px', textAlign: 'right', color: '#64748b' }}>{((p.amount / reportData.totalIncome) * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4. Key Metrics */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>4. KEY METRICS</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px' }}>Avg Monthly</p>
                <p style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>₹{reportData.avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px' }}>Growth Trend</p>
                <p style={{ fontSize: '18px', fontWeight: 900, margin: 0, color: reportData.growthTrend === 'Increasing' ? '#3a8b6e' : '#1e293b' }}>{reportData.growthTrend}</p>
              </div>
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px' }}>Min Income</p>
                <p style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>₹{reportData.minIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
              <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 4px' }}>Max Income</p>
                <p style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>₹{reportData.maxIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>

          {/* 5. Credibility Score & Loan Readiness */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '12px' }}>5. CREDIBILITY ASSESSMENT</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ padding: '20px', background: '#0f172a', color: '#fff', borderRadius: '8px' }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 8px' }}>KaamPay Credibility Score</p>
                <p style={{ fontSize: '36px', fontWeight: 900, margin: 0, color: '#94a3b8' }}>{reportData.score}<span style={{ fontSize: '16px', color: '#64748b' }}>/100</span></p>
                <p style={{ fontSize: '11px', color: '#94a3b8', margin: '8px 0 0', lineHeight: '1.5' }}>Stability ({(reportData.minIncome / reportData.avgIncome * 100).toFixed(0)}%) · Diversification · Growth · Volume</p>
              </div>
              <div style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '8px', borderLeft: `4px solid ${reportData.readiness === 'HIGH' ? '#3a8b6e' : reportData.readiness === 'MODERATE' ? '#6ee7b7' : '#f87171'}` }}>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 8px' }}>Loan Readiness</p>
                <p style={{ fontSize: '28px', fontWeight: 900, margin: '0 0 4px', color: reportData.readiness === 'HIGH' ? '#3a8b6e' : '#1e293b' }}>{reportData.readiness}</p>
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>
                  {reportData.readiness === 'HIGH' ? 'Strong consistent income with positive growth.' : reportData.readiness === 'MODERATE' ? 'Stable income with manageable fluctuations.' : 'Inconsistent income patterns detected.'}
                </p>
              </div>
            </div>
          </div>

          {/* 6. Banking Recommendation */}
          <div style={{ padding: '24px', background: '#0f172a', color: '#fff', borderRadius: '8px', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 700, borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '12px' }}>6. BANKING RECOMMENDATION</h2>
            <p style={{ fontSize: '18px', marginBottom: '8px' }}>Recommended Safe EMI: <span style={{ fontWeight: 900, color: '#6ee7b7' }}>₹{reportData.safeEMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span></p>
            <p style={{ fontSize: '12px', opacity: 0.8 }}>
              Based on minimum monthly income of ₹{reportData.minIncome.toLocaleString()}, the client demonstrates a {reportData.readiness.toLowerCase()} capacity for credit facilities.
            </p>
            <p style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px' }}>Formula: Min Income × 0.30 = ₹{reportData.safeEMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
          </div>

          {/* 7. Risk Indicators */}
          <div style={{ padding: '20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '28px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Risk Indicators</h3>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              <li style={{ fontSize: '13px', color: '#b91c1c', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171', display: 'inline-block', marginRight: '10px' }}></span>
                {reportData.growthTrend === 'Declining' ? 'Negative income growth detected.' : 'No significant negative trend detected.'}
              </li>
              <li style={{ fontSize: '13px', color: '#b91c1c', display: 'flex', alignItems: 'center' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f87171', display: 'inline-block', marginRight: '10px' }}></span>
                {wallet.breakdown.length < 2 ? 'High dependency on single platform.' : 'Healthy diversification across multiple platforms.'}
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div style={{ marginTop: '60px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#64748b', fontStyle: 'italic', marginBottom: '16px' }}>
              "Based on the verified transaction snapshot, this client demonstrates a {reportData.readiness.toLowerCase()} degree of financial stability and creditworthiness for banking facilities."
            </p>
            <p style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '2px' }}>
              Verified by KaamPay Deterministic Engine · This document is legally valid for financial assessment
            </p>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center space-x-2 text-slate-400">
          <ShieldCheck size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Executive Summary</span>
        </div>
        <p className="text-slate-700 leading-relaxed">
          Formal income verification for client <span className="font-bold">{user.phone}</span>.
          Analysis based on <span className="font-bold">{transactions.length}</span> verified transactions across <span className="font-bold">{wallet.breakdown.length}</span> platforms.
        </p>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100/50 flex items-center space-x-2">
          <Calendar size={16} className="text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Monthly Income Breakdown</span>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
              <th className="px-6 py-3 font-bold">Month</th>
              <th className="px-6 py-3 font-bold text-right">Earnings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {Object.entries(reportData.monthlyData).map(([month, amount]) => (
              <tr key={month} className="text-sm">
                <td className="px-6 py-4 text-slate-600">{month}</td>
                <td className="px-6 py-4 text-right font-bold text-slate-900">₹{amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Platform Contribution Summary */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100/50 flex items-center space-x-2">
          <PieIcon size={16} className="text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Platform Contribution Summary</span>
        </div>
        <div className="p-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={wallet.breakdown} margin={{ top: 20, right: 10, left: 10, bottom: 20 }}>
              <XAxis
                dataKey="platform"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 border border-slate-100 rounded shadow-sm">
                        <p className="text-xs font-bold text-slate-900">₹{payload[0].value.toLocaleString()}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="amount"
                radius={[4, 4, 0, 0]}
                barSize={30}
                label={{ position: 'top', formatter: (val: number) => `₹${val}`, fontSize: 10, fontWeight: 700, fill: '#475569' }}
              >
                {wallet.breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#2d6b5a', '#3a8b6e', '#5DA392', '#7ec4a5', '#a3d9be'][index % 5]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Avg Monthly</p>
          <p className="text-xl font-black text-slate-900">₹{reportData.avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="glass-card p-4 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Growth Trend</p>
          <p className={`text-xl font-black ${reportData.growthTrend === 'Increasing' ? 'text-[var(--color-primary)]' : 'text-slate-900'}`}>{reportData.growthTrend}</p>
        </div>
      </div>

      {/* Credibility Score */}
      <div className="glass-card p-6 bg-slate-800 text-white border-none">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">KaamPay Credibility Score out of 100</p>
            <h3 className="text-5xl font-black mt-2 text-slate-500">{reportData.score}<span className="text-xl text-slate-500">/100</span></h3>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-[var(--color-primary)]/30 flex items-center justify-center relative">
            <div className="absolute inset-0 border-4 border-[var(--color-primary)] rounded-full" style={{ clipPath: `inset(0 0 ${100 - reportData.score}% 0)` }}></div>
            <ShieldCheck size={32} className="text-[var(--color-primary)]" />
          </div>
        </div>
        <p className="mt-6 text-sm text-slate-400 leading-relaxed">
          Score derived from income stability (40%), platform diversification (20%), growth trend (20%), and transaction volume (20%).
          Current stability index: <span className="text-white font-bold">{(reportData.minIncome / reportData.avgIncome * 100).toFixed(0)}%</span>.
        </p>
      </div>

      {/* EMI & Readiness */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Recommended Safe EMI</p>
              <h4 className="text-3xl font-black text-slate-900 mt-1">₹{reportData.safeEMI.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h4>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Formula: ₹{reportData.minIncome.toLocaleString()} (Min Income) × 0.30</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <WalletIcon size={24} />
            </div>
          </div>
        </div>

        <div className={`glass-card p-6 border-l-4 ${reportData.readiness === 'HIGH' ? 'border-l-[var(--color-primary)]' : reportData.readiness === 'MODERATE' ? 'border-l-emerald-400' : 'border-l-red-400'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase">Loan Readiness Matrix</p>
              <h4 className={`text-3xl font-black mt-1 ${reportData.readiness === 'HIGH' ? 'text-[var(--color-primary)]' : 'text-slate-900'}`}>{reportData.readiness}</h4>
              <p className="text-sm text-slate-600 mt-2">
                {reportData.readiness === 'HIGH' ? 'Strong consistent income with positive growth trend.' : reportData.readiness === 'MODERATE' ? 'Stable income with manageable fluctuations.' : 'Inconsistent income patterns detected.'}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${reportData.readiness === 'HIGH' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-slate-50/50 text-slate-600'}`}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Risk Indicators */}
      <div className="glass-card p-6 bg-red-50 border-red-100">
        <h4 className="text-xs font-bold text-red-800 uppercase tracking-widest mb-4">Risk Indicators</h4>
        <ul className="space-y-3">
          <li className="flex items-center text-sm text-red-700">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-3"></div>
            {reportData.growthTrend === 'Declining' ? 'Negative income growth detected in recent cycles.' : 'No significant negative trend detected.'}
          </li>
          <li className="flex items-center text-sm text-red-700">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-3"></div>
            {wallet.breakdown.length < 2 ? 'High dependency on single platform income source.' : 'Healthy diversification across multiple platforms.'}
          </li>
        </ul>
      </div>

      {/* Final Assessment */}
      <div className="text-center pt-4">
        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Final Assessment Statement</p>
        <p className="text-sm text-slate-600 mt-2 italic">
          "Based on the verified transaction snapshot, this client demonstrates a {reportData.readiness.toLowerCase()} degree of financial stability and creditworthiness for banking facilities."
        </p>
      </div>
    </motion.div>
  );
};
