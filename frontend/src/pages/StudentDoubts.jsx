import { useEffect, useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const STATUS_META = {
  open: { color: '#378ADD', bg: '#378ADD14', label: 'Open' },
  answered: { color: '#E8A93A', bg: '#E8A93A14', label: 'Answered' },
  resolved: { color: '#3F7D5C', bg: '#3F7D5C14', label: 'Resolved' },
};

const TABS = [
  { value: 'all', label: 'All Doubts' },
  { value: 'open', label: 'Open' },
  { value: 'answered', label: 'Answered' },
  { value: 'resolved', label: 'Resolved' },
];

const AVATAR_COLORS = ['#378ADD', '#8B6BC7', '#E8A93A', '#3F7D5C', '#C7576B'];
const colorFor = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const initials = (name) => {
  if (!name) return '';
  const words = name.trim().split(/\s+/);
  return words.length === 1 ? words[0].slice(0, 2).toUpperCase() : (words[0][0] + words[1][0]).toUpperCase();
};
const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

const PAGE_SIZE = 5;

const StudentDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [answering, setAnsweringId] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [viewing, setViewingId] = useState(null);

  const fetchDoubts = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/doubts');
      setDoubts(data.doubts);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load doubts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoubts(); }, []);

  const counts = {
    all: doubts.length,
    open: doubts.filter((d) => d.status === 'open').length,
    answered: doubts.filter((d) => d.status === 'answered').length,
    resolved: doubts.filter((d) => d.status === 'resolved').length,
  };

  const filtered = doubts
    .filter((d) => activeTab === 'all' || d.status === activeTab)
    .filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return d.title.toLowerCase().includes(q) || d.subject.toLowerCase().includes(q) || (d.student?.name || '').toLowerCase().includes(q);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const startAnswer = (d) => {
    setAnsweringId(d._id);
    setAnswerText('');
    setViewingId(null);
  };

  const submitAnswer = async (id) => {
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      await api.post('/doubts/' + id + '/answers', { text: answerText });
      setAnsweringId(null);
      setAnswerText('');
      fetchDoubts();
    } catch (err) {
      setError('Could not submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-8 pt-4">
        <h1 className="font-display text-3xl text-ink">Student Doubts</h1>
        <p className="text-sm text-slate mt-1 mb-5">Answer and manage student questions</p>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => { setActiveTab(tab.value); setPage(1); }}
                  className={
                    'flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border ' +
                    (active ? 'border-amber text-ink' : 'bg-white border-hairline text-ink hover:bg-paper')
                  }
                  style={active ? { backgroundColor: '#FBEFDA' } : {}}
                >
                  {tab.label}
                  <span className="text-xs font-mono px-1.5 py-0.5 rounded-full bg-white border border-hairline">{counts[tab.value]}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-hairline rounded-lg px-3 py-2 bg-white">
              <Search size={15} color="#B8B2A3" strokeWidth={2} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search doubts..."
                className="text-sm focus:outline-none bg-transparent w-40"
              />
            </div>
            <button type="button" className="border border-hairline rounded-lg p-2.5 bg-white hover:bg-paper">
              <Filter size={16} color="#5B6478" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">{error}</div>}

        <div className="bg-white border border-hairline rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <p className="text-sm text-slate p-6">Loading...</p>
          ) : paged.length === 0 ? (
            <p className="text-sm text-slate p-6">No doubts match this filter.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate uppercase border-b border-hairline">
                  <th className="px-5 py-3 font-medium">Student</th>
                  <th className="px-5 py-3 font-medium">Doubt</th>
                  <th className="px-5 py-3 font-medium">Subject</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((d) => {
                  const meta = STATUS_META[d.status] || STATUS_META.open;
                  const avatarColor = colorFor(d.student?.name || d.subject);
                  const isAnswering = answering === d._id;
                  const isViewing = viewing === d._id;
                  return (
                    <>
                      <tr key={d._id} className="border-b border-hairline align-top">
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-mono font-semibold shrink-0" style={{ backgroundColor: avatarColor + '1A', color: avatarColor }}>
                              {initials(d.student?.name)}
                            </div>
                            <div>
                              <div className="font-medium text-ink">{d.student?.name}</div>
                              <div className="text-xs text-slate">{d.student?.branch || ''}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-xs">
                          <div className="font-medium text-ink">{d.title}</div>
                          <div className="text-xs text-slate mt-0.5 line-clamp-2">{d.description}</div>
                        </td>
                        <td className="px-5 py-4 text-ink whitespace-nowrap">{d.subject}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: meta.color, backgroundColor: meta.bg }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }}></span>
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate text-xs whitespace-nowrap">{formatDate(d.createdAt)}</td>
                        <td className="px-5 py-4 whitespace-nowrap">
                          {d.status === 'resolved' ? (
                            <button type="button" onClick={() => { setViewingId(isViewing ? null : d._id); setAnsweringId(null); }} className="text-sm font-medium px-4 py-1.5 rounded-lg border border-hairline hover:bg-paper">
                              View
                            </button>
                          ) : (
                            <button type="button" onClick={() => (isAnswering ? setAnsweringId(null) : startAnswer(d))} className="text-sm font-medium px-4 py-1.5 rounded-lg bg-ink text-paper hover:bg-ink/90">
                              {isAnswering ? 'Cancel' : d.status === 'answered' ? 'Answer Again' : 'Answer'}
                            </button>
                          )}
                        </td>
                      </tr>
                      {(isAnswering || isViewing) && (
                        <tr key={d._id + '-expand'} className="border-b border-hairline">
                          <td colSpan={6} className="px-5 py-4" style={{ backgroundColor: '#FAF7F0' }}>
                            <p className="text-sm text-ink/80 mb-3">{d.description}</p>
                            {d.answers && d.answers.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {d.answers.map((a, idx) => (
                                  <div key={idx} className="bg-white rounded-lg px-3.5 py-2.5 border-l-4" style={{ borderColor: '#E8A93A' }}>
                                    <p className="text-sm text-ink/90">{a.text}</p>
                                    <p className="text-xs text-slate mt-1">&mdash; {a.faculty?.name || 'Faculty'}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {isAnswering && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={answerText}
                                  onChange={(e) => setAnswerText(e.target.value)}
                                  placeholder="Write your answer..."
                                  className="flex-1 border border-hairline rounded-lg px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-ink"
                                />
                                <button type="button" onClick={() => submitAnswer(d._id)} disabled={submitting} className="bg-ink text-paper px-5 py-2 rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
                                  {submitting ? '...' : 'Submit'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate">Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} doubts</p>
            <div className="flex items-center gap-1.5">
              <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="text-sm px-3 py-1.5 rounded-lg border border-hairline bg-white disabled:opacity-40 hover:border-ink">&larr;</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((p) => (
                <button key={p} type="button" onClick={() => setPage(p)} className={'text-sm px-3.5 py-1.5 rounded-lg border font-medium ' + (p === page ? 'bg-ink text-paper border-ink' : 'bg-white text-ink border-hairline hover:border-ink')}>{p}</button>
              ))}
              <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="text-sm px-3 py-1.5 rounded-lg border border-hairline bg-white disabled:opacity-40 hover:border-ink">&rarr;</button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentDoubts;