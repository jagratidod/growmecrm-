import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
} from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { superAdminService } from '../../services/superAdminService';
import type { Announcement } from '../../types/superAdmin.types';
import { useToast } from '../../components/ui/Toast';

export const AnnouncementsPage: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'critical'>('info');
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'OWNERS' | 'AGENTS'>('ALL');

  const { toast } = useToast();

  const loadAnnouncements = async () => {
    try {
      const data = await superAdminService.getAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast({ type: 'error', title: 'Validation Error', description: 'Please fill in title and message.' });
      return;
    }

    try {
      await superAdminService.createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        type,
        targetAudience,
        active: true,
      });

      toast({
        type: 'success',
        title: 'Broadcast Sent',
        description: 'Announcement is now visible across agency dashboards.',
      });

      setTitle('');
      setMessage('');
      setIsCreateModalOpen(false);
      loadAnnouncements();
    } catch (err: any) {
      toast({ type: 'error', title: 'Failed', description: err.message || 'Error creating broadcast' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await superAdminService.deleteAnnouncement(id);
      toast({ type: 'success', title: 'Deleted', description: 'Announcement removed.' });
      loadAnnouncements();
    } catch (err: any) {
      toast({ type: 'error', title: 'Error', description: 'Could not delete.' });
    }
  };

  return (
    <SuperAdminLayout
      currentPath="Global Broadcasts"
      title="Platform In-App Announcements"
      subtitle="Publish notification banners and system alerts across every agency workspace."
    >
      {/* Top Banner Action */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Active Broadcast Banners
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Broadcast important updates, scheduled maintenance, or new feature alerts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-extrabold shadow-md transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Broadcast</span>
        </button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 text-slate-400">
            No active platform announcements at this moment.
          </div>
        ) : (
          announcements.map((ann) => {
            const isCritical = ann.type === 'critical';
            const isWarning = ann.type === 'warning';
            const isSuccess = ann.type === 'success';

            const bgClass = isCritical
              ? 'bg-rose-50 border-rose-200'
              : isWarning
              ? 'bg-amber-50 border-amber-200'
              : isSuccess
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-purple-50 border-purple-200';

            const textClass = isCritical
              ? 'text-rose-900'
              : isWarning
              ? 'text-amber-900'
              : isSuccess
              ? 'text-emerald-900'
              : 'text-brand';

            const Icon = isCritical
              ? AlertCircle
              : isWarning
              ? AlertTriangle
              : isSuccess
              ? CheckCircle2
              : Info;

            return (
              <div
                key={ann.id || ann._id}
                className={`rounded-3xl p-5 sm:p-6 border ${bgClass} shadow-xs flex items-start justify-between gap-4 transition-all`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-2.5 rounded-2xl bg-white shadow-2xs shrink-0 ${textClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-black ${textClass} tracking-tight`}>
                        {ann.title}
                      </h4>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/70 text-slate-700">
                        {ann.targetAudience}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {ann.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium pt-1">
                      Posted by {ann.createdBy || 'Super Admin'} • {new Date(ann.createdAt || Date.now()).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(ann.id || ann._id || '')}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                  title="Remove Announcement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-5 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Broadcast In-App Announcement
                </h3>
                <p className="text-xs text-slate-400">Pushes a live notification banner to target users</p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Announcement Title</label>
                <input
                  type="text"
                  required

                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Alert Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-brand focus:outline-none"
                  >
                    <option value="info">Info (Purple)</option>
                    <option value="success">Success (Green)</option>
                    <option value="warning">Warning (Amber)</option>
                    <option value="critical">Critical Alert (Red)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-semibold focus:border-brand focus:outline-none"
                  >
                    <option value="ALL">All Users (Staff + Owners)</option>
                    <option value="OWNERS">Agency Owners Only</option>
                    <option value="AGENTS">Travel Agents Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Detailed Message</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter details of the announcement shown on agency workspaces..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-slate-800 font-normal focus:border-brand focus:outline-none resize-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Broadcast</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SuperAdminLayout>
  );
};
