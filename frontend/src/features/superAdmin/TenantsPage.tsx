import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  Edit2,
  X,
  RefreshCw,
} from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { superAdminService } from '../../services/superAdminService';
import type { Tenant } from '../../types/superAdmin.types';
import { useToast } from '../../components/ui/Toast';

export const TenantsPage: React.FC = () => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Edit form state
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'TRIAL' | 'SUSPENDED'>('ACTIVE');
  const [editPlan, setEditPlan] = useState<'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM'>('STARTER');
  const [editMaxSeats, setEditMaxSeats] = useState(2);
  const [editMaxLeads, setEditMaxLeads] = useState(500);

  const { toast } = useToast();

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminService.getTenants();
      setTenants(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleOpenEdit = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setEditStatus(tenant.status);
    setEditPlan(tenant.plan);
    setEditMaxSeats(tenant.maxSeats || 2);
    setEditMaxLeads(tenant.maxLeads || 500);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;

    try {
      await superAdminService.updateTenantStatus(selectedTenant.id, {
        status: editStatus,
        plan: editPlan,
        maxSeats: Number(editMaxSeats),
        maxLeads: Number(editMaxLeads),
      });

      toast({
        type: 'success',
        title: 'Tenant Updated',
        description: `Successfully updated workspace "${selectedTenant.name}".`,
      });

      setIsEditModalOpen(false);
      loadTenants();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Could not update tenant.',
      });
    }
  };

  const handleImpersonate = async (tenant: Tenant) => {
    try {
      await superAdminService.impersonateTenant(tenant.id);
      toast({
        type: 'success',
        title: 'Support Session Active',
        description: `Impersonating admin for "${tenant.name}". Redirecting...`,
      });
      setTimeout(() => {
        window.location.href = '/leads';
      }, 800);
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Impersonation Failed',
        description: err.message || 'Could not log in as admin.',
      });
    }
  };

  const filteredTenants = tenants.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.slug.toLowerCase().includes(search.toLowerCase()) ||
      t.owner?.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.owner?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesPlan = planFilter === 'ALL' || t.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <SuperAdminLayout
      currentPath="Agencies & Admins"
      title="Agencies & Tenant Admins"
      subtitle="Complete directory of all registered agency workspaces, active administrators, and quota limits."
    >
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agency name, owner, or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#453372]/20 focus:border-[#453372] transition"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#453372]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Workspaces</option>
            <option value="TRIAL">Trial Workspaces</option>
            <option value="SUSPENDED">Suspended Workspaces</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#453372]"
          >
            <option value="ALL">All Plans</option>
            <option value="STARTER">Starter Tier</option>
            <option value="PRO">Growth Pro</option>
            <option value="ENTERPRISE">Enterprise Agency</option>
          </select>

          <button
            onClick={loadTenants}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tenants Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-bold border-b border-slate-200/80 uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-5">Agency Workspace</th>
                <th className="py-3.5 px-4">Admin Owner</th>
                <th className="py-3.5 px-4">Plan Tier</th>
                <th className="py-3.5 px-4">Leads / Quota</th>
                <th className="py-3.5 px-4">Seats</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No agency workspaces matching current filters.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((t) => {
                  const leadPercent = Math.min(100, Math.round(((t.leadCount || 0) / (t.maxLeads || 500)) * 100));

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Agency Name & Slug */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#453372] font-black flex items-center justify-center shrink-0 border border-purple-200 shadow-2xs">
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{t.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">/{t.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Admin Owner Details */}
                      <td className="py-3.5 px-4">
                        {t.owner ? (
                          <div>
                            <span className="font-bold text-slate-800 block">{t.owner.name}</span>
                            <span className="text-[11px] text-slate-400 block">{t.owner.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No owner assigned</span>
                        )}
                      </td>

                      {/* Plan Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block font-extrabold text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${
                            t.plan === 'ENTERPRISE'
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : t.plan === 'PRO'
                              ? 'bg-purple-50 text-[#453372] border-purple-300'
                              : 'bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                        >
                          {t.plan}
                        </span>
                      </td>

                      {/* Leads / Quota Progress */}
                      <td className="py-3.5 px-4">
                        <div className="w-32">
                          <div className="flex justify-between text-[10px] font-bold text-slate-600 mb-1">
                            <span>{t.leadCount || 0}</span>
                            <span>{t.maxLeads} max</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                leadPercent > 90 ? 'bg-rose-500' : leadPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${leadPercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Seats */}
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {t.userCount || 1} / {t.maxSeats || 2}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[10px] uppercase px-2.5 py-0.5 rounded-full border ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : t.status === 'TRIAL'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-rose-50 text-rose-700 border-rose-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === 'ACTIVE'
                                ? 'bg-emerald-500'
                                : t.status === 'TRIAL'
                                ? 'bg-blue-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          {t.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* 1-Click Support Impersonation */}
                          <button
                            type="button"
                            onClick={() => handleImpersonate(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] border border-amber-300 transition"
                            title="Log in to this workspace as administrator"
                          >
                            <UserCheck className="w-3 h-3 text-amber-600" />
                            <span>Impersonate</span>
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#453372] hover:bg-purple-50 transition"
                            title="Edit Plan & Quota"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Tenant Modal */}
      {isEditModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Manage Workspace
                </h3>
                <p className="text-xs text-slate-400">{selectedTenant.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              {/* Status */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Full access)</option>
                  <option value="TRIAL">TRIAL (14-day evaluation)</option>
                  <option value="SUSPENDED">SUSPENDED (Access locked)</option>
                </select>
              </div>

              {/* Plan Tier */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Subscription Tier</label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                >
                  <option value="STARTER">Starter Tier (₹1,499/mo)</option>
                  <option value="PRO">Growth Pro (₹3,999/mo)</option>
                  <option value="ENTERPRISE">Enterprise Agency (₹9,999/mo)</option>
                  <option value="CUSTOM">Custom Tier</option>
                </select>
              </div>

              {/* Max Seats & Max Leads */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={editMaxSeats}
                    onChange={(e) => setEditMaxSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Leads</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={editMaxLeads}
                    onChange={(e) => setEditMaxLeads(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#453372] hover:bg-[#38285e] text-white font-extrabold shadow-md transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};
