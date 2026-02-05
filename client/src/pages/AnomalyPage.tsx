import { useState, useEffect } from 'react';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { api } from '../api/client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ShieldAlert, AlertTriangle, Info, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const SEVERITY_COLORS = { high: '#EF4444', medium: '#F59E0B', low: '#6B7280' };
const SEVERITY_VARIANTS: Record<string, 'danger' | 'warning' | 'neutral'> = { high: 'danger', medium: 'warning', low: 'neutral' };

export function AnomalyPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [explaining, setExplaining] = useState<string | null>(null);

  const loadFlags = () => {
    api.getAnomalyFlags().then(d => setFlags(d.flags || [])).catch(() => {});
  };

  useEffect(() => { loadFlags(); }, []);

  const runDetection = async () => {
    setDetecting(true);
    try {
      const result = await api.detectAnomalies();
      setFlags(result.flags || []);
    } catch (e) {}
    setDetecting(false);
  };

  const requestExplanation = async (flagId: string) => {
    setExplaining(flagId);
    try {
      const result = await api.explainAnomaly(flagId);
      setFlags(prev => prev.map(f => f.id === flagId ? { ...f, aiExplanation: result.explanation } : f));
    } catch (e) {}
    setExplaining(null);
  };

  // Stats
  const bySeverity = flags.reduce((acc: Record<string, number>, f) => {
    acc[f.severity] = (acc[f.severity] || 0) + 1;
    return acc;
  }, {});

  const byType = flags.reduce((acc: Record<string, number>, f) => {
    acc[f.type] = (acc[f.type] || 0) + 1;
    return acc;
  }, {});

  const severityData = Object.entries(bySeverity).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(byType).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ramp-gray-900">Anomaly Detection</h2>
          <p className="text-sm text-ramp-gray-500 mt-1">
            Rule-based detection with AI-powered explanations
          </p>
        </div>
        <Button onClick={runDetection} loading={detecting}>
          <ShieldAlert size={16} />
          Run Detection
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <p className="text-xs text-ramp-gray-500">Total Flagged</p>
          <p className="text-2xl font-bold mt-1">{flags.length}</p>
        </Card>
        <Card>
          <p className="text-xs text-ramp-gray-500">High Severity</p>
          <p className="text-2xl font-bold mt-1 text-red-600">{bySeverity.high || 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-ramp-gray-500">Medium Severity</p>
          <p className="text-2xl font-bold mt-1 text-amber-600">{bySeverity.medium || 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-ramp-gray-500">Low Severity</p>
          <p className="text-2xl font-bold mt-1 text-ramp-gray-600">{bySeverity.low || 0}</p>
        </Card>
      </div>

      {/* Charts */}
      {flags.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <Card title="By Severity">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`}>
                    {severityData.map((entry) => (
                      <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS] || '#6B7280'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card title="By Type">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1DB954" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {/* Flagged expenses table */}
      <Card title="Flagged Expenses" subtitle={`${flags.length} items detected`}>
        {flags.length === 0 ? (
          <div className="text-center py-8 text-ramp-gray-400">
            <ShieldAlert size={32} className="mx-auto mb-2" />
            <p className="text-sm">No anomalies detected yet. Click "Run Detection" to scan expenses.</p>
          </div>
        ) : (
          <div className="divide-y divide-ramp-gray-100">
            {flags.map((flag) => (
              <div key={flag.id} className="py-3">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === flag.id ? null : flag.id)}
                >
                  <Badge variant={SEVERITY_VARIANTS[flag.severity] || 'neutral'}>
                    {flag.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ramp-gray-900 truncate">
                      {flag.expense?.vendor || 'Unknown'} — ${flag.expense?.amount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-ramp-gray-500">{flag.type?.replace(/_/g, ' ')} — {flag.ruleDetails}</p>
                  </div>
                  <span className="text-xs text-ramp-gray-400">
                    {(flag.confidence * 100).toFixed(0)}% confidence
                  </span>
                  {expandedId === flag.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {expandedId === flag.id && (
                  <div className="mt-3 ml-16 space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-xs p-3 bg-ramp-gray-50 rounded-lg">
                      <div>
                        <p className="text-ramp-gray-400">Date</p>
                        <p className="font-medium">{flag.expense?.date}</p>
                      </div>
                      <div>
                        <p className="text-ramp-gray-400">Category</p>
                        <p className="font-medium">{flag.expense?.category}</p>
                      </div>
                      <div>
                        <p className="text-ramp-gray-400">Submitted By</p>
                        <p className="font-medium">{flag.expense?.submittedBy}</p>
                      </div>
                    </div>

                    {flag.aiExplanation ? (
                      <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles size={14} className="text-blue-500" />
                          <p className="text-xs font-medium text-blue-700">AI Explanation</p>
                        </div>
                        <p className="text-sm text-blue-800">{flag.aiExplanation}</p>
                      </div>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => requestExplanation(flag.id)}
                        loading={explaining === flag.id}
                        className="text-xs"
                      >
                        <Sparkles size={14} />
                        Generate AI Explanation
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
