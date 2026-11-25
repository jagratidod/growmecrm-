import React, { useState, useEffect } from 'react';
import {
  Copy,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { SuperAdminLayout } from './SuperAdminLayout';
import { superAdminService } from '../../services/superAdminService';
import type { WebhookServiceHealth } from '../../types/superAdmin.types';
import { useToast } from '../../components/ui/Toast';

export const WebhookHealthPage: React.FC = () => {
  const [services, setServices] = useState<WebhookServiceHealth[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadHealth = async () => {
    setIsLoading(true);
    try {
      const data = await superAdminService.getWebhookHealth();
      setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      type: 'success',
      title: 'Copied to Clipboard',
      description: 'Webhook endpoint URL copied.',
    });
  };

  return (
    <SuperAdminLayout
      currentPath="Webhook Health"
      title="Lead ingestion endpoints"
      subtitle="Endpoint URLs for configured lead providers."
    >
      {/* Top Status Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div><h3 className="font-bold">Provider connections</h3><p className="text-sm text-slate-500">Verify event delivery in the connected provider dashboard.</p></div>

        <button
          onClick={loadHealth}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-bold transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh endpoints</span>
        </button>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 gap-5">
        {services.map((srv, idx) => (
          <div
            key={idx}
            className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 hover:shadow-md transition"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-brand flex items-center justify-center font-bold shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{srv.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{srv.description}</p>
                </div>
              </div>

              <span className="gm-tag">{srv.status.toLowerCase()}</span>
            </div>

            {/* Endpoint Bar */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-slate-600 truncate">{srv.endpoint}</span>
              <button
                type="button"
                onClick={() => handleCopy(srv.endpoint)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-white transition shrink-0"
                title="Copy Endpoint"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </SuperAdminLayout>
  );
};
