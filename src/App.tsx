import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  History,
  ShieldCheck,
  TrendingUp,
  Smartphone,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  Activity,
  CreditCard,
  Heart,
  Bike,
  Bell,
  Car,
  Shield,
  FileText,
  Wrench,
  Calculator,
  Printer,
  Download,
  Menu,
  X,
  LogOut,
  MessageSquare,
  MapPin,
  Moon,
  Sun,
  Calendar,
  CheckCircle2
} from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { CreditReport } from './components/CreditReport';
import { OrderMap } from './components/OrderMap';
import { translations, Language, Translation } from './translations';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Pie,
  PieChart as RePieChart
} from 'recharts';

// --- Types ---
interface Transaction {
  id: number;
  platform: string;
  amount: number;
  timestamp: string;
  type: string;
}

interface WalletData {
  balance: number;
  breakdown: { platform: string; amount: number }[];
}

// --- Components ---

// Map insurance type to icon
const getInsuranceIcon = (type: string) => {
  if (type.toLowerCase().includes('bike')) return <Bike size={18} />;
  if (type.toLowerCase().includes('car')) return <Car size={18} />;
  if (type.toLowerCase().includes('health')) return <Heart size={18} />;
  if (type.toLowerCase().includes('life')) return <Shield size={18} />;
  return <ShieldCheck size={18} />;
};

interface InsuranceItem {
  id: number;
  type: string;
  status: string;
  provider: string;
  premium: number;
  nextDue: string;
  startDate: string;
  coverage: string;
  link: string;
  icon?: React.ReactNode;
}

const InsuranceHub = ({ insuranceData }: { insuranceData: InsuranceItem[] }) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear] = useState(new Date().getFullYear());
  const [showMonthModal, setShowMonthModal] = useState(false);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const activeCount = insuranceData.filter(i => i.status === 'active').length;
  const pendingCount = insuranceData.filter(i => i.status === 'pending').length;
  const dueCount = insuranceData.filter(i => i.status === 'due').length;

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();

  const dueDates = insuranceData.map(ins => {
    const d = new Date(ins.nextDue);
    return { day: d.getDate(), month: d.getMonth(), year: d.getFullYear(), status: ins.status, type: ins.type };
  });

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarDays.push(d);

  const statusColor = (s: string) => s === 'active' ? 'text-emerald-600 bg-emerald-50' : s === 'pending' ? 'text-emerald-600 bg-emerald-50' : 'text-emerald-600 bg-emerald-50';
  const statusLabel = (s: string) => s === 'active' ? 'Active' : s === 'pending' ? 'Pending' : 'Due';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 pb-12"
    >
      <div className="flex items-center space-x-2">
        <ShieldCheck className="text-[var(--color-primary)]" />
        <h2 className="text-xl font-bold text-slate-900">Insurance Hub</h2>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-black text-emerald-600">{activeCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Active</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-black text-amber-500">{pendingCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Pending</p>
        </div>
        <div className="glass-card p-3 text-center">
          <p className="text-2xl font-black text-red-500">{dueCount}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase">Due Soon</p>
        </div>
      </div>

      {/* Compact Insurance Cards */}
      <div className="space-y-2">
        {insuranceData.map(ins => (
          <a key={ins.id} href={ins.link} target="_blank" rel="noopener noreferrer"
            className="glass-card p-3 flex items-center justify-between hover:shadow-md transition-all active:scale-[0.98]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">{ins.icon}</div>
              <div>
                <p className="text-sm font-bold text-slate-800">{ins.type}</p>
                <p className="text-[10px] text-slate-400">{ins.provider} · {ins.coverage}</p>
              </div>
            </div>
            <div className="text-right flex items-center space-x-2">
              <div>
                <p className="text-xs font-bold text-slate-700">₹{ins.premium}/mo</p>
                <p className="text-[10px] text-slate-400">Due {new Date(ins.nextDue).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
              </div>
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(ins.status)}`}>{statusLabel(ins.status)}</span>
            </div>
          </a>
        ))}
      </div>

      {/* Calendar */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center">
            <Bell size={14} className="mr-2 text-emerald-500" />Insurance Calendar
          </h3>
          <div className="flex items-center space-x-1">
            <button onClick={() => setSelectedMonth(m => m > 0 ? m - 1 : 11)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronRight size={14} className="rotate-180" /></button>
            <button onClick={() => setShowMonthModal(true)} className="text-xs font-bold text-slate-700 px-2 py-1 hover:bg-slate-50 rounded">{fullMonths[selectedMonth]} {selectedYear}</button>
            <button onClick={() => setSelectedMonth(m => m < 11 ? m + 1 : 0)} className="p-1 hover:bg-slate-100 rounded text-slate-400"><ChevronRight size={14} /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (<div key={i} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</div>))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={`e-${i}`} />;
            const match = dueDates.find(d => d.day === day && d.month === selectedMonth);
            const isToday = day === new Date().getDate() && selectedMonth === new Date().getMonth();
            return (
              <div key={i} className={`text-center py-1.5 rounded-lg text-[11px] font-bold relative cursor-default transition-colors ${isToday ? 'bg-emerald-600 text-white' : match ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                {day}
                {match && (<div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${match.status === 'active' ? 'bg-emerald-500' : match.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`} />)}
              </div>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Due This Month</p>
          {dueDates.filter(d => d.month === selectedMonth).length === 0 ? (
            <p className="text-xs text-slate-400 italic">No insurance dues this month</p>
          ) : (
            dueDates.filter(d => d.month === selectedMonth).map((d, i) => (
              <div key={i} className="flex items-center justify-between py-1.5">
                <span className="text-xs font-medium text-slate-700">{d.type}</span>
                <span className={`text-[10px] font-bold ${d.status === 'active' ? 'text-emerald-500' : d.status === 'pending' ? 'text-amber-500' : 'text-red-500'}`}>{d.day} {months[d.month]}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Month Detail Modal */}
      <AnimatePresence>
        {showMonthModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMonthModal(false)} className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} transition={{ type: 'spring', damping: 22, stiffness: 180 }} className="fixed inset-x-4 top-[15%] bottom-auto max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-[90] p-6 max-h-[70vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-black text-slate-900 flex items-center"><ShieldCheck size={18} className="mr-2 text-emerald-500" />{fullMonths[selectedMonth]} Overview</h2>
                <button onClick={() => setShowMonthModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors"><X size={20} className="text-slate-400" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">Total Premium</p>
                  <p className="text-xl font-black text-emerald-900">₹{insuranceData.reduce((a, b) => a + b.premium, 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">Policies</p>
                  <p className="text-xl font-black text-emerald-900">{insuranceData.length}</p>
                </div>
              </div>
              <div className="space-y-3">
                {insuranceData.map(ins => {
                  const dueDate = new Date(ins.nextDue);
                  const isThisMonth = dueDate.getMonth() === selectedMonth;
                  return (
                    <div key={ins.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">{ins.icon}</div>
                          <div><p className="text-sm font-bold text-slate-800">{ins.type}</p><p className="text-[10px] text-slate-400">{ins.provider}</p></div>
                        </div>
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor(ins.status)}`}>{statusLabel(ins.status)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div><p className="text-[10px] text-slate-400">Premium</p><p className="text-xs font-bold">₹{ins.premium}</p></div>
                        <div><p className="text-[10px] text-slate-400">Coverage</p><p className="text-xs font-bold">{ins.coverage}</p></div>
                        <div><p className="text-[10px] text-slate-400">Next Due</p><p className={`text-xs font-bold ${isThisMonth ? 'text-red-500' : 'text-slate-700'}`}>{dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const ToolsHub = ({ wallet, transactions, user }: { wallet: WalletData, transactions: Transaction[], user: any }) => {
  const [extraIncome, setExtraIncome] = useState(0);
  const [showTaxResult, setShowTaxResult] = useState(false);

  // Calculate monthly income from transactions (last 30 days or average)
  const monthlyIncome = useMemo(() => {
    if (transactions.length === 0) return 0;
    return wallet.breakdown.reduce((acc, curr) => acc + curr.amount, 0);
  }, [wallet, transactions]);

  const calculateTax = () => {
    const annualIncome = (monthlyIncome + Number(extraIncome)) * 12;

    // New Regime FY 2024-25
    let newTax = 0;
    if (annualIncome > 700000) {
      if (annualIncome <= 300000) newTax = 0;
      else if (annualIncome <= 700000) newTax = (annualIncome - 300000) * 0.05;
      else if (annualIncome <= 1000000) newTax = (400000 * 0.05) + (annualIncome - 700000) * 0.10;
      else if (annualIncome <= 1200000) newTax = (400000 * 0.05) + (300000 * 0.10) + (annualIncome - 1000000) * 0.15;
      else if (annualIncome <= 1500000) newTax = (400000 * 0.05) + (300000 * 0.10) + (200000 * 0.15) + (annualIncome - 1200000) * 0.20;
      else newTax = (400000 * 0.05) + (300000 * 0.10) + (200000 * 0.15) + (300000 * 0.20) + (annualIncome - 1500000) * 0.30;
    }

    // Old Regime (Simplified for demo)
    let oldTax = 0;
    if (annualIncome > 250000) {
      if (annualIncome <= 500000) oldTax = (annualIncome - 250000) * 0.05;
      else if (annualIncome <= 1000000) oldTax = (250000 * 0.05) + (annualIncome - 500000) * 0.20;
      else oldTax = (250000 * 0.05) + (500000 * 0.20) + (annualIncome - 1000000) * 0.30;
    }

    const itrForm = annualIncome < 5000000 ? 'ITR-1' : 'ITR-3';
    const betterRegime = newTax < oldTax ? 'New Tax Regime' : 'Old Tax Regime';
    const savings = Math.abs(oldTax - newTax);

    return {
      annualIncome,
      itrForm,
      newTax,
      oldTax,
      betterRegime,
      savings,
      platforms: wallet.breakdown.map(p => p.platform).join(', '),
      hindiSteps: [
        "1. अपने सभी प्लेटफॉर्म्स की कमाई का हिसाब रखें।",
        "2. ITR फाइल करने के लिए फॉर्म " + itrForm + " का उपयोग करें।",
        "3. " + betterRegime + " आपके लिए बेहतर है क्योंकि यह ₹" + savings.toLocaleString() + " बचाता है।",
        "4. समय पर टैक्स भरें और पेनल्टी से बचें।"
      ]
    };
  };

  const taxResult = calculateTax();

  const handleDownloadPDF = () => {
    const html = `<!DOCTYPE html><html><head><title>KaamPay Tax Report</title>
      <link href="https://fonts.googleapis.com/css2?family=Domine:wght@400..700&display=swap" rel="stylesheet">
      <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Domine',serif;color:#1e293b;padding:40px;background:#fff}
      @media print{body{padding:20px}}</style></head><body>
      <div style="border-bottom:4px solid #1e293b;padding-bottom:24px;margin-bottom:32px;display:flex;justify-content:space-between;align-items:flex-end">
        <div><h1 style="font-size:32px;font-weight:900;text-transform:uppercase;letter-spacing:-1px">KaamPay</h1>
        <p style="font-size:12px;font-weight:700;color:#64748b;margin-top:4px">Official Financial Toolkit for Gig Workers</p></div>
        <div style="text-align:right"><p style="font-size:12px;font-weight:700">TAX ASSESSMENT REPORT</p>
        <p style="font-size:10px;color:#94a3b8;margin-top:2px">FY 2024-25 | AY 2025-26</p>
        <p style="font-size:10px;color:#94a3b8;margin-top:2px">Report ID: KP-TAX-${Date.now().toString().slice(-6)}</p>
        <p style="font-size:10px;color:#94a3b8;margin-top:2px">Date: ${new Date().toLocaleDateString()}</p></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;margin-bottom:32px">
        <div><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Client Details</p>
        <p style="font-size:16px;font-weight:700;margin-bottom:4px">Phone: ${user.phone}</p>
        <p style="font-size:13px;color:#64748b">Persona: ${user.persona}</p></div>
        <div style="text-align:right"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:4px">Platforms</p>
        <p style="font-size:13px;font-weight:700">${taxResult.platforms}</p></div>
      </div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">1. INCOME SUMMARY</h2>
      <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">Monthly Gig Earnings</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;font-size:13px">₹${monthlyIncome.toLocaleString()}</td></tr>
      <tr><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#64748b">Monthly Extra Income</td><td style="padding:10px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;font-size:13px">₹${extraIncome.toLocaleString()}</td></tr>
      <tr style="background:#f8fafc"><td style="padding:12px 8px;font-weight:700;font-size:14px">Total Annual Income</td><td style="padding:12px 8px;text-align:right;font-weight:900;font-size:18px">₹${taxResult.annualIncome.toLocaleString()}</td></tr>
      </table></div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">2. TAX LIABILITY ANALYSIS</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div style="padding:20px;border:1px solid #e2e8f0;border-radius:8px"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px">New Tax Regime</p><p style="font-size:24px;font-weight:900">₹${taxResult.newTax.toLocaleString()}</p></div>
      <div style="padding:20px;border:1px solid #e2e8f0;border-radius:8px"><p style="font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;margin-bottom:8px">Old Tax Regime</p><p style="font-size:24px;font-weight:900">₹${taxResult.oldTax.toLocaleString()}</p></div>
      </div></div>

      <div style="padding:24px;background:#0f172a;color:#fff;border-radius:8px;margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #334155;padding-bottom:8px;margin-bottom:12px">3. FINAL RECOMMENDATION</h2>
      <p style="font-size:18px;margin-bottom:8px">Recommended Regime: <span style="font-weight:900;color:#6ee7b7">${taxResult.betterRegime}</span></p>
      <p style="font-size:13px;opacity:0.8;margin-bottom:4px">Potential Annual Savings: <strong>₹${taxResult.savings.toLocaleString()}</strong></p>
      <p style="font-size:13px;opacity:0.8">Suggested ITR Form: <strong>${taxResult.itrForm}</strong></p></div>

      <div style="margin-bottom:28px"><h2 style="font-size:15px;font-weight:700;border-bottom:1px solid #e2e8f0;padding-bottom:8px;margin-bottom:12px">4. COMPLIANCE STEPS</h2>
      ${taxResult.hindiSteps.map(s => `<p style="font-size:13px;color:#475569;margin-bottom:8px;line-height:1.7">${s}</p>`).join('')}</div>

      <div style="margin-top:60px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center">
      <p style="font-size:9px;color:#94a3b8;text-transform:uppercase;letter-spacing:2px">This is a computer-generated report by KaamPay AI · No signature required</p></div>
      </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 500);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center space-x-2">
        <Wrench className="text-[var(--color-primary)]" />
        <h2 className="text-xl font-bold text-slate-900">KaamPay Tools AI</h2>
      </div>

      <div className="glass-card p-6 space-y-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calculator size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Tax Calculator (FY 2024-25)</h3>
            <p className="text-xs text-slate-400">Optimized for Indian Gig Workers</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Monthly Gig Income (Auto-filled)</p>
            <p className="text-lg font-black text-slate-900">₹{monthlyIncome.toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Extra Income (Rent/Freelance)</label>
            <input
              type="number"
              value={extraIncome}
              onChange={(e) => setExtraIncome(Number(e.target.value))}
              placeholder="Enter monthly extra income"
              className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl focus:border-[var(--color-primary)] outline-none font-bold"
            />
          </div>

          <button
            onClick={() => setShowTaxResult(true)}
            className="w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-bold hover:bg-emerald-600 transition-all"
          >
            Calculate Tax Liability
          </button>
        </div>

        {showTaxResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-6 border-t border-slate-100 space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Annual Income</p>
                <p className="text-lg font-black text-emerald-900">₹{taxResult.annualIncome.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-400 uppercase">Applicable Form</p>
                <p className="text-lg font-black text-emerald-900">{taxResult.itrForm}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">New Tax Regime</span>
                <span className="font-bold text-slate-900">₹{taxResult.newTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="text-sm font-medium text-slate-600">Old Tax Regime</span>
                <span className="font-bold text-slate-900">₹{taxResult.oldTax.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
              <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Recommendation</p>
              <p className="text-sm text-emerald-700">
                Use the <span className="font-bold">{taxResult.betterRegime}</span> to save <span className="font-bold">₹{taxResult.savings.toLocaleString()}</span> annually.
              </p>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="w-full py-4 bg-[var(--color-primary)] text-white rounded-xl font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all"
            >
              <Download size={20} />
              <span>Download Official Tax Report</span>
            </button>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 opacity-50">
        <div className="glass-card p-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Tool 2</p>
          <p className="text-sm font-medium text-slate-300">Coming Soon</p>
        </div>
        <div className="glass-card p-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase">Tool 3</p>
          <p className="text-sm font-medium text-slate-300">Coming Soon</p>
        </div>
      </div>
    </motion.div>
  );
};

const Onboarding = ({ onComplete }: { onComplete: (data: any) => void }) => {
  const [step, setStep] = useState(0);
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [lang, setLang] = useState<Language>('en');
  const [persona, setPersona] = useState('');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const t = translations[lang];

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="min-h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative h-screen w-full flex flex-col items-center justify-end pb-20 px-8 bg-slate-950"
          >
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
              <img
                src="https://images.unsplash.com/photo-1617347454431-f49d7ff5c3b1?q=80&w=2015&auto=format&fit=crop"
                alt="Gig Worker"
                className="w-full h-full object-cover opacity-40 grayscale-[0.5] brightness-[0.6]"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent"></div>
            </div>

            <div className="relative z-10 w-full max-w-md space-y-8 text-center">
              <div className="space-y-2">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                    <ShieldCheck className="text-white" size={40} />
                  </div>
                </div>
                <h1 className="text-6xl font-black text-white tracking-tighter uppercase">KaamPay</h1>
                <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Verified Gig Economy Platform</p>
              </div>

              <p className="text-slate-300 text-lg leading-relaxed">
                India's first financial operating system built exclusively for delivery partners, drivers, and freelancers.
              </p>

              <div className="space-y-4 pt-4">
                <button
                  onClick={() => { setIsLoginMode(false); nextStep(); }}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all active:scale-95"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => { setIsLoginMode(true); setStep(6); }}
                  className="w-full py-4 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all active:scale-95"
                >
                  Login
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-emerald-950"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">Get Started</h2>
                <p className="text-emerald-400/60 font-medium">Enter your details to create your account</p>
              </div>

              <div className="space-y-6">
                {!isLoginMode && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">+91</span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setLoginError('');
                    nextStep();
                  }}
                  disabled={(!isLoginMode && !name) || phone.length < 10}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                  Verify Mobile
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-emerald-950"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">Verify OTP</h2>
                <p className="text-emerald-400/60 font-medium">Sent to +91 {phone}</p>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength={1}
                      className={`w-full h-16 text-center text-2xl font-black bg-white/5 border-2 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all ${otpError ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-white/10'
                        }`}
                      onChange={(e) => {
                        setOtpError(false);
                        if (e.target.value) setOtp(prev => prev + e.target.value);
                      }}
                    />
                  ))}
                </div>

                {otpError && (
                  <p className="text-red-400 text-sm font-bold text-center">Invalid OTP. Please enter 1111.</p>
                )}
                {loginError && (
                  <p className="text-red-400 text-sm font-bold text-center">{loginError}</p>
                )}

                <button
                  onClick={async () => {
                    if (otp !== '1111') {
                      setOtpError(true);
                      setOtp(''); // clear for retry
                      return;
                    }

                    if (isLoginMode) {
                      try {
                        const res = await fetch('/api/login', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ phone })
                        });
                        const data = await res.json();
                        if (data.success) {
                          onComplete(data.user);
                        } else {
                          setLoginError(data.message);
                        }
                      } catch (err) {
                        setLoginError('Login failed. Please try again.');
                      }
                    } else {
                      nextStep();
                    }
                  }}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 transition-all active:scale-95"
                >
                  Confirm OTP
                </button>

                <p className="text-center text-sm text-slate-400">
                  Didn't receive code? <button className="text-emerald-400 font-bold">Resend</button>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="lang"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-emerald-950"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">Choose Language</h2>
                <p className="text-emerald-400/60 font-medium">Select your preferred language</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(['en', 'hi', 'mr', 'ta', 'te', 'bn'] as Language[]).map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); nextStep(); }}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${lang === l ? 'border-emerald-500 bg-emerald-500/20 text-white' : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20'}`}
                  >
                    <span className="text-2xl font-black">{l === 'en' ? 'A' : l === 'hi' ? 'अ' : l === 'mr' ? 'म' : l === 'ta' ? 'அ' : l === 'te' ? 'అ' : 'অ'}</span>
                    <span className="text-xs font-bold uppercase tracking-widest">{l === 'en' ? 'English' : l === 'hi' ? 'Hindi' : l === 'mr' ? 'Marathi' : l === 'ta' ? 'Tamil' : l === 'te' ? 'Telugu' : 'Bengali'}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="persona"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-emerald-950"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">{t.selectPersona}</h2>
                <p className="text-emerald-400/60 font-medium">Tell us about your work</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'delivery', label: t.delivery, icon: <Bike size={24} />, color: 'text-emerald-400' },
                  { id: 'mobility', label: t.mobility, icon: <Car size={24} />, color: 'text-emerald-500' },
                  { id: 'freelance', label: t.freelance, icon: <TrendingUp size={24} />, color: 'text-emerald-300' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setPersona(p.id); nextStep(); }}
                    className="w-full flex items-center p-6 rounded-2xl border-2 border-white/10 bg-white/5 hover:border-emerald-500 transition-all group"
                  >
                    <div className={`p-4 rounded-xl bg-white/5 group-hover:bg-emerald-500/10 transition-colors ${p.color}`}>
                      {p.icon}
                    </div>
                    <span className="ml-4 text-xl font-bold text-white">{p.label}</span>
                    <ChevronRight className="ml-auto text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 5: Email & Password Setup (Sign Up final step) */}
        {step === 5 && (
          <motion.div
            key="emailSetup"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-emerald-950"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">Create Account</h2>
                <p className="text-emerald-400/60 font-medium">Set up your email & password to login later</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold"
                  />
                </div>

                {loginError && (
                  <p className="text-red-400 text-sm font-bold text-center">{loginError}</p>
                )}

                <button
                  onClick={async () => {
                    setLoginError('');
                    try {
                      const res = await fetch('/api/onboard', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, phone, email, password, persona, language: lang })
                      });
                      const data = await res.json();
                      if (data.success) {
                        onComplete({ name, phone, email, persona, lang });
                      } else {
                        setLoginError(data.message || 'Signup failed.');
                      }
                    } catch (err) {
                      setLoginError('Something went wrong. Please try again.');
                    }
                  }}
                  disabled={!email || password.length < 4}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                  Complete Sign Up
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 6: Email & Password Login */}
        {step === 6 && (
          <motion.div
            key="emailLogin"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="min-h-screen w-full flex flex-col items-center justify-center p-8 bg-emerald-950"
          >
            <div className="w-full max-w-md space-y-8">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-white">Welcome Back</h2>
                <p className="text-emerald-400/60 font-medium">Login with your email & password</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-emerald-400 uppercase tracking-widest ml-1">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white outline-none focus:border-emerald-500 transition-all font-bold"
                  />
                </div>

                {loginError && (
                  <p className="text-red-400 text-sm font-bold text-center">{loginError}</p>
                )}

                <button
                  onClick={async () => {
                    setLoginError('');
                    try {
                      const res = await fetch('/api/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                      });
                      const data = await res.json();
                      if (data.success) {
                        onComplete(data.user);
                      } else {
                        setLoginError(data.message || 'Invalid email or password.');
                      }
                    } catch (err) {
                      setLoginError('Login failed. Please try again.');
                    }
                  }}
                  disabled={!email || !password}
                  className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
                >
                  Login
                </button>

                <p className="text-center text-sm text-slate-400">
                  Don't have an account? <button onClick={() => { setIsLoginMode(false); setStep(0); }} className="text-emerald-400 font-bold">Sign Up</button>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Dashboard = ({ user, lang, onLogout }: { user: any, lang: Language, onLogout: () => void }) => {
  const [wallet, setWallet] = useState<WalletData>({ balance: 0, breakdown: [] });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState('home');
  const [showNotification, setShowNotification] = useState(false);
  const [lastNotif, setLastNotif] = useState<any>(null);
  const [showSmsNotif, setShowSmsNotif] = useState(false);
  const [smsText, setSmsText] = useState('');
  const lastTxIdRef = useRef<number | null>(null);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showTrendsModal, setShowTrendsModal] = useState(false);
  const [trendPage, setTrendPage] = useState(0);
  const [insuranceData, setInsuranceData] = useState<InsuranceItem[]>([]);
  const t = translations[lang];

  // Auto-cycle trends data in batches of 15
  useEffect(() => {
    if (showTrendsModal || transactions.length === 0) return;
    const totalPages = Math.max(1, Math.ceil(transactions.length / 15));
    const interval = setInterval(() => {
      setTrendPage(prev => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(interval);
  }, [transactions.length, showTrendsModal]);

  const trendBatchData = useMemo(() => {
    const reversed = [...transactions].reverse();
    const start = trendPage * 15;
    return reversed.slice(start, start + 15);
  }, [transactions, trendPage]);

  const fetchData = async () => {
    try {
      const [wRes, tRes, iRes] = await Promise.all([
        fetch(`/api/wallet?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/transactions?email=${encodeURIComponent(user.email)}`),
        fetch(`/api/insurance?email=${encodeURIComponent(user.email)}`)
      ]);
      const wData = await wRes.json();
      const tData = await tRes.json();
      const iData = await iRes.json();

      if (tData.length > 0 && lastTxIdRef.current !== null && tData[0].id !== lastTxIdRef.current) {
        const newTx = tData[0];
        setLastNotif(newTx);

        // Generate realistic SMS text
        const acNo = 'XX' + Math.floor(1000 + Math.random() * 9000);
        const txDate = new Date(newTx.timestamp);
        const dateStr = `${txDate.getDate().toString().padStart(2, '0')}-${(txDate.getMonth() + 1).toString().padStart(2, '0')}-${txDate.getFullYear()}`;
        const timeStr = txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const refNo = Math.floor(100000000000 + Math.random() * 900000000000);
        const sms = `Rs.${newTx.amount} credited to A/c ${acNo} on ${dateStr} at ${timeStr} by ${newTx.platform}/UPI. Ref No: ${refNo}. Avl Bal: Rs.${(wData.balance).toLocaleString()}. -SBI`;
        setSmsText(sms);

        // Show SMS notification
        setShowSmsNotif(true);
        setTimeout(() => setShowSmsNotif(false), 4000);
      }

      if (tData.length > 0) {
        lastTxIdRef.current = tData[0].id;
      }

      setWallet(wData);
      setTransactions(tData);
      // Map DB insurance data to include icons
      if (Array.isArray(iData)) {
        setInsuranceData(iData.map((ins: any) => ({
          id: ins.id,
          type: ins.type,
          status: ins.status,
          provider: ins.provider,
          premium: ins.premium,
          nextDue: ins.next_due,
          startDate: ins.start_date,
          coverage: ins.coverage,
          link: ins.link,
          icon: getInsuranceIcon(ins.type)
        })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Start simulation for this user
    fetch('/api/start-sim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      clearInterval(interval);
      // Stop simulation on unmount (logout)
      fetch('/api/stop-sim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email })
      });
    };
  }, []);

  const COLORS = ['#2d6b5a', '#3a8b6e', '#5DA392', '#7ec4a5', '#a3d9be', '#c8edda'];

  const menuItems = [
    { id: 'home', icon: <TrendingUp size={20} />, label: 'Home' },
    { id: 'map', icon: <MapPin size={20} />, label: 'Map' },
    { id: 'insurance', icon: <ShieldCheck size={20} />, label: 'Insurance' },
    { id: 'report', icon: <FileText size={20} />, label: 'Report' },
    { id: 'tools', icon: <Wrench size={20} />, label: 'Tools' },
  ];

  return (
    <div className="min-h-screen bg-transparent pb-24 relative">

      {/* Android-style SMS Notification */}
      <AnimatePresence>
        {showSmsNotif && smsText && (
          <motion.div
            initial={{ y: -120, opacity: 0, scale: 0.9 }}
            animate={{ y: 12, opacity: 1, scale: 1 }}
            exit={{ y: -120, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className="fixed top-0 left-0 right-0 z-[110] flex justify-center px-4 pointer-events-none"
          >
            <div className="bg-slate-800/95 backdrop-blur-2xl border border-slate-700/50 p-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] max-w-[360px] w-full pointer-events-auto">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <MessageSquare className="text-white" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-white/90 uppercase tracking-wide">Messages</span>
                    <span className="text-[10px] text-slate-400">now</span>
                  </div>
                  <p className="text-[12px] text-slate-300 leading-relaxed font-mono break-words">
                    {smsText}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-emerald-100/50 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200/50">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none">KaamPay</h1>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Verified Gig Economy</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Welcome,</p>
            <p className="text-sm font-black text-slate-800">{user.name || user.phone}</p>
          </div>
          <button
            onClick={() => setIsMenuOpen(true)}
            className="p-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Side Menu (Slider Bar) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white z-[70] shadow-2xl p-8 flex flex-col side-menu"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="text-emerald-600" size={24} />
                  <span className="font-black text-xl tracking-tighter">KaamPay</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all ${activeTab === item.id
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-slate-500 hover:bg-slate-50'
                      }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-transparent mt-4" style={darkMode ? { background: 'rgba(58, 139, 110, 0.1)' } : {}}>
                <div className="flex items-center space-x-3">
                  {darkMode ? <Moon size={20} className="text-emerald-400" /> : <Sun size={20} className="text-amber-500" />}
                  <span className="font-bold text-sm">{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
                </div>
                <button
                  onClick={() => {
                    const next = !darkMode;
                    setDarkMode(next);
                    document.documentElement.classList.toggle('dark', next);
                  }}
                  className={`w-12 h-7 rounded-full transition-all duration-300 relative ${darkMode ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-1 shadow-md transition-all duration-300 ${darkMode ? 'left-6' : 'left-1'
                    }`}></div>
                </button>
              </div>

              <button
                onClick={onLogout}
                className="w-full flex items-center space-x-4 p-4 rounded-xl text-red-500 hover:bg-red-50 transition-all font-bold mt-auto"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="p-6 space-y-6 max-w-2xl mx-auto">
        {activeTab === 'report' ? (
          <CreditReport user={user} transactions={transactions} wallet={wallet} />
        ) : activeTab === 'insurance' ? (
          <InsuranceHub insuranceData={insuranceData} />
        ) : activeTab === 'tools' ? (
          <ToolsHub wallet={wallet} transactions={transactions} user={user} />
        ) : activeTab === 'map' ? (
          <OrderMap transactions={transactions} />
        ) : (
          <>
            {/* KaamPay Earnings Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="wallet-card p-6 border-none flex flex-col justify-between"
            >
              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <ShieldCheck className="text-white" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-tighter leading-none">KaamPay</p>
                    <p className="text-[8px] font-bold uppercase tracking-widest opacity-60">Verified Earnings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-50">{wallet.breakdown.length} Platforms</p>
                </div>
              </div>

              <div className="relative z-10">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{t.walletBalance}</p>
                <h2 className="text-4xl font-black tracking-tight">₹{wallet.balance.toLocaleString()}</h2>
              </div>

              <div className="flex justify-between items-end relative z-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mt-1">{user.name || user.phone}</p>
                  <p className="text-[10px] font-mono opacity-50">{user.persona}</p>
                </div>
              </div>

              {/* Decorative elements for premium feel */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-300/8 rounded-full -mr-20 -mt-20 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/15 rounded-full -ml-16 -mb-16 blur-2xl"></div>
              <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl"></div>
              {/* Holographic stripe */}
              <div className="absolute top-[45%] left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent z-[3]"></div>
            </motion.div>

            {/* Breakdown & Charts */}
            <div className="grid grid-cols-2 gap-4">
              {/* Split Card - clickable */}
              <motion.div
                className="glass-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setShowSplitModal(true)}
                whileTap={{ scale: 0.97 }}
              >
                <h3 className="text-xs font-bold mb-2 flex items-center">
                  <PieChart size={14} className="mr-1 text-emerald-500" />
                  Split
                </h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={wallet.breakdown}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={2}
                        dataKey="amount"
                      >
                        {wallet.breakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </RePieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Trends Card - clickable, cycles batches of 15 */}
              <motion.div
                className="glass-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setShowTrendsModal(true)}
                whileTap={{ scale: 0.97 }}
              >
                <h3 className="text-xs font-bold mb-2 flex items-center justify-between">
                  <span className="flex items-center">
                    <TrendingUp size={14} className="mr-1 text-[var(--color-primary)]" />
                    Trends
                  </span>
                  {transactions.length > 15 && (
                    <span className="text-[9px] font-medium text-slate-400">
                      {trendPage + 1}/{Math.ceil(transactions.length / 15)}
                    </span>
                  )}
                </h3>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendBatchData}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="timestamp" hide />
                      <YAxis hide />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white/90 backdrop-blur-sm p-2 border border-slate-100 rounded-lg shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(payload[0].payload.timestamp).toLocaleDateString()}</p>
                                <p className="text-sm font-black text-slate-900">₹{payload[0].value}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--color-primary)"
                        fillOpacity={1}
                        fill="url(#colorEarnings)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>

            {/* ===== SPLIT MODAL ===== */}
            <AnimatePresence>
              {showSplitModal && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowSplitModal(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                    className="fixed inset-x-4 top-[15%] bottom-auto max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-[90] p-6 max-h-[70vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-black text-slate-900 flex items-center">
                        <PieChart size={18} className="mr-2 text-emerald-500" />
                        Revenue Split
                      </h2>
                      <button onClick={() => setShowSplitModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                      </button>
                    </div>

                    {/* Large Pie Chart */}
                    <div className="h-48 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={wallet.breakdown}
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="amount"
                          >
                            {wallet.breakdown.map((entry, index) => (
                              <Cell key={`modal-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                                    <p className="text-xs font-bold text-slate-900">{payload[0].name}: ₹{payload[0].value}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Platform breakdown list */}
                    <div className="space-y-3">
                      {wallet.breakdown.map((item, index) => {
                        const total = wallet.breakdown.reduce((s, b) => s + b.amount, 0);
                        const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : '0';
                        return (
                          <div key={item.platform} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center">
                              <div className="w-3.5 h-3.5 rounded-full mr-3 flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                              <span className="font-bold text-sm text-slate-800">{item.platform}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm text-slate-900">₹{item.amount.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-400 font-medium">{pct}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-500">Total Revenue</span>
                      <span className="text-lg font-black text-slate-900">₹{wallet.breakdown.reduce((s, b) => s + b.amount, 0).toLocaleString()}</span>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* ===== TRENDS MODAL ===== */}
            <AnimatePresence>
              {showTrendsModal && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowTrendsModal(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                    className="fixed inset-x-4 top-[8%] bottom-auto max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-[90] p-6 max-h-[80vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-black text-slate-900 flex items-center">
                        <TrendingUp size={18} className="mr-2 text-emerald-500" />
                        Trend Analysis
                      </h2>
                      <button onClick={() => setShowTrendsModal(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                      </button>
                    </div>

                    {/* Full Chart */}
                    <div className="h-48 mb-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={[...transactions].reverse()}>
                          <defs>
                            <linearGradient id="colorEarningsModal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#5DA392" stopOpacity={0.4} />
                              <stop offset="95%" stopColor="#5DA392" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis dataKey="timestamp" hide />
                          <YAxis hide />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(payload[0].payload.timestamp).toLocaleDateString()}</p>
                                    <p className="text-sm font-black text-slate-900">₹{payload[0].value}</p>
                                    <p className="text-[10px] text-slate-500">{payload[0].payload.platform}</p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area type="monotone" dataKey="amount" stroke="#5DA392" fillOpacity={1} fill="url(#colorEarningsModal)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { label: 'Total Earned', value: `₹${transactions.reduce((s, t) => s + (t.type === 'EARNING' ? t.amount : 0), 0).toLocaleString()}` },
                        { label: 'Avg / Txn', value: `₹${transactions.length > 0 ? Math.round(transactions.reduce((s, t) => s + t.amount, 0) / transactions.length) : 0}` },
                        { label: 'Top Platform', value: (() => { const counts: Record<string, number> = {}; transactions.forEach(t => { counts[t.platform] = (counts[t.platform] || 0) + t.amount; }); return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-'; })() },
                        { label: 'Highest', value: `₹${transactions.length > 0 ? Math.max(...transactions.map(t => t.amount)) : 0}` },
                      ].map(stat => (
                        <div key={stat.label} className="bg-slate-50 rounded-xl p-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</p>
                          <p className="text-sm font-black text-slate-900 mt-0.5">{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Transaction list */}
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">All Transactions</p>
                      {transactions.slice(0, 30).map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                          <div className="flex items-center">
                            <div className={`p-1.5 rounded-lg mr-3 ${tx.type === 'EARNING' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                              {tx.type === 'EARNING' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">{tx.platform}</p>
                              <p className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <p className={`text-xs font-bold ${tx.type === 'EARNING' ? 'text-emerald-600' : 'text-slate-800'}`}>
                            {tx.type === 'EARNING' ? '+' : '-'}₹{tx.amount}
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* History Pool */}
            <div className="glass-card overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold flex items-center">
                  <History size={18} className="mr-2 text-slate-400" />
                  {t.recentTransactions}
                </h3>
                <button
                  onClick={() => setShowAllTransactions(true)}
                  className="text-sm text-[var(--color-secondary)] font-semibold"
                >
                  View All
                </button>
              </div>
              <div className="divide-y divide-slate-50">
                {transactions.slice(0, 4).map((tx) => (
                  <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${tx.type === 'EARNING' ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-red-50 text-red-400'}`}>
                        {tx.type === 'EARNING' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div className="ml-4">
                        <p className="font-bold text-slate-800">{tx.platform}</p>
                        <p className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'EARNING' ? 'text-[var(--color-primary)]' : 'text-slate-800'}`}>
                        {tx.type === 'EARNING' ? '+' : '-'} ₹{tx.amount}
                      </p>
                      <p className="text-[10px] text-slate-400">Success</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== WEEKLY INSURANCE REMINDERS ===== */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-slate-50">
                <h3 className="text-sm font-bold flex items-center">
                  <Calendar size={14} className="mr-2 text-emerald-500" />
                  Weekly Insurance Reminders
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Upcoming top-ups this week</p>
              </div>
              <div className="divide-y divide-slate-50">
                {(() => {
                  const today = new Date();
                  const weekEnd = new Date(today);
                  weekEnd.setDate(today.getDate() + 7);
                  const weekItems = insuranceData.filter(ins => {
                    const due = new Date(ins.nextDue);
                    return due >= today && due <= weekEnd;
                  }).sort((a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime());

                  const overdueItems = insuranceData.filter(ins => {
                    const due = new Date(ins.nextDue);
                    return due < today;
                  });

                  const allItems = [...overdueItems.map(ins => ({ ...ins, overdue: true })), ...weekItems.map(ins => ({ ...ins, overdue: false }))];

                  if (allItems.length === 0) return (
                    <div className="p-4 text-center">
                      <CheckCircle2 size={24} className="text-emerald-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">All clear! No top-ups due this week.</p>
                    </div>
                  );

                  return allItems.map((ins, i) => {
                    const dueDate = new Date(ins.nextDue);
                    const dayName = dueDate.toLocaleDateString('en-IN', { weekday: 'short' });
                    const dateStr = dueDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                    return (
                      <div key={i} className="p-3 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-600">
                            {ins.icon}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{ins.type}</p>
                            <p className="text-[10px] text-slate-400">{ins.provider} · ₹{ins.premium}/mo</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <p className={`text-[10px] font-bold ${ins.overdue ? 'text-red-500' : 'text-slate-600'}`}>
                              {ins.overdue ? 'Overdue' : dayName}
                            </p>
                            <p className="text-[10px] text-slate-400">{dateStr}</p>
                          </div>
                          <button
                            onClick={async () => {
                              window.open(ins.link, '_blank');
                              const nextDue = new Date(ins.nextDue);
                              nextDue.setMonth(nextDue.getMonth() + 1);
                              await fetch('/api/insurance/update', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ id: ins.id, status: 'active', nextDue: nextDue.toISOString().split('T')[0] })
                              });
                              fetchData();
                            }}
                            className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-[10px] font-bold uppercase rounded-lg hover:opacity-90 transition-opacity active:scale-95"
                          >
                            Pay
                          </button>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="p-3 border-t border-slate-50 text-center">
                <p className="text-[10px] text-slate-400">
                  {insuranceData.filter(i => i.status === 'due').length + insuranceData.filter(i => new Date(i.nextDue) < new Date()).length} overdue · {insuranceData.filter(i => i.status === 'active').length} active
                </p>
              </div>
            </div>

            {/* ===== DAILY SAVINGS PLAN ===== */}
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-slate-50">
                <h3 className="text-sm font-bold flex items-center">
                  <Wallet size={14} className="mr-2 text-emerald-500" />
                  Daily Savings Plan
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Set aside from daily earnings for insurance</p>
              </div>
              <div className="divide-y divide-slate-50">
                {insuranceData.map(ins => {
                  const perDay = Math.ceil(ins.premium / 30);
                  return (
                    <div key={ins.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-600">
                          {ins.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{ins.type}</p>
                          <p className="text-[10px] text-slate-400">₹{ins.premium}/mo ÷ 30 days</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-[var(--color-primary)]">₹{perDay}/day</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 border-t border-slate-50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold text-slate-700">Total Daily Savings</p>
                  <p className="text-sm font-black text-[var(--color-primary)]">₹{insuranceData.reduce((a, b) => a + Math.ceil(b.premium / 30), 0)}/day</p>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (insuranceData.reduce((a, b) => a + Math.ceil(b.premium / 30), 0) / (wallet.balance / Math.max(transactions.length, 1))) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Save ₹{insuranceData.reduce((a, b) => a + Math.ceil(b.premium / 30), 0)} daily from your earnings to stay covered
                </p>
              </div>
            </div>

            {/* ===== ALL TRANSACTIONS MODAL ===== */}
            <AnimatePresence>
              {showAllTransactions && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setShowAllTransactions(false)}
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    transition={{ type: 'spring', damping: 22, stiffness: 180 }}
                    className="fixed inset-x-4 top-[8%] bottom-auto max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-[90] p-6 max-h-[80vh] overflow-y-auto"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-black text-slate-900 flex items-center">
                        <History size={18} className="mr-2 text-emerald-500" />
                        All Transactions
                      </h2>
                      <button onClick={() => setShowAllTransactions(false)} className="p-1.5 hover:bg-slate-100 rounded-full transition-colors">
                        <X size={20} className="text-slate-400" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 mb-3">{transactions.length} transactions</p>

                    <div className="space-y-2">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${tx.type === 'EARNING' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-400'}`}>
                              {tx.type === 'EARNING' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{tx.platform}</p>
                              <p className="text-[10px] text-slate-400">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${tx.type === 'EARNING' ? 'text-[var(--color-primary)]' : 'text-slate-800'}`}>
                              {tx.type === 'EARNING' ? '+' : '-'}₹{tx.amount}
                            </p>
                            <p className="text-[10px] text-slate-400">Success</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </>
        )}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur-md border-t border-slate-100/50 px-6 py-3 flex justify-between items-center z-20">
        {[
          { id: 'home', icon: <TrendingUp />, label: 'Home' },
          { id: 'map', icon: <MapPin />, label: 'Map' },
          { id: 'insurance', icon: <ShieldCheck />, label: 'Insurance' },
          { id: 'report', icon: <FileText />, label: 'Report' },
          { id: 'tools', icon: <Wrench />, label: 'Tools' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center space-y-1 transition-colors ${activeTab === item.id ? 'text-[var(--color-primary)]' : 'text-slate-400'}`}
          >
            {React.cloneElement(item.icon as React.ReactElement<any>, { size: 24 })}
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div >
  );
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Force onboarding on every refresh as requested
    setLoading(false);
  }, []);

  const handleOnboarding = (data: any) => {
    setUser(data);
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-transparent min-h-screen shadow-xl relative overflow-hidden">
      {!user ? (
        <Onboarding onComplete={handleOnboarding} />
      ) : (
        <Dashboard user={user} lang={user.lang} onLogout={handleLogout} />
      )}
    </div>
  );
}
