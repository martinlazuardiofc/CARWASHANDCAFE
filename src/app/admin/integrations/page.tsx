'use client';

import React, { useState, useEffect } from 'react';
import {
  PlugZap,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Send,
  ShieldCheck,
  Server,
  FileCode2,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';

export default function AdminIntegrationsPage() {
  const [config, setConfig] = useState<any>({
    api_url: 'https://kasir.asiacafe.local/api/v1/orders',
    api_key: 'kasir_sec_asia_demo_2026',
    auth_type: 'Bearer',
    webhook_secret: 'whsec_asia_cafe_kasir_9981',
    enabled: true,
  });

  const [syncLogs, setSyncLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [testWebhookStatus, setTestWebhookStatus] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fetchData = async () => {
    try {
      const setRes = await fetch('/api/settings').then((r) => r.json());
      if (setRes.settings && setRes.settings.kasir_config) {
        setConfig(setRes.settings.kasir_config);
      }

      // Fetch recent sync logs
      const ordRes = await fetch('/api/orders?limit=15').then((r) => r.json());
      // We can also check sync logs from orders
      if (ordRes.orders) {
        setSyncLogs(ordRes.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMsg('');

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kasir_config: config }),
      });
      setSavedMsg('Konfigurasi adapter kasir berhasil disimpan!');
      setTimeout(() => setSavedMsg(''), 3000);
    } catch {
      alert('Gagal menyimpan konfigurasi');
    } finally {
      setSaving(false);
    }
  };

  const handleTestWebhook = async () => {
    setTestSending(true);
    setTestWebhookStatus('');

    try {
      // Send sample cashier webhook to local webhook endpoint
      const res = await fetch('/api/webhook/kasir', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: syncLogs[0]?.order_number || 'ORD-20261117-0001',
          status: 'COMPLETED',
          payment_status: 'paid',
          notes: 'Webhook test from cashier simulator',
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTestWebhookStatus(`Sukses: Webhook kasir diterima (${data.message})`);
      } else {
        setTestWebhookStatus(`Gagal: ${data.error}`);
      }
    } catch (err: any) {
      setTestWebhookStatus(`Error: ${err.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const webhookEndpoint = typeof window !== 'undefined' ? `${window.location.origin}/api/webhook/kasir` : '/api/webhook/kasir';

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold/20">
        <div>
          <h1 className="font-serif font-bold text-2xl text-cream tracking-wide flex items-center gap-2">
            <PlugZap className="w-6 h-6 text-gold" />
            <span>Integrasi Sistem Kasir Cafe (kasirAdapter)</span>
          </h1>
          <p className="text-xs text-gold font-sans mt-0.5">
            Konfigurasi koneksi API kasir eksternal, webhook receiver, dan antrean sinkronisasi
          </p>
        </div>

        {savedMsg && (
          <span className="text-xs font-bold text-green-400 animate-pulse">{savedMsg}</span>
        )}
      </div>

      {/* Explanation Banner (Section 14 Requirements) */}
      <div className="p-4 rounded-2xl bg-navy-dark border border-gold/30 space-y-2 text-xs text-cream/80">
        <p className="font-bold text-gold text-sm font-serif">
          Tentang Modul kasirAdapter:
        </p>
        <p>
          Web kasir dibuat terpisah oleh pihak cafe. Sistem digital menu ini bertindak sebagai sumber kebenaran (source of truth) pemesanan dan snapshot harga. Ketika pesanan dibuat, backend secara otomatis mengirim HTTP POST JSON ke endpoint kasir dengan idempotency key dan retry backoff.
        </p>
        <p className="text-[11px] text-cream/60">
          Jika API kasir belum online, sistem secara otomatis mengaktifkan fallback ke <strong>Kitchen &amp; Barista Display</strong>, cetak printer thermal, dan antrean kirim ulang manual.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Connection Settings Form */}
        <form onSubmit={handleSaveConfig} className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-cream flex items-center gap-2 border-b border-gold/15 pb-2">
            <Server className="w-4 h-4 text-gold" />
            <span>Konfigurasi Endpoint Kasir</span>
          </h3>

          <label className="flex items-center gap-2 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              className="accent-gold"
            />
            <span>Aktifkan Sinkronisasi Otomatis ke Kasir</span>
          </label>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gold">
              KASIR_API_URL
            </label>
            <input
              type="text"
              required
              value={config.api_url}
              onChange={(e) => setConfig({ ...config, api_url: e.target.value })}
              placeholder="https://kasir.asiacafe.local/api/v1/orders"
              className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold uppercase tracking-wider text-gold">
              KASIR_API_KEY (Server Secret)
            </label>
            <input
              type="password"
              value={config.api_key}
              onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
              placeholder="kasir_sec_asia_demo_2026"
              className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold font-mono"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-gold">
                AUTH_TYPE
              </label>
              <select
                value={config.auth_type}
                onChange={(e) => setConfig({ ...config, auth_type: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold"
              >
                <option value="Bearer">Bearer Token</option>
                <option value="Basic">Basic Auth</option>
                <option value="ApiKey">X-Api-Key Header</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold uppercase tracking-wider text-gold">
                WEBHOOK_SECRET
              </label>
              <input
                type="text"
                value={config.webhook_secret}
                onChange={(e) => setConfig({ ...config, webhook_secret: e.target.value })}
                placeholder="whsec_asia_cafe_kasir_9981"
                className="w-full p-2.5 rounded-xl bg-navy-deep border border-gold/25 text-cream focus:outline-none focus:border-gold font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-xl bg-gold text-navy-deep font-bold uppercase tracking-wider shadow-goldGlow hover:brightness-110 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Simpan Konfigurasi Kasir</span>}
          </button>
        </form>

        {/* Webhook Receiver & Testing Card */}
        <div className="p-5 rounded-2xl border border-gold/25 bg-navy-dark shadow-card space-y-4 text-xs">
          <h3 className="font-serif font-bold text-base text-cream flex items-center gap-2 border-b border-gold/15 pb-2">
            <FileCode2 className="w-4 h-4 text-gold" />
            <span>Webhook Receiver Kasir</span>
          </h3>

          <div className="p-3 rounded-xl bg-navy-deep border border-gold/20 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-gold">
              Endpoint Webhook (Untuk Tim Developer Kasir):
            </span>
            <div className="flex items-center justify-between font-mono text-[11px] text-cream">
              <span className="truncate">{webhookEndpoint}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(webhookEndpoint);
                  setCopiedUrl(true);
                  setTimeout(() => setCopiedUrl(false), 2000);
                }}
                className="text-xs text-gold flex items-center gap-1 bg-gold/10 px-2 py-1 rounded flex-shrink-0 ml-2"
              >
                {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedUrl ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p className="text-[10px] text-cream/50 pt-1">
              Method: <code>POST</code> &bull; Content-Type: <code>application/json</code>
            </p>
          </div>

          {/* Test Webhook Simulator */}
          <div className="space-y-2 pt-2">
            <p className="font-bold text-cream">Uji Coba Callback Webhook Kasir:</p>
            <p className="text-[11px] text-cream/70">
              Kirim sinyal uji coba webhook dari kasir untuk memperbarui status pesanan menjadi Selesai &amp; Lunas.
            </p>

            <button
              onClick={handleTestWebhook}
              disabled={testSending}
              className="py-2.5 px-4 rounded-xl border border-gold/40 text-gold hover:bg-gold/15 font-bold uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-all"
            >
              {testSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Kirim Sinyal Webhook Test</span>
            </button>

            {testWebhookStatus && (
              <p className="p-2.5 rounded-lg bg-navy-deep border border-gold/20 text-[11px] text-gold font-mono">
                {testWebhookStatus}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
