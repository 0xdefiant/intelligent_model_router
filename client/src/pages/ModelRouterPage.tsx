import { useState, useEffect } from 'react';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { FileUpload } from '../components/shared/FileUpload';
import { api } from '../api/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Zap, Clock, DollarSign, Target, ArrowRight, Download, FileText, FileSpreadsheet, AlertTriangle } from 'lucide-react';

const PROVIDER_COLORS: Record<string, string> = {
  groq: '#F55036',
  cerebras: '#6366F1',
  anthropic: '#D4A574',
  openai: '#10A37F',
};

export function ModelRouterPage() {
  const [loading, setLoading] = useState(false);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');

  const refreshMetrics = () => {
    api.getMetrics().then(setMetrics).catch(() => {});
    api.getMetricsHistory(50).then(d => setHistory(d.history || [])).catch(() => {});
  };

  useEffect(() => {
    refreshMetrics();
  }, []);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setRouteResult(null);
    try {
      const result = await api.routeFile(file);
      setRouteResult(result);
      refreshMetrics();
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
    } finally {
      setLoading(false);
    }
  };

  const providerMetrics = metrics?.providers || [];
  const costData = providerMetrics.map((p: any) => ({
    name: p.provider,
    'Avg Cost ($)': Number(p.avgCostUsd.toFixed(6)),
    'Avg Latency (ms)': p.avgLatencyMs,
  }));

  const historyData = history.slice(-20).map((h: any, i: number) => ({
    index: i + 1,
    latencyMs: h.latencyMs,
    costUsd: h.costUsd,
    provider: h.provider,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ramp-gray-900">Intelligent Model Router</h2>
        <p className="text-sm text-ramp-gray-500 mt-1">
          Upload receipts or CSVs — automatically routed to the optimal AI provider
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Upload panel */}
        <div className="col-span-1 space-y-4">
          <Card title="Upload" subtitle="Receipt image or expense CSV">
            <FileUpload onFileSelect={handleFileUpload} />
            {loading && (
              <div className="mt-4 flex items-center gap-2 text-sm text-ramp-gray-500">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Routing and processing...
              </div>
            )}
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          </Card>

          {/* Test samples */}
          <Card title="Test Samples" subtitle="Download sample files to try the router">
            <div className="space-y-2">
              {[
                {
                  href: '/samples/simple-receipt.csv',
                  name: 'Simple Receipt',
                  desc: '3 expenses — routes to Groq',
                  icon: FileText,
                  route: 'Groq',
                },
                {
                  href: '/samples/complex-invoice.csv',
                  name: 'Complex Invoice',
                  desc: '15 SaaS line items — routes to Anthropic',
                  icon: FileSpreadsheet,
                  route: 'Anthropic',
                },
                {
                  href: '/samples/suspicious-expenses.csv',
                  name: 'Suspicious Expenses',
                  desc: 'Duplicates, round numbers, anomalies',
                  icon: AlertTriangle,
                  route: 'Anthropic',
                },
                {
                  href: '/samples/receipt-text.txt',
                  name: 'Restaurant Receipt',
                  desc: 'Text receipt with line items + tax',
                  icon: FileText,
                  route: 'Groq',
                },
              ].map(sample => (
                <a
                  key={sample.href}
                  href={sample.href}
                  download
                  className="flex items-center gap-3 p-2.5 rounded-lg border border-ramp-gray-100 hover:border-ramp-green/40 hover:bg-ramp-green/5 transition-colors group"
                >
                  <sample.icon size={16} className="text-ramp-gray-400 group-hover:text-ramp-green shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-ramp-gray-800 truncate">{sample.name}</p>
                    <p className="text-[11px] text-ramp-gray-400">{sample.desc}</p>
                  </div>
                  <Download size={14} className="text-ramp-gray-300 group-hover:text-ramp-green shrink-0" />
                </a>
              ))}
            </div>
          </Card>

          {/* Routing table */}
          <Card title="Routing Table" subtitle="How tasks are assigned">
            <div className="space-y-3 text-xs">
              {[
                { task: 'Simple Receipt', provider: 'Groq', reason: 'Fastest, lowest cost' },
                { task: 'Complex Invoice', provider: 'Anthropic', reason: 'Highest accuracy' },
                { task: 'Policy Check', provider: 'OpenAI', reason: 'Function calling' },
                { task: 'Anomaly Explain', provider: 'Anthropic', reason: 'Best reasoning' },
              ].map(r => (
                <div key={r.task} className="flex items-center gap-2">
                  <span className="text-ramp-gray-600 w-24">{r.task}</span>
                  <ArrowRight size={12} className="text-ramp-gray-400" />
                  <Badge variant="info">{r.provider}</Badge>
                  <span className="text-ramp-gray-400 ml-auto">{r.reason}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Results + Metrics */}
        <div className="col-span-2 space-y-4">
          {/* Route Result */}
          {routeResult && (
            <Card title="Routing Result">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-ramp-green" />
                    <span className="text-sm font-medium">Provider:</span>
                    <Badge variant="success">{routeResult.provider || routeResult.decision?.provider}</Badge>
                  </div>
                  {routeResult.usedFallback && (
                    <Badge variant="warning">Used fallback</Badge>
                  )}
                </div>
                {routeResult.decision && (
                  <div className="p-3 bg-ramp-gray-50 rounded-lg text-sm">
                    <p className="font-medium text-ramp-gray-700">Routing Reason</p>
                    <p className="text-ramp-gray-500 mt-1">{routeResult.decision.reason}</p>
                    <div className="flex gap-4 mt-2 text-xs text-ramp-gray-400">
                      <span>Task: {routeResult.decision.complexity?.type}</span>
                      <span>Score: {routeResult.decision.complexity?.score?.toFixed(2)}</span>
                    </div>
                  </div>
                )}
                {routeResult.result?.expenses?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-ramp-gray-700 mb-2">Extracted Expenses</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-ramp-gray-200">
                            <th className="text-left py-2 px-2 text-ramp-gray-500 font-medium">Vendor</th>
                            <th className="text-left py-2 px-2 text-ramp-gray-500 font-medium">Amount</th>
                            <th className="text-left py-2 px-2 text-ramp-gray-500 font-medium">Category</th>
                            <th className="text-left py-2 px-2 text-ramp-gray-500 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {routeResult.result.expenses.map((e: any, i: number) => (
                            <tr key={i} className="border-b border-ramp-gray-100">
                              <td className="py-2 px-2">{e.vendor}</td>
                              <td className="py-2 px-2">${e.amount?.toFixed(2)}</td>
                              <td className="py-2 px-2"><Badge>{e.category}</Badge></td>
                              <td className="py-2 px-2">{e.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                <div className="flex gap-6 text-xs text-ramp-gray-500">
                  <span className="flex items-center gap-1"><Clock size={12} /> {routeResult.latencyMs}ms</span>
                  <span className="flex items-center gap-1"><DollarSign size={12} /> ${routeResult.costUsd?.toFixed(6) || '—'}</span>
                  <span className="flex items-center gap-1"><Target size={12} /> Confidence: {(routeResult.result?.confidence * 100)?.toFixed(0) || '—'}%</span>
                </div>
              </div>
            </Card>
          )}

          {/* Provider Metrics */}
          <div className="grid grid-cols-2 gap-4">
            {providerMetrics.map((p: any) => (
              <Card key={p.provider}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[p.provider] }} />
                    <span className="text-sm font-medium capitalize">{p.provider}</span>
                  </div>
                  <Badge variant={p.successRate >= 0.9 ? 'success' : 'warning'}>
                    {(p.successRate * 100).toFixed(0)}% success
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-ramp-gray-400">Requests</p>
                    <p className="font-semibold">{p.totalRequests}</p>
                  </div>
                  <div>
                    <p className="text-ramp-gray-400">Avg Latency</p>
                    <p className="font-semibold">{p.avgLatencyMs}ms</p>
                  </div>
                  <div>
                    <p className="text-ramp-gray-400">Avg Cost</p>
                    <p className="font-semibold">${p.avgCostUsd.toFixed(5)}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Charts */}
          {costData.length > 0 && (
            <Card title="Provider Comparison" subtitle="Cost and latency across providers">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Avg Latency (ms)" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="Avg Cost ($)" fill="#10A37F" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          {historyData.length > 0 && (
            <Card title="Request History" subtitle="Latency over recent requests">
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="index" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="latencyMs" stroke="#1DB954" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
