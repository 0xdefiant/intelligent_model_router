import { useState, useEffect, useRef } from 'react';
import { Card } from '../components/shared/Card';
import { Badge } from '../components/shared/Badge';
import { Button } from '../components/shared/Button';
import { api } from '../api/client';
import { FileCheck, Send, User, Bot, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const DEFAULT_POLICY = `Expense Policy:
- Maximum meal expense: $75 per person
- Travel expenses require pre-approval for amounts over $500
- Software subscriptions must be approved by department head
- No personal expenses on corporate cards
- Receipts required for all expenses over $25
- Hotel stays capped at $250/night
- No alcohol purchases on corporate cards
- Office supplies limited to $200 per month per employee`;

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  evaluations?: any[];
  timestamp: string;
}

export function PolicyPage() {
  const [policyText, setPolicyText] = useState(DEFAULT_POLICY);
  const [policyRules, setPolicyRules] = useState<any[]>([]);
  const [settingPolicy, setSettingPolicy] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [expenses, setExpenses] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getExpenses(1, 20).then(d => setExpenses(d.expenses || [])).catch(() => {});
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSetPolicy = async () => {
    setSettingPolicy(true);
    try {
      const result = await api.setPolicy(policyText);
      setPolicyRules(result.parsed || []);
    } catch (e) {}
    setSettingPolicy(false);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMsg = { role: 'user', content: chatInput, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const result = await api.policyChat(chatInput, chatMessages);
      const assistantMsg: ChatMsg = {
        role: 'assistant',
        content: result.reply,
        evaluations: result.evaluations,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (e: any) {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your request. Make sure at least one AI provider is configured.',
        timestamp: new Date().toISOString(),
      }]);
    }
    setChatLoading(false);
  };

  const handleEvaluateExpense = async (expenseId: string) => {
    setChatLoading(true);
    try {
      const result = await api.evaluateExpense(expenseId);
      const expense = expenses.find(e => e.id === expenseId);
      const msg: ChatMsg = {
        role: 'assistant',
        content: result.result?.summary || 'Evaluation complete.',
        evaluations: [result.result],
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, {
        role: 'user',
        content: `Evaluate expense: ${expense?.vendor} - $${expense?.amount?.toFixed(2)}`,
        timestamp: new Date().toISOString(),
      }, msg]);
    } catch (e) {}
    setChatLoading(false);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle size={16} className="text-green-500" />;
      case 'fail': return <XCircle size={16} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ramp-gray-900">Policy Compliance Agent</h2>
        <p className="text-sm text-ramp-gray-500 mt-1">
          Define expense policies in natural language — AI evaluates compliance
        </p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Policy Editor - Left Column */}
        <div className="col-span-2 space-y-4">
          <Card title="Expense Policy" subtitle="Enter policy rules in natural language">
            <textarea
              value={policyText}
              onChange={(e) => setPolicyText(e.target.value)}
              className="w-full h-64 text-sm border border-ramp-gray-200 rounded-lg p-3 resize-none focus:ring-2 focus:ring-ramp-green focus:border-transparent"
              placeholder="Enter your expense policy..."
            />
            <Button onClick={handleSetPolicy} loading={settingPolicy} className="w-full mt-3">
              <FileCheck size={16} />
              Parse & Activate Policy
            </Button>
          </Card>

          {policyRules.length > 0 && (
            <Card title="Parsed Rules" subtitle={`${policyRules.length} rules extracted`}>
              <div className="space-y-2">
                {policyRules.map((rule, i) => (
                  <div key={rule.id || i} className="p-2 bg-ramp-gray-50 rounded-lg text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info">{rule.category}</Badge>
                    </div>
                    <p className="text-ramp-gray-700">{rule.constraint}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Quick evaluate buttons */}
          {expenses.length > 0 && (
            <Card title="Quick Evaluate" subtitle="Click an expense to check compliance">
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {expenses.slice(0, 10).map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => handleEvaluateExpense(exp.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-ramp-gray-50 transition-colors text-xs flex items-center justify-between"
                    disabled={chatLoading}
                  >
                    <span className="truncate">{exp.vendor}</span>
                    <span className="text-ramp-gray-500 ml-2 shrink-0">${exp.amount?.toFixed(2)}</span>
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Chat Interface - Right Column */}
        <div className="col-span-3">
          <Card className="h-[calc(100vh-200px)] flex flex-col !p-0">
            <div className="px-6 py-4 border-b border-ramp-gray-100">
              <h3 className="text-sm font-semibold text-ramp-gray-900">Policy Agent Chat</h3>
              <p className="text-xs text-ramp-gray-500">Ask questions about expense policy compliance</p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-12 text-ramp-gray-400">
                  <Bot size={32} className="mx-auto mb-2" />
                  <p className="text-sm">Start a conversation about expense compliance</p>
                  <p className="text-xs mt-1">Try: "Check if a $200 dinner expense complies with policy"</p>
                </div>
              )}

              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-ramp-green/10 flex items-center justify-center shrink-0">
                      <Bot size={14} className="text-ramp-green" />
                    </div>
                  )}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`rounded-ramp p-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-ramp-green text-white'
                        : 'bg-ramp-gray-100 text-ramp-gray-800'
                    }`}>
                      {msg.content}
                    </div>

                    {msg.evaluations?.map((evaluation, j) => (
                      <div key={j} className="mt-2 p-3 border border-ramp-gray-200 rounded-lg text-xs space-y-2">
                        <div className="flex items-center gap-2">
                          {statusIcon(evaluation.status)}
                          <span className="font-semibold capitalize">{evaluation.status}</span>
                        </div>
                        {evaluation.rulesEvaluated?.map((rule: any, k: number) => (
                          <div key={k} className="flex items-start gap-2 pl-2">
                            {rule.passed ? (
                              <CheckCircle size={12} className="text-green-400 mt-0.5 shrink-0" />
                            ) : (
                              <XCircle size={12} className="text-red-400 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <p className="font-medium">{rule.ruleName}</p>
                              <p className="text-ramp-gray-500">{rule.reason}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-ramp-gray-200 flex items-center justify-center shrink-0">
                      <User size={14} className="text-ramp-gray-600" />
                    </div>
                  )}
                </div>
              ))}

              {chatLoading && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-ramp-green/10 flex items-center justify-center">
                    <Bot size={14} className="text-ramp-green" />
                  </div>
                  <div className="bg-ramp-gray-100 rounded-ramp p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-ramp-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-ramp-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-ramp-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat input */}
            <div className="p-4 border-t border-ramp-gray-100">
              <form onSubmit={(e) => { e.preventDefault(); handleSendChat(); }} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about expense compliance..."
                  className="flex-1 border border-ramp-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-ramp-green focus:border-transparent"
                  disabled={chatLoading}
                />
                <Button type="submit" loading={chatLoading} disabled={!chatInput.trim()}>
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
