import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  CreditCard,
  Save,
  Globe,
} from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { superAdminService } from '../../services/superAdminService';
import type { PlatformSettings } from '../../types/superAdmin.types';
import { useToast } from '../../components/ui/Toast';

export const PlatformSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'GrowMe CRM',
    supportEmail: 'support@growmecrm.com',
    contactPhone: '+91 89822 92201',
    defaultCurrency: 'INR',
    defaultTrialDays: 14,
    maintenanceMode: false,
    maintenanceMessage: 'GrowMe CRM is undergoing scheduled maintenance. We will be back online shortly.',
    allowNewRegistrations: true,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpFromEmail: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    superAdminService
      .getSettings()
      .then((data) => setSettings(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await superAdminService.updateSettings(settings);
      toast({
        type: 'success',
        title: 'Settings Saved',
        description: 'Global platform settings updated successfully.',
      });
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Save Failed',
        description: err.message || 'Error saving settings.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SuperAdminLayout
      currentPath="Platform Settings"
      title="Platform Master Settings"
      subtitle="Global configuration for branding, maintenance locks, payment processors, and system communications."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Maintenance Mode & Access Control */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Platform Maintenance & Access Control</h3>
              <p className="text-xs text-slate-400 mt-0.5">Toggle maintenance lock or registration freeze</p>
            </div>
          </div>

          <div className="space-y-4 pt-1 text-xs">
            {/* Maintenance Toggle */}
            <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="pr-4">
                <span className="font-bold text-slate-900 text-sm block">Global Maintenance Mode</span>
                <span className="text-slate-400 text-xs mt-0.5 block">
                  When enabled, non-super-admin users see the maintenance screen upon logging in.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500" />
              </label>
            </div>

            {settings.maintenanceMode && (
              <div className="space-y-1.5 animate-fade-in">
                <label className="font-bold text-slate-700 block">Custom Maintenance Downtime Message</label>
                <textarea
                  rows={2}
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-normal focus:border-brand focus:outline-none resize-none bg-white"
                />
              </div>
            )}

            {/* Allow New Registrations */}
            <div className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100">
              <div className="pr-4">
                <span className="font-bold text-slate-900 text-sm block">Allow New Agency Sign-Ups</span>
                <span className="text-slate-400 text-xs mt-0.5 block">
                  Enables public agency onboarding via the /signup register portal.
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={settings.allowNewRegistrations}
                  onChange={(e) => setSettings({ ...settings, allowNewRegistrations: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand" />
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: General SaaS Branding */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-brand flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">SaaS Identity & Support Contact</h3>
              <p className="text-xs text-slate-400 mt-0.5">Brand name and support channels presented across workspaces</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Platform Brand Name</label>
              <input
                type="text"
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-brand focus:outline-none bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Official Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-brand focus:outline-none bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Support Phone / WhatsApp</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-brand focus:outline-none bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block">Default Starter Trial Duration (Days)</label>
              <input
                type="number"
                min="0"
                max="90"
                value={settings.defaultTrialDays}
                onChange={(e) => setSettings({ ...settings, defaultTrialDays: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:border-brand focus:outline-none bg-white"
              />
            </div>
          </div>
        </div>

        <section className="gm-card gm-row">
          <div className="flex items-center gap-3">
            <span className="gm-card-icon"><CreditCard size={18} /></span>
            <div><h2>GrowMe subscription checkout</h2><p>Assign a GrowMe payment link and record confirmed payments in each client’s Billing tab.</p></div>
          </div>
          <a className="gm-button secondary" href="/super-admin/clients">Open clients</a>
        </section>

        {/* Save Bar */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-7 py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-sm shadow-md transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Settings...' : 'Save All Platform Settings'}</span>
          </button>
        </div>
      </form>
    </SuperAdminLayout>
  );
};
