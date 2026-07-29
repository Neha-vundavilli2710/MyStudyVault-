import { useState } from 'react';
import { Lightbulb, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const AskAI = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', text: currentQuestion }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai/ask', { question: currentQuestion });
      setMessages((prev) => [...prev, { role: 'assistant', text: data.answer, sources: data.sources }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="font-display text-3xl text-ink">AI Study Assistant</h1>
        <div className="w-10 h-0.5 bg-amber mt-2 mb-4"></div>
        <p className="text-sm text-slate mb-5">Ask anything about your course material and get clear, helpful answers.</p>

        <div className="flex items-start gap-3 rounded-lg p-4 mb-5" style={{ backgroundColor: '#FBEFDA' }}>
          <Lightbulb size={20} color="#E8A93A" strokeWidth={1.75} className="shrink-0 mt-0.5" />
          <p className="text-sm text-ink/80">
            Try asking something like{' '}
            <span className="font-semibold text-ink">&quot;Explain deadlock prevention&quot;</span> or{' '}
            <span className="font-semibold text-ink">&quot;Summarize unit 1 of OS.&quot;</span>
          </p>
        </div>

        <div className="bg-white border border-hairline rounded-xl p-6 mb-4" style={{ minHeight: '380px' }}>
          {messages.length === 0 && !loading ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative" style={{ backgroundColor: '#F3F1EC' }}>
                <div className="w-11 h-11 rounded-full bg-ink flex items-center justify-center">
                  <MessageCircle size={18} color="#FAF7F0" strokeWidth={2} fill="#FAF7F0" />
                </div>
                <div className="w-6 h-6 rounded-full bg-amber absolute" style={{ bottom: '18px', right: '18px' }}></div>
              </div>
              <p className="text-base font-semibold text-ink">Start a conversation</p>
              <p className="text-sm text-slate mt-1">Ask a question to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, idx) => (
                <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div className={'inline-block max-w-[85%] rounded-lg px-4 py-2.5 text-sm ' + (m.role === 'user' ? 'bg-ink text-paper' : 'bg-paper border border-hairline text-ink')}>
                    {m.text}
                  </div>
                  {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                    <div className="mt-1 text-xs font-mono text-slate">sources: {m.sources.map((s) => s.title).join(', ')}</div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="text-left">
                  <div className="inline-block bg-paper border border-hairline rounded-lg px-4 py-2.5 text-sm text-slate">Thinking...</div>
                </div>
              )}
            </div>
          )}
        </div>

        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}

        <form onSubmit={handleSubmit} className="flex gap-3 items-center bg-white border border-hairline rounded-xl p-2.5 shadow-sm">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3F1EC' }}>
            <MessageCircle size={16} color="#8A8478" strokeWidth={2} />
          </div>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your course material..."
            className="flex-1 text-sm focus:outline-none bg-transparent"
          />
          <button type="submit" disabled={loading} className="bg-ink text-paper px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
            Ask
          </button>
        </form>

        <p className="text-xs text-slate text-center mt-4">AI responses may not always be 100% accurate. Please verify important information.</p>
      </div>
    </DashboardLayout>
  );
};

export default AskAI;