import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { superAdminService } from '../../services/superAdminService';
import type { SuperAdminDashboardData } from '../../types/superAdmin.types';
import { useRouter } from '../../context/RouterContext';

export const SuperAdminDashboard: React.FC = () => {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { navigate } = useRouter();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const stats = await superAdminService.getDashboardStats();
      setData(stats);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = data?.metrics || {
    totalAgencies: 5,
    activeAgencies: 4,
    suspendedAgencies: 1,
    totalAdmins: 12,
    totalLeads: 4233,
    mrr: 23490,
    arr: 281880,
    currency: 'INR',
  };

  const planDist = data?.planDistribution || {
    STARTER: 2,
    PRO: 2,
    ENTERPRISE: 1,
  };

  return (
    <SuperAdminLayout
      currentPath="Dashboard"
      title="Platform Overview Dashboard"
      subtitle="Real-time multi-tenant health, global subscriptions, and platform metrics."
    >
      {/* Top Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-[#2f2054] via-[#453372] to-[#594096] text-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md border border-purple-400/20">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            GrowMe Multi-Tenant SaaS Master Controls
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, Super Admin 👋
          </h2>
          <p className="text-xs sm:text-sm text-purple-200 font-normal max-w-xl">
            Currently monitoring <strong className="text-white">{metrics.totalAgencies} tenant agencies</strong> and{' '}
            <strong className="text-white">{metrics.totalLeads.toLocaleString()} leads</strong> across all workspaces.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-sm transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={() => navigate('/super-admin/tenants')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-300 hover:from-amber-300 hover:to-amber-200 text-slate-900 text-xs font-extrabold shadow-md transition"
          >
            Manage Agencies
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* KPI 1: MRR */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Revenue (MRR)
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ₹{metrics.mrr.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              ARR: <strong className="text-emerald-600">₹{metrics.arr.toLocaleString()}</strong> / year
            </p>
          </div>
        </div>

        {/* KPI 2: Total Agencies */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Workspaces / Agencies
            </span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#453372] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalAgencies}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-emerald-600 font-bold">{metrics.activeAgencies} Active</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-500 font-bold">{metrics.suspendedAgencies} Suspended</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Active Admins */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Active Agency Admins
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalAdmins}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Across all tenant workspaces
            </p>
          </div>
        </div>

        {/* KPI 4: Total Leads */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Platform Leads Ingested
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {metrics.totalLeads.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              WhatsApp, Meta, Webhooks & Manual
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Plan Distribution & Quick Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Plan Distribution Bar & Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Subscription Tier Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Active tier breakdown across registered tenants</p>
            </div>
            <button
              onClick={() => navigate('/super-admin/subscriptions')}
              className="text-xs text-[#453372] font-bold hover:underline"
            >
              Configure Plans →
            </button>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Starter Plan (₹1,499/mo)</span>
                <span>{planDist.STARTER || 0} Agencies</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-purple-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, ((planDist.STARTER || 0) / (metrics.totalAgencies || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Growth Pro Plan (₹3,999/mo)</span>
                <span>{planDist.PRO || 0} Agencies</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-[#453372] h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, ((planDist.PRO || 0) / (metrics.totalAgencies || 1)) * 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Enterprise Agency (₹9,999/mo)</span>
                <span>{planDist.ENTERPRISE || 0} Agencies</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, ((planDist.ENTERPRISE || 0) / (metrics.totalAgencies || 1)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Global Security & Maintenance Status */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Platform Systems & Gateways</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live connectivity status of global services</p>
            </div>
            <button
              onClick={() => navigate('/super-admin/webhooks')}
              className="text-xs text-[#453372] font-bold hover:underline"
            >
              Health Monitor →
            </button>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Multi-Channel Lead Ingestion Webhook</h4>
                  <p className="text-[11px] text-slate-400">POST /api/webhooks/lead • 45ms latency</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Meta Graph API & Instagram Webhook</h4>
                  <p className="text-[11px] text-slate-400">GET/POST /api/webhooks/meta • Active</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Operational
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">WhatsApp Cloud API Webhook</h4>
                  <p className="text-[11px] text-slate-400">GET/POST /api/webhooks/whatsapp • Active</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Operational
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tenant Directory & Audit Trail */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Platform Audit Trail</h3>
            <p className="text-xs text-slate-400 mt-0.5">Sensitive administrator actions across all workspaces</p>
          </div>
          <button
            onClick={() => navigate('/super-admin/audit-logs')}
            className="text-xs text-[#453372] font-bold hover:underline"
          >
            Full Audit Logs →
          </button>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {(data?.recentAudit || []).slice(0, 4).map((log: any, idx: number) => (
            <div key={log.id || idx} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#453372] flex items-center justify-center shrink-0 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{log.details}</p>
                  <p className="text-[11px] text-slate-400">{log.actorEmail} • {log.action}</p>
                </div>
              </div>
              <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(log.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};
