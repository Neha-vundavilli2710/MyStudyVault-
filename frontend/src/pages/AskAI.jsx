import { useState } from 'react';
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
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.answer, sources: data.sources },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto p-8 flex flex-col h-[calc(100vh-64px)]">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">AI Study Assistant</h1>
        <p className="text-sm text-gray-500 mb-4">
          Ask a question and I'll answer using your uploaded academic resources.
        </p>

        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
          {messages.length === 0 && !loading && (
            <p className="text-sm text-gray-400 italic">
              Try asking something like "Explain deadlock prevention" or "Summarize unit 1 of OS."
            </p>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
              <div
                className={
                  'inline-block max-w-[85%] rounded-lg px-4 py-2 text-sm ' +
                  (m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white shadow text-gray-800')
                }
              >
                {m.text}
              </div>
              {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                <div className="mt-1 text-xs text-gray-400">
                  Sources: {m.sources.map((s) => s.title).join(', ')}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="text-left">
              <div className="inline-block bg-white shadow rounded-lg px-4 py-2 text-sm text-gray-400">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your course material..."
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AskAI;