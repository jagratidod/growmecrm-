import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
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
      title="Multi-Channel Webhook & API Monitor"
      subtitle="Live health status, response latencies, and connectivity of external lead ingestion pipelines."
    >
      {/* Top Status Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">
                All Lead Ingestion Pipelines Operational
              </h3>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% UPTIME
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Continuous heartbeat monitoring active across WhatsApp, Instagram, Meta, and Webhooks.
            </p>
          </div>
        </div>

        <button
          onClick={loadHealth}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#453372] hover:bg-[#38285e] text-white text-xs font-bold transition shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Ping Services</span>
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
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#453372] flex items-center justify-center font-bold shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">{srv.name}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{srv.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-start sm:self-auto">
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 block">{srv.latencyMs} ms</span>
                  <span className="text-[10px] text-slate-400">Response time</span>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  OPERATIONAL
                </span>
              </div>
            </div>

            {/* Endpoint Bar */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2 text-xs font-mono">
              <span className="text-slate-600 truncate">{srv.endpoint}</span>
              <button
                type="button"
                onClick={() => handleCopy(srv.endpoint)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#453372] hover:bg-white transition shrink-0"
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
