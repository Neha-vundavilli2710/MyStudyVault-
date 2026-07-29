import { useEffect, useState } from 'react';
import { PenSquare, Folder } from 'lucide-react';
import api from '../api/axios';
import DashboardLayout from '../components/DashboardLayout';

const STATUS_STYLE = {
  open: { color: '#E8A93A', bg: '#FBEFDA', label: 'Pending' },
  answered: { color: '#378ADD', bg: '#EAF3FC', label: 'Answered' },
  resolved: { color: '#3F7D5C', bg: '#E9F3EE', label: 'Resolved' },
};

const AVATAR_COLORS = ['#378ADD', '#8B6BC7', '#E8A93A', '#3F7D5C', '#C7576B'];

const initials = (text) => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

const colorFor = (text) => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (d) => new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

const MyDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({ subject: '', title: '', description: '' });
  const [posting, setPosting] = useState(false);

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPosting(true);
    try {
      await api.post('/doubts', form);
      setForm({ subject: '', title: '', description: '' });
      setSuccess('Doubt posted successfully.');
      fetchDoubts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post doubt.');
    } finally {
      setPosting(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      await api.patch('/doubts/' + id + '/resolve');
      fetchDoubts();
    } catch (err) {
      setError('Could not mark as resolved.');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-8">
        <h1 className="font-display text-3xl text-ink">My Doubts</h1>
        <div className="w-10 h-0.5 bg-amber mt-2 mb-2"></div>
        <p className="text-sm text-slate mb-6">ask and track answers</p>

        <div className="bg-white border border-hairline rounded-xl p-6 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#FBEFDA' }}>
              <PenSquare size={16} color="#E8A93A" strokeWidth={2} />
            </div>
            <h2 className="text-base font-semibold text-ink">Post a New Doubt</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Subject (e.g. Operating Systems)" required className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Short title" required className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe your doubt in detail" required rows={3} className="w-full border border-hairline rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-ink" />
            <button type="submit" disabled={posting} className="bg-ink text-paper px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-ink/90 disabled:opacity-50">
              {posting ? 'Posting...' : 'Post Doubt'}
            </button>
          </form>
        </div>

        {error && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-800 bg-green-50 border border-green-200 rounded p-2">{success}</div>}

        {loading ? (
          <p className="text-slate text-sm">Loading...</p>
        ) : doubts.length === 0 ? (
          <div className="text-center py-10">
            <Folder size={36} color="#D8D2C4" strokeWidth={1.5} className="mx-auto mb-2" />
            <p className="text-slate text-sm">You haven't posted any doubts yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doubts.map((d) => {
              const status = STATUS_STYLE[d.status] || STATUS_STYLE.open;
              const avatarColor = colorFor(d.subject);
              return (
                <div key={d._id} className="flex gap-4 bg-white border border-hairline rounded-xl p-5 shadow-sm">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-xs font-mono font-semibold"
                    style={{ backgroundColor: avatarColor + '1A', color: avatarColor }}
                  >
                    {initials(d.subject)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-ink">{d.title}</h3>
                        <p className="text-xs text-slate mt-0.5 flex items-center gap-1">
                          <Folder size={11} strokeWidth={2} /> {d.subject.toLowerCase()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ color: status.color, backgroundColor: status.bg }}>
                          {status.label}
                        </span>
                        <span className="text-xs text-slate">{formatDate(d.createdAt)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-ink/80 mt-2">{d.description}</p>

                    {d.answers && d.answers.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {d.answers.map((a, idx) => (
                          <div key={idx} className="rounded-lg px-3.5 py-2.5 border-l-4" style={{ backgroundColor: '#FBEFDA', borderColor: '#E8A93A' }}>
                            <p className="text-sm text-ink/90">{a.text}</p>
                            <p className="text-xs text-slate mt-1">&mdash; {a.faculty?.name || 'Faculty'}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {d.status === 'answered' && (
                      <button type="button" onClick={() => handleResolve(d._id)} className="mt-3 text-xs font-medium text-green-700 hover:underline">
                        Mark as resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyDoubts;