import { useEffect, useState } from 'react';
import { Lightbulb, MessageCircle, Copy, RotateCcw, Trash2, Plus, X, Edit2, Check } from 'lucide-react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';
import { useToast } from '../context/ToastContext';

const SUGGESTED_QUESTIONS = [
  'Explain the key concepts from this resource',
  'What are the main points I should remember?',
  'Summarize this topic in simple terms',
  'Give me an example of this concept',
  'How does this relate to what we learned before?',
];

const AskAI = () => {
  const { showToast } = useToast();
  
  // State
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  
  // Scope state
  const [scope, setScope] = useState({ type: 'general', value: '' });

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversation) {
      fetchConversationMessages(currentConversation._id);
    }
  }, [currentConversation]);

  const fetchConversations = async () => {
    try {
      const { data } = await api.get('/ai/conversations');
      setConversations(data);
    } catch (err) {
      showToast('Failed to load conversations', 'error');
    }
  };

  const fetchConversationMessages = async (conversationId) => {
    try {
      const { data } = await api.get(`/ai/conversations/${conversationId}`);
      setMessages(data.messages || []);
    } catch (err) {
      showToast('Failed to load conversation', 'error');
    }
  };

  const handleNewChat = async () => {
    try {
      const { data } = await api.post('/ai/conversations', {
        title: 'New Chat',
        scope,
      });
      setCurrentConversation(data);
      setMessages([]);
      setQuestion('');
      setError('');
      fetchConversations();
    } catch (err) {
      showToast('Failed to create conversation', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!currentConversation) {
      showToast('Please start a new chat first', 'info');
      return;
    }

    const currentQuestion = question;
    setQuestion('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: currentQuestion }]);
    setLoading(true);

    try {
      const { data } = await api.post(`/ai/conversations/${currentConversation._id}/messages`, {
        question: currentQuestion,
      });
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message.content, sources: data.message.sources }]);
      fetchConversations(); // Update sidebar with latest chat
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      showToast('Failed to get response', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      try {
        await api.delete(`/ai/conversations/${conversationId}`);
        showToast('Conversation deleted', 'success');
        if (currentConversation?._id === conversationId) {
          setCurrentConversation(null);
          setMessages([]);
        }
        fetchConversations();
      } catch (err) {
        showToast('Failed to delete conversation', 'error');
      }
    }
  };

  const handleRenameConversation = async (conversationId, newTitle) => {
    try {
      const { data } = await api.put(`/ai/conversations/${conversationId}`, {
        title: newTitle,
      });
      setConversations(conversations.map((c) => (c._id === conversationId ? data : c)));
      if (currentConversation?._id === conversationId) {
        setCurrentConversation(data);
      }
      setEditingId(null);
      showToast('Conversation renamed', 'success');
    } catch (err) {
      showToast('Failed to rename conversation', 'error');
    }
  };

  const handleClearConversation = async (conversationId) => {
    if (window.confirm('Clear all messages in this conversation?')) {
      try {
        await api.delete(`/ai/conversations/${conversationId}/clear`);
        setMessages([]);
        fetchConversations();
        showToast('Conversation cleared', 'success');
      } catch (err) {
        showToast('Failed to clear conversation', 'error');
      }
    }
  };

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content);
    showToast('Copied to clipboard', 'success');
  };

  const handleRegenerateMessage = async (index) => {
    if (!currentConversation) return;

    // Find the user message before this one
    const userMessageIndex = index - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return;

    const userQuestion = messages[userMessageIndex].content;
    
    // Remove the AI response
    setMessages((prev) => prev.slice(0, index));
    setLoading(true);

    try {
      const { data } = await api.post(`/ai/conversations/${currentConversation._id}/messages`, {
        question: userQuestion,
      });
      
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message.content, sources: data.message.sources }]);
    } catch (err) {
      setError('Failed to regenerate response');
      showToast('Failed to regenerate', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (suggestedQ) => {
    setQuestion(suggestedQ);
  };

  return (
    <DashboardLayout>
      <div className="flex h-screen bg-paper overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white border-r border-hairline transition-all duration-200 overflow-hidden flex flex-col`}
        >
          <div className="p-4 border-b border-hairline">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-ink/90"
            >
              <Plus size={16} /> New Chat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <p className="text-xs text-slate text-center py-8">No conversations yet</p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv._id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentConversation?._id === conv._id
                      ? 'bg-ink/10 border border-ink'
                      : 'hover:bg-paper border border-transparent'
                  }`}
                >
                  {editingId === conv._id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 text-sm border border-hairline rounded px-2 py-1 focus:outline-none"
                      />
                      <button
                        onClick={() => handleRenameConversation(conv._id, editTitle)}
                        className="text-ink hover:text-blue"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => setCurrentConversation(conv)}
                        className="w-full text-left text-sm font-medium text-ink truncate mb-1"
                      >
                        {conv.title}
                      </button>
                      <div className="flex gap-1 text-xs">
                        <button
                          onClick={() => {
                            setEditingId(conv._id);
                            setEditTitle(conv.title);
                          }}
                          className="text-slate hover:text-ink"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleClearConversation(conv._id)}
                          className="text-slate hover:text-ink"
                        >
                          <RotateCcw size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(conv._id)}
                          className="text-slate hover:text-red-600"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-hairline p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-paper rounded-lg transition-colors"
              >
                {sidebarOpen ? '←' : '→'}
              </button>
              <div>
                <h1 className="font-display text-2xl text-ink">AI Study Assistant</h1>
                <p className="text-xs text-slate">Ask anything about your course material</p>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 && !loading ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 relative" style={{ backgroundColor: '#F3F1EC' }}>
                  <div className="w-11 h-11 rounded-full bg-ink flex items-center justify-center">
                    <MessageCircle size={18} color="#FAF7F0" strokeWidth={2} fill="#FAF7F0" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-amber absolute" style={{ bottom: '18px', right: '18px' }}></div>
                </div>
                <p className="text-base font-semibold text-ink">Start a new conversation</p>
                <p className="text-sm text-slate mt-1">Click "New Chat" to begin</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl mx-auto">
                {messages.map((m, idx) => (
                  <div key={idx} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                    <div
                      className={
                        'inline-block max-w-[85%] rounded-lg px-4 py-2.5 text-sm ' +
                        (m.role === 'user'
                          ? 'bg-ink text-paper'
                          : 'bg-paper border border-hairline text-ink')
                      }
                    >
                      {m.content}
                    </div>
                    
                    {m.role === 'assistant' && (
                      <div className="mt-2 flex gap-2 text-xs">
                        <button
                          onClick={() => handleCopyMessage(m.content)}
                          className="flex items-center gap-1 text-slate hover:text-ink transition-colors"
                        >
                          <Copy size={14} /> Copy
                        </button>
                        <button
                          onClick={() => handleRegenerateMessage(idx)}
                          className="flex items-center gap-1 text-slate hover:text-ink transition-colors"
                        >
                          <RotateCcw size={14} /> Regenerate
                        </button>
                      </div>
                    )}
                    
                    {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                      <div className="mt-1 text-xs font-mono text-slate">
                        sources: {m.sources.map((s) => s.title).join(', ')}
                      </div>
                    )}
                  </div>
                ))}
                
                {loading && (
                  <div className="text-left">
                    <div className="inline-block bg-paper border border-hairline rounded-lg px-4 py-2.5 text-sm text-slate">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Suggested Questions (show when chat is empty) */}
          {messages.length === 0 && !loading && currentConversation && (
            <div className="px-6 pb-4">
              <p className="text-xs text-slate mb-2">Suggested questions:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestedQuestion(q)}
                    className="text-xs px-3 py-1.5 rounded-full border border-hairline bg-white hover:bg-paper transition-colors text-slate hover:text-ink"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white border-t border-hairline p-6">
            {error && (
              <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">
                {error}
              </div>
            )}

            {!currentConversation ? (
              <div className="text-center py-4">
                <p className="text-sm text-slate mb-3">Start a new conversation to begin chatting</p>
                <button
                  onClick={handleNewChat}
                  className="flex items-center justify-center gap-2 bg-ink text-paper px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-ink/90 mx-auto"
                >
                  <Plus size={16} /> New Chat
                </button>
              </div>
            ) : (
              <>
                {/* Scope Selector */}
                <div className="mb-4 flex gap-2">
                  <select
                    value={scope.type}
                    onChange={(e) => setScope({ ...scope, type: e.target.value })}
                    className="text-xs border border-hairline rounded px-2.5 py-1.5 bg-white focus:outline-none"
                  >
                    <option value="general">General</option>
                    <option value="branch">By Branch</option>
                    <option value="subject">By Subject</option>
                  </select>
                  {scope.type !== 'general' && (
                    <input
                      type="text"
                      placeholder={scope.type === 'branch' ? 'Enter branch...' : 'Enter subject...'}
                      value={scope.value}
                      onChange={(e) => setScope({ ...scope, value: e.target.value })}
                      className="flex-1 text-xs border border-hairline rounded px-2.5 py-1.5 focus:outline-none"
                    />
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSubmit} className="flex gap-3 items-center bg-paper border border-hairline rounded-xl p-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#F3F1EC' }}>
                    <MessageCircle size={16} color="#8A8478" strokeWidth={2} />
                  </div>
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your course material..."
                    className="flex-1 text-sm focus:outline-none bg-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className="bg-ink text-paper px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-50"
                  >
                    Ask
                  </button>
                </form>
              </>
            )}

            <p className="text-xs text-slate text-center mt-4">AI responses may not always be 100% accurate. Please verify important information.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AskAI;