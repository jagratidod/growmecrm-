import React, { useState, useEffect } from 'react';
import {
  Check,
  Edit2,
  X,
  Plus,
  Trash2,
  Crown,
  Layers,
  AlertTriangle,
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
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Edit Form state - Fully editable fields
  const [editName, setEditName] = useState('');
  const [editCode, setEditCode] = useState('');
  const [editTagline, setEditTagline] = useState('');
  const [editCurrency, setEditCurrency] = useState('INR');
  const [editPriceMonthly, setEditPriceMonthly] = useState<number | ''>(0);
  const [editPriceYearly, setEditPriceYearly] = useState<number | ''>(0);
  const [editMaxSeats, setEditMaxSeats] = useState<number | ''>(2);
  const [editMaxLeads, setEditMaxLeads] = useState<number | ''>(500);
  const [editFeaturesText, setEditFeaturesText] = useState('');
  const [editIsPopular, setEditIsPopular] = useState(false);
  const [editIsActive, setEditIsActive] = useState(true);

  // Create Form state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanCode, setNewPlanCode] = useState('');
  const [newPlanTagline, setNewPlanTagline] = useState('');
  const [newCurrency, setNewCurrency] = useState('INR');
  const [newPriceMonthly, setNewPriceMonthly] = useState<number | ''>(2499);
  const [newPriceYearly, setNewPriceYearly] = useState<number | ''>(24990);
  const [newMaxSeats, setNewMaxSeats] = useState<number | ''>(5);
  const [newMaxLeads, setNewMaxLeads] = useState<number | ''>(1500);
  const [newFeaturesText, setNewFeaturesText] = useState(
    'Up to 5 Team Members\n1,500 Ingested Leads\nWhatsApp Integration\nPDF Quotation Generator\nDedicated Onboarding Support'
  );
  const [newIsPopular, setNewIsPopular] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setEditName(plan.name || '');
    setEditCode(plan.code || '');
    setEditTagline(plan.tagline || '');
    setEditCurrency(plan.currency || 'INR');
    setEditPriceMonthly(plan.priceMonthly ?? 0);
    setEditPriceYearly(plan.priceYearly ?? 0);
    setEditMaxSeats(plan.maxSeats ?? 2);
    setEditMaxLeads(plan.maxLeads ?? 500);
    setEditFeaturesText((plan.features || []).join('\n'));
    setEditIsPopular(Boolean(plan.isPopular));
    setEditIsActive(plan.isActive !== false);
    setIsEditModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    if (!editName.trim()) {
      toast({ type: 'error', title: 'Plan Name Required', description: 'Please provide a valid plan name.' });
      return;
    }

    const features = editFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      const planId = selectedPlan.id || selectedPlan._id || selectedPlan.code;
      await superAdminService.updatePlan(planId, {
        name: editName.trim(),
        code: editCode.trim().toUpperCase() || selectedPlan.code,
        tagline: editTagline.trim(),
        currency: editCurrency.trim() || 'INR',
        priceMonthly: Number(editPriceMonthly) || 0,
        priceYearly: Number(editPriceYearly) || 0,
        maxSeats: Number(editMaxSeats) || 1,
        maxLeads: Number(editMaxLeads) || 100,
        features: features.length > 0 ? features : selectedPlan.features,
        isPopular: editIsPopular,
        isActive: editIsActive,
      });

      toast({
        type: 'success',
        title: 'Plan Updated Successfully',
        description: `All settings, pricing, quotas and features for ${editName} were saved.`,
      });

      setIsEditModalOpen(false);
      loadPlans();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: err.message || 'Could not update plan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) {
      toast({ type: 'error', title: 'Missing Plan Name', description: 'Please enter a name for the subscription model.' });
      return;
    }

    const planCode = (
      newPlanCode.trim() || newPlanName.toUpperCase().replace(/[^A-Z0-9]/g, '_')
    ).slice(0, 20);

    const features = newFeaturesText
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    setIsSubmitting(true);
    try {
      await superAdminService.createPlan({
        name: newPlanName.trim(),
        code: planCode,
        tagline: newPlanTagline.trim() || 'Custom tailored subscription model for agencies.',
        priceMonthly: Number(newPriceMonthly) || 0,
        priceYearly: Number(newPriceYearly) || 0,
        currency: newCurrency || 'INR',
        maxSeats: Number(newMaxSeats) || 2,
        maxLeads: Number(newMaxLeads) || 500,
        features: features.length > 0 ? features : ['Core CRM Features', 'Email Support'],
        isPopular: newIsPopular,
        isActive: true,
      });

      toast({
        type: 'success',
        title: 'Subscription Model Created',
        description: `Plan "${newPlanName}" (${planCode}) is now live.`,
      });

      setIsCreateModalOpen(false);
      // Reset form
      setNewPlanName('');
      setNewPlanCode('');
      setNewPlanTagline('');
      setNewCurrency('INR');
      setNewPriceMonthly(2499);
      setNewPriceYearly(24990);
      setNewMaxSeats(5);
      setNewMaxLeads(1500);
      setNewIsPopular(false);
      loadPlans();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Creation Failed',
        description: err.message || 'Unable to create subscription model.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeletePlan = async () => {
    if (!planToDelete) return;
    const planId = planToDelete.id || planToDelete._id || planToDelete.code;

    setIsSubmitting(true);
    try {
      await superAdminService.deletePlan(planId);
      toast({
        type: 'success',
        title: 'Subscription Model Deleted',
        description: `Plan "${planToDelete.name}" (${planToDelete.code}) was removed.`,
      });

      // If this plan was open in edit modal, close edit modal too
      if (selectedPlan && (selectedPlan.id === planId || selectedPlan._id === planId || selectedPlan.code === planId)) {
        setIsEditModalOpen(false);
      }

      setPlanToDelete(null);
      loadPlans();
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Failed to delete plan',
        description: err.message || 'Could not delete plan.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SuperAdminLayout
      currentPath="Subscription Models"
      title="Subscription Plans & Pricing Engine"
      subtitle="Fully edit, configure, add, or delete SaaS subscription tiers and pricing models."
    >
      {/* Header controls with Monthly / Yearly toggle and Create Plan Button */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Subscription Models
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-[#453372]">
              {plans.length} Models Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Every subscription model below is fully editable and can be updated or deleted anytime.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Toggle Billing Cycle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
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
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
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

          {/* Create Model Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#453372] hover:bg-[#38285e] text-white text-xs font-extrabold flex items-center gap-2 shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Create Subscription Model</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isPro = plan.isPopular || plan.code === 'PRO';
          const activePrice = billingCycle === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);

          return (
            <div
              key={plan.code}
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all relative overflow-hidden ${
                isPro
                  ? 'bg-gradient-to-b from-[#3a2864] via-[#453372] to-[#453372] text-white shadow-xl ring-2 ring-purple-400/30'
                  : 'bg-white text-slate-800 border border-slate-100 shadow-xs hover:border-purple-200'
              }`}
            >
              {/* Top Banner Tag */}
              {isPro ? (
                <div className="absolute top-5 right-5 bg-gradient-to-r from-amber-400 to-amber-300 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Crown className="w-3 h-3 text-slate-950" />
                  <span>Most Popular</span>
                </div>
              ) : (
                <div className="absolute top-5 right-5 bg-slate-100 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                  {plan.code}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h4 className={`text-lg font-black tracking-tight ${isPro ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h4>
                  {isPro && (
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-white/20 text-white">
                      {plan.code}
                    </span>
                  )}
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
                    <p className={`text-[11px] mt-1.5 ${isPro ? 'text-amber-300' : 'text-emerald-600'} font-bold`}>
                      Billed annually at ₹{plan.priceYearly.toLocaleString()} / year
                    </p>
                  )}
                </div>

                {/* Capacity Badges */}
                <div className="grid grid-cols-2 gap-2.5 mb-6">
                  <div className={`p-3 rounded-2xl ${isPro ? 'bg-white/10' : 'bg-slate-50'} text-center`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Team Seats</span>
                    <span className="text-sm font-black text-inherit">{plan.maxSeats} Members</span>
                  </div>
                  <div className={`p-3 rounded-2xl ${isPro ? 'bg-white/10' : 'bg-slate-50'} text-center`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Lead Quota</span>
                    <span className="text-sm font-black text-inherit">{plan.maxLeads.toLocaleString()} Leads</span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-3 mb-8 text-xs">
                  {(plan.features || []).map((feat, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPro ? 'bg-amber-400 text-slate-900' : 'bg-purple-100 text-[#453372]'
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className={isPro ? 'text-purple-100 font-medium' : 'text-slate-600 font-medium'}>
                        {feat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons: Edit and Delete for EVERY plan */}
              <div className="space-y-2 pt-2 border-t border-slate-200/20">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(plan)}
                  className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                    isPro
                      ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
                      : 'bg-purple-50 hover:bg-purple-100 text-[#453372] border border-purple-200'
                  }`}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Plan & Quotas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPlanToDelete(plan)}
                  className={`w-full py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer rounded-lg ${
                    isPro
                      ? 'text-rose-200 hover:text-white hover:bg-rose-500/30'
                      : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50'
                  }`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Model</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subscription Models Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#453372]" />
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Subscription Models Directory
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive list of all subscription tiers with complete edit and delete capabilities.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {plans.length} Registered Models
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <th className="py-3.5 px-6">Model / Tier Name</th>
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Monthly Rate</th>
                <th className="py-3.5 px-4">Annual Rate</th>
                <th className="py-3.5 px-4">Team Seats</th>
                <th className="py-3.5 px-4">Lead Quota</th>
                <th className="py-3.5 px-4">Popular</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {plans.map((p) => (
                <tr key={p.code} className="hover:bg-purple-50/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{p.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block font-normal truncate max-w-xs">
                      {p.tagline}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-[#453372]">
                    <span className="bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {p.code}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-bold text-slate-900">
                    ₹{p.priceMonthly.toLocaleString()} / mo
                  </td>
                  <td className="py-4 px-4 font-bold text-emerald-700">
                    ₹{p.priceYearly.toLocaleString()} / yr
                  </td>
                  <td className="py-4 px-4">{p.maxSeats} seats</td>
                  <td className="py-4 px-4">{p.maxLeads.toLocaleString()} leads</td>
                  <td className="py-4 px-4">
                    {p.isPopular ? (
                      <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />
                        Popular
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Standard</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="px-2.5 py-1.5 text-slate-600 hover:text-[#453372] hover:bg-purple-50 rounded-lg transition font-bold flex items-center gap-1 cursor-pointer"
                        title="Edit Plan"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanToDelete(p)}
                        className="px-2.5 py-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition font-bold flex items-center gap-1 cursor-pointer"
                        title="Delete Plan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULLY EDITABLE PLAN MODAL */}
      {isEditModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-xl p-6 sm:p-7 space-y-5 animate-scale-in max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Edit Subscription Model
                </h3>
                <p className="text-xs text-slate-400">
                  Update plan name, code identifier, pricing, quotas, features, and active state.
                </p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              {/* Row 1: Plan Name and Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Plan / Model Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Starter Tier"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Plan Code (Unique Key)
                  </label>
                  <input
                    type="text"
                    required
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                    placeholder="e.g. STARTER"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold uppercase focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Tagline / Short description</label>
                <input
                  type="text"
                  value={editTagline}
                  onChange={(e) => setEditTagline(e.target.value)}
                  placeholder="e.g. Ideal for boutique agencies and solo founders."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-[#453372] focus:outline-none bg-white"
                />
              </div>

              {/* Row 2: Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Monthly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={editPriceMonthly}
                    onChange={(e) => setEditPriceMonthly(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Yearly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={editPriceYearly}
                    onChange={(e) => setEditPriceYearly(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Currency</label>
                  <input
                    type="text"
                    value={editCurrency}
                    onChange={(e) => setEditCurrency(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold uppercase focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Row 3: Quotas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Max Team Seats</label>
                  <input
                    type="number"
                    min="1"
                    value={editMaxSeats}
                    onChange={(e) => setEditMaxSeats(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Max Leads Quota</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={editMaxLeads}
                    onChange={(e) => setEditMaxLeads(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Features List Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">
                    Features & Entitlements (one feature per line)
                  </label>
                  <span className="text-[11px] text-slate-400">Line break = new bullet</span>
                </div>
                <textarea
                  rows={5}
                  value={editFeaturesText}
                  onChange={(e) => setEditFeaturesText(e.target.value)}
                  placeholder="e.g. Up to 5 Team Members&#10;WhatsApp Ingestion&#10;PDF Quotations"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-[#453372] focus:outline-none bg-white leading-relaxed"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsPopular"
                    checked={editIsPopular}
                    onChange={(e) => setEditIsPopular(e.target.checked)}
                    className="rounded text-[#453372] focus:ring-[#453372] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="editIsPopular" className="font-bold text-slate-700 cursor-pointer">
                    Highlight as "Most Popular"
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editIsActive"
                    checked={editIsActive}
                    onChange={(e) => setEditIsActive(e.target.checked)}
                    className="rounded text-[#453372] focus:ring-[#453372] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="editIsActive" className="font-bold text-slate-700 cursor-pointer">
                    Active Plan Status
                  </label>
                </div>
              </div>

              {/* Footer Actions with Delete option */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlanToDelete(selectedPlan)}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Model</span>
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#38285e] text-white font-extrabold shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Plan Details'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW SUBSCRIPTION MODEL MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 sm:p-7 space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Create Subscription Model
                </h3>
                <p className="text-xs text-slate-400">
                  Introduce a new SaaS tier, pricing structure, and resource capacity limits.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Plan / Model Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Growth Pro Tier"
                    value={newPlanName}
                    onChange={(e) => setNewPlanName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Plan Code (Identifier)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. GROWTH_PRO"
                    value={newPlanCode}
                    onChange={(e) => setNewPlanCode(e.target.value.toUpperCase())}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-mono font-bold uppercase focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Tagline / Short Description</label>
                <input
                  type="text"
                  placeholder="e.g. Tailored for rapidly scaling destination management companies."
                  value={newPlanTagline}
                  onChange={(e) => setNewPlanTagline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-[#453372] focus:outline-none bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Monthly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={newPriceMonthly}
                    onChange={(e) => setNewPriceMonthly(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Yearly Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    value={newPriceYearly}
                    onChange={(e) => setNewPriceYearly(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Team Seats Included</label>
                  <input
                    type="number"
                    min="1"
                    value={newMaxSeats}
                    onChange={(e) => setNewMaxSeats(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">Lead Quota Limit</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    value={newMaxLeads}
                    onChange={(e) => setNewMaxLeads(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-[#453372] focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">
                  Features & Entitlements (one per line)
                </label>
                <textarea
                  rows={4}
                  value={newFeaturesText}
                  onChange={(e) => setNewFeaturesText(e.target.value)}
                  placeholder="e.g. WhatsApp Ingestion&#10;5 Team Members&#10;Unlimited Itineraries"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:border-[#453372] focus:outline-none bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="createIsPopular"
                  checked={newIsPopular}
                  onChange={(e) => setNewIsPopular(e.target.checked)}
                  className="rounded text-[#453372] focus:ring-[#453372] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="createIsPopular" className="font-bold text-slate-700 cursor-pointer">
                  Feature as "Most Popular" Tier
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#453372] hover:bg-[#38285e] text-white font-extrabold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Creating...' : 'Create Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {planToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-md p-6 sm:p-7 space-y-4 animate-scale-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mb-2">
              <AlertTriangle className="w-6 h-6 stroke-[2]" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Delete Subscription Model?
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-slate-900">{planToDelete.name}</span> ({planToDelete.code})? This will immediately remove this tier from the platform and agency upgrade options.
              </p>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={confirmDeletePlan}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Deleting...' : 'Yes, Delete Model'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};
