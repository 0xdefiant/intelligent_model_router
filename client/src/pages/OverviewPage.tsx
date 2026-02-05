import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { api } from '../api/client';
import { Zap, ShieldAlert, FileCheck, ArrowRight, Server } from 'lucide-react';

interface HealthData {
  providers: Array<{ provider: string; available: boolean; reason?: string }>;
  availableProviders: string[];
}

export function OverviewPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [expenseCount, setExpenseCount] = useState(0);

  useEffect(() => {
    api.health().then(setHealth).catch(() => {});
    api.getMetrics().then(setMetrics).catch(() => {});
    api.getExpenses(1, 1).then(d => setExpenseCount(d.total)).catch(() => {});
  }, []);

  const features = [
    {
      to: '/router',
      icon: Zap,
      title: 'Intelligent Model Router',
      description: 'Upload receipts and CSVs — automatically routed to the optimal AI provider based on task complexity.',
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
    {
      to: '/anomalies',
      icon: ShieldAlert,
      title: 'Anomaly Detection',
      description: 'Flag duplicate expenses, round-number fraud patterns, weekend spending spikes with AI-powered explanations.',
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      to: '/policy',
      icon: FileCheck,
      title: 'Policy Compliance Agent',
      description: 'Natural language expense policies evaluated by AI. Chat interface for real-time compliance checks.',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ramp-gray-900">Multi-Model Expense Intelligence</h2>
        <p className="text-ramp-gray-500 mt-1">
          AI-powered expense processing with intelligent routing across multiple providers
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ramp-green/10 rounded-lg">
              <Server size={20} className="text-ramp-green" />
            </div>
            <div>
              <p className="text-2xl font-bold">{health?.availableProviders.length ?? '—'}</p>
              <p className="text-xs text-ramp-gray-500">AI Providers Online</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Zap size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{metrics?.providers?.length ? metrics.providers.reduce((a: number, p: any) => a + p.totalRequests, 0) : '0'}</p>
              <p className="text-xs text-ramp-gray-500">AI Requests Processed</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <FileCheck size={20} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{expenseCount}</p>
              <p className="text-xs text-ramp-gray-500">Expenses Loaded</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Provider status */}
      {health && (
        <Card title="Provider Status" subtitle="AI providers configured via environment variables">
          <div className="grid grid-cols-2 gap-3">
            {health.providers.map(p => (
              <div key={p.provider} className="flex items-center justify-between p-3 rounded-lg border border-ramp-gray-100">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${p.available ? 'bg-ramp-green' : 'bg-ramp-gray-300'}`} />
                  <span className="text-sm font-medium capitalize">{p.provider}</span>
                </div>
                <Badge variant={p.available ? 'success' : 'neutral'}>
                  {p.available ? 'Online' : 'Not configured'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-1 gap-4">
        {features.map(({ to, icon: Icon, title, description, color, bg }) => (
          <Link key={to} to={to} className="block group">
            <Card className="transition-shadow hover:shadow-ramp-lg">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-ramp ${bg}`}>
                  <Icon size={24} className={color} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-ramp-gray-900 group-hover:text-ramp-green transition-colors">
                    {title}
                  </h3>
                  <p className="text-sm text-ramp-gray-500 mt-0.5">{description}</p>
                </div>
                <ArrowRight size={18} className="text-ramp-gray-400 group-hover:text-ramp-green transition-colors" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Architecture note */}
      <Card title="Architecture" subtitle="How the system mirrors Ramp's tech stack">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-ramp-gray-900">AI Orchestration</p>
            <p className="text-ramp-gray-500">Anthropic, OpenAI, Groq, Cerebras — routed by task complexity</p>
          </div>
          <div>
            <p className="font-medium text-ramp-gray-900">Model Router</p>
            <p className="text-ramp-gray-500">Simple tasks → fast/cheap models, complex → accurate models</p>
          </div>
          <div>
            <p className="font-medium text-ramp-gray-900">Anomaly Detection</p>
            <p className="text-ramp-gray-500">Rule engine + AI explainability for flagged expenses</p>
          </div>
          <div>
            <p className="font-medium text-ramp-gray-900">Policy Agent</p>
            <p className="text-ramp-gray-500">Natural language policies with function-calling evaluation</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
