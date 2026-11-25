import React, { useState, useEffect } from 'react';
import {
  Check,
  Edit2,
  X,
} from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { superAdminService } from '../../services/superAdminService';
import type { SubscriptionPlan } from '../../types/superAdmin.types';
import { useToast } from '../../components/ui/Toast';

export const SubscriptionsPage: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state
  const [priceMonthly, setPriceMonthly] = useState(0);
  const [priceYearly, setPriceYearly] = useState(0);
  const [maxSeats, setMaxSeats] = useState(2);
  const [maxLeads, setMaxLeads] = useState(500);
  const [tagline, setTagline] = useState('');

  const { toast } = useToast();

  const loadPlans = async () => {
    try {
      const data = await superAdminService.getPlans();
      setPlans(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setPriceMonthly(plan.priceMonthly);
    setPriceYearly(plan.priceYearly);
    setMaxSeats(plan.maxSeats);
    setMaxLeads(plan.maxLeads);
    setTagline(plan.tagline || '');
    setIsEditModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    try {
      const planId = selectedPlan.id || selectedPlan._id || '';
      await superAdminService.updatePlan(planId, {
        priceMonthly: Number(priceMonthly),
        priceYearly: Number(priceYearly),
        maxSeats: Number(maxSeats),
        maxLeads: Number(maxLeads),
        tagline: tagline.trim(),
      });

      toast({
        type: 'success',
        title: 'Plan Updated',
        description: `Pricing and quota saved for ${selectedPlan.name}.`,
      });

      setIsEditModalOpen(false);
      loadPlans();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Could not update plan.',
      });
    }
  };

  return (
    <SuperAdminLayout
      currentPath="Subscription Models"
      title="Subscription Plans & Pricing Engine"
      subtitle="Configure SaaS subscription tiers, lead and seat capacity limits, and pricing."
    >
      {/* Header controls with Monthly / Yearly toggle */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Platform Subscription Tiers
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Changes to plan limits and pricing reflect across future agency upgrades.
          </p>
        </div>

        {/* Toggle Billing Cycle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white text-[#453372] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('yearly')}
            className={`px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
              billingCycle === 'yearly'
                ? 'bg-white text-[#453372] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Annual (20% Off)</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.2 rounded-full font-black">
              SAVE
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPro = plan.code === 'PRO';
          const activePrice = billingCycle === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);

          return (
            <div
              key={plan.code}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative overflow-hidden ${
                isPro
                  ? 'bg-gradient-to-b from-[#35255e] to-[#453372] text-white shadow-xl ring-2 ring-purple-400/30'
                  : 'bg-white text-slate-800 border border-slate-200/90 shadow-xs'
              }`}
            >
              {/* Top Banner Tag */}
              {isPro && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                  Most Popular
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`text-lg font-black tracking-tight ${isPro ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h4>
                </div>
                <p className={`text-xs ${isPro ? 'text-purple-200' : 'text-slate-400'} min-h-[36px]`}>
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="my-5 pb-5 border-b border-slate-200/20">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight">
                      ₹{activePrice.toLocaleString()}
                    </span>
                    <span className={`text-xs font-medium ${isPro ? 'text-purple-200' : 'text-slate-400'}`}>
                      / month
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className={`text-[11px] mt-1 ${isPro ? 'text-amber-300' : 'text-emerald-600'} font-bold`}>
                      Billed annually at ₹{plan.priceYearly.toLocaleString()} / year
                    </p>
                  )}
                </div>

                {/* Capacity Badges */}
                <div className="grid grid-cols-2 gap-2 mb-5">
                  <div className={`p-2.5 rounded-xl ${isPro ? 'bg-white/10' : 'bg-slate-50'} text-center`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Team Seats</span>
                    <span className="text-sm font-black text-inherit">{plan.maxSeats} Members</span>
                  </div>
                  <div className={`p-2.5 rounded-xl ${isPro ? 'bg-white/10' : 'bg-slate-50'} text-center`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Lead Quota</span>
                    <span className="text-sm font-black text-inherit">{plan.maxLeads.toLocaleString()} Leads</span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 mb-6 text-xs">
                  {(plan.features || []).map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isPro ? 'bg-amber-400 text-slate-900' : 'bg-purple-100 text-[#453372]'
                      }`}>
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={isPro ? 'text-purple-100' : 'text-slate-600'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleOpenEdit(plan)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isPro
                    ? 'bg-amber-400 hover:bg-amber-300 text-slate-900 shadow-md font-extrabold'
                    : 'bg-purple-50 hover:bg-purple-100 text-[#453372] border border-purple-200'
                }`}
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Plan Pricing & Limits</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Plan Modal */}
      {isEditModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Configure {selectedPlan.name}
                </h3>
                <p className="text-xs text-slate-400">Update pricing and agency entitlements</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tagline / Short description</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Monthly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={priceMonthly}
                    onChange={(e) => setPriceMonthly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Yearly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={priceYearly}
                    onChange={(e) => setPriceYearly(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Team Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={maxSeats}
                    onChange={(e) => setMaxSeats(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-[#453372] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Max Leads Allowed</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={maxLeads}
                    onChange={(e) => setMaxLeads(Number(e.target.value))}
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
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};
